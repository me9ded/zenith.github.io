/*
  The shared sketchbook connects to your Supabase project.

  Fill in the two values below from Supabase → Project Settings → API:
    supabaseUrl  the Project URL, e.g. https://abcdefghijkl.supabase.co
    supabaseKey  the *publishable* key (sb_publishable_...) or the legacy "anon" key

  The publishable key is meant to be public: on its own it can do nothing.
  What keeps the drawings private are the database and storage policies in
  supabase/migrations (only the two members can see anything).

  NEVER put the secret / service_role key, or the database password, here.

  While these are empty, the sketchbook still works for drawing, drafts and
  downloads; the share button and the shared gallery simply stay hidden.
*/
window.SKETCHBOOK_CONFIG = {
  supabaseUrl: '',
  supabaseKey: ''
};
