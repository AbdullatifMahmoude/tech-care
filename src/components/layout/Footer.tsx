import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SITE_CONFIG } from '../../data/siteConfig';
import { subscribeNewsletter } from '../../services/contactService';

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState('');

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribing(true);
    try {
      const res = await subscribeNewsletter({ email: newsletterEmail });
      setSubscribedMsg(res.message);
      setNewsletterEmail('');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="no-print relative z-10 w-full border-t border-outline-variant/25 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:gap-10 px-4 sm:px-6 md:px-margin-desktop py-10 sm:py-12">
        {/* Compact Newsletter Strip */}
        <div className="glass-stage flex flex-col justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-headline-sm text-base font-bold text-on-surface">
              {SITE_CONFIG.newsletterCopy.heading}
            </p>
            <p className="text-xs text-on-surface-variant">
              {SITE_CONFIG.newsletterCopy.description}
            </p>
          </div>

          {subscribedMsg ? (
            <div className="inline-flex items-center gap-2 text-xs font-medium text-success">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>{subscribedMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full sm:max-w-sm flex-col sm:flex-row gap-2">
              <input
                id="newsletter-email"
                name="newsletterEmail"
                type="email"
                autoComplete="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Email for updates"
                aria-label="Newsletter email address"
                className="flex-1 rounded-full border border-outline-variant/50 bg-surface-container-lowest/75 px-4 py-2 text-xs text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary-fixed cursor-pointer"
              >
                <span>{subscribing ? '...' : 'Subscribe'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Minimal Footer Row */}
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <img
                src="/assets/techcare-logo.png"
                alt="Tech Care Logo"
                className="h-8 w-8 rounded-full bg-white p-0.5 object-contain"
              />
              <div>
                <span className="font-headline-sm text-sm font-bold text-on-surface uppercase">
                  Tech<span className="text-primary">Care</span>
                </span>
                <span className="ml-2 text-xs text-on-surface-variant">{SITE_CONFIG.location}</span>
              </div>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-on-surface-variant">
              {SITE_CONFIG.footerTagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-on-surface-variant sm:pt-1">
            <Link to="/#mission" className="hover:text-primary">Vision</Link>
            <Link to="/#about" className="hover:text-primary">About Us</Link>
            <Link to="/medi" className="hover:text-primary">Medi</Link>
            <Link to="/mada" className="hover:text-primary">Mada</Link>
            <Link to="/#partners" className="hover:text-primary">Partners</Link>
            {SITE_CONFIG.socials.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-outline-variant/25 pt-5 text-center sm:text-left text-xs text-outline sm:flex-row">
          <span>{SITE_CONFIG.copyright}</span>
          <span>{SITE_CONFIG.email} · {SITE_CONFIG.phone}</span>
        </div>
      </div>
    </footer>
  );
}
