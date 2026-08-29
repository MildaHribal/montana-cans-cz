import type { Metadata } from 'next';
import { Antonio, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { CartProvider } from '@/lib/cart';
import { ShopUiProvider } from '@/lib/shop-ui';
import { ShopOverlays } from '@/components/ShopOverlays';
import './globals.css';

/**
 * Antonio — a redraw of Anton (the original choice for the poster/stencil
 * feel) that ships full latin-ext on Google Fonts, so Czech diacritics render
 * at the same weight as the rest of the headline. Oswald was correct but read
 * newspapery; Antonio holds the condensed graffiti-poster geometry.
 */
const display = Antonio({
  weight: '700',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});

const body = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Montana Cans CZ — Spreje, fixy, trysky & oblečení',
  description:
    'Přes 200 odstínů skladem, fixy, trysky, oblečení a doplňky pro writery, street artisty a každého, kdo chce tvořit. Z Brna k tobě do 24 hodin.',
  /**
   * The site already ships its own dark aesthetic, so the DarkReader
   * extension only adds redundant styling — and it mutates deeply-nested
   * SVG/gradient nodes after the server HTML arrives but before React
   * hydrates, which triggers a hydration mismatch (and a flood of oversized
   * dev-overlay stack-frame requests → 431). This meta tells DarkReader to
   * leave the page alone, killing the mismatch at its source. suppressHydration-
   * Warning only reaches one level deep, so it can't cover DarkReader's edits.
   */
  other: { 'darkreader-lock': 'true' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="cs"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        <CartProvider>
          <ShopUiProvider>
            <a
              href="#obsah"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-bone focus:text-wall-deep focus:px-4 focus:py-2 focus:font-display"
            >
              Přeskočit na obsah
            </a>
            <div className="relative z-10">{children}</div>
            <ShopOverlays />
          </ShopUiProvider>
        </CartProvider>
      </body>
    </html>
  );
}
