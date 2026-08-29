/**
 * Shared lighting primitives for the vector product renders.
 *
 * Everything in `components/art` is drawn as a flat base colour with two
 * separate overlay passes on top:
 *
 *   1. `<ShadeStops>` — a pure-black gradient that darkens the terminators.
 *   2. `<LightStops>` — a pure-white gradient that lays in the specular.
 *
 * They're deliberately kept as two single-hue gradients instead of one
 * black↔white gradient: SVG interpolates gradient stops in non-premultiplied
 * RGBA, so a black(0.3) → white(0.06) transition passes through a *lighter*
 * grey mid-way and muddies exactly the area that should be reading as the
 * curve falling away. Two layers composite correctly over any base colour.
 *
 * Light rig is constant across every product so a shelf of them reads as one
 * photo shoot: key from upper-left, weak bounce on the right rim.
 */

type StopSpec = { o: string; a: number };

/** Terminator falloff for a vertical cylinder lit from the upper-left. */
const CYL_SHADE: StopSpec[] = [
  { o: '0%', a: 0.66 },
  { o: '6%', a: 0.3 },
  { o: '16%', a: 0.06 },
  { o: '30%', a: 0 },
  { o: '50%', a: 0.04 },
  { o: '68%', a: 0.2 },
  { o: '82%', a: 0.36 },
  { o: '92%', a: 0.26 },
  { o: '100%', a: 0.64 },
];

/** Specular band + right-hand rim bounce for the same rig. */
const CYL_LIGHT: StopSpec[] = [
  { o: '0%', a: 0 },
  { o: '12%', a: 0.04 },
  { o: '20%', a: 0.22 },
  { o: '26%', a: 0.36 },
  { o: '33%', a: 0.16 },
  { o: '42%', a: 0.03 },
  { o: '60%', a: 0 },
  { o: '86%', a: 0.1 },
  { o: '94%', a: 0.05 },
  { o: '100%', a: 0 },
];

/**
 * Tighter, hotter version for small glossy plastic parts (caps, nibs, nozzles)
 * where the highlight wraps faster than on a 65 mm can body.
 */
const PLASTIC_SHADE: StopSpec[] = [
  { o: '0%', a: 0.55 },
  { o: '10%', a: 0.18 },
  { o: '28%', a: 0 },
  { o: '58%', a: 0.08 },
  { o: '80%', a: 0.32 },
  { o: '100%', a: 0.5 },
];

const PLASTIC_LIGHT: StopSpec[] = [
  { o: '0%', a: 0 },
  { o: '14%', a: 0.16 },
  { o: '22%', a: 0.48 },
  { o: '30%', a: 0.2 },
  { o: '44%', a: 0.02 },
  { o: '88%', a: 0.12 },
  { o: '100%', a: 0 },
];

function Grad({
  id,
  stops,
  color,
  vertical = false,
}: {
  id: string;
  stops: StopSpec[];
  color: string;
  vertical?: boolean;
}) {
  return (
    <linearGradient
      id={id}
      x1="0"
      y1="0"
      x2={vertical ? '0' : '1'}
      y2={vertical ? '1' : '0'}
    >
      {stops.map((s) => (
        <stop key={s.o} offset={s.o} stopColor={color} stopOpacity={s.a} />
      ))}
    </linearGradient>
  );
}

/**
 * Emits the four gradients a cylindrical part needs, namespaced by `uid`:
 *   {uid}-shade / {uid}-light      → can-body falloff
 *   {uid}-pshade / {uid}-plight    → glossy-plastic falloff
 */
export function CylinderDefs({ uid }: { uid: string }) {
  return (
    <>
      <Grad id={`${uid}-shade`} stops={CYL_SHADE} color="#000" />
      <Grad id={`${uid}-light`} stops={CYL_LIGHT} color="#fff" />
      <Grad id={`${uid}-pshade`} stops={PLASTIC_SHADE} color="#000" />
      <Grad id={`${uid}-plight`} stops={PLASTIC_LIGHT} color="#fff" />
    </>
  );
}

/**
 * Vertical sheen used on horizontal faces (can dome, book cover, cap crown) —
 * a short bright-to-dark ramp that keeps flat planes from reading as stickers.
 */
export function FaceDefs({ uid }: { uid: string }) {
  return (
    <>
      <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
        <stop offset="45%" stopColor="#fff" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
      </linearGradient>
    </>
  );
}

/** Soft contact shadow dropped under a product standing on a surface. */
export function GroundShadow({
  uid,
  cx,
  cy,
  rx,
  ry,
  opacity = 0.45,
}: {
  uid: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity?: number;
}) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-ground`}>
          <stop offset="0%" stopColor="#000" stopOpacity={opacity} />
          <stop offset="55%" stopColor="#000" stopOpacity={opacity * 0.5} />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${uid}-ground)`} />
    </>
  );
}

/**
 * Metal (chrome ring, crimp, nib ferrule). Banded rather than smooth — real
 * chrome reflects the environment in hard steps, and a smooth ramp reads as
 * grey plastic.
 */
export function MetalDefs({ uid, tint = '#c9c9d0' }: { uid: string; tint?: string }) {
  return (
    <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#3a3a42" />
      <stop offset="8%" stopColor="#8e8e98" />
      <stop offset="18%" stopColor={tint} />
      <stop offset="26%" stopColor="#ffffff" />
      <stop offset="34%" stopColor={tint} />
      <stop offset="48%" stopColor="#7d7d88" />
      <stop offset="62%" stopColor="#9d9da8" />
      <stop offset="78%" stopColor="#55555e" />
      <stop offset="90%" stopColor="#8e8e98" />
      <stop offset="100%" stopColor="#33333a" />
    </linearGradient>
  );
}

/** Relative luminance — used to pick readable ink over an arbitrary paint colour. */
export function inkOn(hex: string): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.58 ? '#14131a' : '#f4f2ec';
}

/** Mix `hex` toward black by `amount` (0–1). Used for shadowed variants of a paint colour. */
export function darken(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const to = (i: number) =>
    Math.round(parseInt(full.slice(i, i + 2), 16) * (1 - amount))
      .toString(16)
      .padStart(2, '0');
  return `#${to(0)}${to(2)}${to(4)}`;
}

/** Mix `hex` toward white by `amount` (0–1). */
export function lighten(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const to = (i: number) => {
    const v = parseInt(full.slice(i, i + 2), 16);
    return Math.round(v + (255 - v) * amount)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${to(0)}${to(2)}${to(4)}`;
}
