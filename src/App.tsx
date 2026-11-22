import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SceneProvider, useScene } from './context/SceneContext';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { ThreeBackdrop } from './components/three/ThreeBackdrop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoRequestModal } from './components/modals/DemoRequestModal';
import { AuthModal } from './components/modals/AuthModal';

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

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-surface-container-low/80 px-5 py-2.5 text-xs font-semibold text-primary backdrop-blur-md">
        <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
        <span>Loading Clinical Module...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SceneProvider>
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
