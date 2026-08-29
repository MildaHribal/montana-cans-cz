import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { ColorWall } from '@/components/ColorWall';
import { Catalog } from '@/components/Catalog';
import { Editorial } from '@/components/Editorial';
import { Proof } from '@/components/Proof';
import { Community } from '@/components/Community';
import { Closing } from '@/components/Closing';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/interactive';

/**
 * Eight bands, down from twelve.
 *
 * Order is shop-first and deliberately front-loads the one thing no other
 * graffiti shop has: the colour wall comes before the catalogue because
 * picking a shade re-paints the rest of the page, so everything below it is
 * already wearing the visitor's choice by the time they reach it.
 *
 * The department grid that used to sit here is gone — the catalogue's own
 * category tabs did the same job one screen later, and running both was a
 * large part of why the page read as cluttered.
 */
export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main id="obsah">
        <Hero />
        <ColorWall />
        <Catalog />
        <Editorial />
        <Proof />
        <Community />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
