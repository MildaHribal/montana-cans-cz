'use client';

import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/* ──────────────────────────────────────────────────────────────────
 * Reveal — fade & rise into view on scroll. One-shot.
 * Always renders a <div>; wrap with a semantic tag at the call site
 * if you need <section>/<article>.
 * ──────────────────────────────────────────────────────────────── */
type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** disable to render content statically (useful for above-the-fold). */
  enabled?: boolean;
  /** ignored — kept for backward-compat with existing call sites. */
  as?: string;
};

export function Reveal({
  children,
  delay = 0,
  className = '',
  enabled = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!enabled);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;

    /* Two ways this component can strand content at opacity 0 forever, both
       worth guarding: a reader who has asked for reduced motion does not want
       the reveal at all, and an environment without IntersectionObserver would
       never fire the callback that turns it on. Reveal is decoration — it must
       fail open. */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled]);

  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : 'translateY(20px)',
    filter: shown ? 'blur(0)' : 'blur(6px)',
    transition: `opacity 550ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 550ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 400ms ease-out ${delay}ms`,
    willChange: 'opacity, transform, filter',
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * Tilt — perspective rotation tracking pointer position.
 * Disabled on touch / reduced-motion.
 * ──────────────────────────────────────────────────────────────── */
type TiltProps = {
  children: ReactNode;
  max?: number;
  className?: string;
  scale?: number;
};

export function Tilt({ children, max = 5, scale = 1.0, className = '' }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reducedMotion || coarse) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * max * 2;
        const ry = (x - 0.5) * max * 2;
        el.style.setProperty('--tilt-rx', `${rx}deg`);
        el.style.setProperty('--tilt-ry', `${ry}deg`);
        el.style.setProperty('--tilt-s', `${scale}`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--tilt-rx', '0deg');
      el.style.setProperty('--tilt-ry', '0deg');
      el.style.setProperty('--tilt-s', '1');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [max, scale]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform:
          'perspective(1100px) rotateX(var(--tilt-rx,0deg)) rotateY(var(--tilt-ry,0deg)) scale(var(--tilt-s,1))',
        transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * Counter — count up to `to` when scrolled into view.
 * ──────────────────────────────────────────────────────────────── */
type CounterProps = {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** non-numeric label when in view (overrides the number, e.g. "24 h"). */
  asLabel?: string;
};

export function Counter({
  to,
  duration = 1400,
  prefix = '',
  suffix = '',
  className = '',
  asLabel,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Same fail-open rule as Reveal: without IntersectionObserver the number
       would sit at 0, which is worse than not animating it. */
    if (typeof IntersectionObserver === 'undefined') {
      setN(to);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          obs.disconnect();
          if (reduced) {
            setN(to);
            return;
          }
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {asLabel ?? `${prefix}${n.toLocaleString('cs-CZ')}${suffix}`}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * Magnetic — pulls inline element toward cursor when hovering.
 * ──────────────────────────────────────────────────────────────── */
type MagneticProps = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

export function Magnetic({ children, strength = 0.28, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    },
    [strength],
  );

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block ${className}`}
      style={{ transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * SectionNumber — editorial corner mark.
 * ──────────────────────────────────────────────────────────────── */
export function SectionNumber({
  n,
  label,
  className = '',
}: {
  n: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-ash ${className}`}
    >
      <span className="text-bone font-display text-2xl tracking-tightest leading-none">
        {n}
      </span>
      <span className="h-px w-8 bg-wall-edge" />
      <span>{label}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
 * ScrollProgress — thin paint-stroke progress bar fixed to top.
 * ──────────────────────────────────────────────────────────────── */
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total <= 0 ? 0 : Math.min(1, Math.max(0, h.scrollTop / total)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none">
      <div
        className="h-full origin-left"
        style={{
          width: '100%',
          transform: `scaleX(${p})`,
          background:
            'linear-gradient(90deg, var(--accent, #84cc16), var(--accent, #84cc16))',
          transition: 'transform 80ms linear',
        }}
      />
    </div>
  );
}
