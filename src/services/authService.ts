import type { ClinicalCase, UserSession } from '../types/techcare';

const SESSION_KEY = 'techcare_user_session';
const CASES_KEY = 'techcare_medi_cases';
const PROFILES_KEY = 'techcare_local_profiles';

interface LocalProfile {
  firstName: string;
  lastName: string;
  email: string;
  gender?: 'Male' | 'Female';
  role: UserSession['role'];
}

export interface SignInAccountInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: UserSession['role'];
  gender?: 'Male' | 'Female';
}

function getStoredProfiles(): Record<string, LocalProfile> {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalProfile>) : {};
  } catch {
    return {};
  }
}

function saveStoredProfile(profile: LocalProfile): void {
  try {
    const profiles = getStoredProfiles();
    const key = profile.email.toLowerCase();
    const updated: Record<string, LocalProfile> = { ...profiles, [key]: profile };
    const entries = Object.entries(updated).slice(-20);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Ignore storage restriction
  }
}

function deriveNameFromEmail(email: string): string {
  const localPart = email.split('@')[0]?.trim() ?? '';
  if (!localPart) return 'Dr. TechCare';
  const words = localPart
    .split(/[._-]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  return words.length > 0 ? words.join(' ') : 'Dr. TechCare';
}

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function signInDemoAccount(input: SignInAccountInput): UserSession {
  const email = input.email.trim();
  const normalizedEmail = email.toLowerCase();
  const existingProfile = getStoredProfiles()[normalizedEmail];

  const firstName = input.firstName?.trim() || existingProfile?.firstName;
  const lastName = input.lastName?.trim() || existingProfile?.lastName;
  const combinedInputName = [input.firstName?.trim(), input.lastName?.trim()].filter(Boolean).join(' ');
  const profileFullName = [existingProfile?.firstName, existingProfile?.lastName].filter(Boolean).join(' ');

  const fullName =
    combinedInputName ||
    input.name?.trim() ||
    profileFullName ||
    deriveNameFromEmail(email) ||
    'Dr. TechCare';

  const role: UserSession['role'] = input.role ?? existingProfile?.role ?? 'Doctor';
  const gender: UserSession['gender'] = input.gender ?? existingProfile?.gender;

  if (input.firstName?.trim() || input.lastName?.trim()) {
    saveStoredProfile({
      firstName: input.firstName?.trim() ?? '',
      lastName: input.lastName?.trim() ?? '',
      email,
      gender,
      role,
    });
  }

  const session: UserSession = {
    id: `usr_${Date.now().toString(36)}`,
    name: fullName,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    email,
    role,
    ...(gender ? { gender } : {}),
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

export function clearSavedCases(): void {
  try {
    localStorage.removeItem(CASES_KEY);
  } catch {
    // Ignore storage restriction
  }
}
