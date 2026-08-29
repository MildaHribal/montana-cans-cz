import { CylinderDefs, FaceDefs, GroundShadow, darken, inkOn, lighten } from './shading';

/**
 * The accessories wall: gloves, stencils, bags, refills.
 *
 * All four take the same props as the cans and markers and run the same
 * two-pass rig from `./shading`, because these end up in the same grid as the
 * cans and any one of them lit differently immediately reads as a stock image
 * dropped into the catalogue.
 */

type Props = {
  color: string;
  /** Unique per instance — namespaces the gradient ids so they don't collide. */
  uid: string;
  className?: string;
  shadow?: boolean;
};

/* ══ GLOVES ═══════════════════════════════════════════════════════ */

/**
 * Finger stems, measured off a hand rather than evenly spaced: middle is the
 * longest, index and ring are close behind it, pinky is a good 20 % shorter.
 * Even-length fingers look like a mitten with slots cut in it.
 *
 * `y` is the fingertip; every finger runs down to the same knuckle seam.
 */
const KNUCKLE = -3;
const FINGERS: { x: number; y: number }[] = [
  { x: -27, y: -56 },
  { x: -12.5, y: -64 },
  { x: 2, y: -58 },
  { x: 16.5, y: -46 },
];
const FW = 13; // finger width

/** Capsule with a rounded tip and a square root, so nothing shows at the seam. */
function finger(x: number, y: number): string {
  const r = FW / 2;
  return (
    `M${x} ${KNUCKLE} V${y + r} A${r} ${r} 0 0 1 ${x + FW} ${y + r} V${KNUCKLE} Z`
  );
}

const THUMB = 'M-38 44 V2.5 A7.5 7.5 0 0 1 -23 2.5 V44 Z';
const THUMB_TF = 'rotate(-38 -30 17)';
const PALM = { x: -29, y: -18, w: 58, h: 62, r: 18 };

/**
 * Flat silhouette. Everything overlaps and shares one fill, so the union has no
 * internal seams — the shading passes below are what separate the parts.
 */
function GloveBody({ fill, opacity }: { fill: string; opacity?: number }) {
  return (
    <g fill={fill} opacity={opacity}>
      <path d={THUMB} transform={THUMB_TF} />
      <rect x={PALM.x} y={PALM.y} width={PALM.w} height={PALM.h} rx={PALM.r} />
      {FINGERS.map((f) => (
        <path key={f.x} d={finger(f.x, f.y)} />
      ))}
    </g>
  );
}

/**
 * `k` distinguishes the two hands: both gloves live in one `<svg>`, so a clip
 * id namespaced only by `uid` would collide and the second hand would silently
 * take the first hand's clip.
 */
function Glove({ uid, k, color, dim = 0 }: { uid: string; k: string; color: string; dim?: number }) {
  const shell = dim ? darken(color, dim) : color;
  /* Each tube gets the plastic ramp across its own box — that per-tube falloff
     is what a finger needs, and one ramp over the whole silhouette goes flat. */
  const lit = (key: string, d: string, tf?: string) => (
    <g key={key} transform={tf}>
      <path d={d} fill={`url(#${uid}-pshade)`} />
      <path d={d} fill={`url(#${uid}-plight)`} opacity={0.7} />
    </g>
  );

  return (
    <>
      {/* rolled beaded cuff */}
      <rect x={-31} y={28} width={62} height={32} rx={9} fill={darken(shell, 0.18)} />
      <rect x={-31} y={28} width={62} height={32} rx={9} fill={`url(#${uid}-pshade)`} />
      <rect x={-31} y={44} width={62} height={4} fill="#000" opacity="0.12" />

      <GloveBody fill={shell} />

      {/* Tubes first, then the palm over their roots — the back of the hand is
          in front of where the fingers are set into it, and shading both in the
          overlap doubles up into a visible band across the knuckles. */}
      {lit('thumb', THUMB, THUMB_TF)}
      {FINGERS.map((f) => lit(`f${f.x}`, finger(f.x, f.y)))}
      <g clipPath={`url(#${uid}-${k}-palm)`}>
        <rect x={PALM.x} y={PALM.y} width={PALM.w} height={PALM.h} fill={shell} />
        <rect x={PALM.x} y={PALM.y} width={PALM.w} height={PALM.h} fill={`url(#${uid}-pshade)`} />
        <rect x={PALM.x} y={PALM.y} width={PALM.w} height={PALM.h} fill={`url(#${uid}-plight)`} opacity={0.5} />
        {/* the finger roots are set behind the back of the hand */}
        <rect x={PALM.x} y={PALM.y} width={PALM.w} height="7" fill="#000" opacity="0.14" />
      </g>

      {/* seam the fingers are set into */}
      <path
        d="M-27 -4 C-14 -10 8 -10 20 -2"
        fill="none"
        stroke="#000"
        strokeOpacity="0.22"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* palm crease */}
      <path
        d="M-20 14 C-10 10 8 12 18 18"
        fill="none"
        stroke="#000"
        strokeOpacity="0.09"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

export function Gloves({ color, uid, className = '', shadow = true }: Props) {
  return (
    <svg
      viewBox="0 0 200 190"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <CylinderDefs uid={uid} />
        {['a', 'b'].map((k) => (
          <clipPath key={k} id={`${uid}-${k}-palm`}>
            <rect x={PALM.x} y={PALM.y} width={PALM.w} height={PALM.h} rx={PALM.r} />
          </clipPath>
        ))}
      </defs>

      {shadow && <GroundShadow uid={uid} cx={100} cy={172} rx={78} ry={11} opacity={0.4} />}

      {/* back glove is mirrored — it's the other hand of the pair, not a copy */}
      <g transform="translate(130 92) rotate(13) scale(-1 1)">
        <Glove uid={uid} k="a" color={color} dim={0.16} />
      </g>
      <g transform="translate(74 104) rotate(-10)">
        <Glove uid={uid} k="b" color={color} />
      </g>
    </svg>
  );
}

/* ══ STENCIL ══════════════════════════════════════════════════════ */

export function Stencil({ color, uid, className = '', shadow = true }: Props) {
  const ink = inkOn(color);
  /* skewX alone, not a trapezoid: a laser sheet is thin enough that the
     converging edges of a real perspective would be a sub-pixel lie anyway,
     and the lean is what sells "sheet lying on a table". */
  const lean = 'translate(24 0) skewX(-9)';

  return (
    <svg
      viewBox="0 0 200 150"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <FaceDefs uid={uid} />
        <mask id={`${uid}-cut`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="150">
          <rect x="14" y="16" width="150" height="112" rx="3" fill="#fff" />
          <text
            x="89"
            y="90"
            textAnchor="middle"
            fill="#000"
            fontFamily="var(--font-display), Impact, sans-serif"
            fontSize="58"
            letterSpacing="-1"
          >
            MTN
          </text>
          {/* bridges — without them the counters of the M and the N drop out
              of the sheet and you've cut yourself a pile of confetti */}
          <rect x="30" y="56" width="118" height="3.4" fill="#fff" />
          <rect x="30" y="78" width="118" height="3.4" fill="#fff" />
          {/* registration holes */}
          {[
            [26, 30],
            [152, 30],
            [26, 114],
            [152, 114],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" fill="#000" />
          ))}
        </mask>
      </defs>

      {shadow && <GroundShadow uid={uid} cx={98} cy={132} rx={82} ry={9} opacity={0.42} />}

      <g transform={lean}>
        {/* material thickness */}
        <rect x="16" y="19" width="150" height="112" rx="3" fill={darken(color, 0.55)} />

        <g mask={`url(#${uid}-cut)`}>
          <rect x="14" y="16" width="150" height="112" rx="3" fill={color} />
          <rect
            x="14"
            y="16"
            width="150"
            height="112"
            fill={`url(#${uid}-face)`}
            opacity="0.5"
          />
          {/* trim line printed on the sheet, not cut through it */}
          <rect
            x="21"
            y="23"
            width="136"
            height="98"
            fill="none"
            stroke={ink}
            strokeOpacity="0.22"
            strokeWidth="0.8"
            strokeDasharray="4 3"
          />
          <text
            x="89"
            y="121"
            textAnchor="middle"
            fill={ink}
            opacity="0.5"
            fontFamily="var(--font-mono), monospace"
            fontSize="6.5"
            letterSpacing="2.4"
          >
            MONTANA STENCIL
          </text>
        </g>

        {/* cut edges catch the key light along their upper-left lip */}
        <rect
          x="14"
          y="16"
          width="150"
          height="112"
          rx="3"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

/* ══ BAG ══════════════════════════════════════════════════════════ */

export function Bag({ color, uid, className = '', shadow = true }: Props) {
  const ink = inkOn(color);
  /* Webbing has to separate from the canvas in *both* directions: a darkened
     strap on an olive bag disappears into the bag, and on a black bag it
     disappears into the page. */
  const webbing = ink === '#f4f2ec' ? lighten(color, 0.2) : darken(color, 0.36);

  /* Roughly 2:1 — shorter than that and a soft-sided holdall starts reading
     as a hard toolbox. */
  const body =
    'M22 68 C22 54 34 46 56 46 H144 C166 46 178 54 178 68 V108 ' +
    'C178 122 166 130 144 130 H56 C34 130 22 122 22 108 Z';

  return (
    <svg
      viewBox="0 0 200 152"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <CylinderDefs uid={uid} />
        <FaceDefs uid={uid} />
        <clipPath id={`${uid}-bagclip`}>
          <path d={body} />
        </clipPath>
      </defs>

      {shadow && <GroundShadow uid={uid} cx={100} cy={132} rx={80} ry={10} opacity={0.45} />}

      {/* shoulder strap, behind the bag */}
      <path
        d="M38 80 C44 2 156 2 162 80"
        fill="none"
        stroke={webbing}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M38 80 C44 2 156 2 162 80"
        fill="none"
        stroke="#000"
        strokeOpacity="0.22"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ── BODY (a horizontal cylinder, so the ramp runs top-to-bottom) ── */}
      <path d={body} fill={color} />
      <g clipPath={`url(#${uid}-bagclip)`}>
        {/* canvas weave */}
        {[54, 64, 74, 84, 94, 104, 114, 124].map((y) => (
          <rect key={y} x="18" y={y} width="166" height="1" fill="#000" opacity="0.045" />
        ))}

        <text
          x="58"
          y="92"
          textAnchor="middle"
          fill={ink}
          opacity="0.9"
          fontFamily="var(--font-display), Impact, sans-serif"
          fontSize="26"
          letterSpacing="-0.5"
        >
          MTN
        </text>
        <text
          x="58"
          y="106"
          textAnchor="middle"
          fill={ink}
          opacity="0.55"
          fontFamily="var(--font-mono), monospace"
          fontSize="6.5"
          letterSpacing="2.2"
        >
          CAN BAG
        </text>

        <rect x="18" y="42" width="166" height="92" fill={`url(#${uid}-face)`} opacity="0.75" />
        {/* bounce off the table under the roll of the cylinder */}
        <rect x="18" y="120" width="166" height="12" fill="#fff" opacity="0.07" />

        {/* end panel — a separate sewn disc, so it takes its own falloff */}
        <ellipse cx={162} cy={88} rx={16} ry={42} fill={darken(color, 0.08)} />
        <ellipse cx={162} cy={88} rx={16} ry={42} fill={`url(#${uid}-pshade)`} />
        <ellipse
          cx={162}
          cy={88}
          rx={16}
          ry={42}
          fill="none"
          stroke="#000"
          strokeOpacity="0.16"
          strokeWidth="1"
        />

        {/* zip along the top seam */}
        <path
          d="M40 62 Q100 54 156 62"
          fill="none"
          stroke={darken(color, 0.45)}
          strokeWidth="4"
        />
        {Array.from({ length: 19 }, (_, i) => 44 + i * 6).map((x) => (
          <rect key={x} x={x} y={55} width="2" height="6" fill="#fff" opacity="0.22" />
        ))}
      </g>

      {/* ── HANDLES ──────────────────────────────────────────── */}
      <g>
        <rect x={80} y={46} width={7} height={84} fill={webbing} />
        <rect x={109} y={46} width={7} height={84} fill={webbing} />
        <path
          d="M83.5 50 C83.5 28 112.5 28 112.5 50"
          fill="none"
          stroke={webbing}
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M83.5 50 C83.5 28 112.5 28 112.5 50"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {[80, 109].map((x) => (
          <g key={x}>
            <rect x={x} y={46} width="7" height="84" fill={`url(#${uid}-pshade)`} opacity="0.6" />
            <rect x={x + 1} y={52} width="1" height="72" fill="#fff" opacity="0.08" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ══ REFILL ═══════════════════════════════════════════════════════ */

/** How full the bottle is drawn — a full bottle has no visible level at all. */
const FILL = 0.72;

export function Refill({ color, uid, className = '', shadow = true }: Props) {
  const BODY_TOP = 62;
  const BODY_BOT = 226;
  const level = BODY_BOT - (BODY_BOT - BODY_TOP) * FILL;

  const bottle =
    'M24 100 C24 78 34 66 46 62 H74 C86 66 96 78 96 100 ' +
    'V214 Q96 226 84 226 H36 Q24 226 24 214 Z';

  return (
    <svg
      viewBox="0 0 120 244"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <CylinderDefs uid={uid} />
        <clipPath id={`${uid}-bottleclip`}>
          <path d={bottle} />
        </clipPath>
      </defs>

      {shadow && <GroundShadow uid={uid} cx={60} cy={232} rx={44} ry={7} opacity={0.5} />}

      {/* ── NECK + THREADS (drawn under the cap skirt) ───────── */}
      <g>
        <rect x={44} y={40} width={32} height={26} fill="#d9d5cb" />
        <rect x={44} y={40} width={32} height={26} fill={`url(#${uid}-pshade)`} />
        {[46, 51, 56].map((y) => (
          <rect key={y} x={44} y={y} width={32} height="1.6" fill="#000" opacity="0.14" />
        ))}
      </g>

      {/* ── SCREW CAP ────────────────────────────────────────── */}
      <g>
        <path d="M39 16 H81 V44 Q81 48 77 48 H43 Q39 48 39 44 Z" fill={darken(color, 0.5)} />
        <path d="M39 16 H81 V44 Q81 48 77 48 H43 Q39 48 39 44 Z" fill={`url(#${uid}-pshade)`} />
        {[43, 48, 53, 58, 63, 68, 73, 77].map((x) => (
          <rect key={x} x={x} y={18} width="1.4" height="30" fill="#000" opacity="0.12" />
        ))}
        <path d="M39 16 H81 V44 Q81 48 77 48 H43 Q39 48 39 44 Z" fill={`url(#${uid}-plight)`} />
        <ellipse cx={60} cy={16} rx={21} ry={5} fill={darken(color, 0.38)} />
        <ellipse cx={60} cy={16} rx={21} ry={5} fill={`url(#${uid}-plight)`} opacity="0.5" />
        <ellipse cx={60} cy={16.5} rx={13} ry={3} fill="#000" opacity="0.18" />
        {/* skirt casts onto the neck */}
        <ellipse cx={60} cy={48} rx={21} ry={3.5} fill="#000" opacity="0.28" />
      </g>

      {/* ── BOTTLE ───────────────────────────────────────────── */}
      <g clipPath={`url(#${uid}-bottleclip)`}>
        {/* the empty upper wall: translucent HDPE, faintly tinted by the paint
            below. Push the tint any further and a red refill reads as a bottle
            of something brown. */}
        <rect x={24} y={56} width={72} height={BODY_BOT - 56} fill="#e6e3da" opacity="0.6" />
        <rect x={24} y={56} width={72} height={BODY_BOT - 56} fill={color} opacity="0.07" />

        <rect x={24} y={level} width={72} height={BODY_BOT - level} fill={color} />
        {/* meniscus — the paint climbing the wall is what makes it read as liquid */}
        <ellipse cx={60} cy={level} rx={36} ry={5} fill={lighten(color, 0.16)} />
        <ellipse cx={60} cy={level + 1.5} rx={30} ry={3.2} fill="#000" opacity="0.14" />

        {/* fill graduations */}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = BODY_BOT - (BODY_BOT - BODY_TOP) * t;
          return (
            <rect key={t} x={84} y={y} width={9} height="1.2" fill="#1b1a20" opacity="0.28" />
          );
        })}

        {/* wrap label */}
        <rect x={24} y={140} width={72} height={40} fill="#f2efe7" opacity="0.95" />
        <rect x={24} y={140} width={72} height="1.2" fill="#000" opacity="0.15" />
        <rect x={24} y={178.8} width={72} height="1.2" fill="#000" opacity="0.15" />
        <text
          x={60}
          y={152}
          textAnchor="middle"
          fill="#14131a"
          opacity="0.6"
          fontFamily="var(--font-mono), monospace"
          fontSize="6"
          letterSpacing="2.2"
        >
          MONTANA
        </text>
        <text
          x={60}
          y={172}
          textAnchor="middle"
          fill="#14131a"
          fontFamily="var(--font-display), Impact, sans-serif"
          fontSize="19"
          letterSpacing="-0.5"
        >
          REFILL
        </text>

        <rect x={24} y={56} width={72} height={BODY_BOT - 56} fill={`url(#${uid}-shade)`} />
        <rect
          x={24}
          y={56}
          width={72}
          height={BODY_BOT - 56}
          fill={`url(#${uid}-light)`}
          opacity="0.85"
        />
        {/* seat of the shoulder */}
        <rect x={24} y={98} width={72} height="3" fill="#000" opacity="0.12" />
      </g>

      {/* base rests on its own footring, so the contact edge is a hard line */}
      <path
        d="M26 218 Q26 226 36 226 H84 Q94 226 94 218"
        fill="none"
        stroke="#000"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
    </svg>
  );
}
