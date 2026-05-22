#!/usr/bin/env python3
"""
Strip the background from a photo and turn it into a game-ready sprite.

Usage:
    python3 tools/process_sprite.py <input> <output.png> [--max-width N]

Steps:
    1. Run rembg to remove background -> RGBA image.
    2. Crop to the bounding box of non-transparent pixels.
    3. Resize so the longer side matches --max-width (default 280px).
    4. Save as PNG with transparency.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image
from rembg import remove


def process(input_path: Path, output_path: Path, max_side: int) -> None:
    raw = input_path.read_bytes()
    cut = remove(raw)
    img = Image.open(__import__('io').BytesIO(cut)).convert('RGBA')

    # Crop to the bbox of non-transparent pixels.
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if bbox is None:
        print('warning: empty after background removal', file=sys.stderr)
        sys.exit(2)
    img = img.crop(bbox)

    # Resize so the longer side matches max_side, preserve aspect ratio.
    w, h = img.size
    scale = max_side / max(w, h)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    img = img.resize((new_w, new_h), Image.LANCZOS)

    # Ensure output dir exists.
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f'Saved {output_path} ({new_w}x{new_h})')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--max-width', type=int, default=280)
    args = parser.parse_args()
    process(args.input, args.output, args.max_width)


if __name__ == '__main__':
    main()
