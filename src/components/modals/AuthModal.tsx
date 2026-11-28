import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useScene } from '../../context/SceneContext';

type AuthMode = 'signin' | 'signup';
type Gender = 'Male' | 'Female';
type AccountType = 'Doctor' | 'Medical Student';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, loginDemo } = useScene();

  const [mode, setMode] = useState<AuthMode>(authModalMode);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Create Account state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState<Gender>('Male');
  const [accountType, setAccountType] = useState<AccountType>('Doctor');

  const [error, setError] = useState('');

  useEffect(() => {
    if (!authModalOpen) return;
    setMode(authModalMode);
    setError('');
  }, [authModalOpen, authModalMode]);

  useEffect(() => {
    if (!authModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  };

  const resetForms = () => {
    setSignInEmail('');
    setSignInPassword('');
    setFirstName('');
    setLastName('');
    setSignUpEmail('');
    setSignUpPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSignInSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = signInEmail.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signInPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    loginDemo({ email: trimmedEmail });
    resetForms();
  };

  const handleSignUpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = signUpEmail.trim();

    if (!trimmedFirst || !trimmedLast) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    loginDemo({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: trimmedEmail,
      role: accountType,
      gender,
    });
    resetForms();
  };

  const isSignIn = mode === 'signin';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="modal-backdrop fixed inset-0 backdrop-blur-xl" onClick={closeAuthModal} />

      <div
        className={`auth-modern-card relative z-10 max-h-[92svh] w-full overflow-y-auto rounded-[24px] p-6 sm:p-8 transition-[max-width] duration-300 ${
          isSignIn ? 'max-w-[420px]' : 'max-w-[468px]'
        }`}
      >
        {/* Subtle top specular beam & aurora */}
        <span className="auth-modern-beam pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden="true" />
        <div className="auth-modern-aurora pointer-events-none absolute inset-x-0 top-0 h-36" aria-hidden="true" />

        {/* Discreet close button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close sign in dialog"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Centered Minimal Brand Header */}
        <div className="relative flex flex-col items-center text-center pt-1">
          <img
            src={`${import.meta.env.BASE_URL}assets/techcare-logo.png`}
            alt="Tech Care"
            className="h-11 w-11 rounded-2xl bg-white object-contain p-1 shadow-md ring-1 ring-white/15"
          />
          <h3 id="auth-modal-title" className="mt-4 font-headline-md text-[22px] font-bold tracking-tight text-on-surface">
            {isSignIn ? 'Welcome back' : 'Create your account'}
          </h3>
          <p className="mt-1 text-[13px] text-on-surface-variant">
            {isSignIn
              ? 'Sign in to your Tech Care workspace'
              : 'Fill in your details to get started'}
          </p>
        </div>

        {/* Silky Sliding Segmented Switch */}
        <div
          className="auth-modern-track relative mt-6 grid grid-cols-2 rounded-xl p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          <span
            aria-hidden="true"
            className={`auth-modern-thumb pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-[9px] ${
              isSignIn ? 'translate-x-0' : 'translate-x-full'
            }`}
          />
          <button
            type="button"
            role="tab"
            aria-selected={isSignIn}
            onClick={() => switchMode('signin')}
            className={`relative z-10 rounded-[9px] py-2 text-xs font-semibold transition-colors cursor-pointer ${
              isSignIn ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isSignIn}
            onClick={() => switchMode('signup')}
            className={`relative z-10 rounded-[9px] py-2 text-xs font-semibold transition-colors cursor-pointer ${
              !isSignIn ? 'text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Create account
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-error/35 bg-error-container/25 px-3.5 py-2.5 text-xs font-medium text-error"
          >
            {error}
          </div>
        )}

        {isSignIn ? (
          <form onSubmit={handleSignInSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor="auth-signin-email" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                Email
              </label>
              <div className="auth-modern-field">
                <Mail className="h-4 w-4 shrink-0" />
                <input
                  id="auth-signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="name@clinic.org"
                  className="auth-modern-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-signin-password" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                Password
              </label>
              <div className="auth-modern-field">
                <Lock className="h-4 w-4 shrink-0" />
                <input
                  id="auth-signin-password"
                  name="password"
                  type={showSignInPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-modern-input"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword((v) => !v)}
                  aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                  className="rounded-md p-1 text-outline transition-colors hover:text-on-surface cursor-pointer"
                >
                  {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-modern-cta group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold cursor-pointer"
            >
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit} noValidate className="mt-5 space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="auth-first-name" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                  First Name
                </label>
                <div className="auth-modern-field">
                  <User className="h-4 w-4 shrink-0" />
                  <input
                    id="auth-first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Salma"
                    className="auth-modern-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-last-name" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                  Last Name
                </label>
                <div className="auth-modern-field">
                  <User className="h-4 w-4 shrink-0" />
                  <input
                    id="auth-last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mansour"
                    className="auth-modern-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="auth-signup-email" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                Email
              </label>
              <div className="auth-modern-field">
                <Mail className="h-4 w-4 shrink-0" />
                <input
                  id="auth-signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@clinic.org"
                  className="auth-modern-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="auth-signup-password" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                  Password
                </label>
                <div className="auth-modern-field">
                  <Lock className="h-4 w-4 shrink-0" />
                  <input
                    id="auth-signup-password"
                    name="password"
                    type={showSignUpPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="auth-modern-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword((v) => !v)}
                    aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                    className="rounded-md p-1 text-outline transition-colors hover:text-on-surface cursor-pointer"
                  >
                    {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="auth-confirm-password" className="mb-1.5 block text-xs font-medium text-on-surface-variant">
                  Confirm Password
                </label>
                <div className="auth-modern-field">
                  <Lock className="h-4 w-4 shrink-0" />
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="auth-modern-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="rounded-md p-1 text-outline transition-colors hover:text-on-surface cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">Gender</span>
                <div className="auth-modern-track grid grid-cols-2 gap-1 rounded-xl p-1" role="group" aria-label="Gender">
                  {(['Male', 'Female'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={gender === option}
                      data-active={gender === option ? 'true' : 'false'}
                      onClick={() => setGender(option)}
                      className="auth-modern-seg-btn"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">Account Type</span>
                <div className="auth-modern-track grid grid-cols-2 gap-1 rounded-xl p-1" role="group" aria-label="Account Type">
                  {(['Doctor', 'Medical Student'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={accountType === option}
                      data-active={accountType === option ? 'true' : 'false'}
                      onClick={() => setAccountType(option)}
                      className="auth-modern-seg-btn truncate"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-modern-cta group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold cursor-pointer"
            >
              <span>Create account</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          </form>
        )}

        {/* Whisper-quiet 1-line privacy footnote */}
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-outline">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary/80" />
          <span>Local browser session · No patient data stored</span>
        </p>
      </div>
    </div>
  );
}
