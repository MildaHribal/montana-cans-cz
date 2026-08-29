import { ThrowUp } from './graffiti';
import { Logotype } from './Logotype';

/**
 * Bottom of the pasted poster: a torn top edge, the wordmark painted across the
 * base at wall scale, and the shop details on a slip of paper. No column rules
 * — the columns are held together by the grid alone.
 */
export function Footer() {
  return (
    <footer className="paint-band relative overflow-hidden bg-wall-deep pt-24 pb-10">
      {/* Throw-up painted along the base and cropped by the footer edge — this
          replaces the ghosted MONTANA wordmark that used to sit here. A second
          reading of the brand name was a watermark; the city is the piece a
          writer would actually put on this wall. Knocked back hard so the
          columns keep their contrast, and it re-paints with the colour wall. */}
      <ThrowUp
        word="BRNO"
        uid="footer-throwup"
        color="var(--accent)"
        /* The bottom offset is in rem, not %: the footer is three times taller
           when its columns stack, and a percentage pushed the whole piece off
           the bottom edge on a phone. */
        className="pointer-events-none absolute -bottom-14 -left-[3%] w-[88%] select-none opacity-[0.15] md:-bottom-24 md:w-[58%]"
      />

      <div className="content-grid relative">
        <div className="grid grid-cols-2 gap-y-12 md:grid-cols-12 md:gap-10">
          <div className="col-span-2 md:col-span-4">
            <Logotype size="md" />
            <p className="mt-7 max-w-xs leading-relaxed text-chalk/70">
              Oficiální distributor Montana Cans pro Českou republiku. Vozíme, skladujeme
              a&nbsp;radíme od&nbsp;roku 1994.
            </p>

            <ul className="mt-8 flex list-none gap-2">
              {SOCIALS.map((s) => (
                <li key={s.short}>
                  <a
                    href="#"
                    aria-label={s.label}
                    className="inline-flex size-11 items-center justify-center bg-wall-raised font-display text-sm uppercase tracking-tightest text-chalk transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-ink)]"
                  >
                    {s.short}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Column
            title="Krám"
            items={['Spreje', 'Fixy & markery', 'Trysky', 'Oblečení', 'Doplňky', 'Výprodej']}
            className="col-span-1 md:col-span-2"
          />
          <Column
            title="Doprava"
            items={[
              'Zásilkovna 79 Kč',
              'PPL na adresu 119 Kč',
              'Osobní odběr Brno',
              'Zdarma nad 2 500 Kč',
              'Vrácení do 14 dnů',
            ]}
            className="col-span-1 md:col-span-3"
          />

          {/* pasted slip — the one loud object down here */}
          <div className="col-span-2 md:col-span-3">
            <div className="paint-block -rotate-1 bg-bone p-6 text-ink shadow-slab-sm">
              <h2 className="font-display text-2xl leading-none tracking-tightest">
                Prodejna Brno
              </h2>
              <address className="mt-4 not-italic leading-relaxed text-ink/80">
                Křenová 22
                <br />
                602 00 Brno
                <br />
                <a href="tel:+420775111222" className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                  +420 775 111 222
                </a>
                <br />
                <a
                  href="mailto:ahoj@montanacans.cz"
                  className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                >
                  ahoj@montanacans.cz
                </a>
              </address>
              <p className="mt-5 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.2em] text-ink/60">
                Po–Pá 10–18
                <br />
                So 10–14
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ash md:flex-row md:items-center md:justify-between">
          <p>© 2026 Montana Cans CZ s.r.o. · IČO&nbsp;12345678</p>
          <ul className="flex list-none flex-wrap gap-6">
            {['Obchodní podmínky', 'Ochrana údajů', 'Cookies'].map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-bone">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-ash/60">Náhled · designed for pitch</p>
        </div>
      </div>
    </footer>
  );
}

const SOCIALS = [
  { short: 'ig', label: 'Instagram' },
  { short: 'tt', label: 'TikTok' },
  { short: 'yt', label: 'YouTube' },
  { short: 'fb', label: 'Facebook' },
];

function Column({
  title,
  items,
  className = '',
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ash">{title}</h2>
      <ul className="mt-5 list-none space-y-2.5 text-chalk/85">
        {items.map((it) => (
          <li key={it}>
            <a href="#" className="transition-colors hover:text-[color:var(--accent)]">
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
