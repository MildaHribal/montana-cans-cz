import { RoughEdge } from './filters';

/**
 * Wildstyle arrows.
 *
 * Built as a fat *stroked* shaft plus a separate filled head rather than one
 * authored outline: a piece arrow is a constant-width band that turns, and
 * hand-authoring both sides of every turn is how you end up with a wobbly
 * width. The outline-plus-fill look is three coincident passes — keyline,
 * black outline, colour fill — which is exactly how it's painted.
 *
 * Head polygons are notched (corner → tip → corner → notch) so they read as
 * barbed arrowheads and not as triangles glued to a bar.
 */

export type ArrowVariant = 'straight' | 'curved' | 'hook' | 'lightning';

type Spec = {
  vb: string;
  shaft: string;
  /** Band width. Outline and keyline are stepped out from this. */
  w: number;
  head: string;
  /** Tail serif — the flare writers put on the back end of the bar. */
  tail?: string;
  /** Inner sheen; a single bright sliver sells the paint as glossy. */
  gleam: string;
  round?: boolean;
};

const SPECS: Record<ArrowVariant, Spec> = {
  straight: {
    /* viewBox carries 10 units of slack on every side: the keyline pass is
       stroked 7.5 units outside the shape and gets guillotined without it */
    vb: '0 0 272 162',
    shaft: 'M26 70 H152',
    w: 34,
    head: 'M148 20 L240 70 L148 120 L172 70 Z',
    tail: 'M4 40 L34 70 L4 100 L20 70 Z',
    gleam: 'M48 58 H134 M164 46 L204 68',
  },
  curved: {
    vb: '0 0 252 168',
    shaft: 'M26 132 C26 62 62 30 130 34',
    w: 32,
    head: 'M126 2 L216 34 L126 68 L150 34 Z',
    tail: 'M14 146 L26 126 L38 146 L26 138 Z',
    gleam: 'M20 120 C22 74 56 48 122 50',
    round: true,
  },
  hook: {
    vb: '0 0 216 194',
    shaft: 'M28 22 V88 C28 120 70 136 102 114',
    w: 30,
    /* base is centred on the shaft's end point, tip carried on along its
       tangent — a head bolted on at an arbitrary angle is the usual giveaway */
    head: 'M84 84 L172 74 L122 148 L120 106 Z',
    tail: 'M8 4 L46 22 L28 46 Z',
    gleam: 'M18 26 V90 C18 114 48 126 76 114',
    round: true,
  },
  lightning: {
    vb: '0 0 218 188',
    shaft: 'M28 14 L96 54 L54 72 L130 116',
    w: 26,
    head: 'M114 142 L178 147 L143 93 L142 126 Z',
    tail: 'M20 30 L8 2 L38 0 Z',
    gleam: 'M22 6 L88 46 M62 82 L124 118',
  },
};

const OUTLINE = '#0b0a0e';

type ArrowProps = {
  variant?: ArrowVariant;
  color?: string;
  className?: string;
  /** Distinct per instance — the displacement filter id is derived from it. */
  uid?: string;
};

export function Arrow({
  variant = 'straight',
  color = 'var(--accent)',
  className = '',
  uid = 'gfx-arrow',
}: ArrowProps) {
  const s = SPECS[variant];
  const id = `${uid}-${variant}`;
  const join = s.round ? 'round' : 'miter';

  /** One coincident pass of the whole arrow at a given stroke inflation. */
  const pass = (grow: number, paint: string, opacity?: number) => (
    <g
      fill={paint}
      stroke={paint}
      strokeWidth={grow}
      strokeLinejoin={grow > 0 ? 'round' : join}
      strokeLinecap={grow > 0 ? 'round' : 'butt'}
      opacity={opacity}
    >
      <path
        d={s.shaft}
        fill="none"
        stroke={paint}
        strokeWidth={s.w + grow}
        strokeLinecap="butt"
        strokeLinejoin={join}
      />
      <path d={s.head} />
      {s.tail && <path d={s.tail} />}
    </g>
  );

  return (
    <svg
      viewBox={s.vb}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ color }}
    >
      <defs>
        <RoughEdge id={`${id}-r`} freq="0.03 0.04" octaves={2} scale={4} seed={17} />
      </defs>
      <g filter={`url(#${id}-r)`} transform="translate(10 10)">
        {pass(15, '#efece4', 0.92)}
        {pass(9, OUTLINE)}
        {pass(0, 'currentColor')}
        <g
          stroke="#fff"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
          style={{ mixBlendMode: 'screen' }}
        >
          <path d={s.gleam} />
        </g>
      </g>
    </svg>
  );
}
