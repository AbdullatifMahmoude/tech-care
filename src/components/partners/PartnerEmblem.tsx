import { useState } from 'react';
import type { Partner } from '../../types/techcare';

interface PartnerEmblemProps {
  type: Partner['emblemType'];
  logoSrc?: string;
  alt?: string;
  className?: string;
}

export function PartnerEmblem({ type, logoSrc, alt = '', className = 'w-8 h-8' }: PartnerEmblemProps) {
  const [imgError, setImgError] = useState(false);

  if (logoSrc && !imgError) {
    return (
      <img
        src={logoSrc}
        alt={alt}
        decoding="async"
        onError={() => setImgError(true)}
        className={`${className} rounded-lg bg-white object-contain p-0.5`}
      />
    );
  }

  switch (type) {
    case 'microsoft':
      return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="2" width="9" height="9" className="text-primary" fill="currentColor" opacity="0.95" />
          <rect x="13" y="2" width="9" height="9" className="text-primary" fill="currentColor" opacity="0.7" />
          <rect x="2" y="13" width="9" height="9" className="text-primary" fill="currentColor" opacity="0.82" />
          <rect x="13" y="13" width="9" height="9" className="text-secondary" fill="currentColor" opacity="0.9" />
        </svg>
      );
    case 'isf':
      return (
        <svg className={`${className} text-primary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M14 2.5L4 6.5v8c0 6.5 4.5 10.5 10 12 5.5-1.5 10-5.5 10-12v-8l-10-4z" fill="currentColor" fillOpacity="0.12" />
          <path d="M14 7.5v13M9 13.5h10" />
        </svg>
      );
    case 'alx':
      return (
        <svg className={`${className} text-primary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 21L10.5 7L17 21M7 16.5h7" />
          <path d="M18 9l6 12M24 9l-6 12" className="text-secondary" stroke="currentColor" />
        </svg>
      );
    case 'orangecorners':
      return (
        <svg className={`${className} text-primary`} viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" />
          <path d="M9 19V9h10" className="text-secondary" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17.5" cy="17.5" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'ifmsa':
      return (
        <svg className={`${className} text-primary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="14" cy="14" r="10" fill="currentColor" fillOpacity="0.1" />
          <path d="M14 6v16M9 10c2.5-1.5 7.5-1.5 10 0M8 15c3 1.5 9 1.5 12 0" />
        </svg>
      );
    case 'bibliotheca':
      return (
        <svg className={`${className} text-secondary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M5 21h18M7 17h14M14 5a9 9 0 0 1 9 9H5a9 9 0 0 1 9-9z" fill="currentColor" fillOpacity="0.12" />
        </svg>
      );
    case 'nationalalliance':
      return (
        <svg className={`${className} text-primary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="9" cy="10" r="3" />
          <circle cx="19" cy="10" r="3" />
          <circle cx="14" cy="7" r="3.2" fill="currentColor" fillOpacity="0.18" />
          <path d="M4.5 21c0-3 2.5-5 5.5-5h8c3 0 5.5 2 5.5 5" strokeLinecap="round" />
        </svg>
      );
    case 'hayatkarima':
      return (
        <svg className={`${className} text-primary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path
            d="M14 23s-7.5-4.6-9.5-9.5C3.2 10 5.4 6.5 9 6.5c2.1 0 3.8 1.2 5 3 1.2-1.8 2.9-3 5-3 3.6 0 5.8 3.5 4.5 7C21.5 18.4 14 23 14 23z"
            fill="currentColor"
            fillOpacity="0.14"
          />
          <path d="M10.5 14h2l1.2-2.5 1.8 4.5 1-2h1.8" className="text-on-surface" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'eclub':
      return (
        <svg className={`${className} text-secondary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <polygon points="14,3 24,9 24,19 14,25 4,19 4,9" fill="currentColor" fillOpacity="0.1" />
          <circle cx="14" cy="14" r="3.5" className="text-primary" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'dys':
      return (
        <svg className={`${className} text-primary`} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 21V9l8-4 8 4v12" />
          <path d="M10 21v-6h8v6M14 5v6" />
        </svg>
      );
  }
}
