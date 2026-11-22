import type { ChatMessage } from '../types/techcare';

const AI_API_URL = (import.meta.env.VITE_AI_API_URL as string | undefined)?.trim() || '';
const AI_API_KEY = (import.meta.env.VITE_AI_API_KEY as string | undefined)?.trim() || '';

export interface AiQueryOptions {
  query: string;
  history?: ChatMessage[];
  context?: 'medi-workspace';
  signal?: AbortSignal;
}

export interface AiQueryResponse {
  reply: string;
  language: 'en' | 'ar';
  mode: 'live' | 'demo';
  structuredSummary: {
    urgency: 'Routine' | 'Priority' | 'Urgent';
    differentials: string[];
    recommendedNextSteps: string[];
  };
}

export function isLiveAiConfigured(): boolean {
  return Boolean(AI_API_URL);
}

function detectArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function buildDemoClinicalReply(query: string): AiQueryResponse {
  const isArabic = detectArabic(query);
  const lower = query.toLowerCase();

  if (isArabic) {
    return {
      language: 'ar',
      mode: 'demo',
      reply: [
        'ملخص التقييم السريري المبدئي (Medi Clinical Assistant — Demo Mode):',
        '',
        `• الشكوى / المدخلات: "${query}"`,
        '• الأولوية السريرية المقترحة: متابعة سريعة مع مراجعة العلامات الحيوية الكاملة (BP, HR, SpO2, Temp).',
        '• الفحوصات الموصى بها مبدئياً: صورة دم كاملة (CBC)، وظائف كلى وكبد، مؤشرات التهاب (CRP)، ورسم قلب (ECG) عند وجود أعراض صدرية أو دوخة.',
        '• تنبيه مهم: هذه استجابة تجريبية لدعم القرار الطبي ولا تغني عن الفحص الإكلينيكي المباشر للطبيب المعالج. اربط متغير VITE_AI_API_URL للتشغيل على موديل الذكاء الاصطناعي الفعلي.',
      ].join('\n'),
      structuredSummary: {
        urgency: 'Priority',
        differentials: [
          'استبعاد العلامات التحذيرية الحادة (Red-Flag Rule-out)',
          'تقييم التوازن الهيموديناميكي والمؤشرات الحيوية',
          'مراجعة التاريخ الدوائي والأمراض المزمنة المصاحبة',
        ],
        recommendedNextSteps: [
          'تأكيد العلامات الحيوية الكاملة',
          'طلب الفحوصات المعملية الأساسية ومطابقتها إكلينيكياً',
          'مراجعة خطة العلاج وتصدير ملخص PDF',
        ],
      },
    };
  }

  if (lower.includes('map') || lower.includes('antibiotic') || lower.includes('sepsis')) {
    return {
      language: 'en',
      mode: 'demo',
      reply: [
        'Clinical Neural Correlation Summary:',
        '1. Hemodynamic Trend: Mean Arterial Pressure (MAP) variance aligns with peak vasodilatory window following broad-spectrum infusion.',
        '2. Recommended Verification: Re-check serum lactate trend (2h interval), renal clearance (eGFR) prior to next scheduled trough, and fluid responsiveness via dynamic pulse-pressure variation.',
        '3. Physician Sign-Off: Maintain current norepinephrine floor target >= 65 mmHg pending attending reassessment.',
      ].join('\n'),
      structuredSummary: {
        urgency: 'Urgent',
        differentials: [
          'Infusion-associated transient vasodilation',
          'Early distributive / septic hemodynamic shift',
          'Intravascular volume depletion',
        ],
        recommendedNextSteps: [
          'Verify repeat lactate & fluid balance',
          'Review antimicrobial renal dosing interval',
          'Confirm bedside MAP target with ICU team',
        ],
      },
    };
  }

  if (lower.includes('extubation') || lower.includes('vent') || lower.includes('spo2') || lower.includes('respir')) {
    return {
      language: 'en',
      mode: 'demo',
      reply: [
        '12-Hour Extubation Readiness Synthesis:',
        '• Respiratory Mechanics: RSBI trending favorably (< 85 breaths/min/L) with stable SpO2 >= 97% on FiO2 0.35 and PEEP 5 cmH2O.',
        '• Airway & Cough Reflex: Adequate secretion clearance and alert neurological baseline noted.',
        '• Suggested Protocol: Conduct 30-minute Spontaneous Breathing Trial (SBT) under continuous capnography before extubation sign-off.',
      ].join('\n'),
      structuredSummary: {
        urgency: 'Priority',
        differentials: [
          'Favorable SBT weaning trajectory',
          'Monitor post-extubation upper airway edema risk',
        ],
        recommendedNextSteps: [
          'Run 30-min low-support SBT + cuff-leak check',
          'Verify ABG 30 minutes post-trial',
          'Keep high-flow nasal cannula ready at bedside',
        ],
      },
    };
  }

  return {
    language: 'en',
    mode: 'demo',
    reply: [
      `Medi Clinical Analysis for: "${query}"`,
      '',
      '• Initial Triage Framing: Correlate presenting symptoms with baseline vitals (HR, BP, SpO2, Temp) and recent medication changes.',
      '• Focused Workup Suggestions: Baseline CBC, CMP/renal panel, targeted inflammatory markers (CRP/ESR), and symptom-directed imaging or ECG.',
      '• Doctor-First Note: Generated in Demo AI Mode — set VITE_AI_API_URL in .env to connect your live TechCare medical LLM backend.',
    ].join('\n'),
    structuredSummary: {
      urgency: 'Routine',
      differentials: [
        'Primary symptom correlation with baseline vitals',
        'Rule out acute cardiopulmonary or infectious triggers',
        'Review chronic medication & allergy history',
      ],
      recommendedNextSteps: [
        'Confirm focused physical exam & vital signs',
        'Order baseline labs / imaging if red flags persist',
        'Export structured SOAP / PDF care plan',
      ],
    },
  };
}

export async function sendClinicalQuery({
  query,
  history = [],
  context = 'medi-workspace',
  signal,
}: AiQueryOptions): Promise<AiQueryResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Clinical query cannot be empty.');
  }

  if (!AI_API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 420));
    return buildDemoClinicalReply(trimmed);
  }

  const endpoint = `${AI_API_URL.replace(/\/+$/, '')}/chat`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (AI_API_KEY) {
    headers.Authorization = `Bearer ${AI_API_KEY}`;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      query: trimmed,
      context,
      history: history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    throw new Error(`AI gateway responded with HTTP ${res.status}`);
  }

  const data = (await res.json()) as Partial<AiQueryResponse> & { message?: string; text?: string };
  const replyText = data.reply || data.message || data.text;
  if (!replyText) {
    throw new Error('AI gateway response did not contain a reply field.');
  }

  return {
    reply: replyText,
    language: data.language ?? (detectArabic(replyText) ? 'ar' : 'en'),
    mode: 'live',
    structuredSummary: data.structuredSummary ?? {
      urgency: 'Priority',
      differentials: [],
      recommendedNextSteps: [],
    },
  };
}
