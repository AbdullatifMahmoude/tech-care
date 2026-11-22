import { useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useScene } from '../../context/SceneContext';
import type { UserSession } from '../../types/techcare';

export function AuthModal() {
  const { authModalOpen, closeAuthModal, loginDemo } = useScene();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserSession['role']>('Doctor');

  useEffect(() => {
    if (!authModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    loginDemo({ name, email, role });
    setName('');
    setEmail('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="modal-backdrop fixed inset-0 backdrop-blur-xl" onClick={closeAuthModal} />
      <div className="modal-surface relative z-10 max-h-[90svh] w-full max-w-md overflow-y-auto rounded-3xl p-5 sm:p-8 backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}assets/techcare-logo.png`} alt="Tech Care" className="h-10 w-10 rounded-full object-cover ring-1 ring-primary/40" />
            <div>
              <h3 id="auth-modal-title" className="font-headline-sm text-lg font-bold text-on-surface">
                Sign in to Tech Care
              </h3>
              <p className="text-xs text-on-surface-variant">Local clinician session — no patient data is stored on Tech Care servers.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close sign in dialog"
            className="rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="auth-name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
              Clinician Name
            </label>
            <input
              id="auth-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Salma Mansour"
              className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
              Email Address
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@tech-care.tech"
              className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="auth-role" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-outline">
              Account Role
            </label>
            <select
              id="auth-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserSession['role'])}
              className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="Doctor">Doctor</option>
              <option value="Medical Student">Medical Student</option>
              <option value="Clinic Admin">Clinic Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[11px] text-on-surface-variant">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span>Your session stays strictly local in this browser. Tech Care assists doctors without saving patient or client data.</span>
          </div>

          <button
            type="submit"
            className="btn-primary-glow w-full rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:bg-primary-fixed cursor-pointer"
          >
            Continue to Clinical Workspace
          </button>
        </form>
      </div>
    </div>
  );
}
