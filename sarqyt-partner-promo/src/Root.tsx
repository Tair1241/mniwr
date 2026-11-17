import React from 'react';
import {AbsoluteFill, Composition, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import '@fontsource/rubik/500.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/800.css';
import '@fontsource/rubik/900.css';
import {C, Erlan, Person, FOODS, Croissant, Bun, Salad, Cake, Baguette, SarqytBox, Bell, QR} from './art';

const FPS = 30, W = 1080, H = 1920, OV = 12; // OV = transition overlap in frames
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lin = (f: number, a: number, b: number, from = 0, to = 1, e?: (t: number) => number) =>
  interpolate(f, [a, b], [from, to], {...cl, easing: e});
const eo = Easing.out(Easing.cubic), eio = Easing.inOut(Easing.cubic);
const sp = (f: number, d = 0, damping = 11, stiffness = 140) => spring({frame: f - d, fps: FPS, config: {damping, stiffness}});

// ---------- shared UI ----------
const Caption: React.FC<{f: number; d?: number; top: number; size?: number; color?: string; bg?: string; children: React.ReactNode; w?: number; weight?: number}> =
  ({f, d = 0, top, size = 84, color = C.white, bg, children, w = 960, weight = 800}) => {
    const k = sp(f, d);
    return (
      <div style={{position: 'absolute', top, left: (W - w) / 2, width: w, display: 'flex', justifyContent: 'center', opacity: lin(f, d, d + 6),
        transform: `translateY(${(1 - k) * 40}px) scale(${0.85 + 0.15 * k})`}}>
        <div style={{fontFamily: 'Rubik', fontWeight: weight, fontSize: size, lineHeight: 1.12, color, textAlign: 'center',
          background: bg, padding: bg ? '22px 38px' : 0, borderRadius: 36, boxShadow: bg ? '0 14px 0 rgba(0,0,0,.12)' : undefined}}>{children}</div>
      </div>
    );
  };
const Logo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) =>
  <Img src={staticFile('logo.png')} style={{width: size, height: size, borderRadius: size * 0.23, boxShadow: '0 18px 40px rgba(0,0,0,.25)', ...style}} />;
const Phone: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 64, background: C.black, padding: 16, boxShadow: '0 30px 60px rgba(0,0,0,.3)', ...style}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 50, overflow: 'hidden', background: C.white, fontFamily: 'Rubik'}}>
      {children}
      <div style={{position: 'absolute', top: 14, left: '50%', width: 130, height: 34, marginLeft: -65, borderRadius: 20, background: C.black}} />
    </div>
  </div>
);
const Tap: React.FC<{x: number; y: number; f: number; at: number}> = ({x, y, f, at}) => {
  const p = lin(f, at - 10, at), r = lin(f, at, at + 14);
  return <div style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 50, border: `8px solid ${C.orange}`,
    opacity: (p > 0 ? 1 : 0) * (1 - r), transform: `scale(${0.4 + r * 0.9})`}} />;
};
// scene transition wrapper: circle reveal or slide-up
const Scene: React.FC<{kind?: 'circle' | 'slide' | 'none'; children: React.ReactNode; bg: string}> = ({kind = 'circle', children, bg}) => {
  const f = useCurrentFrame();
  const t = lin(f, 0, OV + 2, 0, 1, eio);
  const style: React.CSSProperties = kind === 'circle' ? {clipPath: `circle(${t * 120}% at 50% 50%)`}
    : kind === 'slide' ? {transform: `translateY(${(1 - t) * H}px)`} : {};
  return <AbsoluteFill style={{background: bg, overflow: 'hidden', ...style}}>{children}</AbsoluteFill>;
};

// ---------- Scene 1: hook ----------
const showcase = (fill: number, x0: number, y0: number, w: number) => {
  // glass showcase with 3 shelves; fill 0..1 controls how many items are shown
  const items: JSX.Element[] = []; let k = 0;
  const per = Math.floor(w / 105);
  for (let r = 0; r < 3; r++) for (let i = 0; i < per; i++) {
    const F = FOODS[(i + r * 2) % FOODS.length];
    const visible = k / (per * 3) < fill; k++;
    if (visible) items.push(<F key={`${r}-${i}`} x={x0 + 62 + i * 103} y={y0 + 118 + r * 150 - (i % 2) * 8} s={0.95} />);
    if (visible && r < 2 && i % 2 === 0) items.push(<Bun key={`b${r}-${i}`} x={x0 + 100 + i * 103} y={y0 + 76 + r * 150} s={0.7} />);
  }
  return (
    <g>
      <rect x={x0 - 14} y={y0 - 20} width={w + 28} height={500} rx={24} fill="#8C5A35" />
      <rect x={x0} y={y0} width={w} height={460} rx={14} fill="#D8F0F6" />
      {[0, 1, 2].map(r => <rect key={r} x={x0} y={y0 + 150 + r * 150} width={w} height={14} fill="#B9D7DF" />)}
      {items}
      <path d={`M${x0 + 20},${y0 + 10} L${x0 + 160},${y0 + 10} L${x0 + 40},${y0 + 440}Z`} fill="#fff" opacity={0.28} />
    </g>
  );
};
const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const h = lin(f, 34, 46, 0, 1, eo);
  const flip = lin(f, 14, 22);
  return (
    <Scene kind="none" bg="#FFE3B8">
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C2A6B" /><stop offset="1" stopColor="#E9765B" /></linearGradient></defs>
        <rect width={W} height={H} fill="#FFE3B8" />
        {[...Array(12)].map((_, i) => <rect key={i} x={i * 96} y={0} width={44} height={1500} fill="#FFD9A3" opacity={0.6} />)}
        <rect x={70} y={640} width={520} height={380} rx={20} fill="#8C5A35" /><rect x={88} y={658} width={484} height={344} rx={10} fill="url(#dusk)" />
        <circle cx={480} cy={730} r={40} fill="#FFF3C4" /><circle cx={200} cy={720} r={4} fill="#fff" /><circle cx={300} cy={690} r={3} fill="#fff" />
        <rect x={325} y={658} width={10} height={344} fill="#8C5A35" />
        {/* open/closed sign */}
        <line x1={240} y1={700} x2={330} y2={760} stroke="#555" strokeWidth={4} /><line x1={420} y1={700} x2={330} y2={760} stroke="#555" strokeWidth={4} />
        <g transform={`translate(330,830) scale(1,${Math.abs(Math.cos(flip * Math.PI))})`}>
          <rect x={-130} y={-60} width={260} height={110} rx={16} fill={flip < 0.5 ? C.green : C.red} />
          <text x={0} y={18} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={52} fill="#fff">{flip < 0.5 ? 'ОТКРЫТО' : 'ЗАКРЫТО'}</text>
        </g>
        {/* clock */}
        <g transform="translate(860,760)"><circle r={90} fill="#fff" stroke={C.dark} strokeWidth={12} />
          <line x1={0} y1={0} x2={0} y2={-58} stroke={C.black} strokeWidth={10} strokeLinecap="round" transform={`rotate(${300 + f * 0.4})`} />
          <line x1={0} y1={0} x2={0} y2={-74} stroke={C.orange} strokeWidth={6} strokeLinecap="round" transform={`rotate(${f * 4.8})`} />
          <circle r={10} fill={C.black} /></g>
        <rect x={0} y={1500} width={W} height={420} fill="#E2A86E" />
        {showcase(1, 50, 1150, 640)}
        <Erlan x={870} y={1660} s={1.0} armL={lin(h, 0, 1, 8, 172)} armR={lin(h, 0, 1, -8, -172)} armsFront={h > 0.5} mood={h > 0.3 ? 'worried' : 'neutral'}
          sweat={lin(f, 46, 56)} headTilt={h > 0.5 ? Math.sin(f * 0.5) * 5 : 0} />
      </svg>
      <Caption f={f} d={4} top={290} size={120} bg={C.orange}>Знакомо?</Caption>
      <Caption f={f} d={22} top={540} size={76} bg={C.dark}>Еда осталась,<br />а день закончился</Caption>
    </Scene>
  );
};

// ---------- Scene 2: write-off ----------
const S2Trash: React.FC = () => {
  const f = useCurrentFrame();
  const throws = [16, 34, 52, 70, 88, 106, 124, 142];
  const lid = throws.reduce((m, t) => Math.max(m, lin(f, t + 14, t + 18) * (1 - lin(f, t + 20, t + 30))), 0);
  const rolling = Math.floor(Math.pow(Math.max(0, f - 14), 1.5) * 41) + 0;
  const digits = String(rolling).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (
    <Scene kind="circle" bg={C.deep}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[...Array(20)].map((_, r) => [...Array(6)].map((_, i) => <rect key={`${r}-${i}`} x={(r % 2) * 90 + i * 180 - 90} y={r * 96} width={172} height={88} rx={6} fill="#1A4430" />))}
        <rect x={0} y={1560} width={W} height={360} fill="#0E2A1D" />
        {throws.map((t, i) => {
          const p = lin(f, t, t + 16, 0, 1, Easing.in(Easing.quad));
          if (p <= 0 || p >= 1) return null;
          const F = FOODS[i % FOODS.length];
          const sx = i % 2 ? 1180 : -100, x = interpolate(p, [0, 1], [sx, 540]), y = 1080 - Math.sin(p * Math.PI) * 360 + p * 140;
          return <F key={i} x={x} y={y} s={1.3} r={p * 540 * (i % 2 ? -1 : 1)} />;
        })}
        {/* bin */}
        <g transform="translate(540,1580)">
          <path d="M-200,-380 L200,-380 L170,0 L-170,0Z" fill="#6E8B7C" />
          {[-110, -40, 40, 110].map(v => <rect key={v} x={v - 10} y={-340} width={20} height={300} rx={10} fill="#5A7366" />)}
          <g transform={`rotate(${-lid * 28} -220 -390)`}><rect x={-225} y={-420} width={450} height={50} rx={18} fill="#7F9E8E" /><rect x={-50} y={-446} width={100} height={30} rx={12} fill="#7F9E8E" /></g>
        </g>
      </svg>
      <Caption f={f} d={OV} top={290} size={74}>Каждый вечер вы<br /><span style={{color: C.orange}}>выбрасываете деньги</span></Caption>
      <div style={{position: 'absolute', top: 560, left: 115, width: 850, height: 190, borderRadius: 36, background: '#0B1F15', border: `6px solid ${C.red}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: 'Rubik', fontWeight: 900, fontSize: 112, color: C.red,
        opacity: lin(f, OV + 6, OV + 14), transform: `scale(${0.9 + 0.1 * sp(f, OV + 6)})`}}>
        <svg width={70} height={90} viewBox="0 0 70 90"><path d="M35,90 L0,45 H22 V0 H48 V45 H70Z" fill={C.red} /></svg>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>−{digits} ₸</span>
      </div>
    </Scene>
  );
};

// ---------- Scene 3: invisible discount ----------
const S3Sign: React.FC = () => {
  const f = useCurrentFrame();
  const sign = sp(f, OV + 6, 9, 120);
  const walkers = [
    {d: 10, v: 7.5, shirt: '#5B7FD1', hair: '#2A1E1A', long: false}, {d: 34, v: 6.2, shirt: '#E36D8F', hair: '#5A3A22', long: true},
    {d: 62, v: 8.4, shirt: '#8B6FD1', hair: '#111', long: false}, {d: 86, v: 6.8, shirt: C.orange, hair: '#3A2A22', long: true},
  ];
  const q = lin(f, 70, 80);
  return (
    <Scene kind="slide" bg="#3B3F8F">
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <defs><linearGradient id="ev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C2A6B" /><stop offset="1" stopColor="#F08A5D" /></linearGradient></defs>
        <rect width={W} height={H} fill="url(#ev)" />
        <rect x={0} y={760} width={W} height={900} fill="#F4E6D2" />
        <rect x={0} y={760} width={W} height={90} fill={C.green} />
        <path d={`M0,850 h${W} v50 ${[...Array(9)].map(() => 'q-60,40 -120,0').join(' ')}Z`} fill={C.orange} transform={`translate(${W},0) scale(-1,1)`} />
        <text x={540} y={826} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={58} fill="#fff" letterSpacing={8}>КАФЕ</text>
        <rect x={80} y={960} width={560} height={480} rx={14} fill="#8C5A35" /><rect x={96} y={976} width={528} height={448} rx={8} fill="#D8F0F6" />
        <Croissant x={180} y={1380} /><Bun x={300} y={1385} /><Cake x={430} y={1380} /><Salad x={550} y={1390} s={0.9} />
        <rect x={730} y={980} width={250} height={680} rx={10} fill="#6B4A33" /><circle cx={950} cy={1330} r={12} fill={C.orange} />
        <rect x={0} y={1660} width={W} height={260} fill="#9AA0A8" /><rect x={0} y={1660} width={W} height={16} fill="#7D838B" />
        {/* sign on window */}
        <g transform={`translate(360,${interpolate(sign, [0, 1], [700, 1150])}) rotate(${(1 - sign) * -8})`} opacity={lin(f, OV + 4, OV + 8)}>
          <rect x={-235} y={-120} width={470} height={240} rx={22} fill={C.red} /><rect x={-221} y={-106} width={442} height={212} rx={16} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="14 10" />
          <text x={0} y={-12} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={58} fill="#fff">СКИДКА 50%</text>
          <text x={0} y={62} textAnchor="middle" fontFamily="Rubik" fontWeight={700} fontSize={50} fill="#fff">после 20:00</text>
        </g>
        <Erlan x={860} y={1670} s={0.95} flip armR={q > 0 ? 20 : -8} mood={q > 0 ? 'worried' : 'happy'} />
        <g opacity={q} transform={`translate(860,${1060 - q * 20})`}><circle r={60} fill="#fff" /><text y={30} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={84} fill={C.dark}>?</text></g>
        {walkers.map((w, i) => {
          const x = -150 + Math.max(0, f - w.d) * w.v; if (x > 1250 || f < w.d) return null;
          return <Person key={i} x={x} y={1840} s={1.05} shirt={w.shirt} hair={w.hair} long={w.long} walk={(f - w.d) / 22} phone headphones />;
        })}
      </svg>
      <Caption f={f} d={OV + 2} top={290} size={76} bg={C.dark}>Скидки есть,<br />но о них<br /><span style={{color: C.orange}}>никто не знает</span></Caption>
    </Scene>
  );
};

// ---------- Scene 4: fact ----------
const Store: React.FC<{bad: number; idx: number}> = ({bad, idx}) => (
  <div style={{width: 150, height: 150, position: 'relative'}}>
    <svg width={150} height={150} viewBox="0 0 150 150">
      <rect x={14} y={40} width={122} height={96} rx={10} fill="#fff" />
      <path d="M8,40 h134 l-10,-26 h-114Z" fill={idx === 9 ? C.green : '#FBD7A6'} />
      <rect x={30} y={62} width={50} height={40} rx={6} fill="#D8F0F6" /><rect x={92} y={70} width={30} height={66} rx={4} fill="#8C5A35" />
    </svg>
    <div style={{position: 'absolute', right: -8, top: -8, width: 64, height: 64, borderRadius: 32, background: idx === 9 ? C.green : C.red, color: '#fff',
      fontFamily: 'Rubik', fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${bad})`}}>
      {idx === 9 ? '✓' : (<svg width={34} height={38} viewBox="0 0 34 38"><path d="M3,9 h28 M12,9 V4 h10 v5 M6,9 l3,27 h16 l3,-27" stroke="#fff" strokeWidth={4} fill="none" strokeLinejoin="round" /></svg>)}
    </div>
  </div>
);
const S4Fact: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene kind="circle" bg={C.orange}>
      <div style={{position: 'absolute', top: 290, width: W, textAlign: 'center', fontFamily: 'Rubik', fontWeight: 900, fontSize: 250, color: '#fff',
        textShadow: '0 12px 0 rgba(0,0,0,.12)', transform: `scale(${sp(f, OV)})`, lineHeight: 1}}>9 из 10</div>
      <div style={{position: 'absolute', top: 620, left: 90, width: 900, display: 'grid', gridTemplateColumns: 'repeat(5,150px)', gap: '36px 37px'}}>
        {[...Array(10)].map((_, i) => <div key={i} style={{opacity: lin(f, OV + 4 + i * 2, OV + 8 + i * 2)}}><Store idx={i} bad={sp(f, OV + 14 + i * 3, 10, 180)} /></div>)}
      </div>
      <Caption f={f} d={OV + 14} top={1060} size={74} color={C.black}>заведений Алматы<br />списывают еду<br />каждую неделю</Caption>
      <Caption f={f} d={OV + 24} top={1400} size={50} color={C.deep} weight={600}>по опросу 70 заведений</Caption>
    </Scene>
  );
};

// ---------- Scene 5: solution ----------
const S5Solution: React.FC = () => {
  const f = useCurrentFrame();
  const pop = sp(f, OV, 9, 130), up = lin(f, OV + 26, OV + 42, 0, 1, eio);
  const ph = lin(f, OV + 34, OV + 56, 0, 1, eo);
  return (
    <Scene kind="circle" bg={C.green}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <g transform={`translate(540,${interpolate(up, [0, 1], [900, 420])}) rotate(${f * 0.6})`} opacity={0.35}>
          {[...Array(14)].map((_, i) => <path key={i} d="M0,0 L-70,-1200 L70,-1200Z" fill={C.light} transform={`rotate(${i * (360 / 14)})`} />)}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, width: W, top: interpolate(up, [0, 1], [700, 270]), display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: `scale(${pop * interpolate(up, [0, 1], [1, 0.62])})`, transformOrigin: '50% 0'}}>
        <Logo size={300} />
        <div style={{fontFamily: 'Rubik', fontWeight: 900, fontSize: 130, color: '#fff', marginTop: 16, letterSpacing: 2}}>Sarqyt</div>
      </div>
      <Caption f={f} d={OV + 36} top={640} size={76} bg={C.dark}>превращает остатки<br />в <span style={{color: C.orange}}>выручку</span></Caption>
      <Phone x={270} y={interpolate(ph, [0, 1], [1950, 920])} w={540} h={1000}>
        <div style={{background: C.green, height: 190, padding: '78px 34px 0', color: '#fff', fontSize: 46, fontWeight: 800}}>Sarqyt</div>
        {[0, 1].map(i => (
          <div key={i} style={{margin: '26px 26px 0', borderRadius: 26, background: C.mint, padding: 22, display: 'flex', gap: 20, alignItems: 'center',
            opacity: lin(f, OV + 54 + i * 8, OV + 60 + i * 8)}}>
            <svg width={120} height={110} viewBox="-60 -55 120 110">{i ? <><Bun x={-12} y={8} s={0.8} /><Croissant x={16} y={-10} s={0.7} /></> : <SarqytBox s={0.6} />}</svg>
            <div><div style={{fontSize: 34, fontWeight: 800, color: C.black}}>Сюрприз-бокс</div>
              <div style={{marginTop: 8, display: 'inline-block', background: C.orange, color: '#fff', borderRadius: 14, padding: '4px 14px', fontSize: 30, fontWeight: 800}}>до −70%</div></div>
          </div>
        ))}
      </Phone>
    </Scene>
  );
};

// ---------- Scene 6: how it works ----------
const Banner: React.FC<{f: number; at: number; top: number}> = ({f, at, top}) => {
  const k = sp(f, at, 12, 160), out = lin(f, at + 50, at + 60);
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: top + (1 - k) * -140 - out * 140, opacity: Math.min(lin(f, at, at + 4), 1 - out),
      background: '#fff', borderRadius: 34, padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 24, boxShadow: '0 20px 50px rgba(0,0,0,.25)', fontFamily: 'Rubik'}}>
      <div style={{width: 96, height: 96, borderRadius: 24, background: C.mint, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `rotate(${Math.sin((f - at) * 0.9) * 14 * (1 - lin(f, at, at + 24))}deg)`}}><Bell s={1.1} /></div>
      <div><div style={{fontSize: 56, fontWeight: 800, color: C.black}}>Новый заказ!</div><div style={{fontSize: 48, fontWeight: 500, color: C.dark}}>Сюрприз-бокс оплачен</div></div>
    </div>
  );
};
const S6How: React.FC = () => {
  const f = useCurrentFrame();
  const s1 = OV, s2 = OV + 96, s3 = OV + 192; // step starts (local frames)
  const step = f < s2 ? 0 : f < s3 ? 1 : 2;
  const caps = ['Выложите бокс\nза минуту', 'Покупатель оплачивает\nв приложении', 'Выдайте бокс\nпо QR-коду'];
  const st = [s1, s2, s3][step];
  const phoneIn = lin(f, OV, OV + 16, 0, 1, eo), phoneOut = lin(f, s3 - 8, s3 + 6, 0, 1, eio);
  const pubAt = s1 + 50, payAt = s2 + 36;
  return (
    <Scene kind="slide" bg={C.light}>
      {/* step chips */}
      <div style={{position: 'absolute', top: 270, width: W, display: 'flex', justifyContent: 'center', gap: 26}}>
        {[0, 1, 2].map(i => <div key={i} style={{width: 92, height: 92, borderRadius: 46, fontFamily: 'Rubik', fontWeight: 900, fontSize: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'center', background: i <= step ? C.green : '#fff', color: i <= step ? '#fff' : C.green,
          transform: `scale(${i === step ? 1.15 : 1})`, boxShadow: '0 8px 0 rgba(0,0,0,.08)'}}>{i + 1}</div>)}
      </div>
      <div key={step} style={{position: 'absolute', top: 410, width: W}}>
        <Caption f={f - st} d={2} top={0} size={70} color={C.deep}>{caps[step].split('\n').map((l, i) => <div key={i}>{l}</div>)}</Caption>
      </div>
      {/* phone for steps 1-2 */}
      {f < s3 + 8 && (
        <Phone x={260} y={interpolate(phoneIn, [0, 1], [1950, 680]) + phoneOut * 1300} w={560} h={1040}>
          {step === 0 ? (
            <div style={{padding: '84px 30px 0'}}>
              <div style={{fontSize: 44, fontWeight: 800, color: C.black}}>Новый бокс</div>
              <div style={{marginTop: 22, height: 250, borderRadius: 26, background: C.mint, position: 'relative'}}>
                <svg width={500} height={250} viewBox="0 0 500 250" style={{position: 'absolute'}}><Croissant x={130} y={150} s={1.4} /><Bun x={260} y={160} s={1.3} /><Cake x={380} y={150} s={1.2} /></svg>
              </div>
              {['Состав бокса', 'Ваша цена', 'Время выдачи'].map((l, i) => (
                <div key={l} style={{marginTop: 20, borderRadius: 20, border: `3px solid ${C.light}`, padding: '16px 22px', fontSize: 32, color: '#4B6358', display: 'flex', justifyContent: 'space-between'}}>
                  <span>{l}</span><span style={{width: lin(f, s1 + 10 + i * 10, s1 + 22 + i * 10, 0, 140), height: 18, marginTop: 8, borderRadius: 9, background: C.green}} /></div>
              ))}
              <div style={{marginTop: 30, height: 100, borderRadius: 26, background: f < pubAt ? C.green : C.dark, color: '#fff', fontSize: 40, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f > pubAt - 3 && f < pubAt + 4 ? 0.95 : 1})`}}>Опубликовать</div>
              <div style={{position: 'absolute', inset: 0, background: 'rgba(62,155,103,.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                opacity: lin(f, pubAt + 4, pubAt + 10), color: '#fff'}}>
                <div style={{width: 190, height: 190, borderRadius: 95, background: '#fff', color: C.green, fontSize: 120, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `scale(${sp(f, pubAt + 4)})`}}>✓</div>
                <div style={{fontSize: 52, fontWeight: 800, marginTop: 30, textAlign: 'center'}}>Бокс<br />опубликован</div>
              </div>
            </div>
          ) : (
            <div style={{padding: '84px 30px 0'}}>
              <div style={{fontSize: 44, fontWeight: 800, color: C.black}}>Оплата</div>
              <div style={{marginTop: 22, borderRadius: 26, background: C.mint, padding: 26, display: 'flex', gap: 20, alignItems: 'center'}}>
                <svg width={140} height={120} viewBox="-70 -60 140 120"><SarqytBox s={0.75} /></svg>
                <div style={{fontSize: 38, fontWeight: 800, color: C.black}}>Сюрприз-<br />бокс</div>
              </div>
              <div style={{marginTop: 26, borderRadius: 20, border: `3px solid ${C.light}`, padding: '20px 22px', fontSize: 34, color: '#4B6358'}}>Оплата картой в приложении</div>
              <div style={{marginTop: 30, height: 100, borderRadius: 26, background: C.orange, color: '#fff', fontSize: 40, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${f > payAt - 3 && f < payAt + 4 ? 0.95 : 1})`}}>Оплатить</div>
              <div style={{position: 'absolute', inset: 0, background: 'rgba(245,160,58,.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                opacity: lin(f, payAt + 4, payAt + 10), color: '#fff'}}>
                <div style={{width: 190, height: 190, borderRadius: 95, background: '#fff', color: C.orange, fontSize: 120, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `scale(${sp(f, payAt + 4)})`}}>✓</div>
                <div style={{fontSize: 56, fontWeight: 800, marginTop: 30}}>Оплачено</div>
              </div>
            </div>
          )}
        </Phone>
      )}
      {step === 0 && <Tap x={540} y={1520} f={f} at={pubAt} />}
      {step === 1 && <Tap x={540} y={1420} f={f} at={payAt} />}
      {step === 1 && <Banner f={f} at={payAt + 16} top={600} />}
      {/* step 3: counter scene */}
      {f >= s3 - 8 && (() => {
        const g = f - s3, scan = lin(g, 22, 30) * (1 - lin(g, 38, 46)), give = lin(g, 46, 72, 0, 1, eio), happy = g > 66;
        return (
          <svg width={W} height={H} style={{position: 'absolute', opacity: lin(f, s3 - 8, s3 + 4)}}>
            <rect x={0} y={1460} width={W} height={460} fill="#C98E50" /><rect x={0} y={1460} width={W} height={26} fill={C.kraftD} />
            <Erlan x={210} y={1700} s={1.0} armR={interpolate(give, [0, 1], [-60, -84])} armL={8} mood={happy ? 'joy' : 'happy'} />
            <g transform="translate(540,1480)"><path d="M30,-130 L60,-340 L190,-250Z" fill={C.red} opacity={scan * 0.5} />
              <rect x={-14} y={-90} width={28} height={90} rx={8} fill="#333" /><rect x={-40} y={-140} width={100} height={56} rx={14} fill="#444" transform="rotate(-28 10 -112)" /><rect x={-50} y={-14} width={100} height={18} rx={8} fill="#333" /></g>
            <rect x={-20} y={1480} width={1120} height={180} fill="#8C5A35" />
            <Person x={860} y={1700} s={1.05} flip shirt="#5B7FD1" smile={happy} armR={g < 46 ? -110 : -40} holdBox={false} />
            {g < 50 && <g transform="translate(655,1235) rotate(10) scale(.85)"><rect x={-70} y={-120} width={140} height={240} rx={22} fill={C.black} /><rect x={-60} y={-106} width={120} height={212} rx={14} fill="#fff" /><QR x={-46} y={-46} size={92} /></g>}
            <SarqytBox x={interpolate(give, [0, 1], [400, 730])} y={interpolate(give, [0, 1], [1395, 1400]) - Math.sin(give * Math.PI) * 120} s={1.3} r={give * 6} />
            {happy && <g opacity={lin(g, 66, 74)}>{[0, 1, 2].map(i => <path key={i} d="M0,-16 L5,-5 L16,0 L5,5 L0,16 L-5,5 L-16,0 L-5,-5Z" fill={C.orange} transform={`translate(${700 + i * 70},${1000 - i * 30 - (g - 66) * 1.5}) scale(${1.4 + i * 0.3})`} />)}</g>}
          </svg>
        );
      })()}
      {f >= s3 && <Banner f={f} at={s3 + 62} top={600} />}
    </Scene>
  );
};

// ---------- Scene 7: benefits ----------
const Icon: React.FC<{k: string}> = ({k}) => {
  const p: Record<string, JSX.Element> = {
    people: <g fill="#fff"><circle cx={30} cy={24} r={12} /><path d="M10,58 q20,-34 40,0Z" /><circle cx={58} cy={30} r={10} /><path d="M42,62 q16,-28 32,0Z" opacity={0.8} /><path d="M66,8 v20 M56,18 h20" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>,
    revenue: <g><path d="M10,62 L30,40 L44,52 L70,20" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M56,18 H72 V34" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" /></g>,
    trash: <g stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14,22 h52 M32,22 v-8 h16 v8 M20,22 l5,46 h30 l5,-46" /><path d="M8,8 L72,72" /></g>,
    camera: <g fill="#fff"><rect x={8} y={24} width={46} height={36} rx={8} /><path d="M54,36 L74,24 V60 L54,48Z" /><circle cx={22} cy={14} r={8} /><circle cx={40} cy={14} r={8} /></g>,
    card: <g><rect x={8} y={20} width={64} height={42} rx={8} fill="#fff" /><rect x={8} y={30} width={64} height={8} fill={C.orange} /><path d="M44,6 L32,30 H44 L36,54 L58,24 H46 L54,6Z" fill={C.dark} transform="translate(14,10) scale(.8)" /></g>,
  };
  return <svg width={80} height={80} viewBox="0 0 80 80">{p[k]}</svg>;
};
const S7Benefits: React.FC = () => {
  const f = useCurrentFrame();
  const items: [string, string, string][] = [
    ['+', 'Новые клиенты', 'people'], ['+', 'Выручка с того, что раньше списывали', 'revenue'], ['−', 'Расходы на списание', 'trash'],
    ['+', 'Бесплатное продвижение: блогеры снимают о вас ролики', 'camera'], ['', 'Деньги на карту в тот же день', 'card'],
  ];
  const starts = [OV + 6, OV + 46, OV + 86, OV + 126, OV + 170];
  const queue = lin(f, OV + 40, OV + 200);
  return (
    <Scene kind="circle" bg={C.cream}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <rect width={W} height={H} fill={C.cream} />
        <rect x={0} y={1310} width={W} height={610} fill="#FFE3B8" /><rect x={0} y={1600} width={W} height={320} fill="#E2A86E" />
        {/* empty showcase */}
        <rect x={40} y={1390} width={380} height={230} rx={14} fill="#8C5A35" /><rect x={54} y={1402} width={352} height={206} rx={8} fill="#D8F0F6" />
        {[0, 1, 2].map(i => <path key={i} d="M0,-14 L4,-4 L14,0 L4,4 L0,14 L-4,4 L-14,0 L-4,-4Z" fill="#fff" transform={`translate(${120 + i * 110},${1470 + (i % 2) * 60}) scale(${1 + 0.4 * Math.sin(f * 0.25 + i)})`} />)}
        <Erlan x={260} y={1690} s={0.72} armR={-150 + Math.sin(f * 0.3) * 10} armL={8} mood="joy" />
        {[0, 1, 2, 3].map(i => <Person key={i} x={interpolate(queue, [0, 1], [1300 + i * 140, 560 + i * 150])} y={1700} s={0.62} flip
          shirt={['#5B7FD1', '#E36D8F', '#8B6FD1', C.orange][i]} hair={['#2A1E1A', '#5A3A22', '#111', '#3A2A22'][i]} long={i % 2 === 1} smile walk={queue < 1 ? f / 18 + i * 0.3 : null} />)}
      </svg>
      <div style={{position: 'absolute', top: 268, width: W, textAlign: 'center', fontFamily: 'Rubik', fontWeight: 800, fontSize: 64, color: C.deep, opacity: lin(f, OV, OV + 8)}}>Что вы получаете</div>
      <div style={{position: 'absolute', top: 370, left: 60, width: 960, display: 'flex', flexDirection: 'column', gap: 16}}>
        {items.map(([sign, text, ic], i) => {
          const k = sp(f, starts[i], 12, 150);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 30, padding: '18px 26px', minHeight: 140,
              boxShadow: '0 10px 0 rgba(30,77,55,.08)', border: `4px solid ${i === 4 ? C.orange : C.light}`, fontFamily: 'Rubik',
              opacity: lin(f, starts[i], starts[i] + 5), transform: `translateX(${(1 - k) * (i % 2 ? -1100 : 1100)}px) rotate(${(1 - k) * (i % 2 ? -8 : 8)}deg)`}}>
              <div style={{flex: 'none', width: 104, height: 104, borderRadius: 30, background: i === 4 ? C.green : C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k={ic} /></div>
              <div style={{fontSize: 50, fontWeight: 700, lineHeight: 1.12, color: C.black}}>
                {sign && <span style={{color: sign === '−' ? C.red : C.orange, fontWeight: 900}}>{sign} </span>}{text}</div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
};

// ---------- Scene 8: call to action ----------
const S8CTA: React.FC = () => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - OV - 40) * 0.25);
  return (
    <Scene kind="slide" bg={C.dark}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {[...Array(26)].map((_, i) => {
          const x = (i * 197) % W, y = ((i * 311) % 1500) + ((f * (2 + (i % 3))) % 300) - 100;
          return <rect key={i} x={x} y={y} width={18} height={30} rx={4} fill={[C.orange, C.light, C.green, '#fff'][i % 4]} opacity={0.7} transform={`rotate(${f * 3 + i * 40} ${x + 9} ${y + 15})`} />;
        })}
        <Erlan x={830} y={1720} s={0.75} armR={140 + Math.sin(f * 0.35) * 18} mood="joy" />
        <SarqytBox x={230} y={1620} s={1.6} r={-6} />
      </svg>
      <div style={{position: 'absolute', top: 280, width: W, display: 'flex', justifyContent: 'center', transform: `scale(${sp(f, OV, 9)})`}}>
        <Logo size={250} />
      </div>
      <Caption f={f} d={OV + 10} top={590} size={90}>Регистрация<br /><span style={{color: C.orange}}>бесплатно</span></Caption>
      <div style={{position: 'absolute', top: 840, width: W, display: 'flex', justifyContent: 'center', opacity: lin(f, OV + 20, OV + 26)}}>
        <div style={{transform: `scale(${sp(f, OV + 20) * pulse})`, background: C.orange, color: '#fff', fontFamily: 'Rubik', fontWeight: 900, fontSize: 96,
          padding: '26px 54px', borderRadius: 999, boxShadow: '0 14px 0 rgba(0,0,0,.18)'}}>sarqytapp.com</div>
      </div>
      <Caption f={f} d={OV + 32} top={1060} size={66} color={C.light} weight={700}>Подключите заведение<br />за 2 минуты</Caption>
      <Tap x={760} y={940} f={f} at={OV + 60} />
      <Tap x={760} y={940} f={f} at={OV + 110} />
    </Scene>
  );
};

// ---------- timeline ----------
export const SCENES: [React.FC, number][] = [[S1Hook, 120], [S2Trash, 180], [S3Sign, 150], [S4Fact, 90], [S5Solution, 120], [S6How, 300], [S7Benefits, 300], [S8CTA, 180]];
export const TOTAL = SCENES.reduce((a, [, d]) => a + d, 0);
export const NOTIFY_FRAMES = (() => { const s6 = SCENES.slice(0, 5).reduce((a, [, d]) => a + d, 0) - OV; return [s6 + OV + 96 + 36 + 16, s6 + OV + 192 + 62]; })();

const Promo: React.FC = () => {
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SCENES.map(([S, d], i) => {
        const from = i === 0 ? 0 : t - OV; const dur = (i === 0 ? d : d + OV); t += d;
        return <Sequence key={i} from={from} durationInFrames={dur}><S /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
export const Root: React.FC = () => <Composition id="Promo" component={Promo} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />;
