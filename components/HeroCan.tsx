'use client';

import { asset } from '@/lib/basePath';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero product cluster, restaged for the poster layout: the group is wider
 * than its own column and pulled left so it crosses into the headline, and the
 * cans throw hard unblurred shadows the way objects lit by a single work lamp
 * do against a wall. Soft drop shadows read as a product page; these read as
 * paste-ups.
 */

const HERO_IMG = '/products/montana-black-400.webp';
const LEFT_IMG = '/products/montana-gold-400.webp';
const RIGHT_IMG = '/products/montana-94-400.webp';

/* Hard offset shadows — cast onto the wall photograph. */
const SHADOW = 'drop-shadow-[14px_18px_0_rgba(10,9,13,0.55)]';
const SHADOW_HERO = 'drop-shadow-[20px_24px_0_rgba(10,9,13,0.62)]';

/** Column placement + the overlap back into the headline column. */
const COLUMN = 'lg:col-span-5 relative z-20 lg:-ml-24 xl:-ml-40';
const STAGE =
  'relative mx-auto w-[82%] sm:w-[58%] lg:w-full max-w-[420px] lg:max-w-[560px] aspect-[3/4]';

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
            <img src={asset(LEFT_IMG)} alt="Montana GOLD" className="w-full h-auto object-contain" />
          </div>
          <div className={`absolute right-0 bottom-[6%] w-[40%] rotate-[10deg] ${SHADOW}`}>
            <img src={asset(RIGHT_IMG)} alt="Montana 94" className="w-full h-auto object-contain" />
          </div>
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[58%] rotate-[5deg] ${SHADOW_HERO}`}
          >
            <img src={asset(HERO_IMG)} alt="Montana BLACK Mandarine" className="w-full h-auto object-contain" />
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
          <img src={asset(LEFT_IMG)} alt="Montana GOLD" className="w-full h-auto object-contain" />
        </motion.div>

        <motion.div
          className={`absolute right-0 bottom-[6%] w-[40%] ${SHADOW}`}
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 10 }}
          transition={{ delay: 0.44, type: 'spring', stiffness: 120, damping: 15 }}
        >
          <img src={asset(RIGHT_IMG)} alt="Montana 94" className="w-full h-auto object-contain" />
        </motion.div>

        <motion.div
          className={`absolute left-1/2 bottom-[6%] w-[58%] ${SHADOW_HERO}`}
          initial={{ opacity: 0, x: '-20%', y: -60, rotate: 22, scale: 0.86 }}
          animate={{ opacity: 1, x: '-50%', y: 0, rotate: 5, scale: 1 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 95, damping: 14, mass: 0.9 }}
          style={{ transformOrigin: '60% 40%' }}
        >
          <img src={asset(HERO_IMG)} alt="Montana BLACK Mandarine" className="w-full h-auto object-contain" />
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
