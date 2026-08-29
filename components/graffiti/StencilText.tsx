import type { ReactNode } from 'react';
import { RoughEdge } from './filters';

/**
 * Text sprayed through a cut stencil.
 *
 * Deliberately HTML text with CSS filters/masks rather than SVG `<text>`:
 * an `<svg>` cannot measure its own glyphs, so any SVG implementation needs a
 * hand-guessed viewBox — and the first thing that clips is the háček on Ě/Š/Č.
 * Here the browser does the layout and nothing can overflow.
 *
 *  - bridges: a vertical alpha mask with two transparent bands, positioned
 *    inside the cap band so they never cross a diacritic.
 *  - edge: an SVG displacement filter referenced from CSS, which frays the
 *    glyph outline the way a stencil's paint creep does.
 *  - overspray: a blurred copy behind, plus a speckle-masked copy on top for
 *    the aerosol dust that gets under the stencil edge.
 *
 * Sizing the box is load-bearing, not cosmetic. A mask covers the element's
 * own box and `mask-repeat` then TILES the same gradient above it, so at
 * `leading-none` the lower bridge band reappears about 0.3em over the box top
 * — precisely where Antonio parks a háček or a kroužek. "ŽŠČŘ" came back with
 * every accent sliced flat. `BOX` is therefore tall enough to contain an
 * accented capital (Ů reaches 1.156em above the baseline, against a 1.29em
 * font box), and `TRIM` hands the extra height straight back to the line so
 * the headline does not move.
 */

/** line box height, em — holds the tallest Czech capital */
const BOX = 1.32;
/** what BOX added over `leading-none`, taken back off the line */
const TRIM = BOX - 1;

/* Stops are em from the top of that box. The baseline sits at 1.165em, so
   these land 0.36–0.41em and 0.13–0.17em above it: inside the cap band. */
const BRIDGES =
  'linear-gradient(to bottom, #000 0 0.755em, transparent 0.755em 0.805em, ' +
  '#000 0.805em 0.995em, transparent 0.995em 1.035em, #000 1.035em 100%)';

type Props = {
  children: ReactNode;
  color?: string;
  className?: string;
  /**
   * Distinct per instance — the CSS `filter: url(#…)` references live in the
   * document, so two StencilTexts sharing a uid share one filter.
   */
  uid?: string;
};

export function StencilText({
  children,
  color = 'var(--accent)',
  className = '',
  uid = 'gfx-stencil',
}: Props) {
  const bridged = {
    maskImage: BRIDGES,
    WebkitMaskImage: BRIDGES,
  };

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ color, lineHeight: BOX, marginTop: `${-TRIM}em` }}
    >
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <RoughEdge id={`${uid}-edge`} freq="0.16 0.22" octaves={2} scale={2.6} seed={9} />
          {/* Unlike the mask-side Speckle, this one has to keep the source's
              colour, so the droplets are intersected with the glyphs
              (`operator="in"`) instead of generated standalone. */}
          <filter
            id={`${uid}-dust`}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={41} result="t" />
            <feColorMatrix
              in="t"
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  12 0 0 0 -7.2"
              result="sp"
            />
            <feComposite in="SourceGraphic" in2="sp" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* overspray halo — paint that drifted past the stencil */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block"
        style={{ ...bridged, filter: 'blur(5px)', opacity: 0.28 }}
      >
        {children}
      </span>

      <span className="relative block" style={{ ...bridged, filter: `url(#${uid}-edge)` }}>
        {children}
      </span>

      {/* dust that crept under the stencil: the same glyphs, broken into
          droplets and nudged off-register */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block"
        style={{
          ...bridged,
          filter: `url(#${uid}-dust)`,
          transform: 'scale(1.04)',
          opacity: 0.38,
        }}
      >
        {children}
      </span>
    </span>
  );
}
