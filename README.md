# zenith

A small, private page for heavy days: a candle that hands out notes, a breathing
exercise with the axolotl, and a detective case with two dinosaurs who absolutely
did eat the cookie.

## Files

- `index.html` – the whole page (markup, styles and script)
- `assets/` – the Spinosaurus and Ceratosaurus drawings (WebP)

## Running it

Open `index.html` in a browser, or serve the folder with any static server:

```sh
python3 -m http.server
```

It's published with GitHub Pages straight from this branch; there is no build step.

## Notes

- Case progress is remembered in the browser (`localStorage`); the case panel has a
  "reopen the case" link to start over.
- The page respects the system "reduce motion" setting.
- Arrow keys steer the ankylosaurus once the chase is on or rest mode is running.
