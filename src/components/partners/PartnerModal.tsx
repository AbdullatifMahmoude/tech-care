import { useEffect } from 'react';
import { ExternalLink, ShieldCheck, X, Layers, Globe, CheckCircle2 } from 'lucide-react';
import type { Partner } from '../../types/techcare';
import { PartnerEmblem } from './PartnerEmblem';

interface PartnerModalProps {
  partner: Partner | null;
  onClose: () => void;
}

export function PartnerModal({ partner, onClose }: PartnerModalProps) {
  useEffect(() => {
    if (!partner) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [partner, onClose]);

  if (!partner) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-partner-title"
    >
      <div
        className="modal-backdrop fixed inset-0 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="modal-surface relative z-10 max-h-[90svh] w-full max-w-2xl overflow-y-auto overflow-x-hidden rounded-3xl p-5 sm:p-8 backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/45 bg-white p-1.5 shadow-sm">
              <PartnerEmblem type={partner.emblemType} logoSrc={partner.logoSrc} alt={partner.name} className="h-full w-full" />
            </div>
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/35 bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary">
                  {partner.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {partner.status}
                </span>
              </div>
              <h3 id="modal-partner-title" className="font-display text-2xl font-bold tracking-tight text-on-surface">
                {partner.name}
                {partner.arabicName && (
                  <span className="ml-2 text-lg font-semibold text-primary/90" dir="rtl">
                    ({partner.arabicName})
                  </span>
                )}
              </h3>
              <p className="text-xs text-on-surface-variant">{partner.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close partner details modal"
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-6 space-y-5">
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/70 p-4 sm:p-5">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ecosystem Collaboration Overview
            </h4>
            <p className="text-sm leading-relaxed text-on-surface-variant">{partner.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-outline">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Program Tier
              </div>
              <p className="mt-1 text-sm font-semibold text-on-surface">{partner.tier}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-outline">
                <Globe className="h-3.5 w-3.5 text-secondary" />
                Operational Scope
              </div>
              <p className="mt-1 text-sm font-semibold text-on-surface">{partner.scope}</p>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-outline">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Alignment
              </div>
              <p className="mt-1 text-sm font-semibold text-on-surface">{partner.compliance}</p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-outline-variant/60 px-5 py-2.5 text-center text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/60 hover:text-on-surface cursor-pointer"
            >
              Close Verification Card
            </button>

            {partner.outboundUrl && (
              <a
                href={partner.outboundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-glow inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-fixed"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
