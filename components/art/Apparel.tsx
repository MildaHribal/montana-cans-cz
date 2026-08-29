import type { ReactNode } from 'react';
import { FaceDefs, GroundShadow, darken, inkOn, lighten } from './shading';

/**
 * Flat-lay garments — the way every streetwear shop photographs merch: laid
 * out, shot from straight above, sleeves squared off.
 *
 * Cloth doesn't take the glossy plastic pass the cans use, so the lighting
 * here is the shared `-face` sheen plus a diagonal cloth ramp and a handful
 * of fold strokes. The folds matter more than the ramp: a garment drawn as
 * one flat fill reads as a sticker of a t-shirt, not a t-shirt.
 */

export type ApparelCut = 'tee' | 'hoodie' | 'cap' | 'crewneck';

type Props = {
  /** Fabric colour. */
  color: string;
  cut?: ApparelCut;
  /** Short chest print. Skipped entirely if absent — blanks are a real SKU. */
  print?: string;
  /** Unique per instance — namespaces the gradient ids so they don't collide. */
  uid: string;
  className?: string;
  shadow?: boolean;
};

type Fold = { d: string; w: number; o: number; light?: boolean };

/**
 * Drape. Jersey doesn't crease in one fat tube down the middle — it gathers at
 * the armholes, hangs in two broad soft columns either side of the chest and
 * ripples at the hem. So: many thin low-opacity strokes rather than a few wide
 * ones, and the single light pass kept under 0.04 so it reads as a sheen on a
 * roll of cloth instead of a painted stripe.
 */
const FOLDS: Record<ApparelCut, Fold[]> = {
  tee: [
    { d: 'M72 76 C77 108 75 144 70 176', w: 13, o: 0.05 },
    { d: 'M128 80 C126 112 129 148 133 176', w: 12, o: 0.05 },
    { d: 'M95 70 C91 102 93 134 96 170', w: 16, o: 0.032, light: true },
    { d: 'M111 98 C114 126 112 152 109 175', w: 4.5, o: 0.045 },
    { d: 'M87 102 C84 130 86 152 89 175', w: 4, o: 0.04 },
    /* armhole gathers — the one crease every laid-out tee actually has */
    { d: 'M67 82 C71 89 74 96 75 105', w: 3.5, o: 0.1 },
    { d: 'M133 82 C129 89 126 96 125 105', w: 3.5, o: 0.1 },
    { d: 'M40 80 C46 87 52 90 58 91', w: 5, o: 0.07 },
    { d: 'M160 80 C154 87 148 90 142 91', w: 5, o: 0.07 },
    { d: 'M79 162 C78 169 78 174 79 178', w: 6, o: 0.05 },
    { d: 'M121 162 C122 169 122 174 121 178', w: 6, o: 0.05 },
  ],
  crewneck: [
    { d: 'M74 80 C79 110 77 138 72 160', w: 14, o: 0.05 },
    { d: 'M127 84 C125 114 128 140 132 160', w: 13, o: 0.05 },
    { d: 'M95 74 C91 104 93 130 96 154', w: 17, o: 0.03, light: true },
    { d: 'M112 100 C115 124 113 142 110 158', w: 5, o: 0.045 },
    { d: 'M86 104 C83 128 85 142 88 158', w: 4.5, o: 0.04 },
    { d: 'M65 84 C69 92 72 100 73 110', w: 4, o: 0.1 },
    { d: 'M135 84 C131 92 128 100 127 110', w: 4, o: 0.1 },
    /* sleeves swing down, so their creases run along the arm, not across it */
    { d: 'M44 106 C50 100 56 96 61 93', w: 6, o: 0.07 },
    { d: 'M156 106 C150 100 144 96 139 93', w: 6, o: 0.07 },
  ],
  hoodie: [
    { d: 'M74 80 C79 108 77 134 73 158', w: 14, o: 0.05 },
    { d: 'M127 84 C125 110 128 136 132 158', w: 13, o: 0.05 },
    { d: 'M96 72 C92 96 94 116 97 132', w: 17, o: 0.03, light: true },
    { d: 'M65 82 C69 90 72 98 73 108', w: 4, o: 0.1 },
    { d: 'M135 82 C131 90 128 98 127 108', w: 4, o: 0.1 },
    { d: 'M44 110 C50 104 56 100 61 97', w: 6, o: 0.07 },
    { d: 'M156 110 C150 104 144 100 139 97', w: 6, o: 0.07 },
    /* the pocket bag pulls the front panel in above the waistband */
    { d: 'M70 160 C90 165 112 165 132 160', w: 6, o: 0.05 },
  ],
  cap: [
    { d: 'M60 76 C48 96 45 112 47 126', w: 9, o: 0.055 },
    { d: 'M150 84 C162 100 167 112 166 126', w: 8, o: 0.05 },
    { d: 'M104 66 C98 88 96 108 96 126', w: 12, o: 0.03, light: true },
  ],
};

/** Chest-print anchor and the width the word has to fit into. */
const PRINT: Record<ApparelCut, { x: number; y: number; room: number }> = {
  tee: { x: 100, y: 108, room: 74 },
  crewneck: { x: 100, y: 112, room: 74 },
  hoodie: { x: 100, y: 110, room: 66 },
  /* On the cap the print lands on the front side panel, forward of the apex. */
  cap: { x: 126, y: 96, room: 52 },
};

const OUTLINE: Record<ApparelCut, string> = {
  /* Set-in sleeves: the shoulder point is a hard corner and the sleeve head
     is a separate seam. Raglan (one sweep from neck to cuff) is the other
     option and looks like a baseball shirt, which this isn't. */
  tee:
    'M81 41 C74 41 70 42 67 43 L23 67 Q21 68 22 71 L31 99 Q32 102 35 101 ' +
    'L61 89 C64 88 66 84 67 81 L61 177 Q100 184 139 177 L133 81 ' +
    'C134 84 136 88 139 89 L165 101 Q168 102 169 99 L178 71 Q179 68 177 67 ' +
    'L133 43 C130 42 126 41 119 41 C116 52 109 58 100 58 C91 58 84 52 81 41 Z',
  /* Long sleeves swung down and out. A sweatshirt with tee-length sleeves is
     just a heavy tee, and next to the tee in a grid the two stop reading as
     different products. */
  crewneck:
    'M80 42 L64 46 L20 92 Q17 95 19 98 L30 122 Q32 125 35 123 ' +
    'L60 100 C63 98 64 94 64 90 L58 170 Q100 176 142 170 L136 90 ' +
    'C136 94 137 98 140 100 L165 123 Q168 125 170 122 L181 98 Q183 95 180 92 ' +
    'L136 46 L120 42 C117 54 109 60 100 60 C91 60 83 54 80 42 Z',
  /* Same dropped, swung-down sleeve as the crewneck — a hoodie with sleeves
     held out sideways reads as a poncho. */
  hoodie:
    'M64 56 L18 100 Q15 103 17 106 L28 130 Q30 133 33 131 L58 108 ' +
    'C61 106 62 102 62 98 L56 186 Q100 192 144 186 L138 98 ' +
    'C138 102 139 106 142 108 L167 131 Q170 133 172 130 L183 106 Q185 103 182 100 ' +
    'L136 56 Z',
  /* Snapback in profile. Dead-on, a cap's bill foreshortens to a crescent
     under a dome — which is a bowler hat, and that is exactly what this used
     to render as. In profile the bill is a long flat wedge and there is
     nothing else it can be. */
  cap:
    'M28 122 C24 88 44 58 96 58 C146 58 174 84 170 122 ' +
    'C170 126 168 128 164 128 L34 128 C30 128 28 126 28 122 Z',
};

const FRAME: Record<ApparelCut, { w: number; h: number; shadow: [number, number, number] }> = {
  tee: { w: 200, h: 190, shadow: [100, 182, 62] },
  crewneck: { w: 200, h: 190, shadow: [100, 176, 60] },
  hoodie: { w: 200, h: 200, shadow: [100, 190, 62] },
  cap: { w: 246, h: 158, shadow: [130, 148, 96] },
};

/**
 * Top surface of the bill, drawn twice — once offset down as its underside.
 *
 * The root is 26 units tall and buried inside the crown, so the bill breaks
 * out of the crown's *front face* rather than from under its hem. Sitting it
 * below the hem instead — which is where it started — makes it read as a plate
 * lying on the table next to the cap, however far the two overlap.
 */
const BILL =
  'M140 100 C176 102 208 114 228 130 C232 133 230 139 224 139 ' +
  'C198 138 166 132 144 126 C138 124 136 102 140 100 Z';

/**
 * Cuff band across a sleeve opening `a`→`b`, walked `depth` back up the sleeve.
 * Ordering matters: the inward normal is (uy, −ux), so pass the two corners so
 * that runs toward the body. Deliberately overlong at both ends — the garment
 * clip is what gives it its real outline, and hand-placed quads drifted off the
 * sleeve every time the outline moved.
 */
function cuff(a: [number, number], b: [number, number], depth: number): string {
  const [ax, ay] = a;
  const len = Math.hypot(b[0] - ax, b[1] - ay);
  const ux = (b[0] - ax) / len;
  const uy = (b[1] - ay) / len;
  const over = 12;
  const at = (t: number, s: number) => `${ax + ux * t + uy * s} ${ay + uy * t - ux * s}`;
  return `M${at(-over, 0)} L${at(len + over, 0)} L${at(len + over, depth)} L${at(-over, depth)} Z`;
}

/** Rib knit — a band of fine ticks so collars and cuffs read as a different fabric. */
function Ribs({ x, y, w, h, step = 4 }: { x: number; y: number; w: number; h: number; step?: number }) {
  const n = Math.floor(w / step);
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * step} y={y} width="1" height={h} fill="#000" opacity="0.09" />
      ))}
    </>
  );
}

export function Apparel({ color, cut = 'tee', print, uid, className = '', shadow = true }: Props) {
  const ink = inkOn(color);
  /* Ribbing has to step *away* from the body colour, and on a near-black
     garment there is no darker left to go — it just fills in as a black hole.
     Dark colourways get lighter trims, the way knit ribbing catches more
     light than a flat jersey panel anyway. */
  const dark = ink === '#f4f2ec';
  const rib = dark ? lighten(color, 0.13) : darken(color, 0.14);
  const panel = dark ? lighten(color, 0.08) : darken(color, 0.07);
  /* Hood interiors and brim undersides stay genuinely dark on every colourway
     — they're cavities, not trims. */
  const deep = darken(color, 0.4);
  const frame = FRAME[cut];
  const seam = { stroke: '#000', strokeOpacity: 0.18, strokeWidth: 1.2, fill: 'none' } as const;
  const stitch = { stroke: '#000', strokeOpacity: 0.12, strokeWidth: 0.9, fill: 'none' } as const;

  /* `under` sits behind the garment body, `trim` is clipped to it,
     `over` is drawn on top of everything (hood cords, cap brim). */
  let under: ReactNode = null;
  let trim: ReactNode = null;
  let over: ReactNode = null;

  if (cut === 'tee') {
    trim = (
      <>
        <path
          d={
            'M81 41 C84 52 91 58 100 58 C109 58 116 52 119 41 L125 40 ' +
            'C122 54 112 65 100 65 C88 65 78 54 75 40 Z'
          }
          fill={rib}
        />
        <path d="M67 43 C63 56 63 70 67 81" {...seam} />
        <path d="M133 43 C137 56 137 70 133 81" {...seam} />
        <path d="M62 168 Q100 174 138 168" {...stitch} />
        <path d="M62 171 Q100 177 138 171" {...stitch} />
        <path d="M37 96 L59 86" {...stitch} />
        <path d="M163 96 L141 86" {...stitch} />
      </>
    );
  } else if (cut === 'crewneck') {
    /* The rib ticks have to be clipped to the collar itself. Left as a bare
       band they carried on down the chest as a striped patch. */
    const collar =
      'M80 42 C83 54 91 60 100 60 C109 60 117 54 120 42 L129 40 ' +
      'C126 58 114 69 100 69 C86 69 74 58 71 40 Z';
    trim = (
      <>
        <clipPath id={`${uid}-collar`}>
          <path d={collar} />
        </clipPath>
        <path d={collar} fill={rib} />
        <g clipPath={`url(#${uid}-collar)`}>
          <Ribs x={70} y={38} w={60} h={34} step={5} />
        </g>
        <path d="M64 46 C58 62 58 76 64 90" {...seam} />
        <path d="M136 46 C142 62 142 76 136 90" {...seam} />
        {/* waistband */}
        <rect x={50} y={152} width={100} height={26} fill={rib} />
        <Ribs x={52} y={152} w={98} h={26} />
        <path d="M56 152 Q100 158 144 152" {...seam} />
        {/* cuffs, squared off against the sleeve ends */}
        <path d={cuff([19, 98], [30, 122], 13)} fill={rib} />
        <path d={cuff([170, 122], [181, 98], 13)} fill={rib} />
      </>
    );
  } else if (cut === 'hoodie') {
    under = (
      <g>
        <path d="M60 60 C54 22 76 6 100 6 C124 6 146 22 140 60 Z" fill={color} />
        <path d="M60 60 C54 22 76 6 100 6 C124 6 146 22 140 60 Z" fill={`url(#${uid}-face)`} opacity="0.4" />
        {/* lining — you always see straight into the hood on a flat lay */}
        <path d="M74 60 C70 30 84 20 100 20 C116 20 130 30 126 60 Z" fill={deep} />
        <path d="M74 60 C70 30 84 20 100 20 C116 20 130 30 126 60 Z" fill="#000" opacity="0.28" />
        {/* hood hem */}
        <path
          d={
            'M74 60 C70 30 84 20 100 20 C116 20 130 30 126 60 L134 60 ' +
            'C138 27 121 13 100 13 C79 13 62 27 66 60 Z'
          }
          fill={rib}
        />
        <path d="M74 60 C70 30 84 20 100 20 C116 20 130 30 126 60" {...seam} />
      </g>
    );
    trim = (
      <>
        {/* kangaroo pocket */}
        <path d="M60 128 L60 168 L140 168 L140 128 L120 120 L80 120 Z" fill={panel} />
        <path
          d="M60 128 L60 168 L140 168 L140 128 L120 120 L80 120 Z"
          fill="none"
          stroke="#000"
          strokeOpacity="0.3"
          strokeWidth="1.3"
        />
        <path d="M63 130 L80 123" {...stitch} />
        <path d="M137 130 L120 123" {...stitch} />
        {/* waistband */}
        <rect x={50} y={166} width={100} height={22} fill={rib} />
        <Ribs x={52} y={166} w={98} h={22} />
        <path d="M56 167 Q100 173 144 167" {...seam} />
        <path d={cuff([17, 106], [28, 130], 14)} fill={rib} />
        <path d={cuff([172, 130], [183, 106], 14)} fill={rib} />
        <path d="M64 56 C58 74 57 86 62 98" {...seam} />
        <path d="M136 56 C142 74 143 86 138 98" {...seam} />
      </>
    );
    over = (
      <g>
        <path
          d="M86 56 C84 66 83 78 85 88"
          fill="none"
          stroke="#efe9da"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M114 56 C116 66 117 78 115 88"
          fill="none"
          stroke="#efe9da"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <rect x={82.4} y={87} width={5.2} height={7} rx={1.4} fill="#8c8579" />
        <rect x={112.4} y={87} width={5.2} height={7} rx={1.4} fill="#8c8579" />
        {/* eyelets the cords run through */}
        <circle cx={86} cy={54} r="2.4" fill="#000" opacity="0.4" />
        <circle cx={114} cy={54} r="2.4" fill="#000" opacity="0.4" />
      </g>
    );
  } else {
    trim = (
      <>
        {/* the stiffened front panel sits a shade brighter than the side ones */}
        <path d="M96 58 C136 68 162 90 169 124 C148 128 120 129 104 128 C102 100 98 76 96 58 Z" fill="#fff" opacity="0.04" />
        {/* six-panel seams, fanning out of the button */}
        <path d="M96 59 C136 70 162 92 170 122" {...seam} />
        <path d="M96 59 C101 86 104 106 104 128" {...seam} />
        <path d="M70 64 C56 86 51 106 51 127" stroke="#000" strokeOpacity="0.1" strokeWidth="1" fill="none" />
        {/* eyelets */}
        <circle cx={74} cy={92} r="2" fill="#000" opacity="0.34" />
        <circle cx={93} cy={98} r="2" fill="#000" opacity="0.34" />
        {/* sweatband: the crown opening rolls under and takes no key light */}
        <path
          d="M28 116 C70 126 130 126 170 116 L170 122 C170 126 168 128 164 128 L34 128 C30 128 28 126 28 122 Z"
          fill="#000"
          opacity="0.18"
        />
        <path d="M30 117 C72 127 130 127 169 117" {...stitch} />
        {/* snapback strap, back of the crown */}
        <path d="M28 102 C22 108 22 124 28 128 L40 128 L40 102 Z" fill={panel} />
        <circle cx={32} cy={110} r="1.8" fill="#000" opacity="0.38" />
        <circle cx={32} cy={120} r="1.8" fill="#000" opacity="0.38" />
      </>
    );
    /* The bill goes *under* the crown, not over it. Its root is 26 units tall
       so it can break out of the crown's front face rather than from under the
       hem, and drawn on top that root paints a pale slab across the crown. */
    under = (
      <g>
        <clipPath id={`${uid}-bill`}>
          <path d={BILL} />
        </clipPath>
        {/* the crown shades the bill for the first few units clear of it */}
        <linearGradient id={`${uid}-billshade`} gradientUnits="userSpaceOnUse" x1="162" y1="0" x2="212" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        {/* underside first, so the visible edge is the lit top surface */}
        <path d={BILL} transform="translate(0 4)" fill={deep} />
        <path d={BILL} fill={color} />
        <path d={BILL} fill={`url(#${uid}-face)`} opacity="0.55" />
        <g clipPath={`url(#${uid}-bill)`}>
          <rect x={150} y={90} width={95} height={56} fill={`url(#${uid}-billshade)`} />
        </g>
        {/* topstitch running parallel to the leading edge */}
        <path
          d="M182 114 C198 118 212 125 223 133"
          fill="none"
          stroke="#000"
          strokeOpacity="0.18"
          strokeWidth="0.9"
          strokeDasharray="3 2.5"
        />
      </g>
    );
    over = (
      <g>
        {/* button */}
        <circle cx={96} cy={60} r="4.6" fill={darken(color, 0.3)} />
        <circle cx={96} cy={58.4} r="4.6" fill={color} />
        <circle cx={94.6} cy={57} r="1.5" fill="#fff" opacity="0.35" />
      </g>
    );
  }

  const p = PRINT[cut];
  const printSize = print ? Math.min(26, p.room / (print.length * 0.46)) : 0;

  return (
    <svg
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <FaceDefs uid={uid} />
        {/* key light runs upper-left → lower-right across the lay */}
        <linearGradient id={`${uid}-cloth`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="34%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id={`${uid}-garment`}>
          <path d={OUTLINE[cut]} />
        </clipPath>
      </defs>

      {shadow && (
        <GroundShadow
          uid={uid}
          cx={frame.shadow[0]}
          cy={frame.shadow[1]}
          rx={frame.shadow[2]}
          ry={7}
          opacity={0.4}
        />
      )}

      {under}

      <path d={OUTLINE[cut]} fill={color} />
      <g clipPath={`url(#${uid}-garment)`}>
        {trim}

        {FOLDS[cut].map((f) => (
          <path
            key={f.d}
            d={f.d}
            fill="none"
            stroke={f.light ? '#fff' : '#000'}
            strokeOpacity={f.o}
            strokeWidth={f.w}
            strokeLinecap="round"
          />
        ))}

        {print && (
          <text
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={ink}
            opacity="0.92"
            fontFamily="var(--font-display), Impact, sans-serif"
            fontSize={printSize}
            letterSpacing="-0.5"
          >
            {print}
          </text>
        )}

        <rect x="0" y="0" width={frame.w} height={frame.h} fill={`url(#${uid}-face)`} opacity="0.32" />
        <rect x="0" y="0" width={frame.w} height={frame.h} fill={`url(#${uid}-cloth)`} />
      </g>

      {over}
    </svg>
  );
}
