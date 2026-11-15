#!/usr/bin/env python3
"""Align a high-res map render (e.g. an overhead screenshot) to a map's playable area.

    python3 scripts/align-render.py <render image> <slug>          # find where the map is in the image
    python3 scripts/align-render.py <render image> <slug> --full   # the image IS the playable area

Liquipedia's high-res previews are usually exactly the playable area, so try --full first and check
that gold mines line up; use the search for screenshots with borders. Angled (perspective) shots
can't be aligned.

Needs Python 3 with numpy and Pillow. Run `npm run import-map` first: it writes the map's own
low-res minimap to map-files/.cache/<slug>-base.png, which this script matches the render against
(by where the water is). The aligned, cropped render is saved to scripts/assets/renders/<slug>.jpg;
then `npm run import-map -- --minimaps` draws the icons on it.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent


def water(im):
    a = np.asarray(im.convert('RGB')).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = ((b > r + 25) & (b > g + 10)).astype(float)
    return m - m.mean()


def main():
    args = [a for a in sys.argv[1:] if a != '--full']
    if len(args) != 2:
        sys.exit(__doc__)
    render = Image.open(args[0]).convert('RGB')
    slug = args[1]
    base = Image.open(ROOT / 'map-files' / '.cache' / f'{slug}-base.png').convert('RGB')
    dest = ROOT / 'scripts' / 'assets' / 'renders' / f'{slug}.jpg'
    dest.parent.mkdir(parents=True, exist_ok=True)
    if '--full' in sys.argv:
        w = min(render.width, base.width * 2)
        render.resize((w, round(w * base.height / base.width)), Image.LANCZOS).save(dest, quality=90)
        print(f'saved whole image as the playable area -> {dest.relative_to(ROOT)}')
        return

    # coarse search at 1/4 size: every scale/aspect, all offsets at once via FFT correlation
    k = 4
    small = render.resize((render.width // k, render.height // k)).filter(ImageFilter.GaussianBlur(1))
    rm = water(small)
    H, W = rm.shape
    fr = np.fft.rfft2(rm)
    target = base.width / base.height
    best = (-1e9,)
    for w in range(int(W * 0.4), W + 1, 3):
        for asp in np.arange(target * 0.7, target * 1.3, target * 0.01):
            h = int(round(w / asp))
            if h > H:
                continue
            g = water(base.resize((w, h)).filter(ImageFilter.GaussianBlur(1)))
            pad = np.zeros((H, W))
            pad[:h, :w] = g
            c = np.fft.irfft2(fr * np.conj(np.fft.rfft2(pad)), s=(H, W))
            c[H - h + 1:, :] = -1e9
            c[:, W - w + 1:] = -1e9
            y, x = np.unravel_index(np.argmax(c), c.shape)
            score = c[y, x] / (w * h)
            if score > best[0]:
                best = (score, w * k, h * k, x * k, y * k)

    # refine at full size
    _, w0, h0, x0, y0 = best
    rm = water(render.filter(ImageFilter.GaussianBlur(2)))
    fine = (-1e9,)
    for w in range(w0 - 8, w0 + 9, 2):
        for h in range(h0 - 8, h0 + 9, 2):
            g = water(base.resize((w, h)).filter(ImageFilter.GaussianBlur(2)))
            for x in range(x0 - 8, x0 + 9, 2):
                for y in range(y0 - 8, y0 + 9, 2):
                    if x < 0 or y < 0 or x + w > render.width or y + h > render.height:
                        continue
                    s = (rm[y:y + h:3, x:x + w:3] * g[::3, ::3]).mean()
                    if s > fine[0]:
                        fine = (s, x, y, w, h)
    score, x, y, w, h = fine
    out_w = min(w, base.width * 2)
    out = render.crop((x, y, x + w, y + h)).resize((out_w, round(out_w * base.height / base.width)), Image.LANCZOS)
    out.save(dest, quality=90)
    print(f'aligned: crop x={x} y={y} {w}x{h} (match {score:.3f}) -> {dest.relative_to(ROOT)}')
    if score < 0.08:
        print('! weak match: check the result, the render may not show this map')


if __name__ == '__main__':
    main()
