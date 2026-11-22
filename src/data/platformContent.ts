export interface ClinicalSystemPill {
  id: string;
  label: string;
  caption: string;
  tag: string;
}

export interface MediPreviewSample {
  id: 'en' | 'ar';
  label: string;
  query: string;
  diagnosisHeadline: string;
  summary: string;
  vitalsTag: string;
}

export const CLINICAL_SYSTEM_PILLS: ClinicalSystemPill[] = [
  {
    id: 'ehr',
    label: 'EHR',
    caption: 'Bi-directional patient chart synchronization across modern clinic & hospital EHR systems.',
    tag: '14ms Sync',
  },
  {
    id: 'his',
    label: 'HIS',
    caption: 'Real-time ADT, scheduling, and outpatient queue orchestration without changing staff habits.',
    tag: 'Queue Flow',
  },
  {
    id: 'pacs',
    label: 'PACS',
    caption: 'DICOMweb imaging summaries correlated directly alongside laboratory and clinical notes.',
    tag: 'DICOM Bridge',
  },
  {
    id: 'lis',
    label: 'LIS',
    caption: 'Instant biochemical panel ingestion highlighting subtle biomarker drift before threshold breach.',
    tag: 'Lab Streams',
  },
  {
    id: 'fhir',
    label: 'HL7 / FHIR R4',
    caption: 'Standards-compliant RESTful resource layer ready for sovereign hospital and cloud deployments.',
    tag: 'FHIR Native',
  },
  {
    id: 'twin',
    label: 'Digital Twin',
    caption: 'Continuous patient and ward physiological baseline model built for preemptive clinical awareness.',
    tag: 'Real-Time Twin',
  },
  {
    id: 'mada',
    label: 'Mada',
    caption: 'Longitudinal outpatient follow-up & clinic continuity connecting every patient visit effortlessly.',
    tag: 'Continuity',
  },
];

export const MEDI_DEMO_SNIPPETS: Record<'en' | 'ar', MediPreviewSample> = {
  en: {
    id: 'en',
    label: 'English Case',
    query: '58M · 2 days progressive dyspnea, HR 104 bpm, SpO2 93% RA, mild basal crackles. Immediate priorities?',
    diagnosisHeadline: 'Differential & First-Hour Workup',
    summary:
      'Prioritize acute decompensated heart failure, CAP, and PE rule-out. Order stat 12-lead ECG, portable CXR, BNP, Troponin-I, and titrate O2 to 94–98%.',
    vitalsTag: 'SHAP Confidence 96.8% · PDF Plan Ready',
  },
  ar: {
    id: 'ar',
    label: 'حالة بالعربي',
    query: 'مريض 54 سنة · ألم ضاغط في الصدر منذ ساعتين مع تعرق، الضغط 145/90 والنبض 98. الخطوات العاجلة؟',
    diagnosisHeadline: 'ملخص التقييم السريري المبدئي',
    summary:
      'استبعاد متلازمة الشريان التاجي الحادة فوراً: تخطيط قلب (ECG) خلال 10 دقائق، إنزيمات القلب (Troponin)، ومراجعة العلامات الحيوية وخطة التدخل العاجل.',
    vitalsTag: 'دعم القرار السريري · ثنائي اللغة',
  },
};
