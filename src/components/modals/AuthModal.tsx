import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { useScene } from '../../context/SceneContext';

type AuthMode = 'signin' | 'signup';
type Gender = 'Male' | 'Female';
type AccountType = 'Doctor' | 'Medical Student';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(pw: string): { score: number; label: string; colorClass: string } {
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', colorClass: 'bg-error' };
  if (score === 2) return { score: 2, label: 'Fair', colorClass: 'bg-amber-400' };
  if (score === 3) return { score: 3, label: 'Good', colorClass: 'bg-secondary' };
  return { score: 4, label: 'Strong', colorClass: 'bg-success' };
}

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
  const pwStrength = getPasswordStrength(signUpPassword);
  const passwordsMatch = confirmPassword.length > 0 && signUpPassword === confirmPassword;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      data-lenis-prevent
    >
      <div className="modal-backdrop fixed inset-0 backdrop-blur-xl" onClick={closeAuthModal} />

      <div
        className={`auth-modern-card relative z-10 flex max-h-[90svh] w-full flex-col overflow-hidden rounded-[22px] transition-[max-width] duration-300 ${
          isSignIn ? 'max-w-[432px]' : 'max-w-[504px]'
        }`}
      >
        {/* Fixed Header */}
        <div className="auth-modern-header shrink-0">
          <div className="flex items-center justify-between px-6 pt-5 pb-3.5">
            <div className="flex items-center gap-2.5">
              <img
                src={`${import.meta.env.BASE_URL}assets/techcare-logo.png`}
                alt="Tech Care"
                className="h-8 w-8 rounded-xl bg-white object-contain p-0.5 ring-1 ring-primary/35 shadow-sm"
              />
              <span className="font-headline-sm text-sm font-bold tracking-tight text-on-surface uppercase">
                Tech<span className="text-primary">Care</span>
              </span>
            </div>

            <button
              type="button"
              onClick={closeAuthModal}
              aria-label="Close sign in dialog"
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high/70 hover:text-on-surface cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Sliding Underline Tabs */}
          <div className="relative mx-6 grid grid-cols-2" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={isSignIn}
              onClick={() => switchMode('signin')}
              className={`py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                isSignIn ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isSignIn}
              onClick={() => switchMode('signup')}
              className={`py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                !isSignIn ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Create account
            </button>
            <span
              aria-hidden="true"
              className={`auth-modern-tab-indicator pointer-events-none absolute bottom-0 left-0 h-[2px] w-1/2 rounded-full ${
                isSignIn ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
          </div>
        </div>

        {/* Dedicated Scrollable Body */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain px-6 py-5"
        >
          <div>
            <h3 id="auth-modal-title" className="font-headline-md text-xl font-bold tracking-tight text-on-surface">
              {isSignIn ? 'Welcome back' : 'Create your account'}
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              {isSignIn
                ? 'Access your clinical AI workspace securely.'
                : 'Set up your profile to start using Medi and Mada.'}
            </p>
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
            <form onSubmit={handleSignInSubmit} noValidate className="mt-5 space-y-4">
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
                className="auth-modern-cta group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold cursor-pointer"
              >
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} noValidate className="mt-5 space-y-4">
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

              <div className="space-y-2">
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

                {/* Live Password Strength & Match Hint */}
                {signUpPassword.length > 0 && (
                  <div className="flex items-center justify-between gap-3 pt-0.5">
                    <div className="flex flex-1 items-center gap-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <span
                          key={step}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            pwStrength.score >= step ? pwStrength.colorClass : 'bg-outline-variant/40'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-on-surface-variant">
                      {pwStrength.label}
                      {confirmPassword.length > 0 && (
                        <span className={passwordsMatch ? ' text-success' : ' text-error'}>
                          {' · '}
                          {passwordsMatch ? 'Matched' : 'Not matched'}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Account Type Cards */}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">Account Type</span>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="group" aria-label="Account Type">
                  <button
                    type="button"
                    aria-label="Doctor"
                    aria-pressed={accountType === 'Doctor'}
                    data-active={accountType === 'Doctor' ? 'true' : 'false'}
                    onClick={() => setAccountType('Doctor')}
                    className="auth-modern-role-card"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-on-surface">Doctor</span>
                      <span className="block truncate text-[11px] text-on-surface-variant">Clinical practice</span>
                    </div>
                    {accountType === 'Doctor' && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>

                  <button
                    type="button"
                    aria-label="Medical Student"
                    aria-pressed={accountType === 'Medical Student'}
                    data-active={accountType === 'Medical Student' ? 'true' : 'false'}
                    onClick={() => setAccountType('Medical Student')}
                    className="auth-modern-role-card"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-on-surface">Medical Student</span>
                      <span className="block truncate text-[11px] text-on-surface-variant">Study &amp; training</span>
                    </div>
                    {accountType === 'Medical Student' && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                </div>
              </div>

              {/* Compact Gender Selector */}
              <div>
                <span className="mb-1.5 block text-xs font-medium text-on-surface-variant">Gender</span>
                <div className="auth-modern-track grid grid-cols-2 gap-1 rounded-[10px] p-1" role="group" aria-label="Gender">
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

              <button
                type="submit"
                className="auth-modern-cta group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold cursor-pointer"
              >
                <span>Create account</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            </form>
          )}
        </div>

        {/* Fixed Grounded Footer */}
        <div className="auth-modern-footer shrink-0 px-6 py-3">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-outline">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary/85" />
            <span>Local session · No patient data stored</span>
          </p>
        </div>
      </div>
    </div>
  );
}
