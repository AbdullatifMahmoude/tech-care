import { useEffect, useRef } from 'react';
import type Lenis from 'lenis';

export function useSmoothScroll(disabled = false) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (disabled) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    if (/jsdom/i.test(navigator.userAgent)) return;

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let cancelled = false;
    let rafId = 0;

    async function init() {
      const { default: LenisCtor } = await import('lenis');
      if (cancelled) return;

      const lenis = new LenisCtor({
        duration: 1.75,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -9 * t)),
        smoothWheel: true,
        allowNestedScroll: true,
        wheelMultiplier: 0.62,
        touchMultiplier: 0.85,
      });
      lenisRef.current = lenis;

      const raf = (time: number) => {
        if (cancelled) return;
        lenis.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };
      rafId = window.requestAnimationFrame(raf);
    }

    init();

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, [disabled]);

  return lenisRef;
}
