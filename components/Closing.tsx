import { asset } from '@/lib/basePath';
import { WALLS, photo } from '@/lib/photos';
import { Splatter } from './graffiti';
import { Reveal } from './interactive';

/**
 * The practical questions and the drop-alert sign-up, closed off by the last
 * loud line on the page. The accordion rows are real <details> — separated by
 * gaps of bare wall instead of rules, so the list reads as a stack of slips.
 *
 * The sign-up is a mockup: the input is real and labelled, the control is a
 * plain button, and nothing submits — which keeps the whole band a server
 * component.
 */
export function Closing() {
  return (
    <section id="faq" className="relative py-28 md:py-40">
      <div className="content-grid">
        <div className="grid grid-cols-12 gap-y-16 md:gap-10">
          {/* ── QUESTIONS ── */}
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-ash">
                Než se zeptáš
              </p>
              <h2 className="mt-6 display-tight display-stack type-slab">
                DOPRAVA,
                <br />
                VRÁCENÍ,
                <br />
                <span className="sprayed-accent" style={{ color: 'var(--accent)' }}>
                  PENÍZE.
                </span>
              </h2>
            </Reveal>

            <Reveal className="mt-12" delay={80}>
              <div className="flex flex-col gap-1.5">
                {ITEMS.map((it, i) => (
                  <details
                    key={it.q}
                    className="group bg-wall-raised/60 open:bg-wall-raised transition-colors"
                  >
                    <summary className="flex cursor-pointer select-none list-none items-start gap-4 p-5 md:gap-6 md:p-6 [&::-webkit-details-marker]:hidden">
                      <span className="pt-1.5 font-mono text-[0.62rem] tracking-[0.2em] text-ash transition-colors group-open:text-[color:var(--accent)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="flex-1 font-display text-xl leading-tight tracking-tightest transition-colors group-hover:text-[color:var(--accent)] md:text-2xl">
                        {it.q}
                      </h3>
                      <span
                        aria-hidden
                        className="relative mt-1 size-5 shrink-0 text-bone transition-transform duration-300 group-open:rotate-45 group-open:text-[color:var(--accent)]"
                      >
                        <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-current" />
                        <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-current" />
                      </span>
                    </summary>

                    {/* animate-rise replays on every open; killed by reduced motion */}
                    <div className="animate-rise -mt-1 pb-6 pl-[3.2rem] pr-6 md:pb-7 md:pl-[4.1rem] md:pr-12">
                      <p className="max-w-2xl leading-relaxed text-chalk/70">{it.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ── DROP ALERT — pasted note ── */}
          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9 lg:pt-24" delay={140}>
            <div id="drop-alert" className="relative">
              <Splatter
                uid="closing-splat"
                seed={3}
                color="var(--accent)"
                className="absolute -left-16 -top-12 size-44 opacity-40"
              />
              <span className="tape-strip absolute -top-4 left-6 z-10 -rotate-2 px-6 py-1.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.24em]">
                Limitky mizí do 48 hodin
              </span>

              <div className="paint-block -rotate-1 bg-bone p-6 pt-10 text-ink shadow-slab md:p-8 md:pt-12">
                <h3 className="display-tight display-stack text-[clamp(2rem,3.4vw,2.9rem)]">
                  AŤ TI NEUTEČE ANI JEDEN DROP.
                </h3>
                <p className="mt-4 leading-relaxed text-ink/70">
                  Jeden mail, když padne nová edice, doplníme vyprodaný odstín nebo
                  vyhlásíme workshop. Žádné „akce týdne“, žádný spam.
                </p>

                <label
                  htmlFor="drop-alert-email"
                  className="mt-8 block font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ink/55"
                >
                  Tvůj e-mail
                </label>
                <input
                  id="drop-alert-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="writer@example.cz"
                  className="mt-2 w-full border-b-2 border-ink/25 bg-transparent pb-2 text-lg text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink"
                />
                <button type="button" className="btn-primary mt-6 w-full">
                  Chci vědět
                  <Arrow />
                </button>

                <p className="mt-5 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.16em] text-ink/50">
                  Odesláním souhlasíš se zpracováním e-mailu podle GDPR. Odhlásit se dá
                  jedním klikem. Posíláme max. 2× měsíčně, čte nás 6 400 lidí.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── LAST WORD — painted over a photographed wall ── */}
      <Reveal className="relative mt-24 md:mt-36" delay={60}>
        <div className="paint-band relative overflow-hidden bg-wall-deep py-20 md:py-28">
          <div aria-hidden className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(photo(WALLS, 3).src)}
              alt=""
              loading="lazy"
              decoding="async"
              className="wall-photo h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-wall-deep via-wall-deep/75 to-wall-deep/30" />
          </div>

          <div className="content-grid relative">
            <h2 className="display-tight display-stack type-poster sprayed">
              MALUJ.
              <br />
              ZBYTEK JE{' '}
              <span className="sprayed-accent" style={{ color: 'var(--accent)' }}>
                NA NÁS.
              </span>
            </h2>
            <div className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <a href="#katalog" className="btn-primary">
                Do krámu
              </a>
              <p className="font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.24em] text-ash">
                Prodejna Křenová, Brno
                <span className="px-3 text-wall-edge">/</span>
                po–pá 10–18, so 10–14
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

type Item = { q: string; a: string };

const ITEMS: Item[] = [
  {
    q: 'Do kdy musím objednat, aby to šlo ten samý den?',
    a: 'Objednávky zaplacené do 14:30 v pracovní den balíme a předáváme dopravci ještě týž den. Do většiny míst v ČR je zásilka druhý den ráno — na Zásilkovnu i PPL. O výdeji ti přijde SMS.',
  },
  {
    q: 'Kolik stojí doprava a od kdy je zdarma?',
    a: 'Zásilkovna 79 Kč, PPL na adresu 119 Kč, dobírka +39 Kč. Nad 2 500 Kč posíláme zdarma. Spreje jsou nebezpečné zboží, takže je nevozíme letecky ani mimo EU.',
  },
  {
    q: 'Můžu si zboží vyzvednout osobně v Brně?',
    a: 'Jasně. Prodejna a výdejní okno jsou na Křenové, po–pá 10–18, so 10–14. Objednávku ti nachystáme obvykle do dvou hodin a napíšeme, až bude na pultě. Rezervaci držíme tři dny.',
  },
  {
    q: 'Jak je to s vrácením do 14 dnů?',
    a: 'Vracíš do 14 dnů od převzetí a nemusíš nic vysvětlovat. Plechovka musí být neotevřená a s nepoškozenou pojistkou — použitý sprej zpátky vzít nemůžeme. Peníze posíláme do tří pracovních dnů od doručení balíku.',
  },
  {
    q: 'Čím se dá zaplatit?',
    a: 'Kartou, Apple Pay a Google Pay, rychlým bankovním převodem, běžným převodem nebo dobírkou. Firmám vystavujeme fakturu se splatností 14 dnů po první objednávce.',
  },
  {
    q: 'Prodáváte spreje i mladším osmnácti let?',
    a: 'Ne. Prodej sprejů s rozpouštědly je v ČR od 18 let, takže při osobním odběru chceme občanku a u dopravy potvrzuješ věk v objednávce. Fixy na vodní bázi, skicáky a oblečení tohle omezení nemají.',
  },
  {
    q: 'Dá se objednat větší množství pro crew nebo školu?',
    a: 'Od 24 kusů počítáme velkoobchodní ceny, u zakázek pro školy a města posíláme nabídku s dodáním do druhého dne. Napiš na velkoobchod@montanacans.cz.',
  },
];

function Arrow() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden>
      <path d="M0 7h17M11 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  );
}
