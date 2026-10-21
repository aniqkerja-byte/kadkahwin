"""Build a flat AS lettermark from the project's Cormorant Garamond outlines."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / 'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff'
font = TTFont(FONT)
glyphs = font.getGlyphSet()


def outline(letter, x, top, height, width_scale=1):
    glyph = glyphs[font.getBestCmap()[ord(letter)]]
    bounds = BoundsPen(glyphs)
    glyph.draw(bounds)
    left, bottom, right, upper = bounds.bounds
    sy = height / (upper - bottom)
    sx = sy * width_scale
    pen = SVGPathPen(glyphs)
    glyph.draw(TransformPen(pen, (sx, 0, 0, -sy, x - left * sx, top + upper * sy)))
    return pen.getCommands()


# Overlapping capitals form one compact mark; no ampersand or ornament.
a = outline('A', 8, 10, 146, .88)
s = outline('S', 114, 10, 146, 1.05)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 168" role="img" aria-labelledby="title">
  <title id="title">Monogram AS</title>
  <g fill="#e8c985">
    <path d="{a}"/>
    <path d="{s}"/>
  </g>
</svg>
'''
(ROOT / 'public/assets/monogram-as-minimal-v2.svg').write_text(svg, encoding='utf8')
print('Created public/assets/monogram-as-minimal-v2.svg')
