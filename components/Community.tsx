import { asset } from '@/lib/basePath';
import { COMMUNITY, photo } from '@/lib/photos';
import { Reveal } from './interactive';

type Shot = {
  /** index into COMMUNITY */
  i: number;
  handle: string;
  likes: number;
  /** aspect ratio — deliberately uneven so the wall never lines up */
  ratio: string;
  tilt: string;
  /** optional strip of tape holding this one up */
  tape?: string;
};

const SHOTS: Shot[] = [
  { i: 0, handle: '@savee_bzh', likes: 1842, ratio: 'aspect-[4/5]', tilt: '-1.4deg', tape: 'Židenice' },
  { i: 5, handle: '@luky.kolej', likes: 396, ratio: 'aspect-square', tilt: '1.1deg' },
  { i: 17, handle: '@nyla_paints', likes: 512, ratio: 'aspect-[3/4]', tilt: '-0.8deg' },
  { i: 2, handle: '@vrtek', likes: 274, ratio: 'aspect-[5/4]', tilt: '1.7deg' },
  { i: 10, handle: '@aneta.on.walls', likes: 908, ratio: 'aspect-[4/5]', tilt: '-1.1deg' },
  { i: 9, handle: '@hrbaty_crew', likes: 2310, ratio: 'aspect-[16/11]', tilt: '0.9deg', tape: 'Jam pod viaduktem' },
  { i: 12, handle: '@ptk_one', likes: 431, ratio: 'aspect-square', tilt: '-1.6deg' },
  { i: 13, handle: '@marek.stencil', likes: 655, ratio: 'aspect-[3/4]', tilt: '1.3deg' },
  { i: 16, handle: '@dvojka.brno', likes: 187, ratio: 'aspect-[5/4]', tilt: '-0.6deg' },
  { i: 4, handle: '@rezavej', likes: 1123, ratio: 'aspect-[3/4]', tilt: '1.5deg' },
  { i: 19, handle: '@kubo.tags', likes: 344, ratio: 'aspect-square', tilt: '-1.2deg' },
  { i: 6, handle: '@lenka.roll', likes: 762, ratio: 'aspect-[4/5]', tilt: '0.8deg' },
];

/**
 * Photos from the feed, pasted rather than gridded.
 *
 * A multi-column flow (not a grid) is what makes the wall irregular: the tiles
 * keep their own aspect ratios, so rows never line up and the column edges stay
 * ragged. Small rotations + a hard offset shadow finish the slapped-on look.
 */
export function Community() {
  return (
    <section id="komunita-feed" className="relative content-grid py-28 md:py-40">
      <Reveal>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-ash">
          Z ulice
          <span className="px-3 text-wall-edge">/</span>
          #montanacz
        </p>

        <div className="mt-6 grid grid-cols-12 items-end gap-y-8 md:gap-10">
          <h2 className="col-span-12 lg:col-span-7 display-tight display-stack type-slab">
            NAŠE BARVY
            <br />
            NA VAŠICH{' '}
            <span className="sprayed-accent" style={{ color: 'var(--accent)' }}>
              ZDECH.
            </span>
          </h2>

          <div className="col-span-12 lg:col-span-5">
            <p className="type-lead text-chalk/80">
              Označ nás na&nbsp;fotce a&nbsp;dostaneš se&nbsp;na&nbsp;stěnu. Nejlepší
              kousek měsíce bere balík barev za&nbsp;3&nbsp;000&nbsp;Kč.
            </p>
            <a
              href="https://instagram.com"
              className="btn-primary mt-7"
              rel="noreferrer noopener"
              target="_blank"
            >
              <InstagramGlyph />
              @montanacans.cz
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-14 md:mt-20" delay={80}>
        <ul className="columns-2 gap-3 md:columns-3 md:gap-5 lg:columns-4 list-none">
          {SHOTS.map((s) => (
            <li key={s.handle} className="mb-3 break-inside-avoid md:mb-5">
              <Tile shot={s} />
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-14" delay={140}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-ash">
            #montanacz
            <span className="px-3 text-wall-edge">/</span>
            #brnowalls
            <span className="px-3 text-wall-edge">/</span>
            #legalwallcz
          </p>
          <a href="#drop-alert" className="btn-ghost">
            Poslat svoji fotku
          </a>
        </div>
      </Reveal>
    </section>
  );
}

function Tile({ shot }: { shot: Shot }) {
  const p = photo(COMMUNITY, shot.i);
  return (
    /* Rotation lives on the wrapper: an inline transform on the anchor itself
       could not be overridden by the hover class. */
    <div className="relative" style={{ transform: `rotate(${shot.tilt})` }}>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Otevřít příspěvek od ${shot.handle} na Instagramu`}
        className={`group paint-block relative block ${shot.ratio} bg-wall-deep shadow-slab-sm transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(p.src)}
          alt={p.alt}
          width={p.w}
          height={p.h}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
        />

        <span
          aria-hidden
          className="absolute inset-0 bg-wall-deep/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
        <span
          aria-hidden
          className="absolute inset-0 flex translate-y-2 flex-col justify-end gap-1.5 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
        >
          <span className="font-display text-xl leading-none tracking-tightest text-bone md:text-2xl">
            {shot.handle}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash">
            <HeartGlyph />
            {shot.likes.toLocaleString('cs-CZ')}
          </span>
        </span>
      </a>

      {/* Sibling of the link, not a child: `.paint-block` is a clip-path, so a
          strip hung off the tile's top edge from inside is cut away — the
          "Židenice" label was down to a 4px sliver of tape. */}
      {shot.tape && (
        <span className="pointer-events-none tape-strip absolute -top-2 left-5 z-10 -rotate-2 px-4 py-1 font-mono text-[0.55rem] uppercase tracking-[0.22em]">
          {shot.tape}
        </span>
      )}
    </div>
  );
}

function InstagramGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

function HeartGlyph() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      style={{ color: 'var(--accent)' }}
    >
      <path d="M12 21S3 14.6 3 8.9A5 5 0 0 1 12 6a5 5 0 0 1 9 2.9C21 14.6 12 21 12 21z" />
    </svg>
  );
}
