"""Builds timeline.js (scene timings, subtitle cues, markers) and the voice track.

Scene length follows the voice clip. A scene whose clip is missing gets an
estimated length and silence, so the clip can be dropped in later and the
whole video rebuilt with the same command.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VO = os.path.join(HERE, '..', 'vo')
LEAD, TAIL = 0.35, 0.75
CPS = 13.2  # chars per second of the chosen voice (measured on existing clips)

SCENES = [
    ('almaty',   's01', 'Алматы. Тёплый день, горы на горизонте. Арман только вышел с последней пары... и у него урчит в животе.', {}),
    ('street',   's02', 'Столовую он пропустил: лекция затянулась. До дома ещё час, и он заходит в кафе у метро.', {}),
    ('cafe',     's03', 'Круассан с кофе стоят 3 790 тенге. Для студента это дорого за обычный перекус. А всё, что не продадут к закрытию, заведению придётся списать.', {'writeoff': 'А всё'}),
    ('bench',    's04', 'На скамейке Арман ищет, где поесть дешевле, и находит сайт Sarqytapp.com: «Сюрприз-боксы из кафе, пекарен и ресторанов Казахстана со скидкой до 70%».', {'site': 'и находит'}),
    ('how',      's05', 'Как это работает. Первое: к концу дня у кафе, пекарен и ресторанов остаётся свежая еда, которую не успели продать. Второе: заведение собирает её в сюрприз-бокс и выставляет в приложении Sarqyt со скидкой до 70%. Третье: вы выбираете бокс рядом с собой и оплачиваете его в приложении. Четвёртое: приходите в указанное время, показываете QR-код и забираете бокс. Покупатель платит меньше, заведение зарабатывает на том, что раньше списывало, а еда не попадает в мусор.',
        {'s1': 'Первое', 's2': 'Второе', 's3': 'Третье', 's4': 'Четвёртое', 'win': 'Покупатель'}),
    ('download', 's06', 'Арман скачивает приложение Sarqyt. Установка занимает меньше минуты. При первом запуске приложение сразу объясняет, что данные пользователя под защитой.', {}),
    ('register', 's07', 'Регистрация проходит по электронной почте — без пароля и длинных анкет. Арман вводит адрес, получает в письме шестизначный код, вводит его в приложении... и сразу попадает внутрь.', {}),
    ('price',    's08', 'В приложении — боксы из заведений рядом. Арман выбирает бокс пончиков за 2 013 тенге вместо 2 550. Это на 1 777 тенге дешевле, чем круассан с кофе.', {'box': 'Арман выбирает', 'cmp': 'Это на'}),
    ('pay',      's09', 'Оплата проходит прямо в приложении. И сразу после неё Арман видит свой заказ, время выдачи и QR-код с кодом получения. Больше ничего не нужно.', {'after': 'И сразу'}),
    ('map',      's10', 'Одно нажатие на «Маршрут» — и карта показывает, где находится заведение и как до него дойти.', {}),
    ('pickup',   's11', 'Через пять минут Арман у кафе. Он показывает QR-код, сотрудник сканирует его, и бокс у него в руках.', {'show': 'Он показывает', 'scan': 'сотрудник', 'hand': 'и бокс'}),
    ('win',      's12', 'Внутри — свежие пончики. Арман заплатил 2 013 вместо 3 790 тенге, кафе получило выручку за то, что иначе списало бы, а еда не попала в мусор. Выигрывают все трое.',
        {'a': 'Арман заплатил', 'c': 'кафе получило', 'g': 'а еда', 'all': 'Выигрывают'}),
    ('metrics',  's13', 'Так выглядит путь пользователя в Sarqyt: от голода до бокса в руках за несколько минут. За первую неделю продаж подключено 11 заведений, из них 10 оплатили взносы. Приложение установили 5 000 раз, активных пользователей 500, продано 190 боксов, и 36% покупателей вернулись за повторной покупкой.',
        {'week': 'За первую', 'm1': 'подключено', 'm2': 'Приложение установили', 'm3': 'активных', 'm4': 'продано', 'm5': 'и 36%'}),
    ('final',    's14', 'Sarqyt зарабатывает наценку в 15% с каждого бокса и абонемент заведения. Мы привлекаем 100 тысяч долларов, чтобы подключить сети заведений и выйти за пределы Алматы.', {'raise': 'Мы привлекаем'}),
]
EXTRA_TAIL = {'final': 3.5, 'almaty': 0.6}
MIN_DUR = {'download': 8.0}


def dur_of(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(out)


def split_subs(text):
    parts = re.split(r'(?<=[.!?:»])\s+', text)
    out = []
    for p in parts:
        while len(p) > 95:
            cut = p.rfind(', ', 0, 90)
            if cut < 30:
                break
            out.append(p[:cut + 1]); p = p[cut + 2:]
        out.append(p)
    return [p for p in out if p.strip()]


def main():
    t = 0.0
    scenes, subs, missing = [], [], []
    for sid, vo, text, marks in SCENES:
        path = os.path.join(VO, vo + '.mp3')
        have = os.path.exists(path)
        vdur = dur_of(path) if have else round(len(text) / CPS, 2)
        if not have:
            missing.append(vo)
        dur = LEAD + vdur + TAIL + EXTRA_TAIL.get(sid, 0)
        dur = max(dur, MIN_DUR.get(sid, 0))
        vstart = t + LEAD
        m = {k: round(LEAD + vdur * text.index(v) / len(text), 3) for k, v in marks.items()}
        scenes.append({'id': sid, 'start': round(t, 3), 'dur': round(dur, 3), 'vo': vo if have else None,
                       'vstart': round(vstart, 3), 'vdur': round(vdur, 3), 'marks': m})
        chunks = split_subs(text)
        total = sum(len(c) for c in chunks)
        acc = 0
        for c in chunks:
            a = vstart + vdur * acc / total
            acc += len(c)
            b = vstart + vdur * acc / total
            subs.append({'a': round(a, 3), 'b': round(b + 0.15, 3), 'text': c})
        t += dur
    total = round(t, 3)
    with open(os.path.join(HERE, 'timeline.js'), 'w') as f:
        f.write('window.TL = ' + json.dumps({'total': total, 'scenes': scenes, 'subs': subs}, ensure_ascii=False, indent=1) + ';\n')

    # voice track
    inputs, filters = [], []
    k = 0
    for s in scenes:
        if not s['vo']:
            continue
        inputs += ['-i', os.path.join(VO, s['vo'] + '.mp3')]
        ms = int(s['vstart'] * 1000)
        filters.append(f'[{k}:a]aresample=48000,adelay={ms}|{ms}[a{k}]')
        k += 1
    mix = ''.join(f'[a{i}]' for i in range(k))
    fc = ';'.join(filters) + f';{mix}amix=inputs={k}:normalize=0,apad,atrim=0:{total},loudnorm=I=-16:TP=-1.5:LRA=11[out]'
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[out]',
                           '-ac', '2', '-ar', '48000', os.path.join(HERE, 'voice.wav')])
    print(f'total {total:.1f}s, scenes {len(scenes)}, missing voice: {missing or "none"}')
    for s in scenes:
        print(f"  {s['id']:9s} {s['start']:7.2f} +{s['dur']:5.2f}  {'VO' if s['vo'] else '--'}")


if __name__ == '__main__':
    main()
