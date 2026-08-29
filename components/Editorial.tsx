import { asset } from '@/lib/basePath';
import { EDITORIAL, EDITORIAL_PORTRAIT, WALLS, photo, type Photo } from '@/lib/photos';
import { Tag } from './graffiti';
import { Reveal, Tilt } from './interactive';

/**
 * Reportage band. The loud move is the collage: three plates pasted at
 * different angles that break out of the content column to the right screen
 * edge. Everything else — byline, dek, closing columns — stays quiet text so
 * the photographs and the pull-quote carry the whole section.
 */
export function Editorial() {
  return (
    <section id="reportaz" className="relative content-grid py-28 md:py-40 overflow-hidden">
      <Backdrop />

      <Reveal className="relative">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-ash">
          Reportáž
          <span className="px-3 text-wall-edge">/</span>
          Brno, listopad 2025
        </p>

        <h2 className="mt-6 display-tight display-stack type-slab max-w-[14ch]">
          ZDI SI NÁS NAJDOU{' '}
          <span className="sprayed-accent" style={{ color: 'var(--accent)' }}>
            SAMY.
          </span>
        </h2>

        <p className="mt-8 max-w-xl type-lead text-chalk/80">
          Sobota se&nbsp;SAVEEM v&nbsp;garážích u&nbsp;Svitavy, pondělní ráno u&nbsp;nás
          na&nbsp;skladě, když se&nbsp;rozbaluje paleta. Mezi tím je&nbsp;třicet plechovek
          a&nbsp;jedna otázka: podle čeho si vlastně vybíráš barvu?
        </p>
      </Reveal>

      {/* ── COLLAGE — breaks the column, runs off the right edge ── */}
      <div className="full relative mt-16 md:mt-24 pl-5 md:pl-10 lg:pl-[max(1.25rem,calc((100vw-1440px)/2))]">
        <div className="grid grid-cols-12 gap-4 md:gap-6 items-start">
          <Reveal className="col-span-12 lg:col-span-7">
            <Plate photo={photo(EDITORIAL, 6)} ratio="aspect-[4/3]" tilt="-1.1deg" tape="01 — Garáže u Svitavy" />
          </Reveal>

          <Reveal className="col-span-7 lg:col-span-3 lg:mt-24" delay={90}>
            <Plate photo={photo(EDITORIAL_PORTRAIT, 0)} ratio="aspect-[2/3]" tilt="1.6deg" />
          </Reveal>

          {/* runs past the right edge of the viewport — intentionally cropped */}
          <Reveal className="col-span-5 lg:col-span-2 lg:mt-56 lg:-mr-24" delay={160}>
            <Plate photo={photo(EDITORIAL_PORTRAIT, 4)} ratio="aspect-[2/3]" tilt="-2.4deg" />
          </Reveal>
        </div>

        {/* pasted note landing on the big plate */}
        <Reveal
          className="relative z-10 mt-6 max-w-md lg:mt-0 lg:absolute lg:top-[58%] lg:left-[46%] lg:max-w-sm"
          delay={220}
        >
          <div className="sticker bg-bone text-ink p-6 md:p-7">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ink/55">
              Terén
            </span>
            <p className="mt-4 leading-relaxed">
              „Skica je&nbsp;hotová týden dopředu. Co&nbsp;se&nbsp;ale nikdy nedá
              naskicovat, je&nbsp;omítka. Půl hodiny tam stojím a&nbsp;jenom zkouším,
              jestli to&nbsp;nasákne.“
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink/65">
              Savee maluje čtrnáct let. Začínal na&nbsp;plotech u&nbsp;trati, dneska dělá
              fasády pro město — a&nbsp;pořád vozí stejnou kraksnu s&nbsp;devadesáti kusy
              v&nbsp;kufru.
            </p>
          </div>
        </Reveal>
      </div>

      {/* ── PULL QUOTE ── */}
      <div className="relative mt-24 md:mt-40 grid grid-cols-12 gap-8 md:gap-10 items-center">
        <Reveal className="col-span-5 sm:col-span-4 lg:col-span-3">
          <Tilt max={4}>
            <Plate photo={photo(EDITORIAL, 5)} ratio="aspect-square" tilt="2deg" />
          </Tilt>
        </Reveal>

        <Reveal className="col-span-12 lg:col-span-9" delay={120}>
          <blockquote>
            {/* Runs to two or three lines and is set mixed-case, so the
                ascenders of one line meet the descenders of the one above as
                well as the accents — `.display-stack` is the floor for both. */}
            <p className="display-tight display-stack text-[clamp(2rem,5.2vw,4.4rem)] text-bone">
              „Barvu si vyberu za&nbsp;pět minut. Půl roku pak hledám zeď, která
              ji&nbsp;<span style={{ color: 'var(--accent)' }}>unese</span>.“
            </p>
            {/* The handstyle is the attribution, not an ornament — a writer
                signs the quote the way he signs the wall, and the mono line
                stays as the readable version of the same thing. */}
            <footer className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <Tag word="SAVEE" uid="savee-tag" className="h-14 w-auto md:h-16" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.26em] text-ash">
                Savee
                <span className="px-3 text-wall-edge">/</span>
                writer, Brno-Židenice
              </span>
            </footer>
          </blockquote>
        </Reveal>
      </div>

      {/* ── CLOSING ── */}
      <Reveal className="relative mt-20 md:mt-28" delay={60}>
        <div className="grid grid-cols-12 gap-8 md:gap-10">
          <p className="col-span-12 md:col-span-5 leading-relaxed text-chalk/70">
            Sklad na&nbsp;Křenové vypadá jako lékárna: kódy nahoru, odstíny vedle sebe,
            nic nechybí. Právě proto sem lidi jezdí i&nbsp;z&nbsp;Ostravy — vědí,
            že&nbsp;když si napíšou o&nbsp;devět kusů Shock Blue, nedostanou osm
            a&nbsp;omluvu.
          </p>
          <p className="col-span-12 md:col-span-4 leading-relaxed text-chalk/70">
            Zbytek reportáže — včetně toho, jak se&nbsp;dělá legální zeď pod&nbsp;viaduktem
            a&nbsp;kolik to&nbsp;stojí — vyšel v&nbsp;našem tištěném zinu. Rozdáváme
            ho&nbsp;na&nbsp;prodejně, dokud je.
          </p>
          <div className="col-span-12 md:col-span-3 flex flex-col gap-6 md:items-end">
            <a href="#komunita-feed" className="btn-ghost self-start md:self-end">
              Číst celý díl
            </a>
            <p className="font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.22em] text-ash md:text-right">
              Text Ondřej Vlk
              <br />
              Foto Klára Hejná
              <br />6 min čtení
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/** Wall photograph washed almost out — gives the band its own paper. */
function Backdrop() {
  return (
    <div aria-hidden className="full pointer-events-none absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(photo(WALLS, 15).src)}
        alt=""
        loading="lazy"
        decoding="async"
        className="wall-photo h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-wall via-wall/70 to-wall" />
    </div>
  );
}

function Plate({
  photo: p,
  ratio,
  tilt,
  tape,
}: {
  photo: Photo;
  ratio: string;
  /** paste angle — every plate hangs slightly differently */
  tilt: string;
  /** optional tape caption pinned across the top-left corner */
  tape?: string;
}) {
  return (
    <figure
      className={`paint-block relative ${ratio} bg-wall-deep shadow-slab-lg`}
      style={{ transform: `rotate(${tilt})` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset(p.src)}
        alt={p.alt}
        width={p.w}
        height={p.h}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {tape && (
        <figcaption className="tape-strip absolute left-6 top-6 -rotate-2 px-5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.22em]">
          {tape}
        </figcaption>
      )}
    </figure>
  );
}
