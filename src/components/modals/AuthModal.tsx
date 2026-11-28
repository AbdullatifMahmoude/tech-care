import { useEffect, useState, type FormEvent } from 'react';
import {
  Bot,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Stethoscope,
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="modal-backdrop fixed inset-0 backdrop-blur-xl" onClick={closeAuthModal} />

      <div className="auth-uiverse-shell relative z-10 max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Tech Care Brand Showcase Panel */}
          <aside className="auth-uiverse-panel hidden md:flex md:col-span-5 flex-col justify-between border-b md:border-b-0 md:border-e p-7">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <span>{isSignIn ? '✦' : '◎'}</span>
                <span>{isSignIn ? 'Tech Care' : 'Create Account'}</span>
              </div>

              <div>
                <h2 className="font-headline-lg text-2xl font-bold tracking-tight text-on-surface">
                  {isSignIn ? 'Tech Care' : 'Create Account'}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                  {isSignIn
                    ? 'AI-powered healthcare tools designed for smarter medical teams.'
                    : 'Start your Tech Care experience with a clean and secure profile.'}
                </p>
              </div>
            </div>

            {/* TechCare Bot Centerpiece */}
            <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5 text-center">
              <div className="relative flex items-center justify-center">
                <span className="auth-bot-orbit absolute -inset-2.5 rounded-full border border-primary/35 bg-primary/10 blur-[2px]" />
                <img
                  src={`${import.meta.env.BASE_URL}assets/techcare-logo.png`}
                  alt="TechCare Bot"
                  className="relative h-16 w-16 rounded-full bg-white object-contain p-1 ring-2 ring-primary/60 shadow-lg"
                />
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                <Bot className="h-3.5 w-3.5" />
                <span>TechCare Bot</span>
                <Sparkles className="h-3 w-3" />
              </div>
              <p className="mt-2 text-[11px] text-on-surface-variant">
                {isSignIn
                  ? 'Clinical intelligence & bilingual medical workspace'
                  : `Selected profile: ${accountType}`}
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/55 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{isSignIn ? 'Secure access' : 'Local-first privacy'}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
                {isSignIn
                  ? 'Doctors, students, and healthcare teams in one premium platform.'
                  : 'Your session stays strictly local in this browser without storing patient data.'}
              </p>
            </div>
          </aside>

          {/* Right Form Panel */}
          <div className="md:col-span-7 p-5 sm:p-8">
            {/* Top Bar: Mode Switch + Close */}
            <div className="flex items-center justify-between gap-3">
              <div className="auth-uiverse-switch" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSignIn}
                  data-active={isSignIn ? 'true' : 'false'}
                  onClick={() => switchMode('signin')}
                  className="auth-uiverse-tab"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isSignIn}
                  data-active={!isSignIn ? 'true' : 'false'}
                  onClick={() => switchMode('signup')}
                  className="auth-uiverse-tab"
                >
                  Create Account
                </button>
              </div>

              <button
                type="button"
                onClick={closeAuthModal}
                aria-label="Close sign in dialog"
                className="rounded-xl border border-outline-variant/40 p-2 text-on-surface-variant transition-colors hover:border-primary/50 hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Compact Mobile Header Badge */}
            <div className="mt-4 flex items-center gap-2.5 md:hidden">
              <img
                src={`${import.meta.env.BASE_URL}assets/techcare-logo.png`}
                alt="Tech Care"
                className="h-9 w-9 rounded-full bg-white object-contain p-0.5 ring-1 ring-primary/50"
              />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                TechCare Bot · {isSignIn ? 'Secure Access' : 'Create Account'}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mt-5">
              <h3 id="auth-modal-title" className="font-headline-lg text-2xl font-bold tracking-tight text-on-surface">
                {isSignIn ? 'Welcome back' : 'Join Tech Care'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                {isSignIn
                  ? 'Access your medical AI workspace and continue your journey securely.'
                  : 'Fill your details and choose your medical account type.'}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-error/40 bg-error-container/30 px-3.5 py-2.5 text-xs font-medium text-error"
              >
                {error}
              </div>
            )}

            {isSignIn ? (
              <form onSubmit={handleSignInSubmit} noValidate className="mt-5 space-y-4">
                <div>
                  <label htmlFor="auth-signin-email" className="mb-1.5 block text-xs font-semibold text-on-surface">
                    Email
                  </label>
                  <div className="auth-uiverse-field">
                    <Mail className="h-4 w-4 shrink-0" />
                    <input
                      id="auth-signin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="doctor@tech-care.tech"
                      className="auth-uiverse-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-signin-password" className="mb-1.5 block text-xs font-semibold text-on-surface">
                    Password
                  </label>
                  <div className="auth-uiverse-field">
                    <Lock className="h-4 w-4 shrink-0" />
                    <input
                      id="auth-signin-password"
                      name="password"
                      type={showSignInPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="auth-uiverse-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword((v) => !v)}
                      aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                      className="rounded-lg p-1 text-outline transition-colors hover:text-on-surface cursor-pointer"
                    >
                      {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-uiverse-submit w-full rounded-xl px-6 py-3 text-sm font-bold cursor-pointer"
                >
                  Sign In
                </button>

                <p className="text-center text-xs text-on-surface-variant">
                  Don&rsquo;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignUpSubmit} noValidate className="mt-5 space-y-3.5">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="auth-first-name" className="mb-1.5 block text-xs font-semibold text-on-surface">
                      First Name
                    </label>
                    <div className="auth-uiverse-field">
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
                        className="auth-uiverse-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-last-name" className="mb-1.5 block text-xs font-semibold text-on-surface">
                      Last Name
                    </label>
                    <div className="auth-uiverse-field">
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
                        className="auth-uiverse-input"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-signup-email" className="mb-1.5 block text-xs font-semibold text-on-surface">
                    Email
                  </label>
                  <div className="auth-uiverse-field">
                    <Mail className="h-4 w-4 shrink-0" />
                    <input
                      id="auth-signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="doctor@tech-care.tech"
                      className="auth-uiverse-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="auth-signup-password" className="mb-1.5 block text-xs font-semibold text-on-surface">
                      Password
                    </label>
                    <div className="auth-uiverse-field">
                      <Lock className="h-4 w-4 shrink-0" />
                      <input
                        id="auth-signup-password"
                        name="password"
                        type={showSignUpPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="auth-uiverse-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword((v) => !v)}
                        aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                        className="rounded-lg p-1 text-outline transition-colors hover:text-on-surface cursor-pointer"
                      >
                        {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="auth-confirm-password" className="mb-1.5 block text-xs font-semibold text-on-surface">
                      Confirm Password
                    </label>
                    <div className="auth-uiverse-field">
                      <Lock className="h-4 w-4 shrink-0" />
                      <input
                        id="auth-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="auth-uiverse-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="rounded-lg p-1 text-outline transition-colors hover:text-on-surface cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gender & Account Type Selectors */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-on-surface">Gender</span>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Gender">
                      {(['Male', 'Female'] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={gender === option}
                          data-active={gender === option ? 'true' : 'false'}
                          onClick={() => setGender(option)}
                          className="auth-uiverse-pill px-3 py-2.5 text-xs font-semibold"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-on-surface">Account Type</span>
                    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Account Type">
                      <button
                        type="button"
                        aria-pressed={accountType === 'Medical Student'}
                        data-active={accountType === 'Medical Student' ? 'true' : 'false'}
                        onClick={() => setAccountType('Medical Student')}
                        className="auth-uiverse-pill inline-flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-xs font-semibold"
                      >
                        <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">Medical Student</span>
                      </button>
                      <button
                        type="button"
                        aria-pressed={accountType === 'Doctor'}
                        data-active={accountType === 'Doctor' ? 'true' : 'false'}
                        onClick={() => setAccountType('Doctor')}
                        className="auth-uiverse-pill inline-flex items-center justify-center gap-1.5 px-2.5 py-2.5 text-xs font-semibold"
                      >
                        <Stethoscope className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>Doctor</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-uiverse-submit mt-1 w-full rounded-xl px-6 py-3 text-sm font-bold cursor-pointer"
                >
                  Create Account
                </button>

                <p className="text-center text-xs text-on-surface-variant">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] text-on-surface-variant">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <span>
                Your session stays strictly local in this browser. Tech Care assists doctors without saving patient or client data.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
