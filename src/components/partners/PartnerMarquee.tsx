import { useState } from 'react';
import { REAL_PARTNERS } from '../../data/partners';
import { SITE_CONFIG } from '../../data/siteConfig';
import type { Partner } from '../../types/techcare';
import { SpatialItem3D, SpatialSection3D } from '../motion/Spatial3D';
import { PartnerEmblem } from './PartnerEmblem';
import { PartnerModal } from './PartnerModal';

interface PartnerMarqueeProps {
  partners?: Partner[];
}

export function PartnerMarquee({ partners = REAL_PARTNERS }: PartnerMarqueeProps) {
  const [selected, setSelected] = useState<Partner | null>(null);

  const renderCard = (partner: Partner, keyPrefix: string) => (
    <button
      key={`${keyPrefix}-${partner.id}`}
      type="button"
      onClick={() => setSelected(partner)}
      aria-haspopup="dialog"
      className="glass-stage partner-card-3d group relative flex shrink-0 items-center gap-3.5 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 ring-1 ring-outline-variant/45 group-hover:ring-primary/60 shadow-sm">
        <PartnerEmblem type={partner.emblemType} logoSrc={partner.logoSrc} alt={partner.name} className="h-full w-full" />
      </div>
      <div>
        <span className="block font-headline-sm text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
          {partner.name}
        </span>
        <span className="block text-[11px] font-medium text-on-surface-variant">
          {partner.shortLabel}
        </span>
      </div>
    </button>
  );

  return (
    <>
      <SpatialSection3D id="partners" variant="gallery-arc" className="relative scroll-mt-20 w-full overflow-hidden py-14 sm:py-20 lg:py-24">
        <SpatialItem3D preset="horizon-title" stagger={0}>
          <div className="mx-auto mb-10 sm:mb-12 max-w-4xl px-4 sm:px-6 md:px-margin-desktop text-center">
            <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              05 / Ecosystem Supporters
            </span>
            <h2 className="mt-3 font-headline-lg text-3xl md:text-4xl font-semibold tracking-tight text-on-surface">
              Trusted by healthcare &amp; innovation partners.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant">
              {SITE_CONFIG.partnersSubtitle} Click any supporter to inspect program verification.
            </p>
          </div>
        </SpatialItem3D>

        <SpatialItem3D preset="depth-pop" stagger={0.16}>
          <div className="relative w-full overflow-hidden py-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 md:w-40 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 md:w-40 bg-gradient-to-l from-background to-transparent" />

            <div className="animate-marquee gap-5 px-4">
              {partners.map((p) => renderCard(p, 'set1'))}
              {partners.map((p) => renderCard(p, 'set2'))}
            </div>
          </div>
        </SpatialItem3D>
      </SpatialSection3D>

      <PartnerModal partner={selected} onClose={() => setSelected(null)} />
    </>
  );
}
