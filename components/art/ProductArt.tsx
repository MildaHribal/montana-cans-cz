'use client';

import { asset } from '@/lib/basePath';
import { useId } from 'react';
import type { Product } from '@/lib/products';
import { SprayCan } from './SprayCan';
import { Marker } from './Marker';
import { Cap } from './Cap';
import { Blackbook } from './Blackbook';
import { Apparel } from './Apparel';
import { Bag, Gloves, Refill, Stencil } from './Extras';

/**
 * Single entry point from catalogue data to product imagery and vector artwork.
 */

type Props = {
  product: Product;
  className?: string;
  shadow?: boolean;
};

export function ProductArt({ product, className = '', shadow = true }: Props) {
  if (product.image) {
    return (
      <div className={`relative flex h-full w-full items-center justify-center ${className}`}>
        <img
          src={asset(product.image)}
          alt={product.name}
          className={`h-full w-full max-h-full max-w-full object-contain ${
            shadow ? 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.55)]' : ''
          }`}
          loading="lazy"
        />
      </div>
    );
  }

  const { art, hex } = product;
  if (!art) return null;

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
