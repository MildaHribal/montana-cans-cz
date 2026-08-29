import { CylinderDefs, FaceDefs, GroundShadow, darken, lighten } from './shading';

/**
 * Spray cap / nozzle, viewed from ~25° above.
 *
 * The angle is the whole point: photographed dead-on a cap is a coloured
 * circle and tells a writer nothing, and the orifice is the only thing anyone
 * actually chooses a cap by. From three-quarters above you read the hole *and*
 * the silhouette in one shape.
 *
 * The silhouette is a SHORT STUBBY CYLINDER — a big elliptical top face, a
 * wall that tapers barely at all on the way down, and a modest skirt flare
 * where the cap grips the valve stem. Pinching the middle is what turns a
 * drawn cap into a cotton reel, so the wall only gains 3 units of radius over
 * its whole run.
 *
 * Lit with the glossy-plastic pass from `./shading`, so a loose cap next to
 * its can reads as the same batch of plastic.
 */

export type CapStyle = 'fat' | 'skinny' | 'calligraphy' | 'universal' | 'super-fat';

type Props = {
  /** Cap body colour. */
  color: string;
  /** Drives the orifice — a cap's entire reason to exist. */
  style?: CapStyle;
  /** Unique per instance — namespaces the gradient ids so they don't collide. */
  uid: string;
  className?: string;
  shadow?: boolean;
};

/* ── geometry (viewBox is 150 × 126) ──────────────────────────────── */
const CX = 75;
const TOP_CY = 34;
const TOP_RX = 44;
const TOP_RY = 18.5;
/** Where the near-straight wall ends and the gripping flange starts. */
const WALL_BOT = 82;
const WALL_RX = 45.5;
const SKIRT_BOT = 92;
const SKIRT_RX = 50;
const SKIRT_RY = 21;

/** Foreshortening of any horizontal circle — 18.5/44 ≈ a 25° camera. */
const PERSP = TOP_RY / TOP_RX;

/**
 * Orifice per cap, plus the moulded colour code. `slot` swaps the round hole
 * for the calligraphy chisel. Writers grab caps off the dot long before they
 * read a label, so it gets drawn on the wall where it stays legible instead of
 * on the top face where perspective flattens it to a dash.
 */
const ORIFICE: Record<CapStyle, { r: number; slot?: number; dot: string }> = {
  skinny: { r: 3, dot: '#ff5470' },
  universal: { r: 6.4, dot: '#8b8f99' },
  calligraphy: { r: 3.4, slot: 30, dot: '#2fbcd6' },
  fat: { r: 11, dot: '#ffc63c' },
  'super-fat': { r: 15.5, dot: '#8a6cf0' },
};

/* The hole is cheated flatter than the face it sits in (0.56 against 0.43):
   it's moulded on a slightly domed boss, and at true face perspective the
   skinny orifice collapses to a sliver and the five caps stop telling apart. */
const HOLE_SQUASH = 0.56;

/** Outlet is moulded off the axis on a real cap — dead centre reads as a lid. */
const OX = CX - 5;
const OY = TOP_CY + 1;

export function Cap({ color, style = 'universal', uid, className = '', shadow = true }: Props) {
  const o = ORIFICE[style];
  const shell = lighten(color, 0.04);
  const halfWidth = o.slot ? o.slot / 2 : o.r;
  /* recessed well the nozzle insert sits down in — always reads as a ring
     around the hole, even when the hole itself is 3 units across */
  const wellRx = Math.max(halfWidth, 6) + 8;

  /* One closed outline: top rim → wall → skirt flare → bottom arc → back up.
     Kept as a single path so the lighting rects and the clip agree exactly. */
  const bodyPath =
    `M${CX - TOP_RX} ${TOP_CY} ` +
    `C${CX - TOP_RX - 1.5} ${TOP_CY + 22} ${CX - WALL_RX} ${WALL_BOT - 24} ${CX - WALL_RX} ${WALL_BOT} ` +
    `C${CX - WALL_RX - 0.5} ${SKIRT_BOT - 6} ${CX - SKIRT_RX} ${SKIRT_BOT - 6} ${CX - SKIRT_RX} ${SKIRT_BOT} ` +
    `A${SKIRT_RX} ${SKIRT_RY} 0 0 0 ${CX + SKIRT_RX} ${SKIRT_BOT} ` +
    `C${CX + SKIRT_RX} ${SKIRT_BOT - 6} ${CX + WALL_RX + 0.5} ${SKIRT_BOT - 6} ${CX + WALL_RX} ${WALL_BOT} ` +
    `C${CX + WALL_RX} ${WALL_BOT - 24} ${CX + TOP_RX + 1.5} ${TOP_CY + 22} ${CX + TOP_RX} ${TOP_CY} Z`;

  /** Lower arc of a horizontal circle of radius `rx` sitting at height `y`. */
  const ring = (y: number, rx: number) =>
    `M${CX - rx} ${y} A${rx} ${rx * PERSP} 0 0 0 ${CX + rx} ${y}`;

  return (
    <svg
      viewBox="0 0 150 126"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <CylinderDefs uid={uid} />
        <FaceDefs uid={uid} />
        {/* Contact occlusion: the last few units before the base circle meets
            the table get no bounce at all, and without it the foreshortened
            underside reads as a separate saucer sitting under the cap. */}
        <linearGradient id={`${uid}-contact`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="55%" stopColor="#000" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.42" />
        </linearGradient>
        <clipPath id={`${uid}-bodyclip`}>
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {shadow && <GroundShadow uid={uid} cx={CX} cy={SKIRT_BOT + 12} rx={62} ry={14} opacity={0.5} />}

      {/* ── BODY: wall + skirt ───────────────────────────────── */}
      <g>
        <path d={bodyPath} fill={shell} />
        <g clipPath={`url(#${uid}-bodyclip)`}>
          <rect
            x={CX - SKIRT_RX}
            y={TOP_CY}
            width={SKIRT_RX * 2}
            height={SKIRT_BOT + SKIRT_RY - TOP_CY}
            fill={`url(#${uid}-pshade)`}
          />

          {/* moulding seam, same as the can cap */}
          <rect x={CX - 0.5} y={TOP_CY} width="1" height={SKIRT_BOT - TOP_CY} fill="#000" opacity="0.1" />

          {/* grip ribs — moulded into the flange so wet fingers can still turn it */}
          {[-45, -38, -31, -24, 24, 31, 38, 45].map((dx) => (
            <rect
              key={dx}
              x={CX + dx}
              y={WALL_BOT - 6}
              width="1.8"
              height="26"
              fill="#000"
              opacity="0.13"
            />
          ))}

          <rect
            x={CX - SKIRT_RX}
            y={TOP_CY}
            width={SKIRT_RX * 2}
            height={SKIRT_BOT + SKIRT_RY - TOP_CY}
            fill={`url(#${uid}-plight)`}
          />

          {/* the step where the flange breaks away from the wall */}
          <path d={ring(WALL_BOT - 2, WALL_RX)} fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="1.6" />
          <path d={ring(WALL_BOT, WALL_RX)} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.2" />

          {/* colour-code dot, moulded into the wall */}
          <ellipse cx={CX + 21} cy={64} rx="6" ry="5.4" fill="#000" opacity="0.3" />
          <ellipse cx={CX + 21} cy={63.2} rx="5.6" ry="5" fill={o.dot} />
          <ellipse
            cx={CX + 21}
            cy={63.2}
            rx="5.6"
            ry="5"
            fill="none"
            stroke="#000"
            strokeOpacity="0.24"
            strokeWidth="0.8"
          />
          <ellipse cx={CX + 19.4} cy={61.4} rx="2" ry="1.5" fill="#fff" opacity="0.3" />

          <rect
            x={CX - SKIRT_RX}
            y={SKIRT_BOT - SKIRT_RY}
            width={SKIRT_RX * 2}
            height={SKIRT_RY * 2}
            fill={`url(#${uid}-contact)`}
          />
        </g>
      </g>

      {/* ── TOP FACE ─────────────────────────────────────────── */}
      <g>
        {/* chamfer: a darker ellipse peeking out under the lit face, which is
            what actually reads as a moulded edge rather than a printed disc */}
        <ellipse cx={CX} cy={TOP_CY + 4} rx={TOP_RX} ry={TOP_RY} fill={darken(color, 0.24)} />
        <ellipse cx={CX} cy={TOP_CY + 1.5} rx={TOP_RX - 1} ry={TOP_RY - 0.6} fill={lighten(color, 0.02)} />

        <ellipse cx={CX} cy={TOP_CY} rx={TOP_RX - 2.5} ry={TOP_RY - 1.6} fill={lighten(color, 0.12)} />
        <ellipse
          cx={CX}
          cy={TOP_CY}
          rx={TOP_RX - 2.5}
          ry={TOP_RY - 1.6}
          fill={`url(#${uid}-face)`}
          opacity="0.45"
        />

        {/* ── WELL + ORIFICE ─────────────────────────────────── */}
        {/* near lip catches the key, far wall drops into shadow */}
        <ellipse cx={OX} cy={OY - 1} rx={wellRx} ry={wellRx * PERSP} fill="#fff" opacity="0.16" />
        <ellipse
          cx={OX}
          cy={OY + 0.8}
          rx={wellRx}
          ry={wellRx * PERSP}
          fill={darken(color, 0.46)}
          opacity="0.62"
        />
        <ellipse
          cx={OX}
          cy={OY + 1.4}
          rx={wellRx - 2.6}
          ry={(wellRx - 2.6) * PERSP}
          fill="#000"
          opacity="0.18"
        />

        {o.slot ? (
          /* calligraphy chisel — a slot, not a hole */
          <rect
            x={OX - o.slot / 2}
            y={OY - o.r * HOLE_SQUASH}
            width={o.slot}
            height={o.r * 2 * HOLE_SQUASH}
            rx={o.r * HOLE_SQUASH}
            fill="#0d0c11"
          />
        ) : (
          <ellipse cx={OX} cy={OY} rx={o.r} ry={o.r * HOLE_SQUASH} fill="#0d0c11" />
        )}
        {/* far wall of the bore catching a little light */}
        <ellipse
          cx={OX}
          cy={OY - o.r * HOLE_SQUASH * 0.42}
          rx={o.slot ? o.slot / 2 - 1.8 : o.r * 0.74}
          ry={o.r * HOLE_SQUASH * 0.34}
          fill="#fff"
          opacity="0.12"
        />
      </g>
    </svg>
  );
}
