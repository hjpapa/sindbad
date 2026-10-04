"""Uniformly contain the entire native RGBA canvas; no crop or painting."""
from PIL import Image, ImageOps

def normalize_world_prop(native):
    assert native.mode == 'RGBA' and 0.70 < native.width / native.height < 0.80
    resized = ImageOps.contain(native, (384, 512), Image.Resampling.LANCZOS)
    offset = ((384-resized.width)//2, (512-resized.height)//2)
    canvas = Image.new('RGBA', (384, 512), (0, 0, 0, 0))
    canvas.paste(resized, offset)
    return canvas, {'resizedSize':list(resized.size), 'offset':list(offset)}
