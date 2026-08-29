'use client';

import { useId } from 'react';
import type { Product } from '@/lib/products';
import { SprayCan } from './SprayCan';
import { Marker } from './Marker';
import { Cap } from './Cap';
import { Blackbook } from './Blackbook';
import { Apparel } from './Apparel';
import { Bag, Gloves, Refill, Stencil } from './Extras';

/**
 * Single entry point from catalogue data to vector artwork.
 *
 * Callers never import the individual renderers — they hand over a `Product`
 * and the discriminated `art` union picks the drawing. Adding a product type
 * means adding one arm here and one to `ArtSpec`, and the compiler points at
 * both.
 */

type Props = {
  product: Product;
  className?: string;
  shadow?: boolean;
};

export function ProductArt({ product, className = '', shadow = true }: Props) {
  const { art, hex } = product;

  /* Per-instance, not per-product. The same product legitimately appears
     several times on one page (mega menu, shelf, rail, grid), and duplicate
     SVG ids are not merely invalid markup — `url(#…)` resolves to whichever
     element came first in the document, so a can rendered inside the collapsed
     mega-menu panel silently hands its zero-height clip path to every later
     copy and blanks them out. */
  const uid = `a${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const common = { uid, className, shadow, color: hex };

  switch (art.t) {
    case 'can':
      return (
        <SprayCan {...common} series={art.series} volume={art.volume} code={product.colorCode} />
      );
    case 'marker':
      return <Marker {...common} tip={art.tip} finish={art.finish} label={art.label} />;
    case 'cap':
      return <Cap {...common} style={art.style} />;
    case 'apparel':
      return <Apparel {...common} cut={art.cut} print={art.print} />;
    case 'book':
      return <Blackbook {...common} size={art.size} />;
    case 'gloves':
      return <Gloves {...common} />;
    case 'stencil':
      return <Stencil {...common} />;
    case 'bag':
      return <Bag {...common} />;
    case 'refill':
      return <Refill {...common} />;
  }
}
