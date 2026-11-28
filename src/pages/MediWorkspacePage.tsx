import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUp,
  Check,
  Copy,
  FileDown,
  FlaskConical,
  HeartPulse,
  MessageSquarePlus,
  PanelLeft,
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

const STARTER_PROMPTS = [
  {
    label: 'Acute dyspnea',
    Icon: Wind,
    prompt:
      '45F with 3-day progressive dyspnea, HR 108 bpm, BP 112/70, SpO2 92% on room air, mild pedal edema. Outline immediate differentials and first-hour workup.',
  },
  {
    label: 'ألم بالصدر',
    Icon: HeartPulse,
    prompt:
      'مريض 54 سنة يعاني من ألم ضاغط في الصدر منذ ساعتين مع تعرق، الضغط 145/90 والنبض 98. ما هي الخطوات التشخيصية العاجلة؟',
  },
  {
    label: 'Renal dosing',
    Icon: FlaskConical,
    prompt:
      '68M eGFR dropped from 62 to 38 mL/min with Cr 1.9 mg/dL, currently on Metformin 1000mg BID and Lisinopril 10mg. Suggest safe medication adjustments.',
  },
] as const;

const URGENCY_STYLES: Record<'Routine' | 'Priority' | 'Urgent', string> = {
  Routine: 'border-outline-variant/40 bg-surface-container text-on-surface-variant',
  Priority: 'border-amber-400/35 bg-amber-400/10 text-amber-400',
  Urgent: 'border-error/40 bg-error-container/25 text-error',
};

export default function MediWorkspacePage() {
  const { setRouteScene, session, openAuthModal } = useScene();
  const [cases, setCases] = useState<ClinicalCase[]>(() => getSavedCases());
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [draftMessages, setDraftMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRouteScene('ambient-2d');
  }, [setRouteScene]);

  const activeCase = cases.find((c) => c.id === activeCaseId) ?? null;
  const visibleMessages = activeCase ? activeCase.messages : draftMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [visibleMessages.length, sending]);

  const startNewCase = () => {
    setActiveCaseId(null);
    setDraftMessages([]);
    setError('');
    setMobileSidebarOpen(false);
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
    setSending(true);

    try {
      const res = await sendClinicalQuery({
        query: text,
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

      if (activeCase) {
        const updated = cases.map((c) =>
          c.id === activeCase.id ? { ...c, messages: finalMessages, updatedAt: new Date().toISOString() } : c,
        );
        setCases(updated);
        if (session) saveCases(updated);
      } else {
        const newCase: ClinicalCase = {
          id: `case-${Date.now().toString(36)}`,
          title: text.slice(0, 44) + (text.length > 44 ? '...' : ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: finalMessages,
        };
        const nextCases = [newCase, ...cases];
        setCases(nextCases);
        setActiveCaseId(newCase.id);
        setDraftMessages([]);
        if (session) saveCases(nextCases);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach Medi AI service.');
    } finally {
      setSending(false);
    }
  };

  const renderSidebarBody = () => (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="font-headline-sm text-sm font-bold tracking-tight text-on-surface">Medi</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={startNewCase}
              aria-label="New case"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-on-primary cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close case history"
              className="rounded-lg p-1.5 text-on-surface-variant hover:text-on-surface lg:hidden cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex items-center justify-between px-1">
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
            <p className="px-1 py-2 text-xs text-outline">No cases yet</p>
          ) : (
            <div className="flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
              {cases.map((c) => {
                const isActive = c.id === activeCaseId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCaseId(c.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-primary/14 font-semibold text-on-surface ring-1 ring-primary/35'
                        : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
                    }`}
                  >
                    <span className="block truncate">{c.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compact Session Footer */}
      <div className="mt-4 border-t border-outline-variant/25 pt-3">
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
    <div className="relative z-10 mx-auto flex h-[calc(100svh-4.5rem)] w-full max-w-[1520px] flex-col px-3 sm:px-6 md:px-margin-desktop py-3 sm:py-5 text-on-surface">
      <div className="medi-shell relative flex min-h-0 flex-1 overflow-hidden rounded-[24px]">
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={`no-print hidden lg:flex shrink-0 flex-col border-r transition-[width,opacity] duration-200 ${
            desktopSidebarOpen ? 'medi-sidebar w-72 opacity-100' : 'w-0 overflow-hidden border-r-0 opacity-0'
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
            <aside className="medi-sidebar relative z-10 h-full w-72 border-r shadow-2xl">
              {renderSidebarBody()}
            </aside>
          </div>
        )}

        {/* Main Editorial AI Canvas */}
        <section className="relative flex min-w-0 flex-1 flex-col">
          {/* Minimal Top Bar */}
          <header className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-outline-variant/20 px-4 sm:px-6">
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

          {/* Messages / Empty Canvas */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-8 py-6">
            {visibleMessages.length === 0 ? (
              <div className="relative mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-8 text-center">
                <div className="medi-aurora pointer-events-none absolute h-64 w-64 rounded-full blur-2xl" aria-hidden="true" />

                <div className="medi-orb relative flex h-16 w-16 items-center justify-center rounded-2xl text-primary">
                  <Stethoscope className="h-7 w-7" />
                </div>

                <h1 className="relative mt-6 font-headline-md text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                  Start a clinical case
                </h1>

                <div className="relative mt-7 flex flex-wrap items-center justify-center gap-2.5">
                  {STARTER_PROMPTS.map(({ label, Icon, prompt }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSend(undefined, prompt)}
                      className="medi-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-on-surface cursor-pointer"
                    >
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {visibleMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isRtl = msg.language === 'ar';

                  if (isUser) {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div
                          dir={isRtl ? 'rtl' : 'ltr'}
                          className="medi-user-msg max-w-[88%] sm:max-w-[78%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
                        >
                          <div className="whitespace-pre-line">{msg.content}</div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <article key={msg.id} className="flex items-start gap-3 sm:gap-3.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                        <Stethoscope className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-3" dir={isRtl ? 'rtl' : 'ltr'}>
                        {msg.structuredSummary?.urgency && (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              URGENCY_STYLES[msg.structuredSummary.urgency]
                            }`}
                          >
                            {msg.structuredSummary.urgency}
                          </span>
                        )}

                        <div className="whitespace-pre-line text-sm leading-7 text-on-surface">
                          {msg.content}
                        </div>

                        {msg.structuredSummary &&
                          ((msg.structuredSummary.differentials?.length ?? 0) > 0 ||
                            (msg.structuredSummary.recommendedNextSteps?.length ?? 0) > 0) && (
                            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 text-xs">
                              {msg.structuredSummary.differentials &&
                                msg.structuredSummary.differentials.length > 0 && (
                                  <div className="medi-summary-card rounded-xl p-3.5">
                                    <span className="block font-semibold uppercase tracking-wider text-primary text-[11px]">
                                      Differentials
                                    </span>
                                    <ul className="mt-2 list-disc ps-4 space-y-1 text-on-surface-variant">
                                      {msg.structuredSummary.differentials.map((d) => (
                                        <li key={d}>{d}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {msg.structuredSummary.recommendedNextSteps &&
                                msg.structuredSummary.recommendedNextSteps.length > 0 && (
                                  <div className="medi-summary-card rounded-xl p-3.5">
                                    <span className="block font-semibold uppercase tracking-wider text-secondary text-[11px]">
                                      Next Steps
                                    </span>
                                    <ul className="mt-2 list-disc ps-4 space-y-1 text-on-surface-variant">
                                      {msg.structuredSummary.recommendedNextSteps.map((s) => (
                                        <li key={s}>{s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )}

                        <div className="no-print flex items-center gap-3 text-[11px] text-outline">
                          <span>{msg.timestamp}</span>
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
                        </div>
                      </div>
                    </article>
                  );
                })}

                {sending && (
                  <div className="flex items-center gap-3 sm:gap-3.5">
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

          {/* Floating Command Composer */}
          <div className="no-print shrink-0 px-4 sm:px-8 pb-4 sm:pb-5 pt-2">
            <div className="mx-auto max-w-3xl">
              {error && (
                <div
                  role="alert"
                  className="mb-2.5 flex items-center gap-2 rounded-xl border border-error/35 bg-error-container/25 px-3 py-2 text-xs text-error"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={(e) => handleSend(e)} className="medi-composer flex items-end gap-2 p-2.5 pl-4">
                <textarea
                  id="medi-case-input"
                  name="clinicalCaseInput"
                  aria-label="Clinical case input"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Enter symptoms, vitals, or labs..."
                  className="max-h-36 min-h-[38px] flex-1 resize-none bg-transparent py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Send clinical case"
                  className="auth-modern-cta inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl disabled:opacity-40 cursor-pointer"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
