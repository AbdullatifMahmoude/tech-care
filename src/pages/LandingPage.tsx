import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ExternalLink, PlayCircle, Sparkles, Stethoscope } from 'lucide-react';
import { useScene } from '../context/SceneContext';
import { SITE_CONFIG } from '../data/siteConfig';
import { MEDI_DEMO_SNIPPETS } from '../data/platformContent';
import { PartnerMarquee } from '../components/partners/PartnerMarquee';
import { ContactSection } from '../components/contact/ContactSection';
import { SpatialItem3D, SpatialSection3D } from '../components/motion/Spatial3D';

const CHAPTERS = [
  { id: 'core', index: '01', label: 'Core' },
  { id: 'mission', index: '02', label: 'Pillars' },
  { id: 'about', index: '03', label: 'About' },
  { id: 'medi-preview', index: '04', label: 'Medi' },
  { id: 'partners', index: '05', label: 'Partners' },
  { id: 'contact', index: '06', label: 'Contact' },
];

export default function LandingPage() {
  const { setRouteScene, triggerScenePulse, openDemoModal } = useScene();
  const [activeChapter, setActiveChapter] = useState('core');
  const [mediSampleLang, setMediSampleLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    setRouteScene('neural-mesh');
  }, [setRouteScene]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: 0.05 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const mediSample = MEDI_DEMO_SNIPPETS[mediSampleLang];

  return (
    <div className="relative flex w-full flex-col overflow-x-clip text-on-surface">
      {/* Right-Edge Minimal Chapter Rail */}
      <aside
        aria-label="Scroll Chapter Navigation"
        className="no-print fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3.5 xl:flex"
      >
        {CHAPTERS.map((ch) => {
          const isCurrent = activeChapter === ch.id;
          return (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              onClick={() => triggerScenePulse()}
              className="group flex items-center gap-2.5 text-right transition-all"
            >
              <span
                className={`font-label-technical text-[10px] uppercase tracking-widest transition-all ${
                  isCurrent
                    ? 'text-primary opacity-100'
                    : 'text-outline opacity-0 group-hover:opacity-100'
                }`}
              >
                {ch.index} · {ch.label}
              </span>
              <span
                className={`block rounded-full transition-all ${
                  isCurrent
                    ? 'h-2.5 w-2.5 bg-primary shadow-[0_0_12px_#47f1e4]'
                    : 'h-1.5 w-1.5 bg-outline/60 group-hover:bg-primary/70'
                }`}
              />
            </a>
          );
        })}
      </aside>

      {/* CHAPTER 01 — HERO (Staggered 3D Typography + Volumetric Neural Brain) */}
      <SpatialSection3D
        id="core"
        variant="hero"
        className="relative scroll-mt-20 flex min-h-[calc(100svh-4rem)] flex-col justify-between px-4 sm:px-6 md:px-margin-desktop py-8 sm:py-12"
        stageClassName="w-full flex-1 flex flex-col justify-between"
      >
        <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <SpatialItem3D preset="hero-title" stagger={0}>
              <h1 className="font-display-hero text-[clamp(2.15rem,8vw,4.5rem)] leading-[1.04] font-bold tracking-tight text-on-surface">
                Intelligence for{' '}
                <span className="hero-gradient-text">
                  Modern Medicine
                </span>
              </h1>
            </SpatialItem3D>

            <SpatialItem3D preset="hero-sub" stagger={0.1}>
              <p className="mt-5 sm:mt-6 max-w-xl text-base sm:text-lg font-light leading-relaxed text-on-surface/85">
                Smart clinical AI built to empower doctors — without replacing the human touch.
              </p>
            </SpatialItem3D>

            <SpatialItem3D preset="hero-cta" stagger={0.2} className="w-full sm:w-auto">
              <div className="mt-7 sm:mt-8 flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  to="/medi"
                  onClick={() => triggerScenePulse()}
                  className="btn-primary-glow inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-on-primary hover:-translate-y-0.5 hover:bg-primary-fixed"
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Launch Medi</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    triggerScenePulse();
                    openDemoModal('Requested from Spatial Hero');
                  }}
                  className="glass-stage inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-on-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 cursor-pointer"
                >
                  <span>Request Demo</span>
                </button>
              </div>
            </SpatialItem3D>
          </div>

          {/* Right 6 Columns: Unobstructed Stage for 3D Volumetric Neural Brain */}
          <div className="hidden lg:block lg:col-span-6 min-h-[440px]" aria-hidden="true" />
        </div>

        {/* Minimal Centered Scroll Cue */}
        <a
          href="#mission"
          className="group mx-auto mt-6 flex flex-col items-center gap-2 text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="font-label-technical text-[10px] uppercase tracking-[0.22em] text-outline group-hover:text-primary">
            Scroll to explore the 3D experience
          </span>
          <span className="h-7 w-[1px] bg-gradient-to-b from-primary to-transparent" />
        </a>
      </SpatialSection3D>

      {/* CHAPTER 02 — PILLARS (Borderless Architectural Typography Opposite 3D DNA Helix) */}
      <SpatialSection3D
        id="mission"
        variant="swing-left"
        className="relative scroll-mt-20 flex min-h-0 lg:min-h-[80vh] items-center px-4 sm:px-6 md:px-margin-desktop py-14 sm:py-20"
      >
        <div
          className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:gap-12 lg:grid-cols-12"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="lg:col-span-5 space-y-6" style={{ transformStyle: 'preserve-3d' }}>
            <SpatialItem3D preset="left-lead" stagger={0} restZ={22} className="space-y-3">
              <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                01 / Smart Diagnosis For Doctors
              </span>
              <h2 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.08] tracking-tight text-on-surface">
                Technology that supports{' '}
                <span className="text-primary">Doctors.</span>
              </h2>
            </SpatialItem3D>

            <SpatialItem3D preset="cascade-item" stagger={0.08} restZ={16}>
              <p className="text-sm sm:text-base font-light leading-relaxed text-on-surface-variant">
                {SITE_CONFIG.heroSubheadline}
              </p>
            </SpatialItem3D>

            <div className="border-t editorial-rule" style={{ transformStyle: 'preserve-3d' }}>
              {SITE_CONFIG.corePillars.map((pillar, idx) => (
                <SpatialItem3D
                  key={pillar.index}
                  preset="cascade-item"
                  stagger={0.12 + idx * 0.05}
                  restZ={24}
                >
                  <div className="flex items-baseline gap-4 border-b editorial-rule py-3.5">
                    <span className="font-mono text-xs font-bold text-primary shrink-0">
                      {pillar.index}
                    </span>
                    <span className="text-sm sm:text-base font-semibold tracking-tight text-on-surface">
                      {pillar.title}
                    </span>
                  </div>
                </SpatialItem3D>
              ))}
            </div>

            <SpatialItem3D preset="cascade-item" stagger={0.34} restZ={14}>
              <p className="text-xs font-medium text-on-surface-variant">
                {SITE_CONFIG.privacyNote}
              </p>
            </SpatialItem3D>
          </div>

          {/* Right 7 columns intentionally open for the 3D DNA Helix */}
          <div className="hidden lg:block lg:col-span-7" aria-hidden="true" />
        </div>
      </SpatialSection3D>

      {/* CHAPTER 03 — ABOUT TECH CARE & COMPANY VIDEO */}
      <SpatialSection3D
        id="about"
        variant="split-converge"
        className="relative scroll-mt-20 flex min-h-0 lg:min-h-[80vh] items-center px-4 sm:px-6 md:px-margin-desktop py-14 sm:py-20"
      >
        <div
          className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:gap-14 lg:grid-cols-12"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Left 6 Columns: Open Borderless About Copy + UN SDGs 3 · 9 · 17 */}
          <div className="lg:col-span-6 space-y-6" style={{ transformStyle: 'preserve-3d' }}>
            <SpatialItem3D preset="left-lead" stagger={0} restZ={20} className="space-y-2.5">
              <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                02 / About Tech Care
              </span>
              <h2 className="font-headline-xl text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
                About Tech Care
              </h2>
            </SpatialItem3D>

            <div className="space-y-3" style={{ transformStyle: 'preserve-3d' }}>
              {SITE_CONFIG.aboutPoints.map((point, idx) => (
                <SpatialItem3D key={point} preset="cascade-item" stagger={0.08 + idx * 0.05} restZ={20}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs sm:text-sm leading-relaxed text-on-surface-variant">{point}</p>
                  </div>
                </SpatialItem3D>
              ))}
            </div>

            <SpatialItem3D preset="depth-pop" stagger={0.22} restZ={24}>
              <div className="space-y-2.5 border-t editorial-rule pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
                    UN Sustainable Development Goals
                  </span>
                  <span className="font-mono text-[11px] font-bold text-primary">
                    UN SDGs 3 · 9 · 17
                  </span>
                </div>
                <div className="border-t editorial-rule">
                  {SITE_CONFIG.sdgs.map((sdg) => (
                    <div
                      key={sdg.goal}
                      className="flex flex-wrap items-baseline gap-2.5 border-b editorial-rule py-2 text-xs"
                    >
                      <span className="font-mono font-bold text-primary shrink-0">{sdg.goal}</span>
                      <span className="font-semibold text-on-surface">{sdg.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SpatialItem3D>
          </div>

          {/* Right 6 Columns: Minimal Architectural Video Viewport */}
          <div className="lg:col-span-6" style={{ transformStyle: 'preserve-3d' }}>
            <SpatialItem3D preset="right-lead" stagger={0.12} restZ={24}>
              <div className="editorial-frame editorial-bracket p-3 sm:p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    <span>{SITE_CONFIG.companyVideo.title}</span>
                  </div>
                  <a
                    href={SITE_CONFIG.companyVideo.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="relative aspect-video w-full overflow-hidden border editorial-rule bg-black">
                  <iframe
                    src={SITE_CONFIG.companyVideo.embedUrl}
                    title={SITE_CONFIG.companyVideo.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            </SpatialItem3D>
          </div>
        </div>
      </SpatialSection3D>

      {/* CHAPTER 04 — MEET MEDI (Borderless Right Editorial Column Opposite 3D ECG Wave) */}
      <SpatialSection3D
        id="medi-preview"
        variant="swing-right"
        className="relative scroll-mt-20 flex min-h-0 lg:min-h-[80vh] items-center px-4 sm:px-6 md:px-margin-desktop py-14 sm:py-20"
      >
        <div
          className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:gap-12 lg:grid-cols-12"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Left 7 columns intentionally open for the 3D Neural ECG Wave */}
          <div className="hidden lg:block lg:col-span-7" aria-hidden="true" />

          <div className="lg:col-span-5 space-y-6" style={{ transformStyle: 'preserve-3d' }}>
            <SpatialItem3D preset="right-lead" stagger={0} restZ={18}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b editorial-rule pb-3">
                <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                  03 / Meet Medi
                </span>
                <div className="flex items-center gap-4">
                  {(['en', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setMediSampleLang(lang);
                        triggerScenePulse();
                      }}
                      className={`border-b-2 pb-1 text-xs font-semibold transition-colors cursor-pointer ${
                        mediSampleLang === lang
                          ? 'border-primary text-primary'
                          : 'border-transparent text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {MEDI_DEMO_SNIPPETS[lang].label}
                    </button>
                  ))}
                </div>
              </div>
            </SpatialItem3D>

            <SpatialItem3D preset="right-lead" stagger={0.08} restZ={20}>
              <div className="space-y-2.5">
                <h2 className="font-headline-lg text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
                  Medi — The Physician&apos;s Personal Clinical Assistant
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Bilingual clinical reasoning in English or Arabic. No patient data is stored — sessions stay local.
                </p>
              </div>
            </SpatialItem3D>

            <SpatialItem3D preset="depth-pop" stagger={0.16} restZ={28}>
              <div
                key={mediSample.id}
                dir={mediSample.id === 'ar' ? 'rtl' : 'ltr'}
                className="animate-3d-card-swap border-s-2 border-primary ps-4 py-1 space-y-2.5"
              >
                <p className="text-xs font-medium text-on-surface">{mediSample.query}</p>
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    {mediSample.diagnosisHeadline}
                  </span>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    {mediSample.summary}
                  </p>
                </div>
                <span className="inline-block text-[10px] font-mono text-secondary">
                  {mediSample.vitalsTag}
                </span>
              </div>
            </SpatialItem3D>

            <SpatialItem3D preset="cascade-item" stagger={0.24} restZ={34}>
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <Link
                  to="/medi"
                  onClick={() => triggerScenePulse()}
                  className="btn-primary-glow inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-on-primary hover:-translate-y-0.5 hover:bg-primary-fixed"
                >
                  <span>Open Medi</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/mada" className="text-xs font-semibold text-on-surface-variant hover:text-primary">
                  Explore Mada →
                </Link>
              </div>
            </SpatialItem3D>
          </div>
        </div>
      </SpatialSection3D>

      {/* CHAPTER 05 — 10 REAL PARTNERS */}
      <PartnerMarquee />

      {/* CHAPTER 06 — CONTACT */}
      <ContactSection />
    </div>
  );
}
