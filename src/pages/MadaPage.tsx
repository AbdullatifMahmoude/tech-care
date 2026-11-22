import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Info, Layers, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { useScene } from '../context/SceneContext';
import { SITE_CONFIG } from '../data/siteConfig';

export default function MadaPage() {
  const { setRouteScene, openDemoModal } = useScene();

  useEffect(() => {
    setRouteScene('neural-mesh');
  }, [setRouteScene]);

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-margin-desktop py-10 sm:py-16 text-on-surface">
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-low/85 p-6 sm:p-10 lg:p-12 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Tech Care Ecosystem · Mada Module
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/35 bg-secondary/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary">
            {SITE_CONFIG.madaNotice.badge}
          </span>
        </div>

        <h1 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
          Mada — Longitudinal Clinic &amp; Patient Continuity
        </h1>

        <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-on-surface-variant">
          Alongside <strong className="text-primary">Medi</strong> (our Physician&apos;s Personal Clinical Assistant), Mada connects outpatient follow-up, structured care timelines, and clinic management workflows into one unified Tech Care platform.
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 sm:p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-headline-sm text-sm font-bold text-on-surface">
              {SITE_CONFIG.madaNotice.heading}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-on-surface-variant">
              {SITE_CONFIG.madaNotice.description}
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Workflow,
              title: 'Unified Clinic Flow',
              desc: 'Connects reception intake, physician notes, and post-visit follow-up reminders without spreadsheet fragmentation.',
            },
            {
              icon: Layers,
              title: 'API & CMS Ready',
              desc: 'Built cleanly on TechCare’s service contracts (contentService.ts & aiClient.ts) so your clinic backend plugs directly in.',
            },
            {
              icon: ShieldCheck,
              title: 'Doctor-First Governance',
              desc: 'Every automated workflow requires clinician visibility and respects institutional privacy boundaries.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-2xl border border-outline-variant/35 bg-surface-container/75 p-6">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="mt-4 font-headline-sm text-lg font-bold text-on-surface">{card.title}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{card.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 border-t border-outline-variant/25 pt-8">
          <button
            type="button"
            onClick={() => openDemoModal('Mada Early Access / Clinic Onboarding')}
            className="btn-primary-glow inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:bg-primary-fixed cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Request Mada Clinic Access</span>
          </button>
          <Link
            to="/medi"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/60 px-6 py-3 text-sm font-semibold text-on-surface hover:border-primary/60"
          >
            <span>Explore Medi AI Assistant</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
