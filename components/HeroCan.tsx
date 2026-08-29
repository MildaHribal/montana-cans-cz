'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SprayCan } from './art/SprayCan';

/**
 * Hero product cluster, restaged for the poster layout: the group is wider
 * than its own column and pulled left so it crosses into the headline, and the
 * cans throw hard unblurred shadows the way objects lit by a single work lamp
 * do against a wall. Soft drop shadows read as a product page; these read as
 * paste-ups.
 *
 * Choreography (unchanged, it earns its keep):
 *   1. the paint bloom opens behind the group
 *   2. the two flanking cans rise from behind the hero can
 *   3. the hero can drops from upper-right, over-rotates, springs to +5°
 *   4. the tape strip snaps on
 */

const HERO = { color: '#e25a15', code: 'MTN-4030' };
const LEFT = { color: '#1f63e0', code: 'MTN-7050' };
const RIGHT = { color: '#a3d930', code: 'MTN-6080' };

/* Hard offset shadows — no blur radius, cast onto the wall photograph. */
const SHADOW = 'drop-shadow-[14px_18px_0_rgba(10,9,13,0.55)]';
const SHADOW_HERO = 'drop-shadow-[20px_24px_0_rgba(10,9,13,0.62)]';

/** Column placement + the overlap back into the headline column. */
const COLUMN = 'lg:col-span-5 relative z-20 lg:-ml-24 xl:-ml-40';
const STAGE =
  'relative mx-auto w-[82%] sm:w-[58%] lg:w-full max-w-[420px] lg:max-w-[560px] aspect-[3/4]';

/**
 * The animated branch has to be client-only.
 *
 * `useReducedMotion()` can only answer on the client, so a server render that
 * guessed "animate" emitted `style="opacity:0"` — and React 19 does NOT patch
 * attribute mismatches during hydration ("this won't be patched up"). With
 * reduced motion on, the client then rendered the static branch, nothing ever
 * cleared the server's inline opacity, and the whole cluster stayed invisible.
 *
 * So: render the finished composition on the server (correct with no JS at
 * all), and only swap in the choreography once mounted, when the media query
 * is actually readable.
 */
export function HeroCan() {
  const reducedSeed = useReducedMotion();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setAnimate(!mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const bloom = (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 blur-3xl"
      style={{
        background: 'radial-gradient(circle at 52% 45%, rgba(255,138,42,0.42), transparent 62%)',
      }}
    />
  );

  if (!animate || reducedSeed === true) {
    return (
      <div className={COLUMN}>
        <div className={STAGE}>
          {bloom}
          <div className={`absolute left-0 bottom-[6%] w-[42%] -rotate-[8deg] ${SHADOW}`}>
            <SprayCan uid="hero-l" color={LEFT.color} series="GOLD" code={LEFT.code} className="w-full h-auto" />
          </div>
          <div className={`absolute right-0 bottom-[6%] w-[40%] rotate-[10deg] ${SHADOW}`}>
            <SprayCan uid="hero-r" color={RIGHT.color} series="94" code={RIGHT.code} className="w-full h-auto" />
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[58%] rotate-[5deg] ${SHADOW_HERO}`}
          >
            <SprayCan uid="hero-c" color={HERO.color} series="BLACK" code={HERO.code} className="w-full h-auto" />
          </div>
          <Tape />
        </div>
      </div>
    );
  }

  return (
    <div className={COLUMN}>
      <div className={STAGE}>
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10 blur-3xl"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.75, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'radial-gradient(circle at 52% 45%, rgba(255,138,42,0.42), transparent 62%)',
          }}
        />

        <motion.div
          className={`absolute left-0 bottom-[6%] w-[42%] ${SHADOW}`}
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -8 }}
          transition={{ delay: 0.34, type: 'spring', stiffness: 120, damping: 15 }}
        >
          <SprayCan uid="hero-l" color={LEFT.color} series="GOLD" code={LEFT.code} className="w-full h-auto" />
        </motion.div>

        <motion.div
          className={`absolute right-0 bottom-[6%] w-[40%] ${SHADOW}`}
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 10 }}
          transition={{ delay: 0.44, type: 'spring', stiffness: 120, damping: 15 }}
        >
          <SprayCan uid="hero-r" color={RIGHT.color} series="94" code={RIGHT.code} className="w-full h-auto" />
        </motion.div>

        <motion.div
          className={`absolute left-1/2 bottom-[6%] w-[58%] ${SHADOW_HERO}`}
          initial={{ opacity: 0, x: '-20%', y: -60, rotate: 22, scale: 0.86 }}
          animate={{ opacity: 1, x: '-50%', y: 0, rotate: 5, scale: 1 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 95, damping: 14, mass: 0.9 }}
          style={{ transformOrigin: '60% 40%' }}
        >
          <SprayCan uid="hero-c" color={HERO.color} series="BLACK" code={HERO.code} className="w-full h-auto" />
        </motion.div>

        <motion.div
          className="absolute bottom-[2%] -left-2 z-10"
          initial={{ opacity: 0, x: -30, y: 14, rotate: 14, scale: 0.6 }}
          animate={{ opacity: 1, x: 0, y: 0, rotate: -9, scale: 1 }}
          transition={{ delay: 0.62, type: 'spring', stiffness: 220, damping: 12, mass: 0.5 }}
        >
          <TapeLabel />
        </motion.div>
      </div>
    </div>
  );
}

function Tape() {
  return (
    <div className="absolute bottom-[2%] -left-2 z-10 -rotate-[9deg]">
      <TapeLabel />
    </div>
  );
}

function TapeLabel() {
  return (
    <div className="tape-strip slab-shadow px-5 py-2 font-display tracking-tightest text-xl md:text-2xl leading-none">
      NOVÉ&nbsp;·&nbsp;MANDARINE
    </div>
  );
}
