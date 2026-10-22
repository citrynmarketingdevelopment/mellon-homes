"""Prepare a seek-friendly clip without altering the supplied source.

Requires imageio-ffmpeg. Every frame is independently decodable (H.264 intra).
The continuous segment excludes the early blink and late hand gestures.
"""
import json
import re
import subprocess
from pathlib import Path

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference/gemini_generated_video_9deb4588.mp4"
OUTPUT = ROOT / "public/videos"
START, NEUTRAL, END = 54, 78, 138
FPS = 24


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([
        ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-vf", f"trim=start_frame={START}:end_frame={END + 1},setpts=N/({FPS}*TB)",
        "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-g", "1", "-bf", "0", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        "-r", str(FPS), "-fps_mode", "cfr",
        "-y", str(OUTPUT / "mellon-scrub.mp4"),
    ], check=True)
    verification = subprocess.run([
        ffmpeg, "-hide_banner", "-i", str(OUTPUT / "mellon-scrub.mp4"),
        "-vf", "showinfo", "-an", "-f", "null", "-",
    ], capture_output=True, text=True, check=True)
    frames = re.findall(r"iskey:(\d) type:(\w)", verification.stderr)
    if len(frames) != END - START + 1 or any(frame != ("1", "I") for frame in frames):
        raise RuntimeError(f"Expected {END - START + 1} independently decodable frames, got {len(frames)}")
    subprocess.run([
        ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(SOURCE),
        "-vf", f"select=eq(n\\,{NEUTRAL})", "-frames:v", "1",
        "-c:v", "libwebp", "-quality", "90", "-compression_level", "6",
        "-y", str(OUTPUT / "mellon-scrub-poster.webp"),
    ], check=True)
    manifest = {
        "source": SOURCE.name, "sourceStartFrame": START, "sourceEndFrame": END,
        "fps": FPS, "frameCount": END - START + 1, "neutralFrame": NEUTRAL - START,
        "width": 1280, "height": 720,
        "video": "/videos/mellon-scrub.mp4",
        "poster": "/videos/mellon-scrub-poster.webp",
    }
    (OUTPUT / "mellon-scrub.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"{manifest['frameCount']} frames, "
          f"{(OUTPUT / 'mellon-scrub.mp4').stat().st_size:,} bytes; source unchanged.")


if __name__ == "__main__":
    main()
