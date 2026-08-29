import { CylinderDefs, GroundShadow, MetalDefs, darken, inkOn, lighten } from './shading';

/**
 * Paint marker. Same lighting rig as `SprayCan` so the two sit together on a
 * shelf: flat fill, black terminator pass, white specular pass.
 *
 * The barrel widens with the nib size — a 30 mm chisel genuinely is a much
 * fatter pen than a 2 mm liner, and keeping them identical made the catalogue
 * grid look like one product repeated.
 *
 * The print on the barrel is laid out as four reserved bands (brand, paint
 * window, rotated series name, size block) rather than as free-floating text.
 * The rotated name is the one that used to run into the size block, so it gets
 * both a size solved from the room actually left over *and* an explicit
 * `textLength` — font metrics vary with whatever `--font-display` resolves to,
 * and a layout that only works for one font isn't a layout.
 */

export type MarkerTip = 2 | 5 | 15 | 30 | 50;

type Props = {
  color: string;
  /** Nib width in mm — printed on the barrel and drives the silhouette. */
  tip?: MarkerTip;
  /** Barrel finish: acrylic markers are white-bodied, ink markers are black. */
  finish?: 'acrylic' | 'ink' | 'chrome';
  label?: string;
  uid: string;
  className?: string;
  shadow?: boolean;
};

const BARREL: Record<MarkerTip, { w: number; nib: number }> = {
  2: { w: 40, nib: 5 },
  5: { w: 46, nib: 9 },
  15: { w: 58, nib: 20 },
  30: { w: 68, nib: 32 },
  50: { w: 78, nib: 46 },
};

const FINISH = {
  acrylic: { body: '#f2efe6', gloss: 0.8 },
  ink: { body: '#17161c', gloss: 0.5 },
  chrome: { body: '#b6b6c0', gloss: 1 },
} as const;

/* ── barrel bands (viewBox is 108 × 356) ──────────────────────────── */
const CAP_TOP = 16;
const CAP_BOT = 122;
const BODY_TOP = 114;
const BODY_BOT = 320;
const BASE_BOT = 338;

const WIN_TOP = BODY_TOP + 32;
const WIN_BOT = WIN_TOP + 40;
/** Rule under the rotated name; everything below it belongs to the size block. */
const RULE = BODY_BOT - 54;
const LABEL_TOP = WIN_BOT + 8;
const LABEL_BOT = RULE - 8;
const LABEL_ROOM = LABEL_BOT - LABEL_TOP;
const LABEL_MID = (LABEL_TOP + LABEL_BOT) / 2;

/** Average advance per glyph, in em, assumed for the condensed display face.
    Deliberately generous — it only ever makes the type smaller than it could
    be, and `textLength` pins the real width afterwards either way. */
const EM = 0.55;

export function Marker({
  color,
  tip = 15,
  finish = 'acrylic',
  label = 'ACRYLIC',
  uid,
  className = '',
  shadow = true,
}: Props) {
  const { w, nib } = BARREL[tip];
  const f = FINISH[finish];
  const ink = inkOn(f.body);
  const CX = 54;
  const bL = CX - w / 2;

  /* cap sits slightly proud of the barrel, as a friction-fit cap does */
  const capW = w + 6;
  const capL = CX - capW / 2;
  const capPath =
    `M${capL} ${CAP_TOP + 18} Q${capL} ${CAP_TOP + 4} ${capL + 8} ${CAP_TOP + 2} ` +
    `H${capL + capW - 8} Q${capL + capW} ${CAP_TOP + 4} ${capL + capW} ${CAP_TOP + 18} ` +
    `V${CAP_BOT} H${capL} Z`;

  /* Rotated series name: solve a size against the band that's actually free,
     then clamp the advance so it physically cannot reach the size block. */
  const labelSize = Math.min(24, w * 0.46, LABEL_ROOM / Math.max(1, label.length * EM));
  const labelLen = Math.min(LABEL_ROOM, label.length * labelSize * EM);

  const sizeText = `${tip} MM`;
  const sizeSize = Math.min(18, (w - 10) / (sizeText.length * EM));

  /* Stroke swatch: the width of the line this pen actually lays down. The nib
     itself is hidden under the cap, so this is the only honest place the tip
     size shows up as a shape rather than as a number. */
  const swatchW = Math.min(w - 16, 44);
  const swatchT = 1.6 + nib * 0.27;
  const swatchY = BODY_BOT - 15;

  return (
    <svg
      viewBox="0 0 108 356"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <CylinderDefs uid={uid} />
        <MetalDefs uid={uid} />
        <clipPath id={`${uid}-capclip`}>
          <path d={capPath} />
        </clipPath>
        <clipPath id={`${uid}-barrelclip`}>
          <rect x={bL} y={BODY_TOP} width={w} height={BODY_BOT - BODY_TOP} />
        </clipPath>
      </defs>

      {shadow && <GroundShadow uid={uid} cx={CX} cy={BASE_BOT + 4} rx={w / 2 + 14} ry={7} />}

      {/* ── BARREL ───────────────────────────────────────────── */}
      <g clipPath={`url(#${uid}-barrelclip)`}>
        <rect x={bL} y={BODY_TOP} width={w} height={BODY_BOT - BODY_TOP} fill={f.body} />

        {/* paint window — the reservoir showing through the barrel */}
        <rect x={bL} y={WIN_TOP} width={w} height={WIN_BOT - WIN_TOP} fill={color} />
        <rect x={bL} y={WIN_TOP} width={w} height="1.4" fill="#000" opacity="0.16" />
        <rect x={bL} y={WIN_BOT - 1.4} width={w} height="1.4" fill="#000" opacity="0.16" />

        <text
          x={CX}
          y={BODY_TOP + 22}
          textAnchor="middle"
          fill={ink}
          fontFamily="var(--font-mono), monospace"
          fontSize="7"
          letterSpacing="2"
          opacity="0.7"
        >
          MONTANA
        </text>

        <text
          transform={`rotate(-90 ${CX} ${LABEL_MID})`}
          x={CX}
          y={LABEL_MID}
          textAnchor="middle"
          dominantBaseline="central"
          textLength={labelLen}
          lengthAdjust="spacing"
          fill={ink}
          fontFamily="var(--font-display), Impact, sans-serif"
          fontSize={labelSize}
        >
          {label}
        </text>

        <rect x={bL} y={RULE} width={w} height="0.8" fill={ink} opacity="0.22" />
        <text
          x={CX}
          y={RULE + 20}
          textAnchor="middle"
          fill={ink}
          fontFamily="var(--font-display), Impact, sans-serif"
          fontSize={sizeSize}
        >
          {sizeText}
        </text>

        {/* stroke swatch */}
        <path
          d={`M${CX - swatchW / 2} ${swatchY} H${CX + swatchW / 2}`}
          stroke="#000"
          strokeOpacity="0.22"
          strokeWidth={swatchT + 1.6}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${CX - swatchW / 2} ${swatchY} H${CX + swatchW / 2}`}
          stroke={color}
          strokeWidth={swatchT}
          strokeLinecap="round"
          fill="none"
        />

        <rect x={bL} y={BODY_TOP} width={w} height={BODY_BOT - BODY_TOP} fill={`url(#${uid}-shade)`} />
        <rect
          x={bL}
          y={BODY_TOP}
          width={w}
          height={BODY_BOT - BODY_TOP}
          fill={`url(#${uid}-light)`}
          opacity={f.gloss}
        />
      </g>

      {/* ── CAP (paint colour, over the barrel it grips) ─────── */}
      <g>
        <path d={capPath} fill={lighten(color, 0.04)} />
        <g clipPath={`url(#${uid}-capclip)`}>
          <rect x={capL} y={CAP_TOP} width={capW} height={CAP_BOT - CAP_TOP} fill={`url(#${uid}-pshade)`} />
          {/* moulded ribs near the crown */}
          {[30, 36, 42].map((y) => (
            <rect key={y} x={capL} y={y} width={capW} height="1.4" fill="#000" opacity="0.09" />
          ))}
          <rect x={capL} y={CAP_TOP} width={capW} height={CAP_BOT - CAP_TOP} fill={`url(#${uid}-plight)`} />
          {/* the barrel it has been pushed down onto occludes the cap's own lip */}
          <rect x={capL} y={CAP_BOT - 8} width={capW} height="8" fill="#000" opacity="0.14" />
        </g>
        {/* shadow the cap casts onto the barrel below it */}
        <rect x={bL} y={CAP_BOT} width={w} height="6" fill="#000" opacity="0.32" />
      </g>

      {/* ── END PLUG ─────────────────────────────────────────── */}
      <g>
        <rect x={bL} y={BODY_BOT - 2} width={w} height={BASE_BOT - BODY_BOT} fill={darken(f.body, 0.55)} />
        <rect
          x={bL}
          y={BODY_BOT - 2}
          width={w}
          height={BASE_BOT - BODY_BOT}
          fill={`url(#${uid}-pshade)`}
        />
        <rect
          x={bL}
          y={BODY_BOT - 2}
          width={w}
          height={BASE_BOT - BODY_BOT}
          fill={`url(#${uid}-plight)`}
        />
        <ellipse cx={CX} cy={BASE_BOT} rx={w / 2} ry="5" fill={darken(f.body, 0.68)} />
      </g>
    </svg>
  );
}
