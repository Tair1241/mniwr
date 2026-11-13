#!/usr/bin/env bash
# Full rebuild: timeline + voice track -> frames -> mp4.
# Drop new ElevenLabs clips into ../vo/sNN.mp3 and rerun this script.
set -euo pipefail
cd "$(dirname "$0")"
python3 build_timeline.py
if [ "${SKIP_RENDER:-0}" != "1" ]; then rm -rf frames; node render.js "${WORKERS:-6}"; fi
OUT=${OUT:-sarqyt_demo.mp4}
AUDIO=voice.wav
if [ -f ../music/music.mp3 ]; then
  # music under the voice: looped to length, ducked by the voice, faded in/out
  T=$(ffprobe -v error -show_entries format=duration -of csv=p=0 voice.wav)
  ffmpeg -v error -y -i voice.wav -stream_loop -1 -i ../music/music.mp3 -filter_complex \
    "[1:a]aresample=48000,atrim=0:$T,loudnorm=I=${MUSIC_LUFS:--27}:TP=-3,afade=t=in:d=2,afade=t=out:st=$(python3 -c "print($T-4)"):d=4[m];\
     [0:a]asplit=2[v][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=80:release=600[md];\
     [v][md]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]" -map "[out]" -ac 2 -ar 48000 mix.wav
  AUDIO=mix.wav
fi
ffmpeg -v error -y -framerate 30 -i frames/%05d.jpg -i $AUDIO \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 192k -shortest "$OUT"
ffprobe -v error -show_entries format=duration,size -of compact "$OUT"
