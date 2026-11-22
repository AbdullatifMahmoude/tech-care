import { useEffect, useState, type FormEvent } from 'react';
import { CalendarCheck2, CheckCircle2, X } from 'lucide-react';
import { useScene } from '../../context/SceneContext';
import { requestDemo } from '../../services/contactService';

export function DemoRequestModal() {
  const { demoModalOpen, closeDemoModal, demoContextNote } = useScene();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Doctor / Clinic Lead');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ referenceId: string; message: string } | null>(null);

  useEffect(() => {
    setNotes(demoContextNote);
  }, [demoContextNote]);

  useEffect(() => {
    if (!demoModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDemoModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [demoModalOpen, closeDemoModal]);

  if (!demoModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await requestDemo({ fullName, email, organization, role, notes });
      setReceipt({ referenceId: res.referenceId, message: res.message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setReceipt(null);
    setFullName('');
    setEmail('');
    setOrganization('');
    setNotes('');
    closeDemoModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
      <div className="modal-backdrop fixed inset-0 backdrop-blur-xl" onClick={resetAndClose} />
      <div className="modal-surface relative z-10 max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 sm:p-8 backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h3 id="demo-modal-title" className="font-headline-sm text-xl font-bold text-on-surface">
                Request a Clinical Demo
              </h3>
              <p className="text-xs text-on-surface-variant">
                Schedule a guided walkthrough of Medi, Mada, and TechCare AI Core.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close demo request modal"
            className="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {receipt ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <h4 className="mt-3 font-headline-sm text-lg font-bold text-on-surface">Demo Request Scheduled</h4>
            <p className="mt-2 text-sm text-on-surface-variant">{receipt.message}</p>
            <p className="mt-2 font-mono text-xs text-primary">Ref: {receipt.referenceId}</p>
            <button
              type="button"
              onClick={resetAndClose}
              className="mt-5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-on-primary cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="demo-full-name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
                Full Name *
              </label>
              <input
                id="demo-full-name"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Ahmed Hassan"
                className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="demo-work-email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
                  Work Email *
                </label>
                <input
                  id="demo-work-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="demo-org" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
                  Clinic / Institution *
                </label>
                <input
                  id="demo-org"
                  name="organization"
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Alexandria Medical Center"
                  className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="demo-role" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
                Role
              </label>
              <select
                id="demo-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="Doctor / Clinic Lead">Doctor / Clinic Lead</option>
                <option value="Hospital IT / Operations">Hospital IT / Operations</option>
                <option value="Medical Student / Researcher">Medical Student / Researcher</option>
                <option value="Ecosystem Partner">Ecosystem Partner</option>
              </select>
            </div>

            <div>
              <label htmlFor="demo-notes" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
                Focus Area
              </label>
              <textarea
                id="demo-notes"
                name="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Medi assistant, AI diagnostic core, or clinic onboarding..."
                className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-glow w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:bg-primary-fixed disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Booking Walkthrough...' : 'Confirm Briefing Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
