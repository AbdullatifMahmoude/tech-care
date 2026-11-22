import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ExternalLink, PlayCircle, Sparkles, Stethoscope } from 'lucide-react';
import { useScene } from '../context/SceneContext';
import { SITE_CONFIG } from '../data/siteConfig';
import { CLINICAL_SYSTEM_PILLS, MEDI_DEMO_SNIPPETS } from '../data/platformContent';
import { PartnerMarquee } from '../components/partners/PartnerMarquee';
import { ContactSection } from '../components/contact/ContactSection';
import { SpatialItem3D, SpatialSection3D, TiltCard3D } from '../components/motion/Spatial3D';

const CHAPTERS = [
  { id: 'core', index: '01', label: 'Core' },
  { id: 'mission', index: '02', label: 'Vision' },
  { id: 'about', index: '03', label: 'About' },
  { id: 'medi-preview', index: '04', label: 'Medi' },
  { id: 'systems', index: '05', label: 'Systems' },
  { id: 'partners', index: '06', label: 'Partners' },
  { id: 'contact', index: '07', label: 'Connect' },
];

export default function LandingPage() {
  const { setRouteScene, triggerScenePulse, openDemoModal } = useScene();
  const [activeChapter, setActiveChapter] = useState('core');
  const [mediSampleLang, setMediSampleLang] = useState<'en' | 'ar'>('en');
  const [activeSystemId, setActiveSystemId] = useState(CLINICAL_SYSTEM_PILLS[0].id);

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
  const activeSystem =
    CLINICAL_SYSTEM_PILLS.find((s) => s.id === activeSystemId) ?? CLINICAL_SYSTEM_PILLS[0];
  const pillMid = Math.floor(CLINICAL_SYSTEM_PILLS.length / 2);

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

      {/* CHAPTER 01 — HERO (Staggered Multi-Layer 3D Copy + Right Volumetric Neural Brain) */}
      <SpatialSection3D
        id="core"
        variant="hero"
        className="relative scroll-mt-20 flex min-h-[calc(100svh-4rem)] flex-col justify-between px-4 sm:px-6 md:px-margin-desktop py-8 sm:py-12"
        stageClassName="w-full flex-1 flex flex-col justify-between"
      >
        <div className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:gap-10 lg:grid-cols-12">
          {/* Left 6 Columns: Multi-Element Staggered 3D Typography */}
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
                  <span>Launch Medi AI</span>
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

      {/* CHAPTER 02 — VISION (Choreographed Staggered Cascade Inside 3D Tilt Card) */}
      <SpatialSection3D
        id="mission"
        variant="swing-left"
        className="relative scroll-mt-20 flex min-h-0 lg:min-h-[82vh] items-center px-4 sm:px-6 md:px-margin-desktop py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <TiltCard3D className="glass-stage-3d rounded-3xl p-5 sm:p-8 lg:p-10 space-y-6">
              <SpatialItem3D preset="left-lead" stagger={0} restZ={20} className="space-y-4">
                <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                  01 / Vision
                </span>
                <h2 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight text-on-surface">
                  Unify clinical data and AI into{' '}
                  <span className="text-primary">one intelligent system.</span>
                </h2>
              </SpatialItem3D>

              <SpatialItem3D preset="cascade-item" stagger={0.08} restZ={16}>
                <p className="text-sm sm:text-base font-light leading-relaxed text-on-surface-variant">
                  {SITE_CONFIG.heroSubheadline}
                </p>
              </SpatialItem3D>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-outline-variant/45 pt-6"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {SITE_CONFIG.corePillars.map((pillar, idx) => (
                  <SpatialItem3D
                    key={pillar.index}
                    preset="cascade-item"
                    stagger={0.14 + idx * 0.05}
                    restZ={28}
                  >
                    <div className="flex h-full items-start gap-3 rounded-2xl border border-outline-variant/35 bg-surface-container-lowest/55 p-3.5">
                      <span className="font-mono text-xs font-bold text-primary pt-0.5 shrink-0">
                        {pillar.index}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-on-surface">{pillar.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                          {pillar.detail}
                        </p>
                      </div>
                    </div>
                  </SpatialItem3D>
                ))}
              </div>
            </TiltCard3D>
          </div>

          {/* Right 6 columns intentionally open for the 3D DNA Helix */}
          <div className="hidden lg:block lg:col-span-6" aria-hidden="true" />
        </div>
      </SpatialSection3D>

      {/* CHAPTER 03 — ABOUT TECH CARE & COMPANY VIDEO */}
      <SpatialSection3D
        id="about"
        variant="split-converge"
        className="relative scroll-mt-20 flex min-h-0 lg:min-h-[84vh] items-center px-4 sm:px-6 md:px-margin-desktop py-12 sm:py-16 lg:py-20"
      >
        <div
          className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:gap-10 lg:grid-cols-12"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Left 6 Columns: Authentic About Statements & UN SDGs 3, 9, 17 */}
          <div className="lg:col-span-6">
            <TiltCard3D maxTilt={4} className="glass-stage-3d rounded-3xl p-5 sm:p-8 space-y-5">
              <SpatialItem3D preset="left-lead" stagger={0} restZ={18} className="space-y-3">
                <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                  02 / About Tech Care
                </span>
                <h2 className="font-headline-xl text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
                  About Tech Care
                </h2>
              </SpatialItem3D>

              <div className="space-y-3" style={{ transformStyle: 'preserve-3d' }}>
                {SITE_CONFIG.aboutPoints.map((point, idx) => (
                  <SpatialItem3D key={point} preset="cascade-item" stagger={0.08 + idx * 0.06} restZ={22}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <p className="text-xs sm:text-sm leading-relaxed text-on-surface-variant">{point}</p>
                    </div>
                  </SpatialItem3D>
                ))}
              </div>

              <SpatialItem3D preset="depth-pop" stagger={0.22} restZ={28}>
                <div className="space-y-3 border-t border-outline-variant/45 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
                      UN Sustainable Development Goals
                    </span>
                    <span className="font-mono text-[11px] font-bold text-primary">
                      UN SDGs 3 · 9 · 17
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SITE_CONFIG.sdgs.map((sdg) => (
                      <div
                        key={sdg.goal}
                        className="rounded-2xl border border-outline-variant/45 bg-surface-container-lowest/80 p-3"
                      >
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                          {sdg.goal}
                        </span>
                        <h3 className="mt-1 text-xs font-bold leading-snug text-on-surface">
                          {sdg.title}
                        </h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
                          {sdg.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </SpatialItem3D>
            </TiltCard3D>
          </div>

          {/* Right 6 Columns: Tech Care YouTube Company Video */}
          <div className="lg:col-span-6">
            <SpatialItem3D preset="right-lead" stagger={0.12} restZ={24}>
              <TiltCard3D maxTilt={3.5} className="glass-stage-3d rounded-3xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
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

                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-outline-variant/45 bg-black shadow-lg">
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
              </TiltCard3D>
            </SpatialItem3D>
          </div>
        </div>
      </SpatialSection3D>

      {/* CHAPTER 04 — MEET MEDI (Multi-Layer Staggered Right Card + Bilingual 3D Flip) */}
      <SpatialSection3D
        id="medi-preview"
        variant="swing-right"
        className="relative scroll-mt-20 flex min-h-0 lg:min-h-[82vh] items-center px-4 sm:px-6 md:px-margin-desktop py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:gap-12 lg:grid-cols-12">
          {/* Left 6 columns intentionally open for the 3D Neural Heartbeat Wave */}
          <div className="hidden lg:block lg:col-span-6" aria-hidden="true" />

          <div className="lg:col-span-6">
            <TiltCard3D className="glass-stage-3d rounded-3xl p-5 sm:p-8 lg:p-9 space-y-6">
              <SpatialItem3D preset="right-lead" stagger={0} restZ={18}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                    03 / Meet Medi
                  </span>
                  <div className="inline-flex rounded-full border border-outline-variant/50 bg-surface-container-high/65 p-1">
                    {(['en', 'ar'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setMediSampleLang(lang);
                          triggerScenePulse();
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                          mediSampleLang === lang
                            ? 'bg-primary text-on-primary'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {MEDI_DEMO_SNIPPETS[lang].label}
                      </button>
                    ))}
                  </div>
                </div>
              </SpatialItem3D>

              <SpatialItem3D preset="right-lead" stagger={0.08} restZ={20}>
                <div>
                  <h2 className="font-headline-lg text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
                    The physician&apos;s clinical copilot.
                  </h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Send symptoms, vitals, or labs in English or Arabic — receive structured clinical reasoning and printable PDF plans.
                  </p>
                </div>
              </SpatialItem3D>

              <SpatialItem3D preset="depth-pop" stagger={0.16} restZ={30}>
                <div
                  key={mediSample.id}
                  dir={mediSample.id === 'ar' ? 'rtl' : 'ltr'}
                  className="animate-3d-card-swap space-y-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest/90 p-5"
                >
                  <p className="text-xs font-medium text-on-surface">{mediSample.query}</p>
                  <div className="border-t border-outline-variant/40 pt-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      {mediSample.diagnosisHeadline}
                    </span>
                    <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                      {mediSample.summary}
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-mono text-secondary">
                    {mediSample.vitalsTag}
                  </span>
                </div>
              </SpatialItem3D>

              <SpatialItem3D preset="cascade-item" stagger={0.24} restZ={40}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <Link
                    to="/medi"
                    onClick={() => triggerScenePulse()}
                    className="btn-primary-glow inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-on-primary hover:-translate-y-0.5 hover:bg-primary-fixed"
                  >
                    <span>Open Medi Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/mada" className="text-xs font-semibold text-on-surface-variant hover:text-primary">
                    Explore Mada →
                  </Link>
                </div>
              </SpatialItem3D>
            </TiltCard3D>
          </div>
        </div>
      </SpatialSection3D>

      {/* CHAPTER 05 — SYSTEMS & DIGITAL TWIN (3D Fanning Holographic Pill Wave + Caption Deck) */}
      <SpatialSection3D
        id="systems"
        variant="horizon-rise"
        className="relative scroll-mt-20 flex min-h-0 lg:min-h-[74vh] items-center px-4 sm:px-6 md:px-margin-desktop py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center" style={{ transformStyle: 'preserve-3d' }}>
          <SpatialItem3D preset="horizon-title" stagger={0}>
            <span className="font-label-technical text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              04 / Clinical Infrastructure
            </span>
            <h2 className="mt-3 font-headline-xl text-3xl sm:text-5xl font-semibold tracking-tight text-on-surface">
              Seamless with your clinic &amp; hospital stack.
            </h2>
          </SpatialItem3D>

          {/* Fanning Interactive Pill Wave */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3" style={{ transformStyle: 'preserve-3d' }}>
            {CLINICAL_SYSTEM_PILLS.map((sys, idx) => {
              const active = sys.id === activeSystem.id;
              return (
                <SpatialItem3D
                  key={sys.id}
                  preset="pill-wave"
                  stagger={0.06 + idx * 0.028}
                  indexOffset={idx - pillMid}
                >
                  <button
                    type="button"
                    onMouseEnter={() => {
                      setActiveSystemId(sys.id);
                      triggerScenePulse();
                    }}
                    onClick={() => {
                      setActiveSystemId(sys.id);
                      triggerScenePulse();
                    }}
                    className={`rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold tracking-wide transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
                      active
                        ? 'btn-primary-glow bg-primary text-on-primary'
                        : 'glass-stage text-on-surface-variant hover:border-primary/50 hover:text-on-surface'
                    }`}
                  >
                    {sys.label}
                  </button>
                </SpatialItem3D>
              );
            })}
          </div>

          {/* 3D Depth-Pop Caption Card with Animated Swap */}
          <SpatialItem3D preset="depth-pop" stagger={0.24} className="mt-8 w-full max-w-2xl">
            <TiltCard3D maxTilt={6} className="glass-stage-3d rounded-2xl px-6 py-5">
              <div key={activeSystem.id} className="animate-3d-card-swap depth-layer-1">
                <div className="mb-1 flex items-center justify-center gap-2 text-xs font-bold text-primary">
                  <span>{activeSystem.label}</span>
                  <span className="text-outline">·</span>
                  <span className="font-mono text-secondary">{activeSystem.tag}</span>
                </div>
                <p className="text-sm text-on-surface-variant">{activeSystem.caption}</p>
              </div>
            </TiltCard3D>
          </SpatialItem3D>
        </div>
      </SpatialSection3D>

      {/* CHAPTER 05 — 10 REAL PARTNERS */}
      <PartnerMarquee />

      {/* CHAPTER 06 — CONNECT */}
      <ContactSection />
    </div>
  );
}
