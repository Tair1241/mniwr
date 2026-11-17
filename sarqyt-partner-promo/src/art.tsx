// Flat 2D art: characters, food, props. All drawn in SVG, local coords documented per component.
import React from 'react';

export const C = {
  green: '#3E9B67', logo: '#568B68', light: '#CFEBD9', mint: '#E8F6EC', dark: '#1E4D37', deep: '#143726',
  white: '#FFFFFF', black: '#111A15', orange: '#F5A03A', orangeD: '#D9821C', red: '#E5484D',
  skin: '#E9B184', skinD: '#C98E64', cream: '#FFF6E6', kraft: '#C98E50', kraftD: '#A9733B',
};

const rot = (deg: number, x: number, y: number) => `rotate(${deg} ${x} ${y})`;

// ---------- Erlan (cafe owner). Feet at (0,0), ~560 tall. ----------
export type Pose = {
  armL?: number; armR?: number; // degrees; 0 = hanging down, + = clockwise
  mood?: 'happy' | 'worried' | 'neutral' | 'joy';
  bob?: number; headTilt?: number; sweat?: number; blink?: boolean; armsFront?: boolean;
};
export const Erlan: React.FC<{x: number; y: number; s?: number; flip?: boolean} & Pose> = ({
  x, y, s = 1, flip = false, armL = 8, armR = -8, mood = 'neutral', bob = 0, headTilt = 0, sweat = 0, blink = false, armsFront = false,
}) => {
  const arm = (side: -1 | 1, a: number) => (
    <g transform={rot(a, side * 62, -338)}>
      <rect x={side * 62 - 20} y={-350} width={40} height={84} rx={20} fill="#F4F4F0" />
      <rect x={side * 62 - 17} y={-280} width={34} height={92} rx={17} fill={C.skin} />
      <circle cx={side * 62} cy={-186} r={21} fill={C.skin} />
    </g>
  );
  const mouth = {
    happy: <path d="M-24,-392 Q0,-366 24,-392" stroke="#6B2E1E" strokeWidth={7} fill="none" strokeLinecap="round" />,
    joy: <path d="M-28,-396 Q0,-352 28,-396 Z" fill="#6B2E1E" />,
    neutral: <path d="M-18,-388 Q0,-380 18,-388" stroke="#6B2E1E" strokeWidth={7} fill="none" strokeLinecap="round" />,
    worried: <path d="M-22,-380 q11,-12 22,0 q11,12 22,0" stroke="#6B2E1E" strokeWidth={7} fill="none" strokeLinecap="round" />,
  }[mood];
  const browY = mood === 'worried' ? -6 : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={4} rx={110} ry={16} fill="rgba(0,0,0,.15)" />
      <rect x={-52} y={-170} width={44} height={168} rx={20} fill="#2B3440" />
      <rect x={8} y={-170} width={44} height={168} rx={20} fill="#2B3440" />
      <ellipse cx={-34} cy={-6} rx={34} ry={14} fill="#1A1F26" />
      <ellipse cx={34} cy={-6} rx={34} ry={14} fill="#1A1F26" />
      <g transform={`translate(0,${-bob})`}>
        {!armsFront && arm(-1, armL)}
        <rect x={-80} y={-360} width={160} height={210} rx={46} fill="#F4F4F0" />
        {/* apron */}
        <path d="M-58,-300 L58,-300 L70,-110 Q0,-92 -70,-110 Z" fill={C.green} />
        <path d="M-40,-300 Q0,-370 40,-300" stroke={C.green} strokeWidth={10} fill="none" />
        <rect x={-34} y={-230} width={68} height={46} rx={10} fill={C.dark} opacity={0.35} />
        <path d="M-70,-250 L-96,-226 M70,-250 L96,-226" stroke={C.green} strokeWidth={8} />
        {!armsFront && arm(1, armR)}
        <g transform={`${rot(headTilt, 0, -380)}`}>
          <rect x={-18} y={-384} width={36} height={34} fill={C.skinD} />
          <circle cx={0} cy={-432} r={66} fill={C.skin} />
          <circle cx={-64} cy={-428} r={14} fill={C.skinD} /><circle cx={64} cy={-428} r={14} fill={C.skinD} />
          <path d="M-68,-440 Q-74,-512 0,-512 Q74,-512 68,-440 Q56,-480 10,-474 Q-40,-486 -68,-440Z" fill="#1E1714" />
          <g transform={`translate(0,${browY})`}>
            <rect x={-38} y={-460} width={24} height={7} rx={3} fill="#1E1714" transform={mood === 'worried' ? rot(-12, -26, -456) : ''} />
            <rect x={14} y={-460} width={24} height={7} rx={3} fill="#1E1714" transform={mood === 'worried' ? rot(12, 26, -456) : ''} />
          </g>
          {blink ? (<><rect x={-34} y={-436} width={18} height={5} rx={2} fill="#1E1714" /><rect x={16} y={-436} width={18} height={5} rx={2} fill="#1E1714" /></>)
            : (<><circle cx={-25} cy={-434} r={8} fill="#1E1714" /><circle cx={25} cy={-434} r={8} fill="#1E1714" /></>)}
          <path d="M-30,-404 Q-14,-414 0,-406 Q14,-414 30,-404 Q14,-396 0,-400 Q-14,-396 -30,-404Z" fill="#1E1714" />
          <circle cx={-44} cy={-410} r={10} fill="#F28C7A" opacity={0.45} /><circle cx={44} cy={-410} r={10} fill="#F28C7A" opacity={0.45} />
          {mouth}
          {sweat > 0 && (
            <g opacity={sweat}>
              <path d="M84,-480 q10,18 0,26 q-10,-8 0,-26Z" fill="#7CC4F2" />
              <path d="M-92,-462 q9,16 0,23 q-9,-7 0,-23Z" fill="#7CC4F2" />
            </g>
          )}
        </g>
        {armsFront && arm(-1, armL)}{armsFront && arm(1, armR)}
      </g>
    </g>
  );
};

// ---------- Generic person (customers). Feet at (0,0), ~430 tall. ----------
export const Person: React.FC<{
  x: number; y: number; s?: number; shirt?: string; hair?: string; skin?: string; flip?: boolean;
  walk?: number | null; phone?: boolean; headphones?: boolean; smile?: boolean; armR?: number; long?: boolean; holdBox?: boolean;
}> = ({x, y, s = 1, shirt = '#5B7FD1', hair = '#2A1E1A', skin = '#D9A07A', flip = false, walk = null, phone = false, headphones = false, smile = false, armR, long = false, holdBox = false}) => {
  const a = walk === null ? 0 : Math.sin(walk * Math.PI * 2) * 22;
  const b = walk === null ? 0 : Math.abs(Math.cos(walk * Math.PI * 2)) * 6;
  const rArm = armR !== undefined ? armR : phone ? 140 : -a * 0.8;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={4} rx={80} ry={12} fill="rgba(0,0,0,.14)" />
      <g transform={rot(a, -18, -150)}><rect x={-36} y={-150} width={34} height={148} rx={16} fill="#33415C" /><ellipse cx={-22} cy={-4} rx={26} ry={11} fill="#1A1F26" /></g>
      <g transform={rot(-a, 18, -150)}><rect x={2} y={-150} width={34} height={148} rx={16} fill="#33415C" /><ellipse cx={22} cy={-4} rx={26} ry={11} fill="#1A1F26" /></g>
      <g transform={`translate(0,${-b})`}>
        <g transform={rot(holdBox ? -40 : a * 0.8, -52, -300)}><rect x={-68} y={-306} width={30} height={140} rx={15} fill={shirt} /><circle cx={-53} cy={-166} r={15} fill={skin} /></g>
        <rect x={-58} y={-320} width={116} height={176} rx={36} fill={shirt} />
        <g transform={rot(rArm, 52, -300)}>
          <rect x={38} y={-306} width={30} height={140} rx={15} fill={shirt} /><circle cx={53} cy={-166} r={15} fill={skin} />
          {phone && <rect x={40} y={-200} width={30} height={50} rx={6} fill={C.black} transform={rot(-rArm, 53, -170)} />}
        </g>
        <rect x={-14} y={-340} width={28} height={26} fill={skin} />
        <circle cx={0} cy={-378} r={50} fill={skin} />
        {long
          ? <path d="M-54,-372 Q-58,-436 0,-436 Q58,-436 54,-372 L58,-300 L36,-300 L40,-372 Q20,-404 -20,-400 L-40,-372 L-36,-300 L-58,-300Z" fill={hair} />
          : <path d="M-52,-382 Q-56,-436 0,-436 Q56,-436 52,-382 Q36,-410 0,-408 Q-36,-410 -52,-382Z" fill={hair} />}
        <circle cx={-18} cy={phone ? -370 : -380} r={6} fill="#1E1714" /><circle cx={18} cy={phone ? -370 : -380} r={6} fill="#1E1714" />
        {smile
          ? <path d="M-18,-356 Q0,-336 18,-356" stroke="#6B2E1E" strokeWidth={6} fill="none" strokeLinecap="round" />
          : <path d="M-12,-350 L12,-350" stroke="#6B2E1E" strokeWidth={6} strokeLinecap="round" />}
        {headphones && (
          <g>
            <path d="M-56,-380 Q-60,-450 0,-450 Q60,-450 56,-380" stroke="#222" strokeWidth={12} fill="none" />
            <rect x={-70} y={-404} width={26} height={46} rx={11} fill={C.orange} />
            <rect x={44} y={-404} width={26} height={46} rx={11} fill={C.orange} />
          </g>
        )}
      </g>
    </g>
  );
};

// ---------- Food. Each centered at (0,0), ~100 wide at s=1 ----------
export const Croissant: React.FC<{x?: number; y?: number; s?: number; r?: number}> = ({x = 0, y = 0, s = 1, r = 0}) => {
  const seg = [[-44, 6, -62, 13, 17], [-25, -14, -32, 18, 23], [0, -22, 0, 22, 27], [25, -14, 32, 18, 23], [44, 6, 62, 13, 17]];
  return <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>{seg.map(([cx, cy, a, rx, ry], i) =>
    <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={rot(a, cx, cy)} fill="#EDA548" stroke="#B9772C" strokeWidth={4} />)}
    <path d="M-14,-34 q-3,12 0,22 M14,-34 q3,12 0,22" stroke="#F8CF8A" strokeWidth={5} fill="none" strokeLinecap="round" /></g>;
};
export const Bun: React.FC<{x?: number; y?: number; s?: number; r?: number}> = ({x = 0, y = 0, s = 1, r = 0}) =>
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}><ellipse rx={50} ry={36} fill="#D98A3D" /><ellipse cy={-6} rx={44} ry={26} fill="#E9A453" />
    {[[-18, -14], [0, -20], [18, -12], [-6, -4], [12, 0]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={4} ry={2.5} fill="#FFF3D6" />)}</g>;
export const Salad: React.FC<{x?: number; y?: number; s?: number; r?: number}> = ({x = 0, y = 0, s = 1, r = 0}) =>
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <circle cx={-26} cy={-14} r={22} fill="#5FBF6B" /><circle cx={0} cy={-24} r={24} fill="#49A85A" /><circle cx={26} cy={-14} r={22} fill="#6CCB78" />
    <circle cx={-8} cy={-20} r={10} fill={C.red} /><circle cx={18} cy={-26} r={8} fill={C.red} /><circle cx={-30} cy={-24} r={6} fill="#F6D04D" />
    <path d="M-56,-10 L56,-10 Q50,34 0,36 Q-50,34 -56,-10Z" fill="#FFFFFF" stroke="#DDE6E0" strokeWidth={4} /></g>;
export const Cake: React.FC<{x?: number; y?: number; s?: number; r?: number}> = ({x = 0, y = 0, s = 1, r = 0}) =>
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <path d="M-46,30 L46,30 L46,-12 L-46,-30Z" fill="#FBE3C2" /><path d="M-46,-4 L46,10 M-46,12 L46,22" stroke="#C0603A" strokeWidth={8} />
    <path d="M-48,-32 L48,-14 L48,-6 Q30,4 20,-8 Q4,6 -8,-12 Q-24,2 -32,-18 Q-42,-8 -48,-20Z" fill="#F7A8C4" /><circle cx={30} cy={-28} r={10} fill={C.red} /></g>;
export const Baguette: React.FC<{x?: number; y?: number; s?: number; r?: number}> = ({x = 0, y = 0, s = 1, r = 0}) =>
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}><rect x={-70} y={-18} width={140} height={36} rx={18} fill="#E0A04F" />
    {[-40, -10, 20, 48].map((v, i) => <path key={i} d={`M${v - 8},-8 l16,14`} stroke="#F6D49A" strokeWidth={5} strokeLinecap="round" />)}</g>;
export const FOODS = [Croissant, Bun, Salad, Cake, Baguette];

// ---------- Props ----------
export const SarqytBox: React.FC<{x?: number; y?: number; s?: number; r?: number; open?: number}> = ({x = 0, y = 0, s = 1, r = 0}) =>
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <rect x={-80} y={-50} width={160} height={100} rx={10} fill={C.kraft} />
    <rect x={-88} y={-66} width={176} height={30} rx={8} fill={C.kraftD} />
    <rect x={-12} y={-66} width={24} height={116} fill={C.green} />
    <circle cx={46} cy={6} r={22} fill="#fff" /><path d="M38,0 h16 l2,18 h-20Z M40,0 q6,-12 12,0" fill={C.logo} stroke={C.logo} strokeWidth={2} />
  </g>;

export const Bell: React.FC<{s?: number; color?: string}> = ({s = 1, color = C.orange}) =>
  <svg width={64 * s} height={64 * s} viewBox="0 0 64 64"><path d="M32,8 a4,4 0 0 1 4,4 v2 c9,2 14,10 14,19 v10 l5,6 H9 l5,-6 V33 c0,-9 5,-17 14,-19 v-2 a4,4 0 0 1 4,-4Z" fill={color} /><circle cx={32} cy={55} r={6} fill={color} /></svg>;

export const QR: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => {
  let s = 17; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const n = 21, c = size / n, cells: JSX.Element[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const f = (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7);
    if (!f && rnd() > 0.52) cells.push(<rect key={`${i}-${j}`} x={x + i * c} y={y + j * c} width={c} height={c} />);
  }
  const fp = (fx: number, fy: number) => <g key={`${fx}${fy}`}><rect x={x + fx * c} y={y + fy * c} width={7 * c} height={7 * c} /><rect x={x + (fx + 1) * c} y={y + (fy + 1) * c} width={5 * c} height={5 * c} fill="#fff" /><rect x={x + (fx + 2) * c} y={y + (fy + 2) * c} width={3 * c} height={3 * c} /></g>;
  return <g fill={C.black}>{cells}{fp(0, 0)}{fp(14, 0)}{fp(0, 14)}</g>;
};
