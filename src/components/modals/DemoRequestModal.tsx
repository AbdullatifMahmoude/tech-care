import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  GraduationCap,
  Handshake,
  Mail,
  Server,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useScene } from '../../context/SceneContext';
import { requestDemo } from '../../services/contactService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = [
  { label: 'Doctor / Clinic Lead', sub: 'Clinical practice', Icon: Stethoscope },
  { label: 'Hospital IT / Operations', sub: 'Cloud & EHR ops', Icon: Server },
  { label: 'Medical Student / Researcher', sub: 'Study & cases', Icon: GraduationCap },
  { label: 'Ecosystem Partner', sub: 'Institutions', Icon: Handshake },
] as const;

const FOCUS_TOPICS = ['Medi AI', 'Mada Learning', 'Clinic Integration'] as const;

export function DemoRequestModal() {
  const { demoModalOpen, closeDemoModal, demoContextNote } = useScene();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<string>('Doctor / Clinic Lead');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ referenceId: string; message: string } | null>(null);

  useEffect(() => {
    setNotes(demoContextNote);
  }, [demoContextNote]);

  useEffect(() => {
    if (!demoModalOpen) return;
    setError('');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDemoModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [demoModalOpen, closeDemoModal]);

  if (!demoModalOpen) return null;

  const toggleTopic = (topic: string) => {
    setNotes((prev) => {
      const current = prev.trim();
      if (!current) return topic;
      const parts = current.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.includes(topic)) {
        return parts.filter((p) => p !== topic).join(', ');
      }
      return [...parts, topic].join(', ');
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedOrg = organization.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!trimmedOrg) {
      setError('Please enter your clinic or institution name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestDemo({
        fullName: trimmedName,
        email: trimmedEmail,
        organization: trimmedOrg,
        role,
        notes: notes.trim(),
      });
      setReceipt({ referenceId: res.referenceId, message: res.message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setReceipt(null);
    setError('');
    setFullName('');
    setEmail('');
    setOrganization('');
    setNotes('');
    closeDemoModal();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      data-lenis-prevent
    >
      <div className="modal-backdrop fixed inset-0 backdrop-blur-xl" onClick={resetAndClose} />

      <div className="auth-modern-card relative z-10 flex max-h-[90svh] w-full max-w-[520px] flex-col overflow-hidden rounded-[22px]">
        {/* Fixed Header */}
        <div className="auth-modern-header shrink-0 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}assets/techcare-logo.png`}
              alt="Tech Care"
              className="h-8 w-8 rounded-xl bg-white object-contain p-0.5 ring-1 ring-primary/35 shadow-sm"
            />
            <span className="font-headline-sm text-sm font-bold tracking-tight text-on-surface uppercase">
              Tech<span className="text-primary">Care</span>
            </span>
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Clinical Briefing
            </span>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close demo request modal"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dedicated Scrollable Body */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-5"
        >
          <div>
            <h3 id="demo-modal-title" className="font-headline-md text-xl font-bold tracking-tight text-on-surface">
              Request a Clinical Demo
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              Schedule a guided walkthrough of Medi, Mada, and TechCare AI Core.
            </p>
          </div>

          {receipt ? (
            <div className="mt-5 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-success">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="mt-3 font-headline-sm text-lg font-bold text-on-surface">Demo Request Scheduled</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">{receipt.message}</p>
              <p className="mt-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                Ref: {receipt.referenceId}
              </p>
              <button
                type="button"
                onClick={resetAndClose}
                className="auth-modern-cta mt-5 w-full rounded-[10px] px-5 py-2.5 text-sm font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-error/35 bg-error-container/25 px-3.5 py-2.5 text-xs font-medium text-error"
                >
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="demo-full-name" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                  Full Name *
                </label>
                <div className="auth-modern-field">
                  <User className="h-4 w-4 shrink-0" />
                  <input
                    id="demo-full-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Ahmed Hassan"
                    className="auth-modern-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="demo-work-email" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                    Work Email *
                  </label>
                  <div className="auth-modern-field">
                    <Mail className="h-4 w-4 shrink-0" />
                    <input
                      id="demo-work-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@hospital.org"
                      className="auth-modern-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="demo-org" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                    Clinic / Institution *
                  </label>
                  <div className="auth-modern-field">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <input
                      id="demo-org"
                      name="organization"
                      type="text"
                      autoComplete="organization"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Alexandria Medical Center"
                      className="auth-modern-input"
                    />
                  </div>
                </div>
              </div>

              {/* Role Cards */}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">Role</span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Role">
                  {ROLE_OPTIONS.map(({ label, sub, Icon }) => {
                    const active = role === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-label={label}
                        aria-pressed={active}
                        data-active={active ? 'true' : 'false'}
                        onClick={() => setRole(label)}
                        className="auth-modern-role-card"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-on-surface">{label}</span>
                          <span className="block truncate text-[11px] text-on-surface-variant">{sub}</span>
                        </div>
                        {active && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus Area + Quick Chips */}
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="demo-notes" className="text-xs font-medium text-on-surface-variant">
                    Focus Area
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {FOCUS_TOPICS.map((topic) => {
                      const active = notes.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                            active
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/45 hover:text-on-surface'
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  id="demo-notes"
                  name="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Medi assistant, AI diagnostic core, or clinic onboarding..."
                  className="auth-modern-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="auth-modern-cta group inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                <span>{submitting ? 'Booking Walkthrough...' : 'Confirm Briefing Request'}</span>
                {!submitting && (
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          )}
        </div>

        {/* Fixed Grounded Footer */}
        <div className="auth-modern-footer shrink-0 px-6 py-3">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-outline">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary/85" />
            <span>Direct clinical team response · Zero patient data required</span>
          </p>
        </div>
      </div>
    </div>
  );
}
