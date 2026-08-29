'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';
import { useShopUi } from '@/lib/shop-ui';
import { Logotype } from './Logotype';
import { PaintBandDrips } from './PaintBandDrips';

/**
 * Header = two painted strips, no chrome.
 *
 * Top: a slab of paint carrying the shop promises (this replaced the old
 * standalone AnnouncementBar — two stacked bars was one bar too many). It
 * scrolls away; only the nav is sticky.
 *
 * Bottom: the nav itself, transparent over the hero photograph and fading up
 * to solid once you leave the hero. The mega menu is gone — a drop-down full
 * of product thumbnails was the single busiest thing on the page and it
 * duplicated the catalogue two screens below.
 */

const LINKS = [
  { href: '#katalog', label: 'Sortiment' },
  { href: '#stena', label: 'Barvy' },
  { href: '#reportaz', label: 'Reportáž' },
  { href: '#komunita', label: 'Komunita' },
];

const PROMISES = [
  { text: 'Doprava zdarma nad 1 500 Kč', always: true },
  { text: 'Objednávka do 14:00 letí ještě dnes', always: false },
  { text: 'Osobní odběr v Brně na Bratislavské', always: false },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);

  const { count, open: openCart } = useCart();
  const { setSearchOpen } = useShopUi();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobile(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('scroll-locked', mobile);
    return () => document.body.classList.remove('scroll-locked');
  }, [mobile]);

  return (
    <>
      {/* ── PAINTED PROMO STRIP ─────────────────────────────────── */}
      {/* The runs are a sibling of the band, not a child: .paint-band is a
          clip-path, so anything crossing its lower edge from inside is cut off.
          They hang short of the logo baseline on purpose — this is the first
          mark on the page, and it has to read before it decorates. */}
      <div className="relative">
        <div className="relative z-[55] paint-band bg-accent text-accent-ink">
          <div className="content-grid">
            <ul className="flex items-center justify-center gap-x-10 py-[5px] font-display uppercase tracking-[0.1em] text-[0.7rem] md:text-[0.76rem] leading-none">
              {PROMISES.map((p) => (
                <li key={p.text} className={p.always ? '' : 'hidden md:block'}>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* z-40 puts the runs *under* the sticky header (z-50), so paint can
            cross the logo and the links without eating their legibility. */}
        <PaintBandDrips className="z-40" />
      </div>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          scrolled || mobile ? 'bg-wall-deep/95 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="content-grid">
          {/* Extra top padding is the clearance the paint runs hang into. The
              longest run is 34 units of a 1440-wide viewBox capped at 1920px,
              so it can never be more than ~45px long — pt-14 keeps the links
              clear of it at every width. */}
          <div className="flex items-center justify-between gap-6 pb-4 pt-11 md:pt-14">
            <a
              href="#"
              className="block shrink-0"
              aria-label="Montana Cans CZ — úvod"
              onClick={() => setMobile(false)}
            >
              <Logotype />
            </a>

            <nav className="hidden lg:flex items-center gap-8" aria-label="Hlavní">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="relative font-display uppercase tracking-[0.08em] text-[1.05rem] leading-none text-chalk hover:text-bone transition-colors after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-[3px] after:bg-accent after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Hledat v katalogu"
                className="inline-flex items-center gap-2.5 text-chalk hover:text-bone transition-colors"
              >
                <SearchIcon />
                <span className="hidden md:inline font-display uppercase tracking-[0.08em] text-[1.05rem] leading-none">
                  Hledat
                </span>
              </button>

              <button
                type="button"
                onClick={openCart}
                aria-label={`Otevřít košík — ${items(count)}`}
                className="relative inline-flex items-center gap-2.5 text-chalk hover:text-bone transition-colors"
              >
                <CartIcon />
                {count > 0 && (
                  <span
                    aria-hidden
                    className="min-w-[1.25rem] px-1 py-0.5 bg-accent text-accent-ink font-mono text-[0.65rem] leading-none text-center"
                  >
                    {count}
                  </span>
                )}
              </button>
              {/* The label above is only read on focus; this announces adds. */}
              <span aria-live="polite" className="sr-only">
                {items(count)}
              </span>

              <button
                type="button"
                onClick={() => setMobile((m) => !m)}
                aria-expanded={mobile}
                aria-controls="mobilni-menu"
                aria-label={mobile ? 'Zavřít menu' : 'Otevřít menu'}
                className="lg:hidden text-chalk hover:text-bone transition-colors"
              >
                <BurgerIcon open={mobile} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE PANEL ────────────────────────────────────────── */}
      <div
        id="mobilni-menu"
        className={`lg:hidden fixed inset-0 z-40 overflow-y-auto bg-wall-deep pt-28 pb-12 transition-opacity duration-200 ${
          mobile ? 'opacity-100' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="content-grid">
          {/* display-stack sits on the list, not the links: each link is its
              own block, so the leading has to come from what they inherit —
              trimming them individually would close the gap the háček on
              Reportáž needs. */}
          <nav
            aria-label="Mobilní navigace"
            className="display-stack flex flex-col items-start gap-1"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobile(false)}
                className="font-display uppercase tracking-tightest text-[13vw] sm:text-6xl text-bone hover:text-[color:var(--accent)] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="#katalog"
            onClick={() => setMobile(false)}
            className="btn-primary mt-10 w-full"
          >
            Celý katalog
          </a>
        </div>
      </div>
    </>
  );
}

/** Czech plural for the cart announcement: 1 položka / 2–4 položky / 0,5+ položek. */
function items(n: number): string {
  if (n === 0) return 'košík je prázdný';
  if (n === 1) return '1 položka';
  if (n < 5) return `${n} položky`;
  return `${n} položek`;
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 4h2.4l2.4 12h11.2l2-8H6.8"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden>
      <path
        d="M1 4h24"
        stroke="currentColor"
        strokeWidth="2.6"
        className="transition-transform duration-300 origin-center"
        style={{ transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }}
      />
      <path
        d="M1 10h24"
        stroke="currentColor"
        strokeWidth="2.6"
        className="transition-opacity duration-200"
        style={{ opacity: open ? 0 : 1 }}
      />
      <path
        d="M1 16h24"
        stroke="currentColor"
        strokeWidth="2.6"
        className="transition-transform duration-300 origin-center"
        style={{ transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
      />
    </svg>
  );
}
