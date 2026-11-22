import type { ClinicalCase, UserSession } from '../types/techcare';

const SESSION_KEY = 'techcare_user_session';
const CASES_KEY = 'techcare_medi_cases';

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function signInDemoAccount(input: {
  name: string;
  email: string;
  role: UserSession['role'];
}): UserSession {
  const session: UserSession = {
    id: `usr_${Date.now().toString(36)}`,
    name: input.name.trim() || 'Dr. TechCare',
    email: input.email.trim(),
    role: input.role,
    signedInAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage restriction
  }
  return session;
}

export function signOutAccount(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage restriction
  }
}

export function getSavedCases(): ClinicalCase[] {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    return raw ? (JSON.parse(raw) as ClinicalCase[]) : [];
  } catch {
    return [];
  }
}

export function saveCases(cases: ClinicalCase[]): void {
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(cases.slice(0, 30)));
  } catch {
    // Ignore storage restriction
  }
}
