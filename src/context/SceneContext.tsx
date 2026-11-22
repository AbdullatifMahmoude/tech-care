import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SceneId, ThemeMode, UserSession } from '../types/techcare';
import { getStoredSession, signInDemoAccount, signOutAccount } from '../services/authService';

interface SceneContextValue {
  activeScene: SceneId;
  setRouteScene: (scene: SceneId) => void;
  pulseToken: number;
  triggerScenePulse: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  demoModalOpen: boolean;
  openDemoModal: (contextNote?: string) => void;
  closeDemoModal: () => void;
  demoContextNote: string;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  session: UserSession | null;
  loginDemo: (input: { name: string; email: string; role: UserSession['role'] }) => void;
  logout: () => void;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [activeScene, setActiveScene] = useState<SceneId>('neural-mesh');
  const [pulseToken, setPulseToken] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoContextNote, setDemoContextNote] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.add('dark');
    }
  }, [theme]);

  const setRouteScene = (scene: SceneId) => setActiveScene(scene);
  const triggerScenePulse = () => setPulseToken((n) => n + 1);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const openDemoModal = (note = '') => {
    setDemoContextNote(note);
    setDemoModalOpen(true);
  };

  const closeDemoModal = () => setDemoModalOpen(false);
  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  const loginDemo = (input: { name: string; email: string; role: UserSession['role'] }) => {
    const next = signInDemoAccount(input);
    setSession(next);
    setAuthModalOpen(false);
  };

  const logout = () => {
    signOutAccount();
    setSession(null);
  };

  return (
    <SceneContext.Provider
      value={{
        activeScene,
        setRouteScene,
        pulseToken,
        triggerScenePulse,
        theme,
        toggleTheme,
        demoModalOpen,
        openDemoModal,
        closeDemoModal,
        demoContextNote,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        session,
        loginDemo,
        logout,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) {
    throw new Error('useScene must be used inside SceneProvider');
  }
  return ctx;
}
