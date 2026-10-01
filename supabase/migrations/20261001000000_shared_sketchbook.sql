-- =====================================================================
-- The shared sketchbook
--
-- Two members. Drawings are private: only members can see them, and
-- only a drawing's owner can delete it. Everything is enforced here in
-- the database and in storage policies, never just in the page.
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- =====================================================================


-- ---------------------------------------------------------------------
-- Members: who may use the shared sketchbook.
-- Filled by hand from the SQL editor (see README). No one can add
-- themselves: there are no insert/update/delete policies for users.
-- ---------------------------------------------------------------------
create table public.sketchbook_members (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  added_at     timestamptz not null default now()
);

alter table public.sketchbook_members enable row level security;

-- the sketchbook is for two; a third row is refused even from the SQL editor
create function public.sketchbook_members_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.sketchbook_members) >= 2 then
    raise exception 'the shared sketchbook already has two members';
  end if;
  return new;
end;
$$;

create trigger sketchbook_members_cap
  before insert on public.sketchbook_members
  for each row execute function public.sketchbook_members_cap();

-- Is the signed-in user one of the two members?
-- security definer so policies can ask without exposing the table.
create function public.is_sketchbook_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.sketchbook_members m
    where m.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_sketchbook_member() from public, anon;
grant execute on function public.is_sketchbook_member() to authenticated;

create policy "members can see who the members are"
  on public.sketchbook_members for select
  to authenticated
  using (public.is_sketchbook_member());


-- ---------------------------------------------------------------------
-- Shared drawings: one row per drawing someone chose to share.
-- The image itself lives in the private storage bucket below.
-- ---------------------------------------------------------------------
create table public.shared_drawings (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid()
              references public.sketchbook_members (user_id) on delete cascade,
  object_path text not null unique,
  title       text check (title is null or char_length(title) <= 80),
  width       integer not null check (width between 1 and 4096),
  height      integer not null check (height between 1 and 4096),
  created_at  timestamptz not null default now(),

  -- <owner uuid>/<random uuid>.png, inside the owner's own folder
  constraint shared_drawings_path_shape check (
    object_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$'
  ),
  constraint shared_drawings_path_owner check (split_part(object_path, '/', 1) = owner_id::text)
);

create index shared_drawings_created_at on public.shared_drawings (created_at desc);

alter table public.shared_drawings enable row level security;

-- the share date is the server's, not whatever the page sends
create function public.shared_drawings_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := now();
  return new;
end;
$$;

create trigger shared_drawings_stamp
  before insert on public.shared_drawings
  for each row execute function public.shared_drawings_stamp();

create policy "members can see shared drawings"
  on public.shared_drawings for select
  to authenticated
  using (public.is_sketchbook_member());

-- a row can only be added for an image that has really been uploaded,
-- by its owner, into their own folder
create policy "members can share their own drawings"
  on public.shared_drawings for insert
  to authenticated
  with check (
    public.is_sketchbook_member()
    and owner_id = (select auth.uid())
    and exists (
      select 1 from storage.objects o
      where o.bucket_id = 'sketchbook'
        and o.name = object_path
    )
  );

create policy "owners can unshare their own drawings"
  on public.shared_drawings for delete
  to authenticated
  using (
    public.is_sketchbook_member()
    and owner_id = (select auth.uid())
  );

-- no update policy: a shared drawing is never edited, only removed

-- defence in depth: visitors who aren't signed in get nothing at all,
-- and signed-in users only get the verbs the policies above allow
revoke all on public.sketchbook_members from anon;
revoke all on public.shared_drawings from anon;
revoke insert, update, delete, truncate, references, trigger on public.sketchbook_members from authenticated;
revoke update, truncate, references, trigger on public.shared_drawings from authenticated;


-- ---------------------------------------------------------------------
-- Private storage for the images: PNG only, 3 MB max, never public.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sketchbook', 'sketchbook', false, 3145728, array['image/png'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "sketchbook: members can view images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'sketchbook'
    and public.is_sketchbook_member()
  );

create policy "sketchbook: members upload into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'sketchbook'
    and public.is_sketchbook_member()
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$'
  );

create policy "sketchbook: owners delete their own images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'sketchbook'
    and public.is_sketchbook_member()
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- no update policy: uploads never overwrite an existing image
