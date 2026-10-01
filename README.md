# zenith

A small, private page for heavy days: a candle that hands out notes, a breathing
exercise with the axolotl, and a detective case with two dinosaurs who absolutely
did eat the cookie.

## What's on the page

1. **The cover**: a letter, and one way in.
2. **What sounds good right now?** Four ways in: a note, a breath, the case, or rest.
3. **The candle**: tap the holder she painted for a note on a small paper card.
   The flame, her name and his blue piece all have notes of their own.
4. **The pond**: catch the axolotl for one minute of breathing (in for 4, out for 6),
   with pause and resume.
5. **Case #003**: three clues are hidden around the page. The case file fills in
   as they're found; solving it lets the culprits loose. The candle switches on the
   paddocks, and the release buttons are a mistake.
6. **Rest**: hands-off mode; notes drift in and the culprits go for a slow walk.
7. After the case: **the pottery place** (a short chapter about the first date) and
   **the studio** (repaint the candle holder).

## Files

- `index.html` – the markup and all the hand-drawn SVG art
- `styles.css` – design tokens, layout and motion
- `script.js` – everything interactive
- `assets/` – the Spinosaurus and Ceratosaurus drawings (WebP) and the
  self-hosted fonts (Fraunces, Karla, Caveat, Special Elite)
- `DESIGN_AUDIT.md` – notes from the redesign

## Running it

Open `index.html` in a browser, or serve the folder with any static server:

```sh
python3 -m http.server
```

It's published with GitHub Pages straight from `main`; there is no build step.

## Notes

- Progress is remembered in the browser (`localStorage`): `zenith-case-003` for the
  case, `zenith-glaze` for the studio, `zenith-date-seen` for the chapter.
  The case file has a "reopen the case" link to start over.
- The page respects the system "reduce motion" setting: nothing drifts, but
  everything still works.
- Keyboard: everything is reachable with Tab. Arrow keys steer the ankylosaurus
  once the chase is on (or while resting); space brings a note while resting;
  Escape closes any overlay.
