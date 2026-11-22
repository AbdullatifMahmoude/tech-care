export interface MediPreviewSample {
  id: 'en' | 'ar';
  label: string;
  query: string;
  diagnosisHeadline: string;
  summary: string;
  vitalsTag: string;
}

export const MEDI_DEMO_SNIPPETS: Record<'en' | 'ar', MediPreviewSample> = {
  en: {
    id: 'en',
    label: 'English Case',
    query: '58M · 2 days progressive dyspnea, HR 104 bpm, SpO2 93% RA, mild basal crackles.',
    diagnosisHeadline: 'Differential & First-Hour Workup',
    summary:
      'Prioritize acute decompensated heart failure, CAP, and PE rule-out. Order stat 12-lead ECG, portable CXR, BNP, and Troponin-I.',
    vitalsTag: 'Local session · Doctor decision support',
  },
  ar: {
    id: 'ar',
    label: 'حالة بالعربي',
    query: 'مريض 54 سنة · ألم ضاغط في الصدر منذ ساعتين، الضغط 145/90 والنبض 98.',
    diagnosisHeadline: 'ملخص التقييم السريري المبدئي',
    summary:
      'استبعاد متلازمة الشريان التاجي الحادة فوراً: تخطيط قلب (ECG) خلال 10 دقائق، إنزيمات القلب (Troponin)، ومراجعة العلامات الحيوية.',
    vitalsTag: 'جلسة محلية · دعم القرار الطبي',
  },
};
