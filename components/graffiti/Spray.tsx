import { Speckle, prng } from './filters';

/**
 * Aerosol atmospherics — the soft stuff that sits *behind* content.
 *
 * A can never lays down a clean gradient: the middle of the cone is solid, the
 * outside breaks into individual droplets. Both components here are built the
 * same way — a smooth core, plus a separately-masked ring where the paint has
 * gone granular. The grain is the whole point; a plain radial gradient reads as
 * a dark-SaaS glow, not paint.
 */

type MistProps = {
  color?: string;
  opacity?: number;
  className?: string;
  /**
   * Namespaces the svg ids. REQUIRED to be distinct if you render more than one
   * SprayMist in a document — `url(#…)` binds to the first match, so later
   * copies would silently reuse the first one's mask.
   */
  uid?: string;
};

/** Hand-placed strays: the fat droplets that outrun the cone. */
const STRAYS = (() => {
  const r = prng(11);
  return Array.from({ length: 26 }, () => {
    const a = r() * Math.PI * 2;
    const d = 0.74 + r() * 0.42;
    return {
      x: 200 + Math.cos(a) * 168 * d,
      y: 132 + Math.sin(a) * 104 * d,
      r: 0.7 + r() * r() * 3.4,
      o: 0.25 + r() * 0.6,
    };
  });
})();

export function SprayMist({
  color = 'var(--accent)',
  opacity = 0.5,
  className = '',
  uid = 'gfx-mist',
}: MistProps) {
  return (
    <svg
      viewBox="0 0 400 264"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color, opacity }}
    >
      <defs>
        <radialGradient id={`${uid}-core`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="34%" stopColor="currentColor" stopOpacity="0.42" />
          <stop offset="66%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        {/* Grain weighting. Never quite reaches zero over the core — a smooth
            centre with a granular rim reads as a glow with confetti round it,
            not as paint. */}
        <radialGradient id={`${uid}-ring`}>
          <stop offset="6%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="32%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="66%" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="86%" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <Speckle id={`${uid}-sp-fine`} freq={0.5} seed={7} gain={11} cut={6.5} />
        <Speckle id={`${uid}-sp-coarse`} freq={0.22} seed={19} gain={13} cut={8.4} />

        <mask id={`${uid}-m-fine`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="264">
          <rect width="400" height="264" filter={`url(#${uid}-sp-fine)`} />
        </mask>
        <mask id={`${uid}-m-coarse`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="264">
          <rect width="400" height="264" filter={`url(#${uid}-sp-coarse)`} />
        </mask>

        {/* Nested masks: droplet presence × annulus falloff = grain that thins
            out toward the edge instead of stopping at a hard rim. */}
        <mask id={`${uid}-grain`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="264">
          <g mask={`url(#${uid}-m-fine)`}>
            <ellipse cx="196" cy="130" rx="180" ry="118" fill={`url(#${uid}-ring)`} />
          </g>
          {/* second pass, offset and rotated — a single annulus is a perfect
              oval of dust and the eye reads the rim immediately */}
          <g mask={`url(#${uid}-m-coarse)`} opacity="0.8">
            <ellipse
              cx="212"
              cy="120"
              rx="188"
              ry="104"
              fill={`url(#${uid}-ring)`}
              transform="rotate(-7 212 120)"
            />
          </g>
        </mask>
      </defs>

      {/* solid heart of the cone, offset off-centre — a hand is never square on */}
      <ellipse cx="192" cy="126" rx="140" ry="86" fill={`url(#${uid}-core)`} />
      <ellipse cx="214" cy="140" rx="92" ry="62" fill={`url(#${uid}-core)`} opacity="0.7" />

      <rect width="400" height="264" fill="currentColor" mask={`url(#${uid}-grain)`} />

      {STRAYS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="currentColor" opacity={s.o} />
      ))}
    </svg>
  );
}

type OversprayProps = {
  color?: string;
  className?: string;
  /** Distinct per instance if rendered more than once — see SprayMist. */
  uid?: string;
};

/** Halo droplets: dense just outside the fill, thinning fast with distance. */
const HALO = (() => {
  const r = prng(4);
  const out: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 340 && out.length < 130; i += 1) {
    const a = r() * Math.PI * 2;
    /* Sector density + radius wobble. A uniform scatter over an annulus is a
       perfect donut of confetti, which is what this looked like for two
       rounds; real overspray is heavy on the side the can was tilted toward
       and almost absent opposite it. */
    const dens = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(a * 2.3 + 0.9), 1.4);
    if (r() > dens) continue;
    const wob = 1 + Math.sin(a * 3.1 + 1.4) * 0.13 + Math.sin(a * 5.7) * 0.08;
    const d = (0.4 + Math.pow(r(), 0.55) * 0.62) * wob;
    const sz = Math.pow(r(), 2.6);
    out.push({
      x: 150 + Math.cos(a) * 134 * d,
      y: 150 + Math.sin(a) * 128 * d,
      r: 0.4 + sz * 4.2,
      o: 0.18 + (1 - sz) * 0.62,
    });
  }
  return out;
})();

export function Overspray({
  color = 'var(--accent)',
  className = '',
  uid = 'gfx-overspray',
}: OversprayProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        <radialGradient id={`${uid}-band`}>
          <stop offset="30%" stopColor="#fff" stopOpacity="0" />
          <stop offset="58%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="78%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <Speckle id={`${uid}-sp`} freq={0.45} seed={31} gain={13} cut={7.8} />
        <mask id={`${uid}-dust`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
          <g mask={`url(#${uid}-spm)`}>
            <ellipse
              cx="146"
              cy="154"
              rx="152"
              ry="136"
              fill={`url(#${uid}-band)`}
              transform="rotate(-18 146 154)"
            />
          </g>
        </mask>
        <mask id={`${uid}-spm`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300">
          <rect width="300" height="300" filter={`url(#${uid}-sp)`} />
        </mask>
      </defs>

      <rect width="300" height="300" fill="currentColor" mask={`url(#${uid}-dust)`} opacity="0.85" />
      {HALO.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="currentColor" opacity={d.o} />
      ))}
    </svg>
  );
}
