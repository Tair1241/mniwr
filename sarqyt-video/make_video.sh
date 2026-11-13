#!/usr/bin/env bash
# Full rebuild: timeline + voice track -> frames -> mp4.
# Drop new ElevenLabs clips into ../vo/sNN.mp3 and rerun this script.
set -euo pipefail
cd "$(dirname "$0")"
python3 build_timeline.py
if [ "${SKIP_RENDER:-0}" != "1" ]; then rm -rf frames; node render.js "${WORKERS:-6}"; fi
OUT=${OUT:-sarqyt_demo.mp4}
ffmpeg -v error -y -framerate 30 -i frames/%05d.jpg -i voice.wav \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 192k -shortest "$OUT"
ffprobe -v error -show_entries format=duration,size -of compact "$OUT"
