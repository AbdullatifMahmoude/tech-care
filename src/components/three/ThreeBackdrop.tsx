import { useEffect, useRef, useState } from 'react';
import { useScene } from '../../context/SceneContext';
import type { ThreeSceneHandle } from './types';

export function ThreeBackdrop() {
  const { activeScene, pulseToken, theme } = useScene();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef(0);
  const themeRef = useRef(theme === 'light');
  const [webglFallback, setWebglFallback] = useState(false);

  useEffect(() => {
    if (pulseToken > 0) {
      pulseRef.current = 1.0;
    }
  }, [pulseToken]);

  useEffect(() => {
    themeRef.current = theme === 'light';
  }, [theme]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (activeScene === 'ambient-2d' || prefersReduced || webglFallback) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let rafId = 0;
    let handle: ThreeSceneHandle | null = null;

    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let targetScroll = 0;
    let smoothedScroll = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
    };

    const handleScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight);
      const current = window.pageYOffset || doc.scrollTop || document.body.scrollTop || 0;
      targetScroll = Math.min(Math.max(current / max, 0), 1);
    };

    const handleResize = () => {
      if (!handle) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      handle.resize(newW, newH);
    };

    async function mountScene() {
      try {
        const THREE = await import('three');
        if (cancelled || !container) return;

        const { createClinicalStoryScene } = await import('./clinicalStoryScene');
        if (!cancelled) handle = createClinicalStoryScene(THREE, container);

        if (cancelled || !handle) {
          handle?.dispose();
          return;
        }

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        handleScroll();

        const clock = new THREE.Clock();
        const animate = () => {
          if (cancelled || !handle) return;
          rafId = window.requestAnimationFrame(animate);
          const dt = Math.min(clock.getDelta(), 0.1);
          smoothedScroll += (targetScroll - smoothedScroll) * (1 - Math.exp(-4.8 * dt));
          pulseRef.current *= Math.exp(-3.8 * dt);
          if (pulseRef.current < 0.005) pulseRef.current = 0;

          handle.update({
            elapsedTime: clock.elapsedTime,
            smoothedScroll,
            mouseX,
            mouseY,
            isHovering,
            pulseEnergy: pulseRef.current,
            isLightTheme: themeRef.current,
          });
        };
        animate();
      } catch {
        if (!cancelled) {
          setWebglFallback(true);
        }
      }
    }

    mountScene();

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      handle?.dispose();
      handle = null;
    };
  }, [activeScene, webglFallback]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Subtle Radial Vignette Glows */}
      <div className="ambient-glow-primary absolute -top-[18%] left-1/2 -translate-x-1/2 w-[66rem] h-[34rem] rounded-full blur-[140px]" />
      <div className="ambient-glow-secondary absolute top-[45%] -left-[12%] w-[42rem] h-[28rem] rounded-full blur-[150px]" />

      {/* Full-Crisp Scroll-Choreographed WebGL Stage */}
      {activeScene === 'neural-mesh' && !webglFallback && (
        <div
          ref={containerRef}
          className="fixed inset-0 w-full h-full opacity-100 transition-opacity duration-500"
        />
      )}
    </div>
  );
}
