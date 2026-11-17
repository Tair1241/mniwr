#!/usr/bin/env bash
# Rebuild sarqyt_partner_promo.mp4: Remotion render -> mix audio -> H.264 yuv420p (veryfast).
# Audio: voiceover.mp3 / music.mp3 next to this script are used if present
# (music at -18 dB under the voice); MUSIC_SRC overrides the music file.
set -euo pipefail
cd "$(dirname "$0")"
BE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npm ci --no-audit --no-fund >/dev/null
npx remotion render src/index.ts Promo out/video_silent.mp4 --browser-executable=$BE --codec=h264 --pixel-format=yuv420p --crf=18 --concurrency=4
MUSIC=${MUSIC_SRC:-music.mp3}; MSTART=${MUSIC_START:-0}
VF="[0:v]scale=in_range=pc:out_range=tv,format=yuv420p[v]"
DING="[DI]asplit=2[d1][d2];[d1]adelay=26933|26933,volume=1.4[a1];[d2]adelay=30467|30467,volume=1.4[a2]"
if [ -f voiceover.mp3 ] && [ -f "$MUSIC" ]; then
  IN=(-i voiceover.mp3 -ss "$MSTART" -t 48 -i "$MUSIC" -i public/ding.wav)
  AF="[1:a]aresample=48000[vo];[2:a]aresample=48000,loudnorm=I=-16,volume=-18dB,afade=t=out:st=46:d=2[m];${DING/DI/3:a};[vo][m][a1][a2]amix=inputs=4:normalize=0:duration=longest,alimiter=limit=0.95[aout]"
elif [ -f "$MUSIC" ]; then
  IN=(-ss "$MSTART" -t 48 -i "$MUSIC" -i public/ding.wav)
  AF="[1:a]aresample=48000,loudnorm=I=-17:TP=-2,afade=t=in:d=0.4,afade=t=out:st=46:d=2[m];${DING/DI/2:a};[m][a1][a2]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.95[aout]"
else
  IN=(-i public/ding.wav)
  AF="${DING/DI/1:a};[a1][a2]amix=inputs=2:normalize=0,apad[aout]"
fi
ffmpeg -v error -y -i out/video_silent.mp4 "${IN[@]}" -filter_complex "$VF;$AF" -map "[v]" -map "[aout]" \
  -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -color_range tv -r 30 -c:a aac -b:a 192k -t 48 -movflags +faststart sarqyt_partner_promo.mp4
ffprobe -v error -show_entries stream=codec_name,pix_fmt,width,height:format=duration -of compact sarqyt_partner_promo.mp4
