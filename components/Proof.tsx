import { TornEdge } from './graffiti';
import { Counter, Reveal } from './interactive';

/**
 * Manifesto + hard numbers + stocked brands + customer quotes, as ONE object:
 * a painted stripe runs full-bleed under the headline carrying the figures and
 * the brand list, and the customer notes are pasted so they straddle its lower
 * edge. Nothing here is a card — the only structure is paint, paper and space.
 */
export function Proof() {
  return (
    <section id="komunita" className="relative py-28 md:py-40">
      {/* ── HEADLINE ── */}
      <div className="content-grid">
        <div className="grid grid-cols-12 items-end gap-y-10 md:gap-10">
          <Reveal className="col-span-12 lg:col-span-8">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-ash">
              Manifest
              <span className="px-3 text-wall-edge">/</span>
              proč zrovna u&nbsp;nás
            </p>

            {/* Lines are separate blocks so the painted one can carry its own
                padding. They inherit the leading from `.display-stack`, which
                is what keeps the čárka on NÁSTROJE out of the line above. */}
            <h2 className="mt-7 display-tight display-stack type-poster">
              <span className="block sprayed">NEJSOU TO</span>
              <span
                className="paint-block my-1.5 inline-block px-3 pb-[0.08em] pt-[0.04em]"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                PLECHOVKY.
              </span>
              <span className="block sprayed">JSOU TO</span>
              <span className="block sprayed">NÁSTROJE.</span>
            </h2>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-4" delay={120}>
            <p className="type-lead text-chalk/80">
              Montanu vozíme přímo od&nbsp;výrobce, máme ji srovnanou podle kódů
              a&nbsp;víme, co&nbsp;s&nbsp;ní. Když si nevíš rady s&nbsp;odstínem, napiš —
              někdo z&nbsp;nás taky někde maluje.
            </p>
            <p className="mt-6 leading-relaxed text-chalk/60">
              Sklad i&nbsp;prodejnu máme na&nbsp;Křenové v&nbsp;Brně. Limitky a&nbsp;barevné
              edice naskladňujeme jako první v&nbsp;ČR, na&nbsp;jamy a&nbsp;workshopy zveme
              i&nbsp;lidi, co&nbsp;drží sprej první měsíc.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ── PAINTED STRIPE: figures + stocked brands ── */}
      <Reveal className="mt-16 md:mt-24" delay={60}>
        {/* The stripe's top edge is torn rather than cut. `paint-band` is gone
            from the block below on purpose — its clip-path would skew the top
            away from the tear and open a wedge of wall between the two. */}
        <TornEdge side="top" color="var(--accent)" className="-mb-px" />
        <div
          className="content-grid py-14 pb-28 md:py-16 md:pb-32"
          style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
        >
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-6">
            <Figure
              value={<><Counter to={79} />&nbsp;Kč</>}
              label="Doprava · Zásilkovna, PPL"
            />
            <Figure value={<><Counter to={24} />&nbsp;h</>} label="Dodání kamkoli po ČR" />
            <Figure value={<><Counter to={30} /> let</>} label="Importujeme Montanu od 1994" />
            <Figure
              value={
                <>
                  4,9<span className="pl-2 align-top text-[0.5em]">★</span>
                </>
              }
              label={<><Counter to={740} />+ recenzí · 98 % doporučuje</>}
            />
          </div>

          <div className="mt-14 flex flex-wrap items-baseline gap-x-7 gap-y-3 md:mt-16">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.28em] opacity-60">
              Skladem
            </span>
            {BRANDS.map((b) => (
              <span
                key={b}
                className="font-display text-2xl leading-none tracking-tightest md:text-3xl"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── PASTED NOTES — overlap the stripe's lower edge ── */}
      <div className="content-grid">
        <ul className="-mt-16 grid list-none grid-cols-1 gap-6 md:-mt-20 md:grid-cols-3 md:gap-5">
          {QUOTES.map((q, i) => (
            <li key={q.name}>
              <Reveal delay={i * 90} className="h-full">
                <Note quote={q} tilt={TILTS[i] ?? '0deg'} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={200}>
          <p className="mt-10 font-mono text-[0.62rem] uppercase tracking-[0.26em] text-ash">
            Recenze sbíráme přes ověřené objednávky
            <span className="px-3 text-wall-edge">/</span>
            740 hodnocení na&nbsp;Googlu a&nbsp;Heurece
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const BRANDS = ['MONTANA', 'BELTON', 'MOLOTOW', 'NBQ', 'KRINK', 'IRONLAK', 'OTR'];

/** Paste angles — kept small; past ~2.5° the paper stops reading as paper. */
const TILTS = ['-1.6deg', '1.1deg', '-0.7deg'];

type Quote = {
  name: string;
  city: string;
  date: string;
  headline: string;
  body: string;
};

const QUOTES: Quote[] = [
  {
    name: 'Tomáš Křížek',
    city: 'Brno',
    date: '12. 11. 2025',
    headline: 'Objednáno v deset, ráno na pobočce',
    body: 'Potřeboval jsem doplnit devět kusů BLACK do jamu a nechtěl jsem riskovat výdejní box. Ráno v devět bylo všechno nachystané na Křenové — i trysky, na které jsem zapomněl.',
  },
  {
    name: 'Nela Hrušková',
    city: 'Olomouc',
    date: '4. 11. 2025',
    headline: 'Poradili mi líp než ve výtvarce',
    body: 'Maluju teprve rok a v odstínech jsem se ztrácela. Napsala jsem na chat, do půl hodiny přišla odpověď a k tomu tip, čím podkládat na tmavý beton.',
  },
  {
    name: 'Ondřej Bartoš',
    city: 'Praha',
    date: '28. 10. 2025',
    headline: 'Konečně vidím reálnou skladovost',
    body: 'Žádné „na dotaz“. Jednu limitku jsem sice nestihl, ale mail přišel hned, jak se naskladnila znovu. Doprava za 79 Kč je fér.',
  },
];

function Figure({ value, label }: { value: React.ReactNode; label: React.ReactNode }) {
  return (
    <div>
      <div className="display-tight text-[clamp(3rem,5.8vw,5rem)]">{value}</div>
      <div className="mt-3 font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.2em] opacity-70">
        {label}
      </div>
    </div>
  );
}

function Note({ quote, tilt }: { quote: Quote; tilt: string }) {
  return (
    <figure
      className="paint-block h-full bg-bone p-6 text-ink shadow-slab-sm md:p-7"
      style={{ transform: `rotate(${tilt})` }}
    >
      <Stars />
      <blockquote>
        <p className="mt-4 display-stack font-display text-2xl tracking-tightest">
          {quote.headline}
        </p>
        <p className="mt-3 leading-relaxed text-ink/70">{quote.body}</p>
      </blockquote>
      <figcaption className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-display text-xl tracking-tightest">{quote.name}</span>
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ink/55">
          {quote.city} · {quote.date}
        </span>
      </figcaption>
    </figure>
  );
}

function Stars() {
  return (
    <div className="flex gap-1 text-marker" role="img" aria-label="Hodnocení 5 z 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 1.8l3.1 7.2 7.8.6-5.9 5 1.8 7.6-6.8-4.1-6.8 4.1 1.8-7.6-5.9-5 7.8-.6z" />
        </svg>
      ))}
    </div>
  );
}
