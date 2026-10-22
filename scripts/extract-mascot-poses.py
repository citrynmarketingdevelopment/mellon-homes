"""Extract the approved, eyes-open poses from the supplied video.

Requires Python + imageio-ffmpeg (`python -m pip install imageio-ffmpeg`).
No generated imagery, background removal, mirroring, or changes to the source.
The locked camera and shoe baseline keep every pose in the same coordinates.
"""
import json
import subprocess
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference/gemini_generated_video_9deb4588.mp4"
OUTPUT = ROOT / "public/images/mellon-poses"
# Exact frame indices at the source's 24 fps; exclude blinks and later gestures.
POSES = {
    "neutral": 4,
    "left": 40,
    "up-left": 58,
    "up": 82,
    "up-right": 103,
    "right": 132,
    "down": 162,
}


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    for name, frame in POSES.items():
        subprocess.run(
            [
                ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
                "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1",
                "-c:v", "libwebp", "-quality", "90", "-compression_level", "6",
                "-y", str(OUTPUT / f"{name}.webp"),
            ],
            check=True,
        )
    manifest = {
        "source": SOURCE.name,
        "width": 1280,
        "height": 720,
        "fps": 24,
        "poses": {name: {"frame": frame, "seconds": frame / 24} for name, frame in POSES.items()},
    }
    (OUTPUT / "source.json").write_text(json.dumps(manifest, indent=2) + "\n")
    total = sum(path.stat().st_size for path in OUTPUT.glob("*.webp"))
    print(f"Extracted {len(POSES)} aligned poses: {total:,} bytes.")


if __name__ == "__main__":
    main()
