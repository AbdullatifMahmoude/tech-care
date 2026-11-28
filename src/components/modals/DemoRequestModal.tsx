import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useScene } from '../../context/SceneContext';
import { requestDemo } from '../../services/contactService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = ['Doctor', 'Hospital IT', 'Student', 'Partner'] as const;

export function DemoRequestModal() {
  const { demoModalOpen, closeDemoModal, demoContextNote } = useScene();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<string>('Doctor');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ referenceId: string } | null>(null);

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
      setReceipt({ referenceId: res.referenceId });
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

      <div className="auth-modern-card relative z-10 flex max-h-[90svh] w-full max-w-[440px] flex-col overflow-hidden rounded-[20px]">
        <div className="auth-modern-header shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h3 id="demo-modal-title" className="font-headline-md text-lg font-bold tracking-tight text-on-surface">
            Request a Clinical Demo
          </h3>

          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close demo request modal"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-5"
        >
          {receipt ? (
            <div className="py-3 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="mt-3 font-headline-sm text-base font-bold text-on-surface">Demo Request Scheduled</h4>
              <p className="mt-2.5 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
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
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                  Full Name
                </label>
                <div className="auth-modern-field">
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
                    Work Email
                  </label>
                  <div className="auth-modern-field">
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
                    Clinic / Institution
                  </label>
                  <div className="auth-modern-field">
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

              <div>
                <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">Role</span>
                <div className="auth-modern-track grid grid-cols-2 gap-1 rounded-[10px] p-1" role="group" aria-label="Role">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={role === option}
                      data-active={role === option ? 'true' : 'false'}
                      onClick={() => setRole(option)}
                      className="auth-modern-seg-btn"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="demo-notes" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                  Notes
                </label>
                <textarea
                  id="demo-notes"
                  name="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional details..."
                  className="auth-modern-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="auth-modern-cta w-full rounded-[10px] px-5 py-2.5 text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Sending...' : 'Request Demo'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
