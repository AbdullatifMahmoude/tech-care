import type { ContactPayload, DemoRequestPayload, NewsletterPayload } from '../types/techcare';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

export interface SubmissionReceipt {
  ok: boolean;
  referenceId: string;
  mode: 'api' | 'local';
  message: string;
}

async function postOrSimulate<T>(path: string, storageKey: string, payload: T, successMessage: string): Promise<SubmissionReceipt> {
  const referenceId = `TC-${Date.now().toString(36).toUpperCase()}`;

  if (API_BASE_URL) {
    const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return {
      ok: true,
      referenceId,
      mode: 'api',
      message: successMessage,
    };
  }

  // Persist locally in demo mode so nothing gets lost and users see real feedback
  await new Promise((resolve) => setTimeout(resolve, 350));
  try {
    const existingRaw = localStorage.getItem(storageKey);
    const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
    existing.unshift({ referenceId, submittedAt: new Date().toISOString(), ...payload });
    localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 20)));
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }

  return {
    ok: true,
    referenceId,
    mode: 'local',
    message: successMessage,
  };
}

export function submitContactForm(payload: ContactPayload): Promise<SubmissionReceipt> {
  return postOrSimulate(
    '/contact',
    'techcare_contact_submissions',
    payload,
    'Message received! Our Tech Care team in Alexandria will respond shortly.',
  );
}

export function subscribeNewsletter(payload: NewsletterPayload): Promise<SubmissionReceipt> {
  return postOrSimulate(
    '/newsletter',
    'techcare_newsletter_subscribers',
    payload,
    'Subscribed to Tech Care healthtech insights & AI updates.',
  );
}

export function requestDemo(payload: DemoRequestPayload): Promise<SubmissionReceipt> {
  return postOrSimulate(
    '/demo-requests',
    'techcare_demo_requests',
    payload,
    'Clinical briefing request logged. We will reach out to schedule your walkthrough.',
  );
}
