import { CylinderDefs, GroundShadow, MetalDefs, darken, inkOn, lighten } from './shading';

/**
 * Vector render of a 150 / 400 / 600 ml graffiti can.
 *
 * Proportions are measured off a real 400 ml can at ~1.7 user units per mm:
 * 65 mm body, a *shallow* 13 mm shoulder dome and a cap that's a good 60 % of
 * the body width. Getting those last two wrong is what makes drawn cans read
 * as shampoo bottles — a narrow cap on a tall dome makes a neck, and aerosol
 * cans don't have one.
 *
 * Everything is a flat fill plus the shared two-pass lighting from
 * `./shading`, which is what keeps a dozen colourways looking like they came
 * out of the same product shoot.
 */

export type CanSeries = 'BLACK' | 'GOLD' | '94' | 'CHALK' | 'STENCIL' | 'HARDCORE' | 'WATER';
export type CanVolume = 150 | 400 | 600;

type Props = {
  /** Paint colour — drives the cap, the ID stripe and (on 94) the body. */
  color: string;
  series?: CanSeries;
  volume?: CanVolume;
  /** MTN code printed under the volume. */
  code?: string;
  /** Unique per instance — namespaces the gradient ids so they don't collide. */
  uid: string;
  className?: string;
  /** Draw the contact shadow. Off for floating / tilted presentations. */
  shadow?: boolean;
};

/**
 * Body finish per series.
 *   `tinted` — the body itself carries the paint colour (94 is colour-matched).
 *   `metal`  — chrome/gold shoulder instead of a darkened body colour.
 *   `gloss`  — multiplier on the specular pass. BLACK and 94 are matte paint
 *              and go dull and plasticky if lit like the varnished cans.
 */
const FINISH: Record<
  CanSeries,
  { base: string; tinted: boolean; metal?: boolean; gloss: number }
> = {
  BLACK: { base: '#131218', tinted: false, gloss: 0.45 },
  GOLD: { base: '#b9a684', tinted: false, metal: true, gloss: 1 },
  '94': { base: '#8d8d96', tinted: true, gloss: 0.4 },
  CHALK: { base: '#eae6dc', tinted: false, gloss: 0.55 },
  STENCIL: { base: '#1b1a21', tinted: false, gloss: 0.5 },
  HARDCORE: { base: '#a9a9b4', tinted: false, metal: true, gloss: 1 },
  WATER: { base: '#f2efe7', tinted: false, gloss: 0.7 },
};

/* ── geometry constants (viewBox is 150 wide) ─────────────────────── */
const BODY_L = 16;
const BODY_R = 134;
const BODY_W = BODY_R - BODY_L;
const CX = (BODY_L + BODY_R) / 2;
const BODY_TOP = 98;

export function SprayCan({
  color,
  series = 'BLACK',
  volume = 400,
  code,
  uid,
  className = '',
  shadow = true,
}: Props) {
  const finish = FINISH[series];
  const body = finish.tinted ? color : finish.base;
  const ink = inkOn(body);
  const sub = ink === '#14131a' ? 'rgba(20,19,26,0.6)' : 'rgba(244,242,236,0.6)';

  const bodyBot = volume === 600 ? 314 : volume === 150 ? 236 : 296;
  const baseBot = bodyBot + 14;
  const vbH = baseBot + 18;

  const word = series === 'WATER' ? '94' : series;

  /* The wordmark runs *up* the can, so its available length is the body's
     height minus the ID stripe and the volume block. Antonio sits at roughly
     0.44 em per glyph; solve for a size that fits, then cap it so short names
     like "94" don't balloon. */
  const wordRoom = bodyBot - BODY_TOP - 74;
  const wordSize = Math.min(46, wordRoom / (word.length * 0.46));

  const capBase = lighten(color, 0.05);
  const domeBase = finish.metal ? '#9a9aa4' : darken(body, 0.14);

  const bodyPath = `M${BODY_L} ${BODY_TOP} H${BODY_R} V${bodyBot} Q${BODY_R} ${bodyBot + 4} ${BODY_R - 4} ${bodyBot + 4} H${BODY_L + 4} Q${BODY_L} ${bodyBot + 4} ${BODY_L} ${bodyBot} Z`;
  /* Shallow — an aerosol shoulder is ~13 mm of a 200 mm can. Any taller and
     the silhouette grows a neck and starts reading as a bottle. */
  const domePath = `M${BODY_L} 100 C${BODY_L} 90 26 84 52 80 H98 C124 84 ${BODY_R} 90 ${BODY_R} 100 Z`;
  /* Cap spans ~66 % of the body width — the single biggest tell between a
     spray can and a shampoo bottle. */
  const capPath = 'M38 30 H112 L114 62 Q114 71 105 71 H45 Q36 71 36 62 Z';

  return (
    <svg
      viewBox={`0 0 150 ${vbH}`}
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <CylinderDefs uid={uid} />
        <MetalDefs uid={uid} />
        <clipPath id={`${uid}-bodyclip`}>
          <path d={bodyPath} />
        </clipPath>
        <clipPath id={`${uid}-capclip`}>
          <path d={capPath} />
        </clipPath>
        <clipPath id={`${uid}-domeclip`}>
          <path d={domePath} />
        </clipPath>
      </defs>

      {shadow && (
        <GroundShadow uid={uid} cx={CX} cy={baseBot + 5} rx={66} ry={9} opacity={0.5} />
      )}

      {/* ── SHOULDER DOME ────────────────────────────────────── */}
      <g clipPath={`url(#${uid}-domeclip)`}>
        <rect x={BODY_L} y="76" width={BODY_W} height="28" fill={domeBase} />
        <rect x={BODY_L} y="76" width={BODY_W} height="28" fill={`url(#${uid}-shade)`} />
        <rect x={BODY_L} y="76" width={BODY_W} height="28" fill={`url(#${uid}-light)`} />
      </g>

      {/* ── VALVE NECK ───────────────────────────────────────── */}
      <g>
        <rect x="52" y="68" width="46" height="16" fill={`url(#${uid}-metal)`} />
        <ellipse cx={CX} cy="68" rx="23" ry="3.6" fill={`url(#${uid}-metal)`} />
        <rect x="52" y="80" width="46" height="1.6" fill="#000" opacity="0.28" />
      </g>

      {/* ── CAP (paint colour) ───────────────────────────────── */}
      <g>
        {/* skirt shadow cast onto the neck below */}
        <ellipse cx={CX} cy="71" rx="39" ry="4" fill="#000" opacity="0.3" />
        <path d={capPath} fill={capBase} />
        <g clipPath={`url(#${uid}-capclip)`}>
          <rect x="36" y="28" width="78" height="44" fill={`url(#${uid}-pshade)`} />
          <rect x="36" y="28" width="78" height="44" fill={`url(#${uid}-plight)`} />
          {/* moulding seam down every plastic cap */}
          <rect x={CX - 0.5} y="28" width="1" height="44" fill="#000" opacity="0.1" />
          {/* grip ribs around the skirt */}
          {[46, 54, 62, 88, 96, 104].map((x) => (
            <rect key={x} x={x} y="50" width="1.4" height="22" fill="#000" opacity="0.07" />
          ))}
        </g>
        {/* crown */}
        <ellipse cx={CX} cy="30" rx="37" ry="6.4" fill={lighten(color, 0.14)} />
        <ellipse cx={CX} cy="30" rx="37" ry="6.4" fill={`url(#${uid}-plight)`} opacity="0.55" />
        {/* recessed well the actuator sits down inside */}
        <ellipse cx={CX} cy="30.5" rx="17" ry="3.8" fill={darken(color, 0.36)} opacity="0.6" />

        {/* actuator — drawn last but kept short, so it reads as a nozzle
            seated in the well rather than a bottle spout on a neck. */}
        <rect x="68" y="22" width="14" height="10" rx="2" fill="#2a2930" />
        <rect x="68" y="22" width="14" height="10" rx="2" fill={`url(#${uid}-pshade)`} />
        <rect x="68" y="22" width="14" height="10" rx="2" fill={`url(#${uid}-plight)`} />
        <ellipse cx={CX} cy="22.6" rx="7" ry="2" fill="#3c3b45" />
        <ellipse cx={CX} cy="22.6" rx="2.2" ry="0.9" fill="#0b0b0e" />
      </g>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <g clipPath={`url(#${uid}-bodyclip)`}>
        <rect x={BODY_L} y={BODY_TOP} width={BODY_W} height={bodyBot - BODY_TOP + 6} fill={body} />

        {/* colour ID stripe — keeps the shade readable at thumbnail size */}
        <rect x={BODY_L} y={BODY_TOP + 10} width={BODY_W} height="14" fill={color} />
        <rect x={BODY_L} y={BODY_TOP + 10} width={BODY_W} height="1.5" fill="#000" opacity="0.18" />

        {/* brand line */}
        <text
          x={CX}
          y={BODY_TOP + 38}
          textAnchor="middle"
          fill={ink}
          fontFamily="var(--font-mono), monospace"
          fontSize="7"
          letterSpacing="2.2"
          opacity="0.7"
        >
          MONTANA
        </text>

        {/* series wordmark, running up the can like the real print */}
        <text
          transform={`rotate(-90 ${CX} ${(BODY_TOP + bodyBot) / 2 + 10})`}
          x={CX}
          y={(BODY_TOP + bodyBot) / 2 + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill={ink}
          fontFamily="var(--font-display), Impact, sans-serif"
          fontSize={wordSize}
          letterSpacing="-1"
          opacity="0.96"
        >
          {word}
        </text>

        {/* base block: volume + code */}
        <rect x={BODY_L} y={bodyBot - 36} width={BODY_W} height="0.8" fill={ink} opacity="0.22" />
        <text
          x={CX}
          y={bodyBot - 22}
          textAnchor="middle"
          fill={ink}
          fontFamily="var(--font-display), Impact, sans-serif"
          fontSize="17"
          letterSpacing="-0.5"
        >
          {volume} ML
        </text>
        {code && (
          <text
            x={CX}
            y={bodyBot - 10}
            textAnchor="middle"
            fill={sub}
            fontFamily="var(--font-mono), monospace"
            fontSize="6.5"
            letterSpacing="1.4"
          >
            {code}
          </text>
        )}

        {/* lighting passes, over everything printed on the body */}
        <rect
          x={BODY_L}
          y={BODY_TOP - 2}
          width={BODY_W}
          height={bodyBot - BODY_TOP + 10}
          fill={`url(#${uid}-shade)`}
        />
        <rect
          x={BODY_L}
          y={BODY_TOP - 2}
          width={BODY_W}
          height={bodyBot - BODY_TOP + 10}
          fill={`url(#${uid}-light)`}
          opacity={finish.gloss}
        />
        {/* occlusion where the dome meets the straight wall */}
        <rect x={BODY_L} y={BODY_TOP} width={BODY_W} height="5" fill="#000" opacity="0.24" />
      </g>

      {/* ── BASE RIM ─────────────────────────────────────────── */}
      <g>
        <rect
          x={BODY_L}
          y={bodyBot - 2}
          width={BODY_W}
          height={baseBot - bodyBot}
          fill={`url(#${uid}-metal)`}
        />
        <rect x={BODY_L} y={bodyBot - 2} width={BODY_W} height="2" fill="#000" opacity="0.32" />
        <ellipse cx={CX} cy={baseBot} rx={BODY_W / 2} ry="7" fill={`url(#${uid}-metal)`} />
        <ellipse cx={CX} cy={baseBot} rx={BODY_W / 2} ry="7" fill="#000" opacity="0.2" />
        <ellipse cx={CX} cy={baseBot - 1} rx={BODY_W / 2 - 10} ry="4.6" fill="#000" opacity="0.3" />
      </g>
    </svg>
  );
}
