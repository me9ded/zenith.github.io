# Design audit

An audit of the page as it stood before the redesign (commit `a8bff25`).
I tested it in headless Chrome at 390×844 (inside a same-origin iframe, so the
mobile media queries really apply) and at 1280, 1440 and 1920 wide, and
clicked through every interaction with a scripted test suite.

## What the page is

A private page for one person's heavy days:

- a cover letter with an invitation button
- a painted candle holder that hands out notes, with secret and case-file
  notes hidden in the flame and the name
- an axolotl that opens a 4-in / 6-out breathing screen
- **Case #003**: three clues hidden around the page; finding them reveals two
  dinosaurs, who then chase the cursor (an ankylosaurus) around the page
- containment: the candle switches on two paddocks and the release buttons
  get eaten
- rest mode, which runs itself and rotates notes
- after the case: "the pottery place", a seven-scene chapter about the first
  date, and a studio for repainting the candle holder
- progress is kept in `localStorage`: case progress, the studio glaze, and
  whether the chapter has been seen

## Strengths (keep these)

- **The voice.** Lowercase, warm, funny, specific. The notes and case files
  are the heart of the page.
- **Hand-made SVG art.** The candle, the critters, the snakes, his kingsnake
  piece and the ankylosaurus all share one flat, soft, storybook style. The
  two dinosaur paintings are the richest artwork and the most characterful.
- **Strong colour seed.** Deep plum night, her pink, candle amber and cream
  already work together. A candle needs a dark room, so the evening setting is right.
- **Good type choices.** Fraunces (warm serif), Karla (clean sans), Caveat
  (handwriting) and Special Elite (typewriter) are a good kit.
- **Depth of discovery.** Hidden notes, secret flame notes, the case, the
  chapter, the studio. There is a lot to find.
- **Solid technical base.** Reduced-motion support, keyboard handling, overlay
  focus management, `inert`, stored progress.

## Weaknesses

### Composition and layout
- **One screen and floating widgets.** Everything sits in one viewport. The
  case tab, rest button, clues and axolotl are all `position: fixed` and hug
  the edges, so the page reads as scattered widgets rather than a place.
- **Desktop:** a 240px candle centred in a 1440px void. The clues end up
  300–600px away from anything, near the screen edges, and the axolotl swims
  across the full width of a huge empty band at the bottom.
- **No journey.** After the cover, nothing says what the page offers. The
  breathing exercise, the case and rest mode are only discoverable by accident
  or from one line in the cover letter.
- **The case lives in a 280px pop-over** in the corner; the verdict appears
  in the note area under the candle, away from the evidence.
- **Paddocks** drop in over the top corners of the viewport and cover the title
  on phones.

### Mobile (390px)
- **The axolotl swims right over the "case #003" button** (both sit at the
  bottom left), so the button is covered for part of every lap.
- The candle stage plus the fixed buttons leave the note only about 150px of height.
- His kingsnake piece sits flush against the right edge.
- The cover letter's hard `<br>` breaks plus 0.06em letter-spacing give a ragged
  shape with orphan lines ("our date," / "a lot."), and the lower half of the
  screen is empty.

### Typography
- **No scale.** Sizes are one-offs (0.62–1.9rem) with no steps.
- **Special Elite is overused**: on the case tab, rest button, keepsakes,
  studio chips and kickers. A typewriter face should mean "case file" and
  little else.
- The body copy on the cover uses line-height 2 with wide letter-spacing,
  which reads airy but loose, and the muted mauve on plum is low contrast.
- The handwritten notes are large Caveat (1.85rem) floating directly on the
  background, with nothing to hold them.

### Colour
- Raw hex and rgba values are scattered through the stylesheet (89 colour
  literals); only 8 UI tokens exist.
- `--muted` (#a08ba0) is 5.4:1 on #221a27, which is fine, but the second hint line
  (0.8rem at 75% opacity) is only 3.4:1, below the 4.5:1 minimum.
- The interactive elements have no consistent accent: pink pills, amber case
  tab, pink rest button, yellow release buttons.

### Interaction
- **Notes have no "object".** A note fades in as loose text; there is no
  "another" control other than clicking the candle again, and no way to put a
  note away.
- **Breathing:** the glow animation (a CSS loop) and the "breathe in / out"
  text (JS timers) are driven separately and drift apart. There is no pause, no
  sense of progress and no end.
- **Clue feedback is easy to miss:** the corner panel pops open; nothing marks the moment.
- **Rest mode** has no visible "on" state apart from the corner button.
- The candle's "lit" state and "note revealed" state are not visually distinct.

### Accessibility
- The candle scene is a `div role="button"` containing two real `<button>`s
  (the flame and his piece), so interactive elements are nested.
- The name easter egg (`<em id="nameTap">`) can't be reached by keyboard. That's
  acceptable for a secret, but it has no role either.
- Low-contrast hint text (see above).
- There are no landmarks apart from `header`.
- Each chaser is a `div role="button"`; acceptable, since it is a toy, but noted.

### Code
- About 110 KB of HTML, CSS and JS in one file.
- Fonts come from Google Fonts: a third-party request, and a flash of fallback
  text on slow phones.

## Opportunities

1. **Turn the page into a short journey**: cover → "what sounds good right now?"
   → the candle → the breathing pond → the case board → rest → a quiet ending.
   Each experience gets its own section, so nothing has to float.
2. **Give every kind of content its own material:** notes on small paper cards,
   the case as a manila case file with evidence slots and a stamp, breathing
   as an open ambient space, navigation as plain text.
3. **Hide the clues in the sections themselves** (by the candle, by the water,
   at the end of the page), with a detective's hint for each, so finding them
   becomes a reason to explore.
4. **Make the paddocks flank the candle stage**, since the candle is the fence
   switch, instead of covering the viewport corners.
5. **Breathing driven by one clock**, with clear in/out phases, a breath
   counter, pause/resume and a gentle finish after a minute.
6. **Build a real token system** for colour, type, space, radius and motion;
   self-host the fonts; split the code into `index.html`, `styles.css` and
   `script.js`.

---

# The sketchbook (added October 2026)

## Where it fits

The page already reads as a short journey (cover → choices → candle → pond →
case → rest → ending). The sketchbook joins it as its own stop, **"a little space
to draw"**, between the case and rest, and as a fifth way in on the welcome
cards. It lives in its own `sketchbook.js`, so nothing about the existing
experiences changed.

## Design

- **On the page**: a notebook left open on the table: dotted paper, spiral
  rings, a slight tilt. It shows a peek of the current page, or a faint dotted
  flower when blank. The copy is the gentle line from the brief, lowercased to
  match the site's voice.
- **Drawing** happens in a full-screen overlay, like the breathing and studio
  screens, so a finger on a phone never fights page scrolling. Only the canvas
  sets `touch-action: none`.
- **The page** is a 4:5 notebook leaf (1000×1250 page units). On desktop the tools
  sit in a column beside it so the page can be large; on phones they stack
  beneath, with icon-only tools (labels kept for screen readers).
- **Tools**, kept few: 8 colours from the site's palette, 3 brush sizes, an
  eraser, undo and redo. Then save draft, download, and (when connected) share.
  The chosen colour gets a tick, so it never relies on colour alone.
- **The shared gallery** is polaroids on the dark table, each with a handwritten
  title, the date, and "yours" / "from …". Opening one shows it large.
- **Language** says plainly where a drawing is: "only on this device · not
  shared", "saved as a draft · only on this device", "shared ♡". Nothing
  nudges her to share, draw more, or come back.

## Technical constraints and decisions

- **GitHub Pages is static**, so privacy can't come from the site. Supabase
  provides sign-in, a database and private storage; row-level security and
  storage policies enforce everything (see README).
- **Strokes, not pixels**: the drawing is a list of strokes in page units, so
  resizing, rotation and high-DPI screens re-draw losslessly, and undo/redo are exact.
- **Drafts in IndexedDB**: local only, and never uploaded automatically, including
  when the connection comes back.
- **The Supabase client is vendored and lazy-loaded**: no CDN, and it's only
  fetched when someone opens the gallery or shares.
- **One-time codes, not magic links**: a code works even when the email opens
  in a different app's browser, which breaks magic links on phones.
- **Uploads use XHR** so real progress can be shown, and a drawing is only
  called "shared" after both the image upload and the database row succeed. If
  the row fails, the image is removed again.
