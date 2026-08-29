import { RoughEdge, prng } from './filters';

/**
 * Paint and ink marks: splatter, runs, marker.
 *
 * Everything here is drawn as clean geometry and then pushed through a
 * displacement filter, which is what separates a paint mark from a vector
 * ornament. The geometry itself is deliberately asymmetric — a splat with
 * evenly spaced lobes is a flower, and a drip without a bulb at the bottom is
 * a rounded rectangle.
 */

/* ── SPLATTER ────────────────────────────────────────────────────── */

const CX = 100;
const CY = 100;

/**
 * Central masses, authored as radius profiles rather than as path strings.
 *
 * A splat's outline is a closed loop whose radius wanders — writing that as
 * beziers by hand reliably produces flat facets and right angles (the first
 * version of this file looked like a yellow postage stamp with pins in it).
 * Radii guarantee the loop stays round; the dips below ~30 are the concave
 * notches every real splat has where two lobes met.
 */
const PROFILES = [
  [46, 38, 29, 43, 34, 45, 28, 37, 47, 32],
  [34, 45, 27, 39, 48, 30, 41, 25, 44, 36, 29],
  [43, 30, 46, 35, 26, 41, 47, 31, 39, 28],
  [29, 42, 48, 33, 38, 27, 45, 36, 30, 46, 34],
  [46, 34, 27, 44, 39, 29, 48, 31, 42, 26],
  [32, 47, 29, 40, 45, 25, 38, 44, 30, 39, 35],
];

/** Catmull-Rom through the radius profile, converted to cubics. */
function blob(radii: number[], squash: number): string {
  const n = radii.length;
  const pt = (i: number): [number, number] => {
    const k = ((i % n) + n) % n;
    const a = (k / n) * Math.PI * 2;
    return [CX + Math.cos(a) * radii[k], CY + Math.sin(a) * radii[k] * squash];
  };
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const p0 = pt(i - 1);
    const p1 = pt(i);
    const p2 = pt(i + 1);
    const p3 = pt(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    if (i === 0) d += `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

const SQUASH = [0.92, 1.04, 0.86, 1, 0.95, 1.08];
const BLOBS = PROFILES.map((p, i) => blob(p, SQUASH[i]));

/**
 * Per-seed lobes: [angle°, launch radius, length, base width, tip radius].
 * Launch radius sits *inside* the mass so the lobe grows out of it; a lobe
 * that starts on the contour reads as a pin stuck in a blob.
 */
const FINGERS: number[][][] = [
  [
    [-42, 20, 30, 30, 8],
    [-14, 24, 46, 20, 7],
    [22, 22, 18, 26, 6],
    [126, 18, 22, 20, 5.5],
    [-4, 30, 62, 8, 4],
  ],
  [
    [-98, 18, 34, 24, 7],
    [-58, 22, 16, 28, 6],
    [16, 24, 30, 22, 6.5],
    [152, 20, 24, 19, 5],
    [96, 18, 12, 24, 5],
    [-88, 30, 58, 7, 3.5],
  ],
  [
    [-152, 20, 32, 22, 6],
    [-104, 18, 14, 27, 5.5],
    [-24, 24, 26, 24, 7],
    [58, 22, 40, 20, 6.5],
    [62, 34, 66, 7.5, 4],
  ],
  [
    [-72, 20, 20, 26, 6],
    [8, 24, 18, 30, 6.5],
    [46, 22, 38, 21, 7],
    [138, 20, 28, 20, 5.5],
    [-168, 18, 13, 22, 4.5],
    [40, 32, 58, 8, 4],
  ],
  [
    [-120, 18, 28, 23, 6],
    [-30, 24, 14, 30, 6],
    [30, 22, 34, 22, 6.5],
    [104, 18, 20, 21, 5.5],
    [-124, 30, 52, 7, 3.5],
  ],
  [
    [-8, 24, 22, 28, 7],
    [34, 22, 13, 24, 5],
    [92, 18, 40, 21, 7],
    [-136, 20, 26, 20, 5.5],
    [176, 20, 16, 23, 5],
    [94, 32, 64, 8, 4],
  ],
];

/** Direction the "hand" threw in — satellites cluster downrange of it. */
const THROW = [-16, -40, 24, 40, -60, 84];

/**
 * Teardrop: fat where it leaves the mass, rounded bulb at the tip. Built from
 * the launch vector rather than authored per-seed so the six splatters stay
 * consistent in weight.
 */
function finger(a: number, r0: number, len: number, w: number, tip: number): string {
  const rad = (a * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);
  const px = -uy;
  const py = ux;
  const bx = CX + ux * r0;
  const by = CY + uy * r0;
  const tx = CX + ux * (r0 + len);
  const ty = CY + uy * (r0 + len);
  const h = w / 2;
  const mx = bx + ux * len * 0.42;
  const my = by + uy * len * 0.42;
  const mw = h * 0.55 + tip * 0.45;
  const kx = tx - ux * tip * 1.3;
  const ky = ty - uy * tip * 1.3;
  return (
    `M${bx + px * h} ${by + py * h}` +
    ` C${mx + px * mw} ${my + py * mw} ${kx + px * tip} ${ky + py * tip} ${tx + px * tip} ${ty + py * tip}` +
    /* sweep 0: round the tip the long way, through the launch direction */
    ` A${tip} ${tip} 0 0 0 ${tx - px * tip} ${ty - py * tip}` +
    ` C${kx - px * tip} ${ky - py * tip} ${mx - px * mw} ${my - py * mw} ${bx - px * h} ${by - py * h} Z`
  );
}

const SATELLITES = BLOBS.map((_, s) => {
  const r = prng(s * 97 + 13);
  const bias = (THROW[s] * Math.PI) / 180;
  return Array.from({ length: 22 }, () => {
    /* cone of ±70° around the throw, distance^1.6 so most land close in */
    const a = bias + (r() - 0.5) * 2.4;
    const d = 52 + Math.pow(r(), 1.6) * 96;
    const sz = Math.pow(r(), 2.2);
    return {
      x: CX + Math.cos(a) * d,
      y: CY + Math.sin(a) * d * 0.92,
      r: 0.9 + sz * 6.5,
      o: 0.45 + (1 - sz) * 0.55,
    };
  });
});

type SplatterProps = {
  color?: string;
  /** 0–5, picks a hand-authored mass + finger set. Values wrap. */
  seed?: number;
  className?: string;
  /** Distinct per instance — the displacement filter id is derived from it. */
  uid?: string;
};

export function Splatter({
  color = 'var(--accent)',
  seed = 0,
  className = '',
  uid,
}: SplatterProps) {
  const s = ((seed % BLOBS.length) + BLOBS.length) % BLOBS.length;
  const id = `${uid ?? 'gfx-splat'}-${s}`;
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        {/* fine + fast: a low-frequency displacement at this scale flattens the
            loop into facets instead of fraying it */}
        <RoughEdge id={`${id}-r`} freq="0.11 0.13" octaves={3} scale={5} seed={s * 7 + 2} />
        <RoughEdge id={`${id}-r2`} freq="0.2 0.18" octaves={2} scale={3} seed={s * 5 + 9} />
      </defs>
      <g fill="currentColor">
        <g filter={`url(#${id}-r)`}>
          <path d={BLOBS[s]} />
          {FINGERS[s].map((f, i) => (
            <path key={i} d={finger(f[0], f[1], f[2], f[3], f[4])} />
          ))}
        </g>
        <g filter={`url(#${id}-r2)`}>
          {SATELLITES[s].map((d, i) => (
            <ellipse key={i} cx={d.x} cy={d.y} rx={d.r} ry={d.r * 0.86} opacity={d.o} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/* ── DRIPS ───────────────────────────────────────────────────────── */

/**
 * One run: leaves the block at full width, necks in as gravity stretches it,
 * then swells into the bulb where surface tension is still holding the paint.
 * The bulb is the tell — without it a drip is a rounded rect.
 */
function run(x: number, w: number, len: number): string {
  const top = w * 0.5;
  const neck = w * 0.34;
  const bulb = w * 0.56;
  const by = len - bulb;
  const f = (v: number) => v.toFixed(1);
  return (
    `M${f(x - top)} 0` +
    ` C${f(x - top)} ${f(len * 0.18)} ${f(x - neck)} ${f(len * 0.34)} ${f(x - neck)} ${f(by - bulb * 0.4)}` +
    ` C${f(x - bulb)} ${f(by + bulb * 0.08)} ${f(x - bulb)} ${f(by + bulb * 0.9)} ${f(x)} ${f(len)}` +
    ` C${f(x + bulb)} ${f(by + bulb * 0.9)} ${f(x + bulb)} ${f(by + bulb * 0.08)} ${f(x + neck)} ${f(by - bulb * 0.4)}` +
    ` C${f(x + neck)} ${f(len * 0.34)} ${f(x + top)} ${f(len * 0.18)} ${f(x + top)} 0 Z`
  );
}

type DripsProps = {
  color?: string;
  /**
   * Number of runs. The viewBox widens by 44 units per run and the strip is
   * drawn with `preserveAspectRatio="none"`, so pick roughly
   * `container width in px / 40` — undershoot it and every run comes out
   * stretched into a fat slab.
   */
  count?: number;
  className?: string;
  /** Distinct per instance — the displacement filter id is derived from it. */
  uid?: string;
};

export function Drips({
  color = 'var(--accent)',
  count = 7,
  className = '',
  uid = 'gfx-drips',
}: DripsProps) {
  const n = Math.max(1, Math.min(40, Math.round(count)));
  const W = n * 44;
  const H = 120;
  const r = prng(n * 31 + 7);

  const runs = Array.from({ length: n }, (_, i) => {
    const jitter = (r() - 0.5) * 24;
    const w = 7 + r() * 9;
    /* squared distribution: a handful of long runs, most of them short —
       evenly-spaced equal-length drips read as a decorative fringe */
    const len = 20 + Math.pow(r(), 2) * 88;
    /* the odd bead that has already broken off and is falling on its own */
    const bead = r() > 0.72 ? { y: len + 12 + r() * 20, r: w * 0.26 } : null;
    return { x: 22 + i * 44 + jitter, w, len, bead };
  });

  /* Sagging lip the runs hang off: one continuous wave, dipping lowest exactly
     where a run leaves it. Kept shallow — a deep sag turns the strip into
     scalloped bunting. */
  const lip = runs
    .map((d) => `Q${(d.x - 20).toFixed(1)} 5 ${d.x.toFixed(1)} ${(7 + d.w * 0.18).toFixed(1)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        {/* long, lazy wobble only — raise the vertical frequency here and the
            straight sides of every run turn corrugated */}
        <RoughEdge id={`${uid}-r`} freq="0.012 0.016" octaves={2} scale={2.6} seed={n + 4} />
      </defs>
      <g fill="currentColor" filter={`url(#${uid}-r)`}>
        <path d={`M0 4 ${lip} Q${W - 20} 6 ${W} 5 L${W} 0 L0 0 Z`} />
        <rect x="0" y="-4" width={W} height="10" />
        {runs.map((d, i) => (
          <path key={i} d={run(d.x, d.w, d.len)} />
        ))}
      </g>
      <g fill="currentColor">
        {runs.map((d, i) =>
          d.bead ? (
            <ellipse key={i} cx={d.x} cy={d.bead.y} rx={d.bead.r} ry={d.bead.r * 1.25} />
          ) : null,
        )}
      </g>
    </svg>
  );
}

/* ── MARKER ──────────────────────────────────────────────────────── */

type MarkProps = {
  color?: string;
  className?: string;
  /** Distinct per instance — the displacement filter id is derived from it. */
  uid?: string;
};

/**
 * Chisel-nib swipe. Drawn as a *filled* outline rather than a stroke: a stroke
 * has one width, and the whole character of a chisel nib is that the width
 * changes as the hand accelerates. Thick on the entry, dry and thin on the
 * exit, with two skips knocked out where the nib lifted.
 */
export function MarkerStroke({
  color = 'var(--accent)',
  className = '',
  uid = 'gfx-marker',
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 300 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        <RoughEdge id={`${uid}-r`} freq="0.07 0.4" octaves={2} scale={2.6} seed={12} />
        <mask id={`${uid}-skip`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="44">
          <rect width="300" height="44" fill="#fff" />
          <ellipse cx="118" cy="17" rx="14" ry="1.5" fill="#000" />
          <ellipse cx="203" cy="19" rx="21" ry="1.1" fill="#000" />
          <ellipse cx="262" cy="16" rx="10" ry="0.9" fill="#000" />
        </mask>
      </defs>
      <g fill="currentColor" filter={`url(#${uid}-r)`} mask={`url(#${uid}-skip)`}>
        <path d="M4 15 C56 6 168 3 262 6 C277 6.5 288 8.5 298 11 C288 14.5 277 17 262 18.6 C168 22 58 30 6 38 Z" />
        {/* ink that pooled where the nib first landed and again where it lifted */}
        <path d="M3 14 C10 9 16 10 20 13 C17 22 11 31 5 37 Z" />
        <ellipse cx="292" cy="11" rx="9" ry="3.2" opacity="0.75" />
      </g>
    </svg>
  );
}

function zigzag(seed: number, up: boolean): string {
  const r = prng(seed);
  const pts: string[] = [];
  let x = 6 + r() * 8;
  let hi = up;
  while (x < 294) {
    const y = hi ? 6 + r() * 38 : 48 + r() * 38;
    pts.push(`${x.toFixed(0)} ${y.toFixed(0)}`);
    x += 12 + r() * 30;
    hi = !hi;
  }
  return `M${pts.join(' L')}`;
}

const ZIG_A = zigzag(5, true);
const ZIG_B = zigzag(29, false);

/**
 * Cross-out scribble. Four passes at different angles with round caps — a
 * single polyline reads as a chart line, and it's the overlap of repeated
 * passes that says "someone scrubbed this out".
 */
export function Scribble({
  color = 'var(--accent)',
  className = '',
  uid = 'gfx-scribble',
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 300 92"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        <RoughEdge id={`${uid}-r`} freq="0.06 0.3" octaves={2} scale={3.2} seed={21} />
      </defs>
      <g
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${uid}-r)`}
      >
        {/* Hard reversals at an uneven pitch. Smooth waves read as a chart
            line; an even zigzag reads as a heartbeat. Both apex height and
            spacing have to wander. */}
        <path d={ZIG_A} strokeWidth="7" strokeLinejoin="miter" />
        <path d={ZIG_B} strokeWidth="5.5" strokeLinejoin="miter" opacity="0.9" />
        <path d="M6 44 C74 60 122 34 186 52 C232 65 262 40 294 52" strokeWidth="5" opacity="0.8" />
        <path d="M18 84 C90 62 168 76 236 44 C262 32 280 30 294 34" strokeWidth="4" opacity="0.65" />
      </g>
    </svg>
  );
}
