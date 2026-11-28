import { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'pointer' | 'text';

const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"]';
const POINTER_SELECTOR =
  'a, button, [role="button"], [role="tab"], select, summary, label[for], .cursor-pointer';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    if (/jsdom/i.test(navigator.userAgent)) return;

    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;
    root.classList.add('tc-custom-cursor-active');

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let visible = false;
    let rafId = 0;

    const applyState = (state: CursorState) => {
      dotRef.current?.setAttribute('data-state', state);
      ringRef.current?.setAttribute('data-state', state);
    };

    const setVisibility = (isVisible: boolean) => {
      visible = isVisible;
      const opacity = isVisible ? '1' : '0';
      if (dotRef.current) dotRef.current.style.opacity = opacity;
      if (ringRef.current) ringRef.current.style.opacity = opacity;
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        ringX = targetX;
        ringY = targetY;
        setVisibility(true);
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }

      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(TEXT_SELECTOR)) {
        applyState('text');
      } else if (target?.closest(POINTER_SELECTOR)) {
        applyState('pointer');
      } else {
        applyState('default');
      }
    };

    const onPointerDown = () => {
      dotRef.current?.setAttribute('data-pressed', 'true');
      ringRef.current?.setAttribute('data-pressed', 'true');
    };

    const onPointerUp = () => {
      dotRef.current?.setAttribute('data-pressed', 'false');
      ringRef.current?.setAttribute('data-pressed', 'false');
    };

    const onMouseLeave = () => {
      setVisibility(false);
    };

    const tick = () => {
      ringX += (targetX - ringX) * 0.2;
      ringY += (targetY - ringY) * 0.2;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    root.addEventListener('mouseleave', onMouseLeave);

    return () => {
      root.classList.remove('tc-custom-cursor-active');
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        data-state="default"
        data-pressed="false"
        style={{ opacity: 0 }}
        className="tc-cursor-ring pointer-events-none fixed left-0 top-0 z-[9999]"
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        data-state="default"
        data-pressed="false"
        style={{ opacity: 0 }}
        className="tc-cursor-dot pointer-events-none fixed left-0 top-0 z-[9999]"
      />
    </>
  );
}
