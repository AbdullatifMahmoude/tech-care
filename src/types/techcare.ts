export type SceneId = 'neural-mesh' | 'ambient-2d';

export type ThemeMode = 'dark' | 'light';

export interface Partner {
  id: string;
  name: string;
  arabicName?: string;
  shortLabel: string;
  subtitle: string;
  category: string;
  status: string;
  description: string;
  tier: string;
  scope: string;
  compliance: string;
  outboundUrl?: string;
  logoSrc?: string;
  emblemType:
    | 'microsoft'
    | 'isf'
    | 'alx'
    | 'orangecorners'
    | 'ifmsa'
    | 'bibliotheca'
    | 'nationalalliance'
    | 'hayatkarima'
    | 'eclub'
    | 'dys';
}

export interface ClinicalBenefit {
  index: string;
  title: string;
  summary: string;
  tag: string;
}

export interface WhyPillar {
  index: string;
  title: string;
  summary: string;
  icon: string;
  accent: 'secondary' | 'primary' | 'primary-fixed';
}

export interface HospitalIntegrationNode {
  id: string;
  code: string;
  caption: string;
  icon: string;
}

export interface OperationalMetricBar {
  label: string;
  value: string;
  percent: number;
  tone: 'primary' | 'secondary' | 'primary-fixed';
}

export interface OperationalFeature {
  id: string;
  index: string;
  title: string;
  description: string;
  vectorId: string;
  syncLabel: string;
  metrics: OperationalMetricBar[];
  observation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: 'en' | 'ar';
  mode?: 'live' | 'demo';
  structuredSummary?: {
    urgency: 'Routine' | 'Priority' | 'Urgent';
    differentials?: string[];
    recommendedNextSteps?: string[];
  };
}

export interface ClinicalCase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: 'Doctor' | 'Medical Student' | 'Other';
  message: string;
}

export interface DemoRequestPayload {
  fullName: string;
  email: string;
  organization: string;
  role: string;
  notes?: string;
}

export interface NewsletterPayload {
  email: string;
}

export interface UserSession {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'Doctor' | 'Medical Student' | 'Clinic Admin';
  gender?: 'Male' | 'Female';
  signedInAt: string;
}
