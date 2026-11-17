# Sarqyt — рекламный ролик для партнёров (Reels/TikTok/Stories)

1080×1920, 30 fps, 48 с. Сборка: Remotion (React) → ffmpeg (H.264, yuv420p, preset veryfast).

- `src/Root.tsx` — 8 сцен и таймлайн; `src/art.tsx` — Ерлан, покупатели, еда, реквизит (SVG).
- `public/logo.png` — логотип (иконка приложения Sarqyt); `public/ding.wav` — звук «Новый заказ».
- `build.sh` — полная пересборка. Музыка: `music.mp3` рядом со скриптом или `MUSIC_SRC=путь MUSIC_START=сек`.
- `node stills.mjs 100 900` — проверочные кадры в `out/`.

Палитра: зелёный #3E9B67, светло-зелёный #CFEBD9, тёмно-зелёный #1E4D37, белый #FFFFFF,
чёрный #111A15, акцент оранжевый #F5A03A (базовый цвет логотипа — #568B68).
