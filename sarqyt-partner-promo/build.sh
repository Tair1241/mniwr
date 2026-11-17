#!/usr/bin/env bash
# Rebuild sarqyt_partner_promo.mp4: Remotion render -> audio mix -> H.264 yuv420p (preset veryfast).
# Audio, if present next to this script:
#   voiceover.mp3 — voice track (built from vo/*.mp3 by assemble_audio.py using audio_plan.json)
#   music.mp3     — background music; sits about 18 dB under the voice (ducked), a bit louder in pauses
# Notification "ding" frames come from audio_plan.json.
set -euo pipefail
cd "$(dirname "$0")"
BE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[ -d node_modules ] || npm ci --no-audit --no-fund >/dev/null
if [ "${SKIP_RENDER:-0}" != "1" ]; then
  npx remotion render src/index.ts Promo out/video_silent.mp4 --browser-executable=$BE \
    --codec=h264 --pixel-format=yuv420p --crf=18 --concurrency=4
fi
[ -d vo ] && python3 assemble_audio.py
python3 - <<'PY'
import json, os, subprocess
P = json.load(open('audio_plan.json')); T = P['total_frames'] / P['fps']
ins = ['-i', 'out/video_silent.mp4']; parts = []; mix = []
k = 1
if os.path.exists('voiceover.mp3'):
    ins += ['-i', 'voiceover.mp3']; V = k; k += 1
else:
    V = None
if os.path.exists('music.mp3'):
    ins += ['-stream_loop', '-1', '-i', 'music.mp3']; M = k; k += 1
    # music normalised to the voice level (-16 LUFS), then a volume envelope:
    # -18 dB while the narrator speaks, -8 dB in pauses, 0.25 s ramps
    base = -16 if V else -17
    parts.append(f'[{M}:a]aresample=48000,atrim=0:{T},loudnorm=I={base}:TP=-2,afade=t=in:d=0.4,afade=t=out:st={T-2}:d=2[m0]')
    if V:
        iv = []
        for f, fr in P['voice']:
            d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
            iv.append((fr / P['fps'], fr / P['fps'] + d))
        duck = '0'
        for a, b in iv:
            duck = f"max({duck},clip(min(t-{a - 0.25:.3f},{b + 0.3:.3f}-t)/0.25,0,1))"
        parts.append(f"[m0]volume='pow(10,(-8-10*{duck})/20)':eval=frame[m]")
        parts.append(f'[{V}:a]aresample=48000[v]')
        mix += ['[v]', '[m]']
    else:
        mix += ['[m0]']
elif V:
    parts.append(f'[{V}:a]aresample=48000[v]'); mix += ['[v]']
ins += ['-i', 'public/ding.wav']; D = k
dings = P['ding']
parts.append(f'[{D}:a]asplit={len(dings)}' + ''.join(f'[d{i}]' for i in range(len(dings))))
for i, fr in enumerate(dings):
    ms = round(fr / P['fps'] * 1000); parts.append(f'[d{i}]adelay={ms}|{ms},volume=0.9[dd{i}]'); mix.append(f'[dd{i}]')
parts.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0,apad,atrim=0:{T},alimiter=limit=0.95[aout]')
parts.insert(0, '[0:v]scale=in_range=pc:out_range=tv,format=yuv420p[vid]')
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(parts), '-map', '[vid]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-r', str(P['fps']),
    '-c:a', 'aac', '-b:a', '192k', '-t', str(T), '-movflags', '+faststart', 'sarqyt_partner_promo.mp4'])
PY
ffprobe -v error -show_entries stream=codec_name,pix_fmt,width,height:format=duration -of compact sarqyt_partner_promo.mp4
