import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SceneProvider, useScene } from './context/SceneContext';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { ThreeBackdrop } from './components/three/ThreeBackdrop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoRequestModal } from './components/modals/DemoRequestModal';
import { AuthModal } from './components/modals/AuthModal';
import { TechCareLoader } from './components/ui/TechCareLoader';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const MediWorkspacePage = lazy(() => import('./pages/MediWorkspacePage'));
const MadaPage = lazy(() => import('./pages/MadaPage'));

function ScrollHandler() {
  const { pathname, hash } = useLocation();
  useSmoothScroll();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, hash]);

  return null;
}

function AuthRouteRedirect() {
  const { openAuthModal } = useScene();
  useEffect(() => {
    openAuthModal();
  }, [openAuthModal]);
  return <Navigate to="/" replace />;
}

function InitialPreloader() {
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const holdMs = prefersReducedMotion ? 250 : 950;
    const fadeTimer = window.setTimeout(() => setFading(true), holdMs);
    const hideTimer = window.setTimeout(() => setVisible(false), holdMs + 320);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background/95 px-4 backdrop-blur-2xl transition-opacity duration-300 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <TechCareLoader size="lg" label="AI-Powered Healthcare Intelligence" />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <TechCareLoader size="md" label="Loading Clinical Module..." />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SceneProvider>
        <InitialPreloader />
        <ScrollHandler />
        <div className="relative flex min-h-screen flex-col bg-background text-on-surface">
          <ThreeBackdrop />
          <Navbar />

          <main className="relative z-10 flex-1 pt-16">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/medi" element={<MediWorkspacePage />} />
                <Route path="/mada" element={<MadaPage />} />
                <Route path="/auth" element={<AuthRouteRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
          <DemoRequestModal />
          <AuthModal />
        </div>
      </SceneProvider>
    </BrowserRouter>
  );
}
