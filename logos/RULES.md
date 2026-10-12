# KitFix mark — the rules

The approved mark is **concept 8, the stitched K**: the letter K built from thick stitch dashes on a solid
gold square. Approved by Leroy 2026-10-12 from three directions, chosen because it is the one that
survives being small (see the measurements below) and because the stitch dash is already this brand's
signature element (`DESIGN.md`: *"Signature Element — Stitch Seam: dashed gold divider"*).

Files: `export/logo.svg` (master, 512x512, the only source of truth) and `export/logo-{16,32,48,192,512,1024,2048}.png`.

## Why the letter is outlines and not text

The K is drawn as paths. An SVG loaded through `<img>`, a favicon or a PWA tile **cannot fetch a font**,
so a `<text>` mark silently renders in whatever the viewer happens to have, differently on every machine.
Outlines are the only version of this asset that is identical everywhere. Nothing in the mark needs a
font, which is also why it exports identically through cairosvg.

## Colour

| Role | Value | Where it comes from |
|---|---|---|
| Tile | `#F2B01E` | the live site's `--color-stitch`, their single accent |
| Letter | `#0F1C10` | the live site's `--color-ink`, used for text on gold |
| Optional reversal on dark, letter only | tile `#0F1C10`, letter `#F2B01E` | same two tokens, inverted |

No gradients, no filters, no third colour. The old bright green (`#00E859`) belongs to a retired palette
and must not come back — it is what this mark replaced.

## Minimum size and clear space

- **Minimum 16px** digital for the icon (measured legible, see below). Below 16px use nothing.
- **Minimum 10mm** wide in print — derived from the same proportions, not measured; at 10mm the stroke
  width is about 1.2mm, comfortably printable. If a print job needs smaller, don't shrink the mark.
- **Clear space: 25% of the mark's height** on all four sides, kept free of type, rules and other logos.
- The tile is **square with sharp corners** — `DESIGN.md`: *"Sharp corners everywhere — the workshop /
  repair-sheet identity."* Never round it.
- Where the mark sits beside the wordmark, set the wordmark in **Archivo Black** with the full stop in
  `#F2B01E` (the live header's own treatment) and keep the gap at half the tile's width.

## Small-size behaviour, measured

Coverage of the letter's own ink, as a share of the tile, on the **exported PNGs** (not the vector):

| Size | 16px | 24px | 32px | 40px | 48px | 64px |
|---|---|---|---|---|---|---|
| Coverage | 19.5% | — | 19.4% | — | 17.3% | — |
| (from the SVG, wider sweep) | 18.8% | 21.7% | 19.8% | 19.1% | 18.8% | 19.2% |

Spread 2.2pt across a 3x scale change on the PNGs, 2.9pt on the vector sweep. **Coverage holding roughly
constant is the signal that the strokes survive the shrink** rather than turning to mush. The ink box also
scales linearly — 7x12px at 16px to 30x49px at 64px.

The letter is centred on its **measured ink box**, not on cap height: the ink is 241 units wide starting at
x=135 and 384 units tall starting at y=64 inside the 512 square, verified by rasterising and finding the
ink within 1px of the tile centre at 256px. Centring on cap height alone leaves heavy capitals visibly
high, and a vision review will not tell you that reliably — the pixel measurement does.

## Variants to use where

| Context | Use |
|---|---|
| Favicon, PWA tile, app icon | `logo-32.png` (favicon), `logo-192.png` / `logo-512.png` (PWA), `logo.svg` where SVG icons are supported |
| Site header beside the wordmark | `logo.svg` at 36–40px, no rounding, 25% clear space |
| Social avatar | `logo-512.png`, full bleed |
| Reversed on a dark panel | letter-only variant above; never put the gold tile on gold |

## What was rejected, and why it is written down

- **Concepts 1–5** (in `concepts/`): one idea five times — a scissors-K monogram with gradients, a fabric
  filter and a 1024x512 wordmark. Wordmark-first and gradient-heavy, which fights a 40px card slot, a
  favicon and a PWA tile.
- **Concept 6, stitch patch**: measured 14.7–23.8% coverage across 16–64px — the dashes alias once the
  tile is small. **Collapses.** Fine for a large lockup, not usable as the icon.
- **Concept 7, kit silhouette**: holds (spread 2.4pt) and says what the business does at a glance, but the
  garment is heavy for a card slot. Kept in `concepts/` as the alternate direction.
