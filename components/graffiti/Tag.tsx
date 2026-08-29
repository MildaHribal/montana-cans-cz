import { RoughEdge, hashWord } from './filters';

/* ── HANDSTYLE TAG ───────────────────────────────────────────────── */

/**
 * A tag is one continuous gesture — the pen leaves the surface once, at the
 * flick. So each variant below is a *single* open path: the letters are
 * whatever the hand did between the connectors, which is why a tag stays
 * legible-looking without spelling anything.
 *
 * Rhythm is what makes them read: steep near-vertical downstrokes, sharp
 * corners at the baseline, loops at the top, and a baseline that climbs to the
 * right. Evenly spaced arches read as cursive handwriting, not as a tag.
 */
/**
 * Handstyles are assembled from letter-sized *gestures* rather than authored
 * as one long path, because a hand-drawn alternating up/down at a constant
 * pitch is a zigzag, not a tag — the first two attempts at this file both came
 * out as a seismograph trace. Chaining differently-shaped gestures (tall stem,
 * round bump, sharp spike, closed loop, below-baseline dip) gives the uneven
 * rhythm real handstyle has, and because every gesture is written in relative
 * commands the whole word still emits as a single continuous path.
 */
type Gesture = { d: string; dx: number; dy: number };

const G: Record<string, Gesture> = {
  /* tall thin ascender that kicks back out at the baseline */
  stem: { d: 'c-5 -30 2 -72 14 -70 c12 2 5 38 -1 62 c-4 16 12 18 18 4', dx: 31, dy: -4 },
  /* low round bowl that closes on itself */
  bump: { d: 'c4 -12 22 -16 28 -4 c6 13 -8 22 -18 16 c-9 -6 -4 -16 8 -18', dx: 18, dy: -6 },
  /* fast reversal with just enough radius at the apex to read as a letter
     rather than a fence picket */
  spike: { d: 'l10 -52 c2 -7 9 -5 8 3 l6 47', dx: 24, dy: -2 },
  zig: { d: 'l24 -44 l-16 2 l22 44', dx: 30, dy: 2 },
  /* drops below the baseline before the next ascender */
  dip: { d: 'c6 14 20 16 26 -4 c5 -16 -2 -32 6 -40 c8 -8 16 2 10 20 c-4 12 -2 22 6 24', dx: 48, dy: 0 },
  loop: {
    d: 'c-2 -26 6 -50 16 -46 c9 4 4 22 -6 26 c-8 3 -10 -8 0 -14 c8 -5 18 4 14 30 c-2 12 6 16 12 6',
    dx: 36,
    dy: 2,
  },
  /* the low connector the pen rides between letters */
  link: { d: 'c5 5 11 4 15 -1', dx: 15, dy: -1 },
};

const SEQUENCES: string[][] = [
  ['stem', 'bump', 'spike', 'loop', 'bump', 'dip'],
  ['spike', 'zig', 'bump', 'spike', 'stem', 'zig', 'spike'],
  ['loop', 'bump', 'stem', 'bump', 'loop', 'bump'],
  ['bump', 'stem', 'bump', 'dip', 'bump', 'loop', 'bump'],
];

const WEIGHTS = [9, 8, 12, 8];
const SHARP = [false, true, false, false];
const START = { x: 18, y: 100 };

type Handstyle = { d: string; w: number; sharp: boolean; flick: string; extras: string; vb: string };

function build(seq: string[], i: number): Handstyle {
  let x = START.x;
  let y = START.y;
  const parts: string[] = [`M${x} ${y}`];
  seq.forEach((k, j) => {
    if (j > 0) {
      parts.push(G.link.d);
      x += G.link.dx;
      y += G.link.dy;
    }
    parts.push(G[k].d);
    x += G[k].dx;
    y += G[k].dy;
  });

  /* Filled, not stroked: the flick is the one place the line has to taper to
     nothing as the pen leaves the wall. */
  const flick =
    `M${x - 4} ${y + 5} C${x + 22} ${y - 12} ${x + 42} ${y - 28} ${x + 62} ${y - 40}` +
    ` L${x + 65} ${y - 32} C${x + 44} ${y - 20} ${x + 22} ${y - 2} ${x - 2} ${y + 12} Z`;

  const extras =
    i % 2 === 0
      ? `M${START.x + 14} 118 C${(x + START.x) / 2} 128 ${x - 30} 124 ${x} 112`
      : `M${START.x + 8} 14 L${START.x + 22} 6 M${x - 40} 120 C${x - 10} 126 ${x + 10} 122 ${x + 24} 114`;

  return {
    d: parts.join(' '),
    w: WEIGHTS[i],
    sharp: SHARP[i],
    flick,
    extras,
    vb: `0 0 ${Math.round(x + 80)} 136`,
  };
}

const HANDSTYLES: Handstyle[] = SEQUENCES.map(build);

type TagProps = {
  /** Only picks the variant — the mark is a gesture, not lettering. */
  word?: string;
  color?: string;
  className?: string;
  /** Distinct per instance — the displacement filter id is derived from it. */
  uid?: string;
};

export function Tag({
  word = 'MTN',
  color = 'var(--accent)',
  className = '',
  uid = 'gfx-tag',
}: TagProps) {
  const h = HANDSTYLES[hashWord(word) % HANDSTYLES.length];
  const id = `${uid}-${hashWord(word) % HANDSTYLES.length}`;
  return (
    <svg
      viewBox={h.vb}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        {/* low scale: a marker wobbles, it doesn't tear */}
        <RoughEdge id={`${id}-r`} freq="0.09 0.11" octaves={2} scale={2.4} seed={13} />
      </defs>
      {/* every handstyle leans — an upright tag reads as handwriting */}
      {/* skewX pivots on y=0, so the translate puts the baseline back where it
          was authored instead of hanging it off the left edge */}
      <g filter={`url(#${id}-r)`} transform="translate(18 0) skewX(-9)">
        <path
          d={h.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={h.w}
          strokeLinecap="round"
          strokeLinejoin={h.sharp ? 'miter' : 'round'}
          strokeMiterlimit={h.sharp ? 3 : undefined}
        />
        {h.extras && (
          <path
            d={h.extras}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}
        {/* the flick is filled, not stroked — it has to taper to nothing */}
        <path d={h.flick} fill="currentColor" />
      </g>
    </svg>
  );
}

/* ── THROW-UP ────────────────────────────────────────────────────── */

/**
 * Bubble letters, built as skeletons stroked at an absurd width with round
 * caps and joins. That is genuinely how the shape works: a throw-up is a fat
 * pen dragged along a letter's centreline, and authoring the outlines by hand
 * gives lumpier results for ten times the work.
 *
 * Every letter is drawn on the same 104-unit body so the outline pass, drawn
 * first and 16 units wider, welds neighbouring letters into one silhouette.
 */
const GLYPHS: Record<string, { d: string; w: number }> = {
  M: { d: 'M12 114 V14 L40 70 L68 14 V114', w: 80 },
  T: { d: 'M10 20 H74 M42 20 V114', w: 84 },
  N: { d: 'M12 114 V14 L62 114 V14', w: 74 },
  C: { d: 'M72 32 C50 8 12 26 12 64 C12 100 50 116 72 94', w: 84 },
  A: { d: 'M12 114 L40 14 L68 114 M24 80 H56', w: 80 },
  S: { d: 'M70 28 C52 10 20 16 22 44 C24 70 64 60 66 86 C68 112 34 118 14 100', w: 82 },
  B: { d: 'M14 14 V114 M14 14 H42 C68 14 68 60 42 60 H14 M14 60 H48 C74 60 74 114 48 114 H14', w: 84 },
  R: { d: 'M14 14 V114 M14 14 H44 C70 14 70 62 44 62 H14 M44 62 L74 114', w: 86 },
  O: { d: 'M42 14 C18 14 10 38 10 64 C10 92 22 114 42 114 C64 114 74 90 74 64 C74 34 64 14 42 14 Z', w: 84 },
};

const FILL_W = 30;
const OUTLINE_W = 50;
/** Letters overlap so the outline pass fuses them into one blob. */
const KERN = -16;
const PAD = OUTLINE_W / 2 + 8;

type ThrowUpProps = {
  /** Short words only — glyphs exist for M T N C A S B R O. */
  word?: string;
  color?: string;
  outline?: string;
  className?: string;
  /** Distinct per instance — the displacement filter id is derived from it. */
  uid?: string;
};

export function ThrowUp({
  word = 'MTN',
  color = 'var(--accent)',
  outline = '#0b0a0e',
  className = '',
  uid = 'gfx-throwup',
}: ThrowUpProps) {
  const letters = word
    .toUpperCase()
    .split('')
    .filter((c) => c in GLYPHS);
  const glyphs = (letters.length ? letters : ['M', 'T', 'N']).map((c) => GLYPHS[c]);

  let x = PAD;
  const placed = glyphs.map((g, i) => {
    const at = x;
    x += g.w + KERN;
    /* alternating tilt + bounce: a throw-up is painted fast, off a ladder of
       nothing, and perfectly level letters kill it */
    const rot = [-3, 2.5, -1.5, 3.5][i % 4];
    const dy = [0, 5, -4, 3][i % 4];
    return { d: g.d, t: `translate(${at} ${dy}) rotate(${rot} ${g.w / 2} 64)` };
  });
  const W = x - KERN + PAD;
  const H = 128 + PAD;

  const pass = (paint: string, width: number) => (
    <g
      fill="none"
      stroke={paint}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {placed.map((p, i) => (
        <path key={i} d={p.d} transform={p.t} />
      ))}
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        <RoughEdge id={`${uid}-r`} freq="0.02 0.03" octaves={2} scale={5} seed={23} />
        <mask id={`${uid}-shine`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          {pass('#fff', FILL_W - 8)}
        </mask>
      </defs>
      <g transform="translate(0 12)" filter={`url(#${uid}-r)`}>
        {/* cast shadow — throw-ups are usually painted with one offset drop */}
        <g transform="translate(9 10)" opacity="0.5">
          {pass(outline, OUTLINE_W)}
        </g>
        {pass(outline, OUTLINE_W)}
        {pass('currentColor', FILL_W)}
        {/* highlight clipped to the fill so it can't spill onto the outline */}
        <g mask={`url(#${uid}-shine)`}>
          <g
            fill="none"
            stroke="#fff"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.22"
            transform="translate(-6 -7)"
          >
            {placed.map((p, i) => (
              <path key={i} d={p.d} transform={p.t} />
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
}
