import { CylinderDefs, FaceDefs, GroundShadow, darken, inkOn, lighten } from './shading';

/**
 * Hardcover blackbook, near-frontal with a few degrees of rotation.
 *
 * The rotation is small on purpose. Swing it far enough for a proper 3/4 and
 * you have to choose between showing the spine and showing the page block —
 * they sit on opposite sides of the book and only one side face can be
 * visible at a time. At a couple of degrees you get both honestly: the page
 * block peeks out on the right, and the *rounded* spine bulges past the cover
 * edge on the left the way a cased-in hardcover always does.
 */

export type BookSize = 'A4' | 'A5' | 'square';

type Props = {
  /** Cover stock colour. */
  color: string;
  size?: BookSize;
  /** Unique per instance — namespaces the gradient ids so they don't collide. */
  uid: string;
  className?: string;
  shadow?: boolean;
};

/* Drawn at true relative scale rather than each filling the frame — an A5
   next to an A4 in a catalogue grid should visibly be the smaller book. */
const SIZES: Record<BookSize, { w: number; h: number }> = {
  A4: { w: 112, h: 158 },
  A5: { w: 88, h: 124 },
  square: { w: 126, h: 126 },
};

const VB_W = 180;
const BOT = 186;
const PAGES = 10; // fore-edge band
const BOARD = 3.5; // back cover board beyond the pages
const SPINE = 9; // how far the rounded spine bulges past the cover edge
const SHEAR = 5; // near (right) edge is this much taller than the far edge

export function Blackbook({ color, size = 'A4', uid, className = '', shadow = true }: Props) {
  const { w, h } = SIZES[size];
  const ink = inkOn(color);
  const deboss = ink === '#14131a' ? '#ffffff' : '#000000';

  const L = (VB_W + SPINE - w - PAGES - BOARD) / 2;
  const R = L + w;
  const TOP = BOT - h;

  /** Top/bottom cover edges converge toward the far (left) side. */
  const coverPath = `M${L} ${TOP + SHEAR} L${R} ${TOP} L${R} ${BOT} L${L} ${BOT - SHEAR} Z`;
  /** y of the cover's top edge at a given x. */
  const topAt = (x: number) => TOP + SHEAR * (1 - (x - L) / w);
  const botAt = (x: number) => BOT - SHEAR * (1 - (x - L) / w);

  const elasticX = R - 19;

  return (
    <svg
      viewBox={`0 0 ${VB_W} 208`}
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <CylinderDefs uid={uid} />
        <FaceDefs uid={uid} />
        <clipPath id={`${uid}-coverclip`}>
          <path d={coverPath} />
        </clipPath>
        <linearGradient id={`${uid}-pageedge`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.34" />
          <stop offset="22%" stopColor="#000" stopOpacity="0.05" />
          <stop offset="70%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
        </linearGradient>
      </defs>

      {shadow && <GroundShadow uid={uid} cx={L + w / 2 + 4} cy={BOT + 6} rx={w * 0.62} ry={8} />}

      {/* ── SPINE ROLL ───────────────────────────────────────── */}
      <g>
        <path
          d={`M${L} ${TOP + SHEAR} C${L - SPINE} ${TOP + SHEAR + 5} ${L - SPINE} ${BOT - SHEAR - 5} ${L} ${BOT - SHEAR} Z`}
          fill={darken(color, 0.24)}
        />
        <path
          d={`M${L} ${TOP + SHEAR} C${L - SPINE} ${TOP + SHEAR + 5} ${L - SPINE} ${BOT - SHEAR - 5} ${L} ${BOT - SHEAR} Z`}
          fill={`url(#${uid}-pshade)`}
        />
        {/* the roll's crest catches the key light before it turns away */}
        <path
          d={`M${L - SPINE + 2.5} ${TOP + SHEAR + 12} C${L - SPINE + 0.5} ${TOP + SHEAR + 30} ${L - SPINE + 0.5} ${BOT - SHEAR - 30} ${L - SPINE + 2.5} ${BOT - SHEAR - 12}`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.16"
          strokeWidth="1.8"
        />
        {/* head and tail caps */}
        <path
          d={`M${L} ${TOP + SHEAR} C${L - SPINE} ${TOP + SHEAR + 5} ${L - SPINE + 2} ${TOP + SHEAR + 10} ${L} ${TOP + SHEAR + 8} Z`}
          fill="#000"
          opacity="0.22"
        />
      </g>

      {/* ── BACK BOARD + PAGE BLOCK (right side) ─────────────── */}
      <g>
        {/* back cover board, furthest from camera */}
        <path
          d={
            `M${R + PAGES} ${TOP + 3} L${R + PAGES + BOARD} ${TOP + 4} ` +
            `L${R + PAGES + BOARD} ${BOT - 4} L${R + PAGES} ${BOT - 3} Z`
          }
          fill={darken(color, 0.42)}
        />
        {/* fore edge */}
        <path
          d={`M${R} ${TOP} L${R + PAGES} ${TOP + 3} L${R + PAGES} ${BOT - 3} L${R} ${BOT} Z`}
          fill="#e8e2d3"
        />
        {[0.16, 0.32, 0.46, 0.6, 0.74, 0.88].map((t) => (
          <line
            key={t}
            x1={R + PAGES * t}
            y1={TOP + 3 * t}
            x2={R + PAGES * t}
            y2={BOT - 3 * t}
            stroke="#8d8779"
            strokeOpacity={0.35}
            strokeWidth="0.7"
          />
        ))}
        <path
          d={`M${R} ${TOP} L${R + PAGES} ${TOP + 3} L${R + PAGES} ${BOT - 3} L${R} ${BOT} Z`}
          fill={`url(#${uid}-pageedge)`}
        />
        {/* front board thickness, between cover face and paper */}
        <path
          d={`M${R} ${TOP} L${R + 2.6} ${TOP + 0.8} L${R + 2.6} ${BOT - 0.8} L${R} ${BOT} Z`}
          fill={darken(color, 0.55)}
        />
        {/* ribbon marker */}
        <path
          d={`M${R + 3.6} ${BOT - 20} H${R + 8.2} V${BOT + 9} L${R + 5.9} ${BOT + 5} L${R + 3.6} ${BOT + 9} Z`}
          fill="#b8352c"
        />
        <path
          d={`M${R + 3.6} ${BOT - 20} H${R + 8.2} V${BOT + 9} L${R + 5.9} ${BOT + 5} L${R + 3.6} ${BOT + 9} Z`}
          fill={`url(#${uid}-pshade)`}
        />
      </g>

      {/* ── FRONT COVER ──────────────────────────────────────── */}
      <g>
        <path d={coverPath} fill={color} />
        <g clipPath={`url(#${uid}-coverclip)`}>
          <rect x={L} y={TOP} width={w} height={h} fill={`url(#${uid}-face)`} opacity="0.55" />

          {/* hinge groove — the crease the cover folds on, 6 mm in from the spine */}
          <line
            x1={L + 6}
            y1={topAt(L + 6)}
            x2={L + 6}
            y2={botAt(L + 6)}
            stroke="#000"
            strokeOpacity="0.3"
            strokeWidth="2.4"
          />
          <line
            x1={L + 8}
            y1={topAt(L + 8)}
            x2={L + 8}
            y2={botAt(L + 8)}
            stroke="#fff"
            strokeOpacity="0.09"
            strokeWidth="1.4"
          />

          {/* debossed block. A deboss reads as a dark top edge with the light
              catching the bottom of the trough, so the ghost copy sits *under*
              the ink and one unit low. */}
          <g transform={`translate(${L + w / 2} ${TOP + h * 0.44}) skewY(${(-Math.atan(SHEAR / w) * 180) / Math.PI})`}>
            <rect
              x={-w * 0.33}
              y={-21}
              width={w * 0.66}
              height={42}
              rx="2"
              fill="none"
              stroke={ink}
              strokeOpacity="0.28"
              strokeWidth="1"
            />
            <text
              x="0"
              y="-4"
              textAnchor="middle"
              fill={deboss}
              opacity="0.16"
              fontFamily="var(--font-mono), monospace"
              fontSize="6.5"
              letterSpacing="3"
            >
              MONTANA
            </text>
            <text
              x="0"
              y="-5"
              textAnchor="middle"
              fill={ink}
              opacity="0.5"
              fontFamily="var(--font-mono), monospace"
              fontSize="6.5"
              letterSpacing="3"
            >
              MONTANA
            </text>
            <text
              x="0"
              y="16"
              textAnchor="middle"
              fill={deboss}
              opacity="0.16"
              fontFamily="var(--font-display), Impact, sans-serif"
              fontSize={Math.min(20, (w * 0.62) / (9 * 0.46))}
              letterSpacing="-0.4"
            >
              BLACKBOOK
            </text>
            <text
              x="0"
              y="15"
              textAnchor="middle"
              fill={ink}
              opacity="0.55"
              fontFamily="var(--font-display), Impact, sans-serif"
              fontSize={Math.min(20, (w * 0.62) / (9 * 0.46))}
              letterSpacing="-0.4"
            >
              BLACKBOOK
            </text>
          </g>

          {/* size stamp, bottom-left of the cover */}
          <text
            x={L + 12}
            y={botAt(L + 12) - 12}
            fill={ink}
            opacity="0.4"
            fontFamily="var(--font-mono), monospace"
            fontSize="6"
            letterSpacing="1.6"
          >
            {size.toUpperCase()}
          </text>

          {/* the spine roll turns away from the key light */}
          <rect x={L} y={TOP} width="14" height={h} fill="#000" opacity="0.16" />
        </g>
      </g>

      {/* ── ELASTIC CLOSURE ──────────────────────────────────── */}
      <g>
        <rect
          x={elasticX - 0.8}
          y={topAt(elasticX) - 1}
          width="6.4"
          height={botAt(elasticX) - topAt(elasticX) + 2}
          fill="#000"
          opacity="0.28"
        />
        <rect
          x={elasticX}
          y={topAt(elasticX) - 2}
          width="5.2"
          height={botAt(elasticX) - topAt(elasticX) + 4}
          fill={lighten('#171620', 0.06)}
        />
        <rect
          x={elasticX + 0.8}
          y={topAt(elasticX) - 2}
          width="1.4"
          height={botAt(elasticX) - topAt(elasticX) + 4}
          fill="#fff"
          opacity="0.14"
        />
      </g>
    </svg>
  );
}
