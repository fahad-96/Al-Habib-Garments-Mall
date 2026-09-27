#!/usr/bin/env python3
"""Builds the home page hero video loops from the shop's two bonfire clips.

The clips are only ~5 seconds long, so a plain <video loop> would visibly restart. This script:
  1. stabilises each clip (tripod mode: the whole clip is locked to its first frame, with a small
     zoom that hides the moving edges), so the camera drift no longer jumps at a cut,
  2. strings several overlapping parts of the clip together with slow crossfades, so the fire never
     repeats in the same order within one pass (~15 s landscape, ~12 s portrait),
  3. crossfades the end of that sequence back into its start, so <video loop> is seamless,
  4. writes a VP9 WebM, an H.264 MP4 fallback (no audio) and a WebP poster frame for each into public/video.

Usage (needs ffmpeg with libvidstab, e.g. Ubuntu 24.04 `apt-get install ffmpeg`):
  python3 scripts/hero-video/build.py
"""
import json
import os
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "scripts/hero-video/source")
OUT = os.path.join(ROOT, "public/video")
FADE = 1.0  # seconds of crossfade between parts, and at the loop point
H264_CRF = 31
VP9_BITRATE = {"hero-bonfire-landscape": "1500k", "hero-bonfire-portrait": "1100k"}

# (source, output name, size, parts as (start, end) seconds within the clip)
CLIPS = [
    ("bonfire-landscape.mp4", "hero-bonfire-landscape", (1280, 720), [(0.0, 5.4), (1.1, 5.4), (0.3, 4.4), (1.8, 5.4)]),
    ("bonfire-portrait.mp4", "hero-bonfire-portrait", (720, 1280), [(0.0, 4.5), (1.0, 4.5), (0.2, 3.8), (1.5, 4.5)]),
]


def run(*args):
    subprocess.run(args, check=True)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path], check=True, capture_output=True, text=True).stdout
    return float(json.loads(out)["format"]["duration"])


def build(src, name, size, parts, tmp):
    w, h = size
    src = os.path.join(SRC, src)
    trf = os.path.join(tmp, f"{name}.trf")
    stable = os.path.join(tmp, f"{name}-stable.mp4")
    seq = os.path.join(tmp, f"{name}-seq.mp4")
    # 1. Stabilise.
    run("ffmpeg", "-v", "error", "-y", "-i", src, "-vf", f"vidstabdetect=tripod=1:shakiness=6:accuracy=15:result={trf}", "-f", "null", "-")
    run("ffmpeg", "-v", "error", "-y", "-i", src, "-an", "-vf",
        f"vidstabtransform=tripod=1:input={trf}:optzoom=1:interpol=bicubic,scale={w}:{h}:flags=lanczos,fps=30,format=yuv420p",
        "-c:v", "libx264", "-crf", "12", "-preset", "fast", stable)
    # 2. Overlapping parts joined with crossfades.
    graph, prev, length = [], None, 0.0
    for i, (a, b) in enumerate(parts):
        graph.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[p{i}]")
        if prev is None:
            prev, length = f"p{i}", b - a
            continue
        graph.append(f"[{prev}][p{i}]xfade=transition=fade:duration={FADE}:offset={length - FADE:.3f}[x{i}]")
        prev, length = f"x{i}", length + (b - a) - FADE
    run("ffmpeg", "-v", "error", "-y", "-i", stable, "-filter_complex", ";".join(graph), "-map", f"[{prev}]", "-c:v", "libx264", "-crf", "12", "-preset", "fast", seq)
    # 3. Seamless loop: the body from FADE to the end, whose last FADE seconds fade into the first FADE seconds.
    t = duration(seq)
    loop = (
        f"[0:v]split[a][b];"
        f"[a]trim={FADE}:{t},setpts=PTS-STARTPTS[body];"
        f"[b]trim=0:{FADE},setpts=PTS-STARTPTS[head];"
        f"[body][head]xfade=transition=fade:duration={FADE}:offset={t - 2 * FADE:.3f},format=yuv420p[v]"
    )
    master = os.path.join(tmp, f"{name}-loop.mp4")
    run("ffmpeg", "-v", "error", "-y", "-i", seq, "-filter_complex", loop, "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "10", "-preset", "fast", master)
    # VP9 WebM first (Chrome, Edge, Firefox, recent Safari), H.264 MP4 as the fallback every browser plays.
    webm = os.path.join(OUT, f"{name}.webm")
    vp9 = ["-an", "-c:v", "libvpx-vp9", "-b:v", VP9_BITRATE[name], "-deadline", "good", "-cpu-used", "1", "-row-mt", "1", "-pix_fmt", "yuv420p"]
    run("ffmpeg", "-v", "error", "-y", "-i", master, *vp9, "-pass", "1", "-passlogfile", os.path.join(tmp, name), "-f", "null", "-")
    run("ffmpeg", "-v", "error", "-y", "-i", master, *vp9, "-pass", "2", "-passlogfile", os.path.join(tmp, name), webm)
    mp4 = os.path.join(OUT, f"{name}.mp4")
    run("ffmpeg", "-v", "error", "-y", "-i", master, "-an", "-c:v", "libx264", "-profile:v", "high", "-crf", str(H264_CRF), "-preset", "veryslow", "-movflags", "+faststart", mp4)
    # 4. Poster: the loop's first frame, so the swap from poster to video is invisible.
    poster = os.path.join(OUT, f"{name}.webp")
    run("ffmpeg", "-v", "error", "-y", "-i", master, "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", poster)
    print(f"{name}: {duration(mp4):.1f} s, WebM {os.path.getsize(webm) / 1024:.0f} KB, MP4 {os.path.getsize(mp4) / 1024:.0f} KB, poster {os.path.getsize(poster) / 1024:.0f} KB")


os.makedirs(OUT, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    for clip in CLIPS:
        build(*clip, tmp)
