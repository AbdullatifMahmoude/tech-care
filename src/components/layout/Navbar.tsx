import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import { NAV_LINKS } from '../../data/siteConfig';
import { useScene } from '../../context/SceneContext';

export function Navbar() {
  const { theme, toggleTheme, openDemoModal, openAuthModal, session, logout } = useScene();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname, hash } = useLocation();

  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 border-b border-outline-variant/25 bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 md:px-margin-desktop">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group" onClick={() => setMobileOpen(false)}>
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white p-0.5 ring-1 ring-primary/40 shadow-[0_2px_12px_rgba(0,125,117,0.18)]">
            <img
              src="/assets/techcare-logo.png"
              alt="Tech Care Logo"
              className="h-full w-full rounded-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-headline-sm text-base sm:text-lg font-bold tracking-tight text-on-surface uppercase">
              Tech<span className="text-primary">Care</span>
            </span>
            <span className="relative flex h-2 w-2 shrink-0" title="Clinical Telemetry Online">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Main Navigation">
          {NAV_LINKS.map((link) =>
            link.isHash ? (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-wide transition-colors ${
                  pathname === '/' && hash === `#${link.path.split('#')[1]}`
                    ? 'font-bold text-primary'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => {
                  if (link.path === '/' && pathname === '/' && !hash) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors ${
                    isActive && !hash
                      ? 'font-bold text-primary'
                      : 'font-medium text-on-surface-variant hover:text-on-surface'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low/80 text-on-surface-variant transition-colors hover:border-primary/60 hover:text-on-surface cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {session ? (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-on-surface">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[120px] truncate">{session.name}</span>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                title="Sign out"
                className="text-on-surface-variant hover:text-error cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="hidden sm:inline-flex whitespace-nowrap shrink-0 items-center gap-1.5 rounded-full border border-outline-variant/50 px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/60 hover:text-on-surface cursor-pointer"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign in</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => openDemoModal()}
            className="btn-primary-glow inline-flex whitespace-nowrap shrink-0 items-center justify-center rounded-full bg-primary px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold tracking-wide text-on-primary hover:bg-primary-fixed cursor-pointer"
          >
            Request Demo
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low/80 text-on-surface cursor-pointer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-outline-variant/25 bg-surface-container-lowest/95 px-4 sm:px-6 py-5 backdrop-blur-2xl">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) =>
              link.isHash ? (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                    pathname === '/' && hash === `#${link.path.split('#')[1]}`
                      ? 'bg-primary/15 font-bold text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm transition-colors ${
                      isActive && !hash
                        ? 'bg-primary/15 font-bold text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-outline-variant/25 pt-3">
              {session ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex-1 rounded-full border border-outline-variant/50 py-2 text-xs font-semibold text-on-surface cursor-pointer"
                >
                  Sign out ({session.name})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal();
                  }}
                  className="flex-1 rounded-full border border-outline-variant/50 py-2 text-xs font-semibold text-on-surface cursor-pointer"
                >
                  Sign in
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openDemoModal();
                }}
                className="btn-primary-glow flex-1 rounded-full bg-primary py-2 text-xs font-bold text-on-primary hover:bg-primary-fixed cursor-pointer"
              >
                Request Demo
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
