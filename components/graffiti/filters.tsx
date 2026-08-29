/**
 * Internal filter primitives for `components/graffiti`.
 *
 * Two chains do almost all the work in this library:
 *
 *   RoughEdge  — feTurbulence → feDisplacementMap. Pushes every point of a
 *                shape sideways by the noise field, so a clean bezier comes out
 *                with the frayed, uneven contour of paint that hit a wall.
 *                Without this the whole library reads as clip-art.
 *
 *   Speckle    — feTurbulence → feColorMatrix alpha threshold. The alpha row
 *                (`gain·R − cut`) is a hard step function over smooth noise, so
 *                the continuous cloud collapses into discrete droplets. That is
 *                real aerosol grain; a blur is not.
 *
 * Both are declared with `colorInterpolationFilters="sRGB"`: the SVG default is
 * linearRGB, which silently shifts the turbulence midpoint and makes every
 * threshold value below need re-tuning.
 *
 * NOTE ON IDS: every `id` here is caller-supplied and must be unique per
 * document. `url(#x)` resolves to the *first* match in the document, so a
 * second copy of a component with the same ids silently renders through the
 * first component's filters.
 */

type RoughEdgeProps = {
  id: string;
  /** Noise scale. Low = long lazy waves, high = fine fray. */
  freq?: string;
  octaves?: number;
  /** Displacement in user units — how far the edge can wander. */
  scale?: number;
  seed?: number;
  /** Post-blur, in user units. A hair of it stops the fray looking laser-cut. */
  soften?: number;
};

export function RoughEdge({
  id,
  freq = '0.035 0.055',
  octaves = 3,
  scale = 7,
  seed = 3,
  soften = 0,
}: RoughEdgeProps) {
  return (
    <filter
      id={id}
      x="-30%"
      y="-30%"
      width="160%"
      height="160%"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency={freq}
        numOctaves={octaves}
        seed={seed}
        result="n"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="n"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
      />
      {soften > 0 && <feGaussianBlur stdDeviation={soften} />}
    </filter>
  );
}

type SpeckleProps = {
  id: string;
  /** Droplet size — 0.9 is dust, 0.25 is fat spatter. */
  freq?: number;
  seed?: number;
  /** Coverage: alpha = gain·R − cut, so raising `cut` thins the dust out. */
  gain?: number;
  cut?: number;
  /** Softens each droplet's rim. Keep tiny or the grain turns back into fog. */
  soften?: number;
};

/**
 * Emits white droplets on transparent, sized to the filtered element's box.
 * Intended as the content of a `<mask>` — see `speckMask` usage in Spray.tsx.
 */
export function Speckle({
  id,
  freq = 0.55,
  seed = 5,
  gain = 9,
  cut = 5.1,
  soften = 0,
}: SpeckleProps) {
  return (
    <filter
      id={id}
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency={freq}
        numOctaves={1}
        seed={seed}
        result="t"
      />
      <feColorMatrix
        type="matrix"
        values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${gain} 0 0 0 -${cut}`}
      />
      {soften > 0 && <feGaussianBlur stdDeviation={soften} />}
    </filter>
  );
}

/** Deterministic LCG. Scatter must be identical on server and client. */
export function prng(seed: number): () => number {
  let s = (seed * 1103515245 + 12345) >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
}

/** Stable string → small int, for picking a hand-authored variant from a word. */
export function hashWord(word: string): number {
  let h = 0;
  for (let i = 0; i < word.length; i += 1) h = (h * 31 + word.charCodeAt(i)) >>> 0;
  return h;
}
