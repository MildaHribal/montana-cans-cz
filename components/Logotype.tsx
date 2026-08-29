type Props = {
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Typographic mark for "MONTANA CANS CZ" — no real Montana artwork.
 *
 * Built as two painted objects rather than as a logo lockup: "MONTANA" is
 * stencilled straight onto the wall (overspray halo), "CANS" is a slapped-on
 * block of paint that re-colours with the swatch wall. The block is rotated a
 * hair so the pair never sits perfectly level.
 */
export function Logotype({ size = 'sm', className = '' }: Props) {
  const big = size === 'md' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-[1.75rem]';
  const block = size === 'md' ? 'text-2xl md:text-3xl' : 'text-base md:text-lg';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`font-display tracking-tightest leading-none sprayed ${big}`}>
        MONTANA
      </span>
      <span
        className={`paint-block bg-accent text-accent-ink font-display tracking-tightest leading-none px-1.5 pt-1 pb-0.5 -rotate-[2.5deg] ${block}`}
      >
        CANS
      </span>
      <span className={`font-display tracking-tightest leading-none text-ash ${block}`}>
        CZ
      </span>
    </span>
  );
}
