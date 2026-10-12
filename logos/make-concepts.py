#!/usr/bin/env python3
"""Generate fresh KitFix icon concepts (skill: logo-designer, phase 2).

WHY: the five concepts already in logos/concepts/ are five variations on one idea - a scissors-K
monogram with gradients and a fabric filter, drawn 1024x512 with a wordmark. They are wordmark-first and
gradient/filter-heavy, which fights the job the mark actually has: sitting in a 40px card slot, a
favicon and a PWA tile. The live site's own mark is flat and two-colour, so anything for this brand has
to survive being flat and small.

So these three are ICON-first: 512x512, flat, at most three colours, no gradients, no filters, no
transforms - the conventions in the skill. Each is a deliberately different direction, not a variation:

  6  STITCH PATCH   the tile IS the patch: gold square, inset stitch border in ink, cream seam across
  7  KIT SILHOUETTE a bold jersey with the repair seam stitched across the chest
  8  STITCHED K     the K built as thick stitch dashes, echoing the live KF tile but ownable

Colours are the live site's own tokens, read from its stylesheet:
  gold #F2B01E (--color-stitch) · ink #0F1C10 (--color-ink) · cream #EFE9D8 (--color-thread)
  pitch #24572A (--color-pitch)

Run: python3 logos/make-concepts.py     (writes logos/concepts-concept-{6,7,8}.svg)
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent / "concepts"
GOLD, INK, CREAM, PITCH = "#F2B01E", "#0F1C10", "#EFE9D8", "#24572A"

HEAD = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="KitFix">
  <title>KitFix</title>
'''

CONCEPT_6 = HEAD + f'''  <!-- concept 6: the tile is the patch. Gold ground, an inset stitch border sewn in ink, one cream seam
       running across the repair. Reads at 16px because every element is a thick shape, and it says
       "repaired" without drawing a jersey. -->
  <rect width="512" height="512" fill="{GOLD}" />
  <rect x="66" y="66" width="380" height="380" fill="none" stroke="{INK}" stroke-width="34"
        stroke-dasharray="112 54" />
  <path d="M92 424 L420 96" fill="none" stroke="{CREAM}" stroke-width="46" stroke-linecap="round" />
  <path d="M92 424 L420 96" fill="none" stroke="{INK}" stroke-width="16" stroke-dasharray="52 44"
        stroke-linecap="round" />
</svg>
'''

CONCEPT_7 = HEAD + f'''  <!-- concept 7: kit silhouette. A bold jersey in gold on ink with the repair seam stitched across the
       chest. The clearest at a glance about what the business does, and the only one that reads as a
       garment rather than a symbol. -->
  <rect width="512" height="512" fill="{INK}" />
  <!-- body -->
  <path d="M176 122 L336 122 L336 118 Q336 106 348 106 L388 106 Q400 106 400 118 L400 210 Q400 222
           388 222 L352 222 L352 400 Q352 414 338 414 L174 414 Q160 414 160 400 L160 222 L124 222
           Q112 222 112 210 L112 118 Q112 106 124 106 L164 106 Q176 106 176 118 Z" fill="{GOLD}" />
  <!-- neckline -->
  <path d="M212 122 Q256 168 300 122" fill="none" stroke="{INK}" stroke-width="26" stroke-linecap="round" />
  <!-- the repair seam, stitched across the chest -->
  <path d="M160 262 L352 262" fill="none" stroke="{CREAM}" stroke-width="22" stroke-linecap="round"
        stroke-dasharray="34 22" />
</svg>
'''

CONCEPT_8 = HEAD + f'''  <!-- concept 8: the stitched K. Built from thick stroke segments rather than a font, so it is identical
       everywhere and needs no font to render. The two arms are separate dashes: a stitched letter. -->
  <rect width="512" height="512" fill="{GOLD}" />
  <path d="M166 92 L166 412" fill="none" stroke="{INK}" stroke-width="62" stroke-linecap="butt" />
  <!-- the arms run long and meet the stem at one junction, so the letter reads as a K and not as
       loose blocks; each arm is split once, which is the stitch. The coordinates are integer-centred:
       the ink box is 241 wide from x=135 and 384 tall from y=64, so the letter sits dead centre in the
       512 square (verified by measuring the rendered ink, not by eye). -->
  <path d="M192 248 L266 174" fill="none" stroke="{INK}" stroke-width="60" stroke-linecap="round" />
  <path d="M282 158 L346 94" fill="none" stroke="{INK}" stroke-width="60" stroke-linecap="round" />
  <path d="M192 264 L266 338" fill="none" stroke="{INK}" stroke-width="60" stroke-linecap="round" />
  <path d="M282 354 L346 418" fill="none" stroke="{INK}" stroke-width="60" stroke-linecap="round" />
</svg>
'''


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for number, svg in ((6, CONCEPT_6), (7, CONCEPT_7), (8, CONCEPT_8)):
        path = OUT / f"concept-{number}.svg"
        path.write_text(svg)
        print(f"wrote {path} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()
