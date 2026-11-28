/**
 * From Uiverse.io by SelfMadeSystem - https://uiverse.io/SelfMadeSystem/pretty-treefrog-77
 * MIT License, Copyright (c) SelfMadeSystem (SelfMadeSystem)
 */
import { useId } from 'react';

export interface TechCareLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<TechCareLoaderProps['size']>, { letter: string; orb: string }> = {
  sm: {
    letter: 'h-5 w-5',
    orb: 'h-2.5 w-2.5 mx-1.5',
  },
  md: {
    letter: 'h-7 w-7 sm:h-10 sm:w-10',
    orb: 'h-3.5 w-3.5 sm:h-5 sm:w-5 mx-1.5 sm:mx-2.5',
  },
  lg: {
    letter: 'h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14',
    orb: 'h-4 w-4 sm:h-6 sm:w-6 mx-2 sm:mx-3',
  },
};

interface LetterSpec {
  letter: string;
  d: string;
  gradient: 'b' | 'c' | 'd';
}

const TECH_LETTERS: LetterSpec[] = [
  { letter: 'T', d: 'M 10 10 H 54 H 32 V 54', gradient: 'b' },
  { letter: 'E', d: 'M 50 10 H 14 V 32 H 44 H 14 V 54 H 50', gradient: 'd' },
  { letter: 'C', d: 'M 49.5 16.4 A 22 22 0 1 0 49.5 47.6', gradient: 'c' },
  { letter: 'H', d: 'M 14 10 V 54 V 32 H 50 V 10 V 54', gradient: 'b' },
];

const CARE_LETTERS: LetterSpec[] = [
  { letter: 'C', d: 'M 49.5 16.4 A 22 22 0 1 0 49.5 47.6', gradient: 'c' },
  { letter: 'A', d: 'M 12 54 L 32 10 L 52 54 L 44 36 H 20', gradient: 'd' },
  { letter: 'R', d: 'M 14 54 V 10 H 36 A 12 12 0 0 1 36 34 H 14 H 34 L 50 54', gradient: 'b' },
  { letter: 'E', d: 'M 50 10 H 14 V 32 H 44 H 14 V 54 H 50', gradient: 'd' },
];

export function TechCareLoader({ size = 'md', label, className = '' }: TechCareLoaderProps) {
  const rawId = useId();
  const safeId = rawId.replace(/:/g, '_');
  const gradIds = {
    b: `${safeId}-b`,
    c: `${safeId}-c`,
    d: `${safeId}-d`,
  };
  const sizing = SIZE_CLASSES[size];

  const renderWord = (letters: LetterSpec[], wordPrefix: string) =>
    letters.map((item, idx) => (
      <svg
        key={`${wordPrefix}-${idx}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 64 64"
        height="64"
        width="64"
        aria-hidden="true"
        className={`tc-uiverse-loader-glyph ${sizing.letter}`}
      >
        <path
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth={8}
          stroke={`url(#${gradIds[item.gradient]})`}
          d={item.d}
          className="tc-uiverse-loader-dash"
          data-letter={item.letter}
          pathLength={360}
        />
      </svg>
    ));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label ?? 'Loading Tech Care'}
      className={`inline-flex flex-col items-center justify-center gap-3 max-w-full ${className}`.trim()}
    >
      <div className="tc-uiverse-loader max-w-full">
        <svg height="0" width="0" viewBox="0 0 64 64" className="tc-uiverse-loader-defs" aria-hidden="true">
          <defs xmlns="http://www.w3.org/2000/svg">
            <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id={gradIds.b}>
              <stop stopColor="#973BED" />
              <stop stopColor="#007CFF" offset="1" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" y2="0" x2="0" y1="64" x1="0" id={gradIds.c}>
              <stop stopColor="#FFC800" />
              <stop stopColor="#F0F" offset="1" />
              <animateTransform
                repeatCount="indefinite"
                keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
                keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
                calcMode="spline"
                dur="8s"
                values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32"
                type="rotate"
                attributeName="gradientTransform"
              />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id={gradIds.d}>
              <stop stopColor="#00E0ED" />
              <stop stopColor="#00DA72" offset="1" />
            </linearGradient>
          </defs>
        </svg>

        {renderWord(TECH_LETTERS, 'tech')}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          aria-hidden="true"
          className={`tc-uiverse-loader-glyph ${sizing.orb}`}
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth={10}
            stroke={`url(#${gradIds.c})`}
            d="M 32 32 m 0 -27 a 27 27 0 1 1 0 54 a 27 27 0 1 1 0 -54"
            className="tc-uiverse-loader-spin"
            pathLength={360}
          />
        </svg>

        {renderWord(CARE_LETTERS, 'care')}
      </div>

      {label && (
        <span className="font-label-technical text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant text-center">
          {label}
        </span>
      )}
    </div>
  );
}
