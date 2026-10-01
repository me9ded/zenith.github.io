# zenith

A small, private page for heavy days: a candle that hands out notes, a breathing
exercise with the axolotl, a detective case with two dinosaurs who absolutely
did eat the cookie, and a little sketchbook.

## What's on the page

1. **The cover**: a letter, and one way in.
2. **What sounds good right now?** Five ways in: a note, a breath, the case, drawing, or rest.
3. **The candle**: tap the holder she painted for a note on a small paper card.
   The flame, her name and his blue piece all have notes of their own.
4. **The pond**: catch the axolotl for one minute of breathing (in for 4, out for 6).
5. **Case #003**: three clues hidden around the page; the case file fills in as
   they're found. Solving it lets the culprits loose.
6. **The sketchbook**: a little space to draw. Drafts stay on the device; a drawing
   is only shared when she chooses to share it.
7. **Rest**: hands-off mode; notes drift in and the culprits go for a slow walk.
8. After the case: **the pottery place** (a short chapter about the first date)
   and **the studio** (repaint the candle holder).

## Files

- `index.html` – the markup and the hand-drawn SVG art
- `styles.css` – design tokens, layout and motion
- `script.js` – the candle, notes, breathing, case, chase, rest, chapter and studio
- `sketchbook.js` – the sketchbook, drafts, sharing and the shared gallery
- `sketchbook-config.js` – the only file to edit to connect the shared gallery
- `assets/` – dinosaur drawings, self-hosted fonts, and `vendor/supabase.js`
  (supabase-js 2.117.2, MIT, loaded only when sharing is used)
- `supabase/` – database migration, sign-in email template, local dev config,
  and `tests/security_test.py`
- `DESIGN_AUDIT.md` – design notes from the redesign and the sketchbook

## Running it

```sh
python3 -m http.server     # then open http://localhost:8000
```

It's published with GitHub Pages straight from `main`; there is no build step
(`.nojekyll` tells Pages to serve the files as they are).

## The sketchbook

### Local vs shared, kept strictly apart

- **The page you're drawing on** is kept on the device as you draw (IndexedDB), so
  closing the tab never loses it. It is never uploaded.
- **Drafts** ("save draft") also live only on that device.
- **Download** saves a PNG.
- **Share this drawing** is the only thing that sends anything anywhere. It asks
  first, needs a signed-in member, and only says "shared" after the server
  confirms both the image and its entry. If anything fails, the drawing stays
  put and nothing is left half-uploaded.

Until `sketchbook-config.js` is filled in, the share button and the shared
gallery are hidden; drawing, drafts and downloads work on their own.

### How privacy is enforced

All of it lives in `supabase/migrations/20261001000000_shared_sketchbook.sql`,
enforced by the database and storage, never just by the page:

| | |
|---|---|
| `sketchbook_members` | the allowlist: two rows, added by hand; a third is refused; no one can add themselves |
| `shared_drawings` | one row per shared drawing; visible only to members; a row can only point at an image its owner actually uploaded; never editable; only the owner can unshare |
| storage bucket `sketchbook` | private (no public URLs); PNG only, 3 MB max; each member can upload only into their own folder; uploads never overwrite; only the owner can delete |
| sign-in | email + one-time 6-digit code; public sign-up disabled; the page gives the same answer for known and unknown emails |
| viewing | images load through signed links that expire after 5 minutes |
| no tracking | nothing records visits, views, "seen" or activity; there are no notifications |

The publishable key in `sketchbook-config.js` is designed to be public. **Never**
put the secret / service_role key or the database password in the site.

### Setting up the shared gallery (one time)

1. **Create a Supabase project** at supabase.com (the free tier is plenty).
2. **Create the tables, bucket and policies**: open *SQL Editor*, paste the whole
   of `supabase/migrations/20261001000000_shared_sketchbook.sql`, and run it.
   (Or with the CLI: `supabase link --project-ref <ref>` then `supabase db push`.)
3. **Turn off public sign-ups**: *Authentication → Sign In / Providers*: keep
   **Email** enabled, and switch **Allow new users to sign up** off.
4. **Send a code, not just a link**: *Authentication → Email Templates → Magic Link*:
   subject `your sign-in code`, and paste the body of
   `supabase/templates/magic_link.html` (it must contain `{{ .Token }}`).
5. **Site URL**: *Authentication → URL Configuration*: set the Site URL to
   `https://me9ded.github.io/zenith.github.io/` (add `http://localhost:8000` as a
   redirect URL if you want to try it locally).
6. **Create the two accounts**: *Authentication → Users → Add user → Create new
   user*, once for her email and once for yours, with **Auto Confirm User**
   ticked. The password is never used (a long random one is fine).
7. **Make them the two members**: in the *SQL Editor* (emails stay out of the repo):

   ```sql
   insert into public.sketchbook_members (user_id, display_name)
   select id, 'zenith' from auth.users where email = 'HER EMAIL';

   insert into public.sketchbook_members (user_id, display_name)
   select id, 'amine' from auth.users where email = 'YOUR EMAIL';
   ```

8. **Connect the site**: from *Project Settings → API Keys* (or *API*), copy the
   **Project URL** and the **publishable** key (or legacy *anon* key) into
   `sketchbook-config.js`, then commit and push. GitHub Pages picks it up in a
   minute or two; nothing else needs configuring on GitHub.

Supabase's built-in email sender only sends a handful of emails per hour and is
meant for testing. If codes are slow or stop arriving, add your own SMTP
provider under *Project Settings → Authentication → SMTP*.

### Checking it with two devices

1. On her phone: open the sketchbook, draw, **save draft**. In Supabase →
   *Table Editor → shared_drawings* there is still nothing (drafts never upload).
2. Tap **share this drawing**, sign in with her email and the code, give it a name,
   **share it**. Only after "shared ♡" appears is there a row and an image in
   *Storage → sketchbook*.
3. On your laptop (another browser): open **the shared sketchbook**, sign in with
   your email. The drawing is there, "from zenith"; you can open it larger but
   cannot unshare it.
4. In a private window, signed out: the gallery shows only the sign-in prompt.
   Trying any other email shows the same "if that email belongs to this
   sketchbook…" message, but no code ever arrives.
5. Back on her phone: open it in the gallery, **unshare**. It disappears for both
   of you, and its image is gone from Storage.

### Testing the security rules locally

```sh
supabase start                          # local stack (Docker)
python3 supabase/tests/security_test.py # 49 checks; local only, never the real project
```

## Notes

- Progress is remembered in the browser: `zenith-case-003` (the case),
  `zenith-glaze` (the studio), `zenith-date-seen` (the chapter), and the
  `zenith-sketchbook` IndexedDB database (the page and drafts).
- The page respects the system "reduce motion" setting.
- Keyboard: everything is reachable with Tab; arrow keys steer the ankylosaurus
  once the chase is on (or while resting); space brings a note while resting;
  in the sketchbook, Ctrl/⌘+Z undoes and Shift+Ctrl/⌘+Z redoes; Escape closes.
