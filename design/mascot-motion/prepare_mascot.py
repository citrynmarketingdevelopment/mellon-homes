"""Crop and matte the supplied mascot video; keep its original motion."""
from pathlib import Path
import json
import subprocess
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'images' / 'mascot-motion'
OUT.mkdir(parents=True, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SOURCE = ROOT / 'reference' / 'gemini_generated_video_41490059.mp4'
WIDTH, HEIGHT, FPS = 640, 360, 24
CROP = (120, 0, 500, 360)
TILE = 160

decoder = subprocess.Popen([
    FFMPEG, '-v', 'error', '-i', str(SOURCE), '-an',
    '-vf', f'scale={WIDTH}:{HEIGHT}', '-f', 'rawvideo',
    '-pix_fmt', 'rgb24', 'pipe:1'
], stdout=subprocess.PIPE)
frames = []
coverage = []
while True:
    raw = decoder.stdout.read(WIDTH * HEIGHT * 3)
    if not raw:
        break
    rgb = np.frombuffer(raw, np.uint8).reshape(HEIGHT, WIDTH, 3).copy()
    color = rgb.astype(np.float32)
    r, g, b = color.transpose(2, 0, 1)
    background = (r-g > 32) & (b-g > -9) & (r-b > 5) & (g > 35)
    boundary = np.zeros_like(background)
    boundary[[0,-1],:] = True
    boundary[:,[0,-1]] = True
    background = ndi.binary_propagation(boundary & background, mask=background)
    foreground = ~background
    foreground[:, :CROP[0]] = False
    foreground[:, CROP[2]:] = False
    labels, count = ndi.label(foreground)
    sizes = np.bincount(labels.ravel())
    keep = sizes > 36
    keep[0] = False
    mask = keep[labels]
    mask = ndi.binary_closing(mask, iterations=1)
    alpha = ndi.gaussian_filter(mask.astype(np.float32), 0.55)
    opaque = ndi.binary_erosion(mask, iterations=1)
    _, nearest = ndi.distance_transform_edt(~opaque, return_indices=True)
    edge = alpha < 0.96
    color[edge] = color[nearest[0][edge], nearest[1][edge]]
    alpha[alpha < 0.02] = 0
    rgba = np.dstack((color.astype(np.uint8), (alpha*255).astype(np.uint8)))
    cropped = Image.fromarray(rgba).crop(CROP)
    canvas = Image.new('RGBA', (400, 400))
    canvas.alpha_composite(cropped, (10, 20))
    frames.append(canvas.resize((320, 320), Image.Resampling.LANCZOS))
    ys, xs = np.where(mask)
    coverage.append([int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())])
decoder.wait()
assert decoder.returncode == 0 and len(frames) == 240, len(frames)

frames[12].save(OUT / 'mascot-poster.png')
frames[0].save(OUT / 'mascot-loop.webp', save_all=True,
               append_images=frames[1:], duration=[42,42,41]*80,
               loop=0, quality=84, method=5)

atlas = Image.new('RGBA', (16*TILE, 15*TILE))
for index, frame in enumerate(frames):
    atlas.alpha_composite(frame.resize((TILE, TILE), Image.Resampling.LANCZOS),
                          ((index % 16)*TILE, (index // 16)*TILE))
atlas.save(OUT / 'mascot-atlas.webp', lossless=True, method=5)
for chunk in range(15):
    page = Image.new('RGBA', (4*TILE, 4*TILE))
    for local in range(16):
        index = chunk*16 + local
        tile = atlas.crop(((index % 16)*TILE, (index // 16)*TILE,
                           (index % 16+1)*TILE, (index // 16+1)*TILE))
        page.alpha_composite(tile, ((local % 4)*TILE, (local // 4)*TILE))
    page.save(OUT / f'mascot-atlas-{chunk:02}.webp', lossless=True, method=5)

encoder = subprocess.Popen([
    FFMPEG, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba',
    '-s', '320x320', '-r', str(FPS), '-i', 'pipe:0', '-an',
    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0',
    '-crf', '32', '-b:v', '0', str(OUT / 'mascot-loop.webm')
], stdin=subprocess.PIPE)
for frame in frames:
    encoder.stdin.write(frame.tobytes())
encoder.stdin.close()
encoder.wait()
assert encoder.returncode == 0

sheet = Image.new('RGB', (800, 400), '#F4ABC0')
for i, frame_number in enumerate([0,24,48,72,96,144,192,239]):
    thumb = frames[frame_number].resize((200,200), Image.Resampling.LANCZOS)
    sheet.paste(thumb, ((i % 4)*200, (i // 4)*200), thumb)
sheet.save(ROOT / 'design' / 'mascot-motion' / 'matted-contact-sheet.png')
metadata = {'source': str(SOURCE.relative_to(ROOT)), 'fps': FPS,
            'frames': len(frames), 'duration': 10, 'cropAt640px': CROP,
            'atlas': {'columns':16,'rows':15,'tile':TILE},
            'boundingBoxRange': np.array(coverage).min(axis=0).tolist() +
                                np.array(coverage).max(axis=0).tolist()}
(OUT / 'metadata.json').write_text(json.dumps(metadata, indent=2))
print(json.dumps(metadata))
print({p.name:p.stat().st_size for p in OUT.iterdir()})
