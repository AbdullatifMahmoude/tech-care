import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Info, ShieldCheck, Sparkles, Stethoscope, Workflow } from 'lucide-react';
import { useScene } from '../context/SceneContext';
import { SITE_CONFIG } from '../data/siteConfig';

export default function MadaPage() {
  const { setRouteScene, openDemoModal } = useScene();

  useEffect(() => {
    setRouteScene('neural-mesh');
  }, [setRouteScene]);

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-margin-desktop py-12 sm:py-16 text-on-surface">
      <div className="editorial-frame editorial-bracket p-6 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 border-b border-primary/50 pb-1 text-[11px] font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Tech Care Ecosystem · Mada
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/35 bg-secondary/10 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
            {SITE_CONFIG.madaNotice.badge}
          </span>
        </div>

        <h1 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">
          {SITE_CONFIG.madaNotice.heading}
        </h1>

        <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-on-surface-variant">
          {SITE_CONFIG.madaNotice.description}{' '}
          Built alongside <strong className="text-primary">Medi</strong> to assist medical teams cleanly — without storing patient data on Tech Care servers.
        </p>

        <div className="mt-6 flex items-start gap-3 border-s-2 border-primary ps-4 py-1.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {SITE_CONFIG.privacyNote}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 border-t editorial-rule pt-8 md:grid-cols-3">
          {[
            {
              icon: Stethoscope,
              title: 'Doctor Support Only',
              desc: 'Focused tools to assist clinicians and medical teams without replacing human judgment.',
            },
            {
              icon: Workflow,
              title: 'Calm Clinic UX',
              desc: 'Simple, fast interfaces engineered for everyday medical practice.',
            },
            {
              icon: ShieldCheck,
              title: 'No Patient Data Stored',
              desc: 'Sessions stay local and never store client or patient records on Tech Care.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="space-y-2 border-s editorial-rule ps-4">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="font-headline-sm text-base font-bold text-on-surface">{item.title}</h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 border-t editorial-rule pt-8">
          <button
            type="button"
            onClick={() => openDemoModal('Mada Updates / Inquiry')}
            className="btn-primary-glow inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:bg-primary-fixed cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Request Updates</span>
          </button>
          <Link
            to="/medi"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/60 px-6 py-3 text-sm font-semibold text-on-surface hover:border-primary/60"
          >
            <span>Open Medi Assistant</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
