import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  FileDown,
  FlaskConical,
  HeartPulse,
  MessageSquarePlus,
  PanelLeft,
  Pill,
  Plus,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  Trash2,
  User,
  Wind,
  X,
} from 'lucide-react';
import { useScene } from '../context/SceneContext';
import { sendClinicalQuery } from '../services/aiClient';
import { clearSavedCases, getSavedCases, saveCases } from '../services/authService';
import type { ChatMessage, ClinicalCase } from '../types/techcare';
import { TechCareLoader } from '../components/ui/TechCareLoader';

type ClinicalLens = 'diagnosis' | 'pharmacology' | 'labs';

const LENS_CONFIG: Record<
  ClinicalLens,
  { label: string; Icon: typeof Stethoscope; prefix: string }
> = {
  diagnosis: { label: 'Diagnosis', Icon: Stethoscope, prefix: '' },
  pharmacology: {
    label: 'Pharmacology',
    Icon: Pill,
    prefix: '[Clinical Lens: Pharmacology & Dosing] ',
  },
  labs: {
    label: 'Labs',
    Icon: Activity,
    prefix: '[Clinical Lens: Labs & Diagnostics] ',
  },
};

const STARTER_PROMPTS = [
  {
    label: 'Acute dyspnea',
    metric: 'SpO2 92%',
    Icon: Wind,
    prompt:
      '45F with 3-day progressive dyspnea, HR 108 bpm, BP 112/70, SpO2 92% on room air, mild pedal edema. Outline immediate differentials and first-hour workup.',
  },
  {
    label: 'ألم بالصدر',
    metric: 'BP 145/90',
    Icon: HeartPulse,
    prompt:
      'مريض 54 سنة يعاني من ألم ضاغط في الصدر منذ ساعتين مع تعرق، الضغط 145/90 والنبض 98. ما هي الخطوات التشخيصية العاجلة؟',
  },
  {
    label: 'Renal dosing',
    metric: 'eGFR 38',
    Icon: FlaskConical,
    prompt:
      '68M eGFR dropped from 62 to 38 mL/min with Cr 1.9 mg/dL, currently on Metformin 1000mg BID and Lisinopril 10mg. Suggest safe medication adjustments.',
  },
] as const;

const FOLLOWUP_EN = [
  { label: 'Red flags?', prompt: 'Highlight critical red flags requiring immediate escalation.' },
  { label: 'Dosing check', prompt: 'Review safe medication dosing and renal/hepatic precautions.' },
  { label: 'SOAP note', prompt: 'Format this assessment into a concise SOAP note.' },
] as const;

const FOLLOWUP_AR = [
  { label: 'العلامات التحذيرية؟', prompt: 'ما هي العلامات التحذيرية الحرجة التي تستدعي تدخلاً عاجلاً؟' },
  { label: 'مراجعة الجرعات', prompt: 'راجع الجرعات الدوائية الآمنة والاحتياطات اللازمة.' },
  { label: 'ملخص SOAP', prompt: 'رتب هذا التقييم في صورة ملاحظة سريرية مختصرة (SOAP).' },
] as const;

const URGENCY_STYLES: Record<'Routine' | 'Priority' | 'Urgent', { badge: string; dot: string }> = {
  Routine: {
    badge: 'border-outline-variant/40 bg-surface-container text-on-surface-variant',
    dot: 'bg-outline',
  },
  Priority: {
    badge: 'border-amber-400/35 bg-amber-400/10 text-amber-400',
    dot: 'bg-amber-400',
  },
  Urgent: {
    badge: 'border-error/40 bg-error-container/25 text-error',
    dot: 'bg-error',
  },
};

function renderInlineLabelledText(text: string) {
  const colonIdx = text.indexOf(':');
  if (colonIdx > 0 && colonIdx < 56) {
    const label = text.slice(0, colonIdx + 1);
    const rest = text.slice(colonIdx + 1);
    return (
      <>
        <strong className="font-semibold text-on-surface">{label}</strong>
        <span className="text-on-surface-variant">{rest}</span>
      </>
    );
  }
  return <span className="text-on-surface-variant">{text}</span>;
}

function renderFormattedReply(content: string) {
  const lines = content.split('\n');
  let headingRendered = false;

  return (
    <div className="space-y-2 text-[14.5px] leading-7">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={index} className="h-1" />;
        }

        const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[1].padStart(2, '0');
          return (
            <div key={index} className="flex items-start gap-2.5">
              <span className="mt-1.5 inline-flex h-5 min-w-[22px] shrink-0 items-center justify-center rounded-md bg-primary/12 px-1 font-mono text-[10px] font-semibold text-primary">
                {num}
              </span>
              <p className="min-w-0 flex-1">{renderInlineLabelledText(numberedMatch[2])}</p>
            </div>
          );
        }

        const bulletMatch = line.match(/^[•-]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={index} className="flex items-start gap-2.5">
              <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/80" />
              <p className="min-w-0 flex-1">{renderInlineLabelledText(bulletMatch[1])}</p>
            </div>
          );
        }

        if (!headingRendered) {
          headingRendered = true;
          return (
            <p key={index} className="text-[15px] font-semibold leading-snug text-on-surface">
              {line}
            </p>
          );
        }

        return (
          <p key={index} className="text-on-surface-variant">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function MediWorkspacePage() {
  const { setRouteScene, session, openAuthModal } = useScene();
  const [cases, setCases] = useState<ClinicalCase[]>(() => getSavedCases());
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [draftMessages, setDraftMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [lens, setLens] = useState<ClinicalLens>('diagnosis');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setRouteScene('ambient-2d');
  }, [setRouteScene]);

  const activeCase = cases.find((c) => c.id === activeCaseId) ?? null;
  const visibleMessages = activeCase ? activeCase.messages : draftMessages;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    if (visibleMessages.length > 0 || sending) {
      scrollToBottom('smooth');
    }
  }, [visibleMessages.length, sending]);

  const handleThreadScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distanceFromBottom > 140);
  };

  const adjustTextareaHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const insertVitalsTemplate = () => {
    const template = 'BP:  | HR:  | SpO2:  | Temp:  | ';
    const nextValue = input.trim() ? `${input.trimEnd()}\n${template}` : template;
    setInput(nextValue);
    window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        adjustTextareaHeight(textareaRef.current);
      }
    });
  };

  const toggleStep = (key: string) => {
    setCheckedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startNewCase = () => {
    setActiveCaseId(null);
    setDraftMessages([]);
    setError('');
    setShowScrollDown(false);
    setMobileSidebarOpen(false);
  };

  const handleDeleteCase = (caseId: string) => {
    const nextCases = cases.filter((c) => c.id !== caseId);
    setCases(nextCases);
    if (session) saveCases(nextCases);
    if (activeCaseId === caseId) {
      setActiveCaseId(null);
      setDraftMessages([]);
    }
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard?.writeText?.(content);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1600);
    } catch {
      // Ignore clipboard restriction
    }
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setDesktopSidebarOpen((v) => !v);
    }
  };

  const persistMessages = (nextMessages: ChatMessage[], titleHint: string) => {
    if (activeCase) {
      const updated = cases.map((c) =>
        c.id === activeCase.id ? { ...c, messages: nextMessages, updatedAt: new Date().toISOString() } : c,
      );
      setCases(updated);
      if (session) saveCases(updated);
      return updated;
    }

    const newCase: ClinicalCase = {
      id: `case-${Date.now().toString(36)}`,
      title: titleHint.slice(0, 44) + (titleHint.length > 44 ? '...' : ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
    };
    const nextCases = [newCase, ...cases];
    setCases(nextCases);
    setActiveCaseId(newCase.id);
    setDraftMessages([]);
    if (session) saveCases(nextCases);
    return nextCases;
  };

  const handleSend = async (e?: FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;

    setError('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `m-u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: nowTime,
      language: /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en',
    };

    const nextHistory = [...visibleMessages, userMsg];
    if (!activeCase) {
      setDraftMessages(nextHistory);
    } else {
      const updated = cases.map((c) =>
        c.id === activeCase.id ? { ...c, messages: nextHistory, updatedAt: new Date().toISOString() } : c,
      );
      setCases(updated);
      if (session) saveCases(updated);
    }

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setSending(true);

    const payloadQuery =
      lens !== 'diagnosis' && !overrideText ? `${LENS_CONFIG[lens].prefix}${text}` : text;

    try {
      const res = await sendClinicalQuery({
        query: payloadQuery,
        history: nextHistory,
        context: 'medi-workspace',
      });

      const assistantMsg: ChatMessage = {
        id: `m-a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: res.language,
        mode: res.mode,
        structuredSummary: res.structuredSummary,
      };

      const finalMessages = [...nextHistory, assistantMsg];
      persistMessages(finalMessages, text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach Medi AI service.');
    } finally {
      setSending(false);
    }
  };

  const handleRegenerate = async (assistantIndex: number) => {
    if (sending) return;
    let promptMsg: ChatMessage | undefined;
    for (let i = assistantIndex - 1; i >= 0; i -= 1) {
      if (visibleMessages[i].role === 'user') {
        promptMsg = visibleMessages[i];
        break;
      }
    }
    if (!promptMsg) return;

    setError('');
    const baseHistory = visibleMessages.slice(0, assistantIndex);
    if (activeCase) {
      const updated = cases.map((c) =>
        c.id === activeCase.id ? { ...c, messages: baseHistory, updatedAt: new Date().toISOString() } : c,
      );
      setCases(updated);
      if (session) saveCases(updated);
    } else {
      setDraftMessages(baseHistory);
    }

    setSending(true);
    try {
      const res = await sendClinicalQuery({
        query: promptMsg.content,
        history: baseHistory,
        context: 'medi-workspace',
      });

      const regenerated: ChatMessage = {
        id: `m-a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: res.language,
        mode: res.mode,
        structuredSummary: res.structuredSummary,
      };

      const finalMessages = [...baseHistory, regenerated];
      persistMessages(finalMessages, promptMsg.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach Medi AI service.');
    } finally {
      setSending(false);
    }
  };

  const renderComposer = (centered = false) => (
    <form
      onSubmit={(e) => handleSend(e)}
      className="medi-composer flex flex-col gap-1.5 p-2.5 sm:p-3"
    >
      <div className="flex items-end gap-2 px-1">
        <textarea
          ref={textareaRef}
          id="medi-case-input"
          name="clinicalCaseInput"
          aria-label="Clinical case input"
          rows={centered ? 2 : 1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Enter symptoms, vitals, or labs..."
          className="max-h-40 min-h-[38px] flex-1 resize-none bg-transparent py-1.5 text-sm text-on-surface placeholder:text-outline focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send clinical case"
          className="auth-modern-cta inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl disabled:opacity-35 cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      {/* Clinical Lens Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/20 pt-2 px-1">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Clinical lens">
          {(Object.keys(LENS_CONFIG) as ClinicalLens[]).map((key) => {
            const { label, Icon } = LENS_CONFIG[key];
            const active = lens === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                data-active={active ? 'true' : 'false'}
                onClick={() => setLens(key)}
                className="medi-lens-pill inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium"
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={insertVitalsTemplate}
          className="medi-lens-pill inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium"
        >
          <Plus className="h-3 w-3 text-primary" />
          <span>Vitals</span>
        </button>
      </div>
    </form>
  );

  const renderSidebarBody = () => (
    <div className="flex h-full min-h-0 flex-col justify-between p-3.5">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="font-headline-sm text-sm font-bold tracking-tight text-on-surface">Medi</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close case history"
            className="rounded-lg p-1.5 text-on-surface-variant hover:text-on-surface lg:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={startNewCase}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container/55 py-2 text-xs font-semibold text-on-surface transition-colors hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
        >
          <MessageSquarePlus className="h-3.5 w-3.5 text-primary" />
          <span>New case</span>
        </button>

        <div className="flex min-h-0 flex-1 flex-col pt-1">
          <div className="mb-1.5 flex items-center justify-between px-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-outline">Cases</span>
            {cases.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearSavedCases();
                  setCases([]);
                  setActiveCaseId(null);
                  setDraftMessages([]);
                }}
                aria-label="Clear cases"
                className="inline-flex items-center gap-1 text-[11px] text-outline transition-colors hover:text-error cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {cases.length === 0 ? (
            <p className="px-1.5 py-2 text-xs text-outline">No cases yet</p>
          ) : (
            <div
              data-lenis-prevent
              className="medi-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain touch-pan-y pr-1"
            >
              {cases.map((c) => {
                const isActive = c.id === activeCaseId;
                return (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs transition-colors ${
                      isActive
                        ? 'bg-primary/12 font-semibold text-on-surface ring-1 ring-primary/30'
                        : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
                    }`}
                  >
                    <span
                      className={`h-4 w-[3px] shrink-0 rounded-full transition-opacity ${
                        isActive ? 'bg-primary opacity-100' : 'opacity-0'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCaseId(c.id);
                        setMobileSidebarOpen(false);
                      }}
                      className="min-w-0 flex-1 truncate text-left cursor-pointer"
                    >
                      {c.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCase(c.id)}
                      aria-label={`Delete ${c.title}`}
                      className="rounded-md p-1 text-outline opacity-0 transition-opacity hover:text-error group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compact Session Footer */}
      <div className="mt-3 shrink-0 border-t border-outline-variant/25 pt-3">
        {session ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <span className="truncate text-xs font-medium text-on-surface">{session.name}</span>
            </div>
            <span className="shrink-0 rounded-full border border-outline-variant/35 px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
              {session.role}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/35 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/50 hover:text-on-surface cursor-pointer"
          >
            <User className="h-3.5 w-3.5" />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      data-lenis-prevent
      className="medi-studio relative z-10 flex h-[calc(100svh-4rem)] w-full overflow-hidden text-on-surface"
    >
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`no-print hidden lg:flex min-h-0 shrink-0 flex-col border-r transition-[width,opacity] duration-200 ${
          desktopSidebarOpen ? 'medi-sidebar w-[268px] opacity-100' : 'w-0 overflow-hidden border-r-0 opacity-0'
        }`}
      >
        {renderSidebarBody()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="medi-sidebar relative z-10 h-full w-[268px] border-r shadow-2xl">
            {renderSidebarBody()}
          </aside>
        </div>
      )}

      {/* Main Full-Bleed AI Studio */}
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Subtle Architectural Grid Canvas */}
        <div className="medi-canvas-grid pointer-events-none absolute inset-0 opacity-75" aria-hidden="true" />

        {/* Minimal Top Header */}
        <header className="relative z-10 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-outline-variant/20 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSidebar}
              aria-label="Toggle case history"
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container/70 hover:text-on-surface cursor-pointer"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span className="truncate text-sm font-semibold text-on-surface">
                {activeCase ? activeCase.title : 'Medi'}
              </span>
            </div>
          </div>

          {visibleMessages.length > 0 && (
            <div className="no-print flex items-center gap-2">
              <button
                type="button"
                onClick={startNewCase}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/35 px-2.5 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/45 hover:text-on-surface cursor-pointer"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Export PDF plan"
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/35 px-2.5 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/45 hover:text-on-surface cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5 text-primary" />
                <span>PDF</span>
              </button>
            </div>
          )}
        </header>

        {/* Scrollable Canvas Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleThreadScroll}
          data-lenis-prevent
          className="medi-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 sm:px-8"
        >
          {visibleMessages.length === 0 ? (
            <div className="relative mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center py-10 text-center">
              <div className="medi-aurora pointer-events-none absolute h-72 w-72 rounded-full blur-2xl" aria-hidden="true" />

              <div className="medi-orb editorial-bracket relative flex h-14 w-14 items-center justify-center rounded-2xl text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>

              <h1 className="relative mt-5 font-headline-md text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                Start a clinical case
              </h1>

              {/* Centerpiece Command Dock */}
              <div className="relative mt-7 w-full text-left">
                {error && (
                  <div
                    role="alert"
                    className="mb-3 flex items-center gap-2 rounded-xl border border-error/35 bg-error-container/25 px-3 py-2 text-xs text-error"
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {renderComposer(true)}
              </div>

              {/* Architectural Clinical Starter Tiles */}
              <div className="relative mt-4 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3 text-left">
                {STARTER_PROMPTS.map(({ label, metric, Icon, prompt }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    onClick={() => handleSend(undefined, prompt)}
                    className="medi-starter-tile group flex flex-col justify-between gap-2.5 rounded-xl p-3.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-mono text-[10px] font-medium text-outline">{metric}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-on-surface">{label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-outline transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 pt-6 pb-44">
              {visibleMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isRtl = msg.language === 'ar';
                const isLatestAssistant = !isUser && idx === visibleMessages.length - 1;

                if (isUser) {
                  return (
                    <div key={msg.id} className="medi-msg-enter flex justify-end">
                      <div
                        dir={isRtl ? 'rtl' : 'ltr'}
                        className="medi-user-msg max-w-[88%] sm:max-w-[78%] rounded-[20px] rounded-tr-[6px] px-4 py-3 text-[14.5px] leading-relaxed"
                      >
                        <div className="whitespace-pre-line">{msg.content}</div>
                      </div>
                    </div>
                  );
                }

                const urgencyStyle = msg.structuredSummary?.urgency
                  ? URGENCY_STYLES[msg.structuredSummary.urgency]
                  : null;
                const followUps = isRtl ? FOLLOWUP_AR : FOLLOWUP_EN;

                return (
                  <div key={msg.id} className="medi-msg-enter space-y-2.5">
                    <article className="medi-ai-card flex items-start gap-3 sm:gap-4 rounded-2xl p-4 sm:p-5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                        <Stethoscope className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-3.5" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface">Medi</span>
                          {msg.structuredSummary?.urgency && urgencyStyle && (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${urgencyStyle.badge}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${urgencyStyle.dot}`} />
                              <span>{msg.structuredSummary.urgency}</span>
                            </span>
                          )}
                          <span className="text-[11px] text-outline">{msg.timestamp}</span>
                        </div>

                        {renderFormattedReply(msg.content)}

                        {msg.structuredSummary &&
                          ((msg.structuredSummary.differentials?.length ?? 0) > 0 ||
                            (msg.structuredSummary.recommendedNextSteps?.length ?? 0) > 0) && (
                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 text-xs">
                              {msg.structuredSummary.differentials &&
                                msg.structuredSummary.differentials.length > 0 && (
                                  <div className="medi-summary-card rounded-xl border-s-2 border-s-primary/75 p-3.5">
                                    <span className="block font-semibold uppercase tracking-wider text-primary text-[11px]">
                                      Differentials
                                    </span>
                                    <ul className="mt-2.5 space-y-1.5">
                                      {msg.structuredSummary.differentials.map((d, dIdx) => (
                                        <li key={d} className="flex items-start gap-2 text-on-surface-variant">
                                          <span className="font-mono text-[10px] text-primary/80 pt-0.5">
                                            {String(dIdx + 1).padStart(2, '0')}
                                          </span>
                                          <span>{d}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {msg.structuredSummary.recommendedNextSteps &&
                                msg.structuredSummary.recommendedNextSteps.length > 0 && (
                                  <div className="medi-summary-card rounded-xl border-s-2 border-s-secondary/75 p-3.5">
                                    <span className="block font-semibold uppercase tracking-wider text-secondary text-[11px]">
                                      Next Steps
                                    </span>
                                    <ul className="mt-2.5 space-y-1.5">
                                      {msg.structuredSummary.recommendedNextSteps.map((s, sIdx) => {
                                        const stepKey = `${msg.id}-${sIdx}`;
                                        const done = Boolean(checkedSteps[stepKey]);
                                        return (
                                          <li key={s}>
                                            <button
                                              type="button"
                                              aria-pressed={done}
                                              onClick={() => toggleStep(stepKey)}
                                              className="flex w-full items-start gap-2 text-start text-on-surface-variant transition-colors hover:text-on-surface cursor-pointer"
                                            >
                                              <span
                                                className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                                                  done
                                                    ? 'border-primary bg-primary text-on-primary'
                                                    : 'border-outline-variant/70'
                                                }`}
                                              >
                                                {done && <Check className="h-2.5 w-2.5" />}
                                              </span>
                                              <span className={done ? 'line-through opacity-60' : ''}>{s}</span>
                                            </button>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )}

                        <div className="no-print flex items-center gap-3 pt-1 text-[11px] text-outline">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            aria-label="Copy response"
                            className="inline-flex items-center gap-1 transition-colors hover:text-on-surface cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="h-3 w-3 text-success" />
                                <span className="text-success">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={sending}
                            onClick={() => handleRegenerate(idx)}
                            aria-label="Regenerate response"
                            className="inline-flex items-center gap-1 transition-colors hover:text-on-surface disabled:opacity-40 cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Regenerate</span>
                          </button>
                        </div>
                      </div>
                    </article>

                    {isLatestAssistant && !sending && (
                      <div
                        className="no-print flex flex-wrap items-center gap-1.5 ps-10"
                        dir={isRtl ? 'rtl' : 'ltr'}
                      >
                        {followUps.map((f) => (
                          <button
                            key={f.label}
                            type="button"
                            onClick={() => handleSend(undefined, f.prompt)}
                            className="medi-followup-pill rounded-full px-3 py-1 text-[11px] font-medium"
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div className="medi-ai-card flex items-center gap-3 sm:gap-4 rounded-2xl p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Stethoscope className="h-3.5 w-3.5" />
                  </div>
                  <TechCareLoader variant="pulse" size="sm" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom Floating Action */}
        {visibleMessages.length > 0 && showScrollDown && (
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            aria-label="Scroll to latest message"
            className="no-print absolute bottom-32 left-1/2 z-20 -translate-x-1/2 rounded-full border border-outline-variant/50 bg-surface-container/95 p-2 text-on-surface shadow-lg backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:border-primary/60 cursor-pointer"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        {/* Bottom Docked Composer (when conversation is active) */}
        {visibleMessages.length > 0 && (
          <div className="no-print medi-bottom-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 sm:px-8 pt-8 pb-4 sm:pb-5">
            <div className="pointer-events-auto mx-auto max-w-3xl">
              {error && (
                <div
                  role="alert"
                  className="mb-2.5 flex items-center gap-2 rounded-xl border border-error/35 bg-error-container/25 px-3 py-2 text-xs text-error"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {renderComposer(false)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
