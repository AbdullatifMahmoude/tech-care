import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';

export type SpatialVariant =
  | 'hero'
  | 'swing-left'
  | 'swing-right'
  | 'horizon-rise'
  | 'gallery-arc'
  | 'split-converge';

export type SpatialItemPreset =
  | 'hero-title'
  | 'hero-sub'
  | 'hero-cta'
  | 'left-lead'
  | 'right-lead'
  | 'cascade-item'
  | 'depth-pop'
  | 'pill-wave'
  | 'horizon-title';

interface StageEntry {
  outer: HTMLElement;
  stage: HTMLElement;
  variant: SpatialVariant;
  current: number;
  target: number;
}

interface ItemEntry {
  el: HTMLElement;
  anchor: HTMLElement;
  preset: SpatialItemPreset;
  stagger: number;
  indexOffset: number;
  restZ: number;
  current: number;
  target: number;
}

const stages = new Set<StageEntry>();
const items = new Set<ItemEntry>();
let coordinatorRaf = 0;
let listenersAttached = false;
let lastTickTime = 0;

const DEAD_ZONE = 0.14;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function isReducedMotionOrTest(): boolean {
  if (typeof window === 'undefined') return true;
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) {
    return true;
  }
  return Boolean(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
}

function measureSectionRaw(anchor: HTMLElement, isHeroScope: boolean): number {
  const rect = anchor.getBoundingClientRect();
  const vh = window.innerHeight || 900;
  // Plateau across tall mobile-stacked sections so lower sub-cards/video stay focused at opacity 1
  const halfCore = Math.min(rect.height * 0.5, vh * 0.34);
  const centerY = vh * 0.5;
  let distFromCenter = 0;
  if (rect.top > centerY - halfCore) {
    distFromCenter = rect.top + halfCore - centerY;
  } else if (rect.bottom < centerY + halfCore) {
    distFromCenter = rect.bottom - halfCore - centerY;
  }

  let raw = distFromCenter / (vh * 0.85);
  raw = clamp(raw, -1.25, 1.25);

  if (isHeroScope && raw > 0) {
    raw = 0;
  }
  return raw;
}

function computeStageTarget(outer: HTMLElement, variant: SpatialVariant): number {
  const raw = measureSectionRaw(outer, variant === 'hero');
  if (Math.abs(raw) <= DEAD_ZONE) return 0;
  const sign = raw >= 0 ? 1 : -1;
  return sign * Math.min(1, (Math.abs(raw) - DEAD_ZONE) / (1.0 - DEAD_ZONE));
}

function computeItemTarget(anchor: HTMLElement, preset: SpatialItemPreset, stagger: number): number {
  const raw = measureSectionRaw(anchor, preset.startsWith('hero-'));
  if (Math.abs(raw) <= DEAD_ZONE) return 0;
  const base = Math.min(1, (Math.abs(raw) - DEAD_ZONE) / (1.0 - DEAD_ZONE));
  const exp = Math.max(0.45, 1.45 - stagger * 3.0);
  const sign = raw >= 0 ? 1 : -1;
  return sign * Math.pow(base, exp);
}

function applyStageTransform(stage: HTMLElement, variant: SpatialVariant, progress: number) {
  if (Math.abs(progress) < 0.002) {
    stage.style.transform = 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)';
    stage.style.opacity = '1';
    return;
  }

  // Softer macro-camera stage framing (~55% softer than before so items lead the 3D choreography)
  const compactFactor = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.45 : 1;
  const e = Math.sign(progress) * Math.pow(Math.min(1, Math.abs(progress)), 1.25);
  const absE = Math.abs(e);

  let transform = '';
  let opacity = 1;

  switch (variant) {
    case 'hero':
      transform = `translate3d(0px, ${(e * 16).toFixed(1)}px, ${(-absE * 88).toFixed(1)}px) rotateX(${(e * 5.8).toFixed(2)}deg) scale(${(1 - absE * 0.036).toFixed(4)})`;
      opacity = Math.max(0.45, 1 - absE * 0.45);
      break;
    case 'swing-left':
      transform = `translate3d(${(-absE * 16 * compactFactor).toFixed(1)}px, ${(e * 20).toFixed(1)}px, ${(-absE * 84).toFixed(1)}px) rotateY(${(e * 6.5 * compactFactor).toFixed(2)}deg) rotateX(${(e * 4.8).toFixed(2)}deg) scale(${(1 - absE * 0.04).toFixed(4)})`;
      opacity = Math.max(0.45, 1 - absE * 0.42);
      break;
    case 'swing-right':
      transform = `translate3d(${(absE * 16 * compactFactor).toFixed(1)}px, ${(e * 20).toFixed(1)}px, ${(-absE * 84).toFixed(1)}px) rotateY(${(-e * 6.5 * compactFactor).toFixed(2)}deg) rotateX(${(e * 4.8).toFixed(2)}deg) scale(${(1 - absE * 0.04).toFixed(4)})`;
      opacity = Math.max(0.45, 1 - absE * 0.42);
      break;
    case 'horizon-rise':
      transform = `translate3d(0px, ${(e * 24).toFixed(1)}px, ${(-absE * 96).toFixed(1)}px) rotateX(${(e * 7.8).toFixed(2)}deg) scale(${(1 - absE * 0.045).toFixed(4)})`;
      opacity = Math.max(0.45, 1 - absE * 0.42);
      break;
    case 'gallery-arc':
      transform = `translate3d(0px, ${(e * 18).toFixed(1)}px, ${(-absE * 76).toFixed(1)}px) rotateX(${(e * 6.0).toFixed(2)}deg) rotateZ(${(e * 0.65).toFixed(2)}deg) scale(${(1 - absE * 0.035).toFixed(4)})`;
      opacity = Math.max(0.48, 1 - absE * 0.38);
      break;
    case 'split-converge':
      transform = `translate3d(0px, ${(e * 20).toFixed(1)}px, ${(-absE * 80).toFixed(1)}px) rotateX(${(e * 5.8).toFixed(2)}deg) scale(${(1 - absE * 0.036).toFixed(4)})`;
      opacity = Math.max(0.48, 1 - absE * 0.4);
      break;
  }

  stage.style.transform = transform;
  stage.style.opacity = opacity.toFixed(3);
}

function applyItemTransform(
  el: HTMLElement,
  preset: SpatialItemPreset,
  progress: number,
  indexOffset: number,
  restZ: number,
) {
  if (Math.abs(progress) < 0.002) {
    el.style.transform = `translate3d(0px, 0px, ${restZ}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    el.style.opacity = '1';
    return;
  }

  const compactFactor = typeof window !== 'undefined' && window.innerWidth < 768 ? 0.45 : 1;
  const e = progress;
  const absE = Math.abs(e);
  let transform = '';
  let opacity = 1;

  switch (preset) {
    case 'hero-title':
      transform = `translate3d(0px, ${(e * 22).toFixed(1)}px, ${(restZ - absE * 70).toFixed(1)}px) rotateX(${(e * 5).toFixed(2)}deg)`;
      opacity = Math.max(0.28, 1 - absE * 0.58);
      break;
    case 'hero-sub':
      transform = `translate3d(${(-absE * 14 * compactFactor).toFixed(1)}px, ${(e * 38).toFixed(1)}px, ${(restZ - absE * 130).toFixed(1)}px) rotateX(${(e * 8).toFixed(2)}deg)`;
      opacity = Math.max(0.22, 1 - absE * 0.68);
      break;
    case 'hero-cta':
      transform = `translate3d(${(-absE * 22 * compactFactor).toFixed(1)}px, ${(e * 56).toFixed(1)}px, ${(restZ - absE * 185).toFixed(1)}px) rotateX(${(e * 11).toFixed(2)}deg) scale(${(1 - absE * 0.06).toFixed(4)})`;
      opacity = Math.max(0.18, 1 - absE * 0.74);
      break;
    case 'left-lead':
      transform = `translate3d(${(-absE * 42 * compactFactor).toFixed(1)}px, ${(e * 28).toFixed(1)}px, ${(restZ - absE * 120).toFixed(1)}px) rotateY(${(e * 11 * compactFactor).toFixed(2)}deg) rotateX(${(e * 7).toFixed(2)}deg)`;
      opacity = Math.max(0.32, 1 - absE * 0.58);
      break;
    case 'right-lead':
      transform = `translate3d(${(absE * 42 * compactFactor).toFixed(1)}px, ${(e * 28).toFixed(1)}px, ${(restZ - absE * 120).toFixed(1)}px) rotateY(${(-e * 11 * compactFactor).toFixed(2)}deg) rotateX(${(e * 7).toFixed(2)}deg)`;
      opacity = Math.max(0.32, 1 - absE * 0.58);
      break;
    case 'cascade-item':
      transform = `translate3d(${(-absE * 28 * compactFactor).toFixed(1)}px, ${(e * 34).toFixed(1)}px, ${(restZ - absE * 110).toFixed(1)}px) rotateX(${(e * 13).toFixed(2)}deg) rotateY(${(e * 7 * compactFactor).toFixed(2)}deg) scale(${(1 - absE * 0.05).toFixed(4)})`;
      opacity = Math.max(0.26, 1 - absE * 0.64);
      break;
    case 'depth-pop':
      transform = `translate3d(0px, ${(e * 42).toFixed(1)}px, ${(restZ - absE * 150).toFixed(1)}px) rotateX(${(e * 14).toFixed(2)}deg) scale(${(1 - absE * 0.08).toFixed(4)})`;
      opacity = Math.max(0.26, 1 - absE * 0.66);
      break;
    case 'pill-wave':
      transform = `translate3d(${(indexOffset * absE * 20 * compactFactor).toFixed(1)}px, ${(e * 44 + Math.abs(indexOffset) * absE * 7).toFixed(1)}px, ${(restZ - absE * (115 + Math.abs(indexOffset) * 16)).toFixed(1)}px) rotateX(${(e * 18).toFixed(2)}deg) rotateY(${(-indexOffset * e * 4.5 * compactFactor).toFixed(2)}deg)`;
      opacity = Math.max(0.24, 1 - absE * 0.68);
      break;
    case 'horizon-title':
      transform = `translate3d(0px, ${(e * 32).toFixed(1)}px, ${(restZ - absE * 100).toFixed(1)}px) rotateX(${(e * 10).toFixed(2)}deg)`;
      opacity = Math.max(0.35, 1 - absE * 0.52);
      break;
  }

  el.style.transform = transform;
  el.style.opacity = opacity.toFixed(3);
}

function tickCoordinator(now = performance.now()) {
  coordinatorRaf = 0;
  const dt = lastTickTime > 0 ? clamp((now - lastTickTime) / 1000, 0.008, 0.25) : 0.016;
  lastTickTime = now;
  const stageAlpha = 1 - Math.exp(-8.5 * dt);
  let needsMore = false;

  for (const entry of stages) {
    entry.target = computeStageTarget(entry.outer, entry.variant);
    const diff = entry.target - entry.current;
    if (Math.abs(diff) < 0.002) {
      if (entry.current !== entry.target) {
        entry.current = entry.target;
        applyStageTransform(entry.stage, entry.variant, entry.current);
      }
    } else {
      entry.current += diff * stageAlpha;
      applyStageTransform(entry.stage, entry.variant, entry.current);
      needsMore = true;
    }
  }

  for (const item of items) {
    item.target = computeItemTarget(item.anchor, item.preset, item.stagger);
    const diff = item.target - item.current;
    if (Math.abs(diff) < 0.002) {
      if (item.current !== item.target) {
        item.current = item.target;
        applyItemTransform(item.el, item.preset, item.current, item.indexOffset, item.restZ);
      }
    } else {
      const speed = Math.max(5.5, 9.5 - item.stagger * 12.0);
      const itemAlpha = 1 - Math.exp(-speed * dt);
      item.current += diff * itemAlpha;
      applyItemTransform(item.el, item.preset, item.current, item.indexOffset, item.restZ);
      needsMore = true;
    }
  }

  if (needsMore && (stages.size > 0 || items.size > 0)) {
    coordinatorRaf = window.requestAnimationFrame(tickCoordinator);
  } else {
    lastTickTime = 0;
  }
}

function wakeCoordinator() {
  if ((stages.size === 0 && items.size === 0) || isReducedMotionOrTest()) return;
  if (!coordinatorRaf) {
    coordinatorRaf = window.requestAnimationFrame(tickCoordinator);
  }
}

function attachGlobalListeners() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  window.addEventListener('scroll', wakeCoordinator, { passive: true });
  window.addEventListener('resize', wakeCoordinator, { passive: true });
}

function detachGlobalListenersIfEmpty() {
  if (!listenersAttached || stages.size > 0 || items.size > 0 || typeof window === 'undefined') return;
  listenersAttached = false;
  window.removeEventListener('scroll', wakeCoordinator);
  window.removeEventListener('resize', wakeCoordinator);
  if (coordinatorRaf) {
    window.cancelAnimationFrame(coordinatorRaf);
    coordinatorRaf = 0;
  }
}

interface SpatialSection3DProps {
  id?: string;
  variant: SpatialVariant;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}

export function SpatialSection3D({
  id,
  variant,
  className = '',
  stageClassName = 'w-full',
  children,
}: SpatialSection3DProps) {
  const outerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    if (!outer || !stage || isReducedMotionOrTest()) return;

    const initialTarget = computeStageTarget(outer, variant);
    const entry: StageEntry = {
      outer,
      stage,
      variant,
      current: initialTarget,
      target: initialTarget,
    };

    applyStageTransform(stage, variant, initialTarget);
    stages.add(entry);
    attachGlobalListeners();

    return () => {
      stages.delete(entry);
      detachGlobalListenersIfEmpty();
    };
  }, [variant]);

  return (
    <section
      id={id}
      ref={outerRef}
      data-spatial-variant={variant}
      className={className}
      style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}
    >
      <div
        ref={stageRef}
        className={stageClassName}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
      >
        {children}
      </div>
    </section>
  );
}

interface SpatialItem3DProps {
  preset: SpatialItemPreset;
  stagger?: number;
  indexOffset?: number;
  restZ?: number;
  className?: string;
  children: ReactNode;
}

export function SpatialItem3D({
  preset,
  stagger = 0,
  indexOffset = 0,
  restZ = 0,
  className = '',
  children,
}: SpatialItem3DProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = itemRef.current;
    if (!el || isReducedMotionOrTest()) return;

    const anchor = (el.closest('[data-spatial-variant]') as HTMLElement | null) ?? el;
    const initialTarget = computeItemTarget(anchor, preset, stagger);
    const entry: ItemEntry = {
      el,
      anchor,
      preset,
      stagger,
      indexOffset,
      restZ,
      current: initialTarget,
      target: initialTarget,
    };

    applyItemTransform(el, preset, initialTarget, indexOffset, restZ);
    items.add(entry);
    attachGlobalListeners();

    return () => {
      items.delete(entry);
      detachGlobalListenersIfEmpty();
    };
  }, [preset, stagger, indexOffset, restZ]);

  return (
    <div
      ref={itemRef}
      data-spatial-item={preset}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
    >
      {children}
    </div>
  );
}

interface TiltCard3DProps {
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  children: ReactNode;
}

export function TiltCard3D({
  className = '',
  maxTilt = 8,
  glare = true,
  children,
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || isReducedMotionOrTest()) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    const rotX = (-ny * maxTilt * 2).toFixed(2);
    const rotY = (nx * maxTilt * 2).toFixed(2);

    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;
    card.style.setProperty('--mx', `${((nx + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${((ny + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--glare-opacity', '1');
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    card.style.setProperty('--glare-opacity', '0');
  };

  return (
    <div className="w-full" style={{ perspective: '1100px' }}>
      <div
        ref={cardRef}
        data-tilt-card="true"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`relative transition-transform duration-200 ease-out ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {glare && (
          <div
            aria-hidden="true"
            className="tilt-glare-overlay pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
            style={{ transform: 'translateZ(1px)' }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
