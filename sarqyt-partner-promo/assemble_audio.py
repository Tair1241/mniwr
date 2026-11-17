"""Lays the ElevenLabs voice clips on the timeline (audio_plan.json) -> voiceover.mp3."""
import json, subprocess
P = json.load(open('audio_plan.json')); T = P['total_frames'] / P['fps']
ins, fl = [], []
for i, (f, fr) in enumerate(P['voice']):
    ins += ['-i', f]; ms = round(fr / P['fps'] * 1000); fl.append(f'[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]')
n = len(P['voice'])
fc = ';'.join(fl) + ';' + ''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad,atrim=0:{T},loudnorm=I=-16:TP=-1.5[o]'
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[o]', '-ac', '2', '-ar', '48000', '-b:a', '192k', 'voiceover.mp3'])
print('voiceover.mp3', T, 's')
