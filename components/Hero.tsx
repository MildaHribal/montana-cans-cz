import { asset } from '@/lib/basePath';
import { HERO, photo } from '@/lib/photos';
import { HeroCan } from './HeroCan';

/**
 * Full-bleed wall poster.
 *
 * A graffiti photograph carries the whole backdrop, knocked back by
 * `.wall-photo` and a directional scrim so the poster type keeps its contrast
 * on the left while the wall stays readable as a wall on the right. Everything
 * that used to compete with the headline — crosshairs, a three-column stat
 * grid, a scroll hint, a marquee — is gone; the headline and one CTA are the
 * only things asking for attention.
 */

/** Dark brick on the left, colour on the right — it takes the scrim well. */
const WALL = photo(HERO, 3);

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Runs up behind the transparent nav — the page should open on wall, not
          on a header. */}
      <div aria-hidden className="absolute inset-x-0 -top-24 bottom-0 -z-20 overflow-hidden">
        <img
          src={asset(WALL.src)}
          alt=""
          width={WALL.w}
          height={WALL.h}
          loading="eager"
          decoding="async"
          className="wall-photo h-full w-full object-cover object-center"
        />
      </div>
      {/* Scrim weighted to the left — the headline column needs the contrast,
          the right half is allowed to stay wall. */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-24 bottom-0 -z-10"
        style={{
          background:
            'linear-gradient(97deg, rgba(10,9,13,0.96) 0%, rgba(10,9,13,0.86) 30%, rgba(10,9,13,0.3) 58%, rgba(10,9,13,0.12) 78%, rgba(10,9,13,0.45) 100%)',
        }}
      />
      {/* Hand the section back to the page background at the bottom edge. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--wall))' }}
      />

      <div className="content-grid pt-14 pb-20 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-y-10 lg:gap-x-4">
          <div className="lg:col-span-7 relative z-10">
            <span className="tape-strip inline-block px-4 py-1.5 -rotate-[1.5deg] font-display uppercase tracking-[0.08em] text-sm md:text-base leading-none">
              Oficiální dovozce Montana Cans
            </span>

            <h1 className="mt-9 md:mt-10 display-tight display-stack type-poster text-bone">
              <PosterLine word="ZEĎ" />
              <PosterLine word="JE PLÁTNO" />
            </h1>

            <p className="mt-9 max-w-lg type-lead text-chalk">
              Přes 200 odstínů Montany skladem v Brně. Objednáš do dvou, zítra už stojíš u
              zdi.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-9 gap-y-5">
              <a href="#stena" className="btn-primary">
                Vyber barvu
                <Arrow />
              </a>
              <a
                href="#katalog"
                className="font-display uppercase tracking-[0.06em] text-lg leading-none text-bone/75 hover:text-bone transition-colors underline decoration-[3px] underline-offset-[7px] decoration-[color:var(--accent)]"
              >
                Celý katalog
              </a>
            </div>

            <p className="mt-14 text-sm text-ash tracking-wide">
              212 odstínů skladem · doručení po ČR do 24 hodin · na trhu od roku 1994
            </p>
          </div>

          <HeroCan />
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden>
      <path d="M0 7h19M13 1l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

/**
 * One poster line. Static on purpose — the headline used to sweep in behind an
 * aerosol blob on load, which delayed the one thing the page exists to say and
 * put motion on the very first paint. The overspray halo stays; it is texture,
 * not choreography.
 */
function PosterLine({ word }: { word: string }) {
  return (
    <span className="relative block">
      <span className="sprayed relative inline-block">{word}</span>
    </span>
  );
}
