# Sarqyt — рекламный ролик для партнёров (Reels/TikTok/Stories)

1080×1920, 30 fps, 50 с, с озвучкой ElevenLabs (голос Pavel, eleven_v4) и музыкой. Сборка: Remotion (React) → ffmpeg (H.264, yuv420p, preset veryfast).

- `src/Root.tsx` — 8 сцен и таймлайн; `src/art.tsx` — Ерлан, покупатели, еда, реквизит (SVG).
- `public/logo.png` — логотип (иконка приложения Sarqyt); `public/ding.wav` — звук «Новый заказ».
- `vo/` — фрагменты озвучки по сценам; `audio_plan.json` — на каком кадре звучит каждый фрагмент и звук уведомления.
- `assemble_audio.py` — собирает `voiceover.mp3` из `vo/`; `music.mp3` — фоновая музыка (ElevenLabs Music).
- `build.sh` — полная пересборка: рендер → озвучка → музыка на −18 dB под голосом (−8 dB в паузах) → mp4. `SKIP_RENDER=1` — только звук.
- `node stills.mjs 100 900` — проверочные кадры в `out/`.

Палитра: зелёный #3E9B67, светло-зелёный #CFEBD9, тёмно-зелёный #1E4D37, белый #FFFFFF,
чёрный #111A15, акцент оранжевый #F5A03A (базовый цвет логотипа — #568B68).
