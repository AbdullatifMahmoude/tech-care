import { REAL_PARTNERS } from '../data/partners';
import type { Partner } from '../types/techcare';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

export interface ManagedSiteContent {
  partners: Partner[];
  announcement?: string;
  source: 'cms' | 'static';
}

export async function fetchManagedContent(): Promise<ManagedSiteContent> {
  if (!API_BASE_URL) {
    return {
      partners: REAL_PARTNERS,
      source: 'static',
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/content`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = (await res.json()) as Partial<ManagedSiteContent>;
    return {
      partners: Array.isArray(payload.partners) && payload.partners.length > 0 ? payload.partners : REAL_PARTNERS,
      announcement: payload.announcement,
      source: 'cms',
    };
  } catch {
    return {
      partners: REAL_PARTNERS,
      source: 'static',
    };
  }
}
