import type { CSSProperties, ReactNode } from 'react';
import { prng } from './filters';

/**
 * Physical surfaces: tape, torn paper, print screen, stickers.
 *
 * These are all HTML rather than SVG, because they have to wrap arbitrary
 * children at arbitrary sizes. The irregularity therefore comes from clip-path
 * and mask-image with hand-tuned point lists instead of from filters.
 */

/* ── TAPE ────────────────────────────────────────────────────────── */

/**
 * Torn ends, straight long edges — that's genuinely how masking tape comes off
 * a dispenser, and jagging all four sides is the tell of a fake.
 *
 * The tear amplitude is in px while the positions are in %, so the tear keeps
 * its real-world size no matter how wide the strip is stretched.
 */
const TAPE_CLIP = [
  /* Mostly shallow with two deep excursions per end. Evenly alternating
     shallow/deep at an even pitch is a pinking-shear zigzag, which is what
     this looked like before — a tear is ragged, not serrated. */
  '6px 0%',
  '2px 5%',
  '4px 11%',
  '1px 15%',
  '3px 23%',
  '11px 28%',
  '4px 34%',
  '6px 41%',
  '1px 47%',
  '2px 56%',
  '8px 61%',
  '3px 67%',
  '5px 74%',
  '1px 79%',
  '4px 88%',
  '12px 93%',
  '3px 100%',
  'calc(100% - 4px) 100%',
  'calc(100% - 1px) 94%',
  'calc(100% - 7px) 90%',
  'calc(100% - 2px) 84%',
  'calc(100% - 3px) 76%',
  'calc(100% - 11px) 71%',
  'calc(100% - 4px) 66%',
  'calc(100% - 2px) 58%',
  'calc(100% - 6px) 52%',
  'calc(100% - 1px) 45%',
  'calc(100% - 3px) 37%',
  'calc(100% - 9px) 32%',
  'calc(100% - 2px) 26%',
  'calc(100% - 5px) 19%',
  'calc(100% - 1px) 12%',
  'calc(100% - 4px) 6%',
  'calc(100% - 2px) 0%',
].join(', ');

type TapeProps = {
  children: ReactNode;
  /** Degrees. Tape is never applied square. */
  rotate?: number;
  color?: string;
  className?: string;
};

export function Tape({ children, rotate = -1.5, color = 'var(--accent)', className = '' }: TapeProps) {
  return (
    <span
      className={`relative inline-block px-5 py-2 align-middle ${className}`}
      style={{
        background: color,
        color: 'var(--accent-ink, #0e0d10)',
        clipPath: `polygon(${TAPE_CLIP})`,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.93,
        /* adhesive is never perfectly clear: a faint fibre weave plus darker
           bands where it grabbed the wall */
        backgroundImage: `repeating-linear-gradient(115deg, rgba(255,255,255,0.13) 0 2px, transparent 2px 5px),
           linear-gradient(180deg, rgba(0,0,0,0.16) 0 2px, transparent 2px calc(100% - 2px), rgba(0,0,0,0.22) calc(100% - 2px) 100%)`,
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 22px rgba(0,0,0,0.16)' }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

/* ── TORN EDGE ───────────────────────────────────────────────────── */

const TILE_W = 420;
const TILE_H = 44;
const TEAR_MID = 22;

/**
 * Torn paper tears in *chunks*: a flat run of fibre, a step, another flat run,
 * with the occasional deep bite. A per-pixel random walk gives an even
 * sawtooth, which reads as grass — so each iteration emits a plateau (two
 * points at the same y) before jumping.
 *
 * Both ends are pinned to TEAR_MID so the tile butts against its own repeat
 * with no visible seam at any width.
 */
function tearPoints(sign: number): string[] {
  const r = prng(77);
  const pts: string[] = [];
  let x = 0;
  let y = TEAR_MID;
  while (x < TILE_W - 14) {
    const x2 = Math.min(TILE_W - 8, x + 5 + r() * 24);
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`, `${x2.toFixed(1)} ${y.toFixed(1)}`);
    /* the gap before the next plateau becomes the diagonal of the step; make
       it too small and the profile turns into a barcode */
    x = x2 + 2 + r() * 7;
    const bite = r() > 0.84 ? sign * (6 + r() * 11) : 0;
    y = Math.max(4, Math.min(TILE_H - 4, TEAR_MID + (r() - 0.5) * 22 + bite));
  }
  return pts;
}

function tearTile(side: 'top' | 'bottom'): string {
  const sign = side === 'bottom' ? 1 : -1;
  const edge = tearPoints(sign).reverse().map((p) => `L${p}`).join(' ');
  const base = side === 'bottom' ? 0 : TILE_H;
  const d = `M0 ${base} H${TILE_W} V${TEAR_MID} ${edge} L0 ${TEAR_MID} Z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${TILE_H}"><path d="${d}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const TEAR = { top: tearTile('top'), bottom: tearTile('bottom') };

function maskStyle(side: 'top' | 'bottom'): CSSProperties {
  const v = {
    maskImage: TEAR[side],
    maskRepeat: 'repeat-x',
    maskSize: `${TILE_W}px ${TILE_H}px`,
    maskPosition: '0 0',
  };
  return {
    ...v,
    WebkitMaskImage: v.maskImage,
    WebkitMaskRepeat: v.maskRepeat,
    WebkitMaskSize: v.maskSize,
    WebkitMaskPosition: v.maskPosition,
  } as CSSProperties;
}

type TornEdgeProps = {
  /** Which way the ragged edge faces. */
  side?: 'top' | 'bottom';
  color?: string;
  className?: string;
};

/** Tiles horizontally at any width — the mask repeats on a 240px seamless tile. */
export function TornEdge({ side = 'bottom', color = 'var(--accent)', className = '' }: TornEdgeProps) {
  const m = maskStyle(side);
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${className}`}
      style={{ height: TILE_H }}
    >
      {/* paper thickness: the same tear, pushed back and darkened */}
      <div
        className="absolute inset-x-0"
        style={{
          ...m,
          top: side === 'bottom' ? 2 : -2,
          height: TILE_H,
          background: 'rgba(0,0,0,0.45)',
        }}
      />
      <div className="absolute inset-0" style={{ ...m, background: color }} />
    </div>
  );
}

/* ── HALFTONE ────────────────────────────────────────────────────── */

type HalftoneProps = {
  className?: string;
  /** Screen pitch in px. */
  size?: number;
  opacity?: number;
};

/**
 * Print dot screen. Two offset lattices rather than one, because a single
 * square grid reads as a UI texture; staggering them gives the 45° rosette a
 * real screen has. Inherits `currentColor`.
 */
export function Halftone({ className = '', size = 6, opacity = 0.22 }: HalftoneProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        opacity,
        backgroundImage:
          'radial-gradient(currentColor 26%, transparent 27%), radial-gradient(currentColor 26%, transparent 27%)',
        backgroundSize: `${size}px ${size}px, ${size}px ${size}px`,
        backgroundPosition: `0 0, ${size / 2}px ${size / 2}px`,
      }}
    />
  );
}

/* ── STICKER ─────────────────────────────────────────────────────── */

type StickerFrameProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Slapped-on sticker: off-axis, hard (zero-blur) drop shadow so it reads as
 * flat vinyl lifted off the wall, and one corner curled back to show the
 * paper's underside.
 */
export function StickerFrame({ children, className = '' }: StickerFrameProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        transform: 'rotate(-1.8deg)',
        filter: 'drop-shadow(7px 9px 0 rgba(0,0,0,0.55))',
      }}
    >
      {children}
      {/* shadow the lifted corner throws back onto the sticker */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 block h-9 w-9"
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          background: 'linear-gradient(315deg, rgba(0,0,0,0.65), rgba(0,0,0,0) 70%)',
          transform: 'translate(-6px, -6px)',
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 block h-8 w-8"
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          background: 'linear-gradient(315deg, #d8d4ca 0%, #9d9990 55%, #55524c 100%)',
        }}
      />
    </div>
  );
}
