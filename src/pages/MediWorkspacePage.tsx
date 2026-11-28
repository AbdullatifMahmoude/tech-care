import { useEffect, useState, type FormEvent } from 'react';
import {
  FileDown,
  History,
  MessageSquarePlus,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserCheck,
} from 'lucide-react';
import { useScene } from '../context/SceneContext';
import { isLiveAiConfigured, sendClinicalQuery } from '../services/aiClient';
import { clearSavedCases, getSavedCases, saveCases } from '../services/authService';
import type { ChatMessage, ClinicalCase } from '../types/techcare';
import { TechCareLoader } from '../components/ui/TechCareLoader';

const STARTER_PROMPTS = [
  {
    label: 'Acute dyspnea differential',
    prompt:
      '45F with 3-day progressive dyspnea, HR 108 bpm, BP 112/70, SpO2 92% on room air, mild pedal edema. Outline immediate differentials and first-hour workup.',
  },
  {
    label: 'حالة ألم بالصدر (Arabic)',
    prompt:
      'مريض 54 سنة يعاني من ألم ضاغط في الصدر منذ ساعتين مع تعرق، الضغط 145/90 والنبض 98. ما هي الخطوات التشخيصية العاجلة؟',
  },
  {
    label: 'Renal dosing & lab check',
    prompt:
      '68M eGFR dropped from 62 to 38 mL/min with Cr 1.9 mg/dL, currently on Metformin 1000mg BID and Lisinopril 10mg. Suggest safe medication adjustments.',
  },
];

export default function MediWorkspacePage() {
  const { setRouteScene, session, openAuthModal } = useScene();
  const [cases, setCases] = useState<ClinicalCase[]>(() => getSavedCases());
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [draftMessages, setDraftMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setRouteScene('ambient-2d');
  }, [setRouteScene]);

  const activeCase = cases.find((c) => c.id === activeCaseId) ?? null;
  const visibleMessages = activeCase ? activeCase.messages : draftMessages;

  const startNewCase = () => {
    setActiveCaseId(null);
    setDraftMessages([]);
    setError('');
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
          title: text.slice(0, 48) + (text.length > 48 ? '...' : ''),
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

  return (
    <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-[1600px] flex-col px-4 sm:px-6 md:px-margin-desktop py-4 sm:py-6 text-on-surface">
      <div className="grid flex-1 grid-cols-1 gap-5 lg:gap-6 lg:grid-cols-12">
        {/* Left Clinical Sidebar */}
        <aside className="no-print order-2 lg:order-1 lg:col-span-3 flex flex-col justify-between rounded-3xl border border-outline-variant/35 bg-surface-container-low/85 p-4 sm:p-5 backdrop-blur-xl">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                    Clinical workspace
                  </span>
                  <h1 className="font-headline-sm text-base font-bold text-on-surface">Medi</h1>
                </div>
              </div>

              <button
                type="button"
                onClick={startNewCase}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-on-primary hover:bg-primary-fixed cursor-pointer"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Guest Mode / Signed-in Status Banner */}
            {session ? (
              <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-success">
                  <UserCheck className="h-4 w-4" />
                  <span>Local session · {session.role}</span>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Local session active for <strong className="text-on-surface">{session.name}</strong> — no patient data is stored on servers.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <span className="block text-xs font-bold text-primary">Local demo mode</span>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                  Explore Medi directly. All sessions stay local in your browser — Tech Care does not store patient or client data.
                </p>
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="mt-3 w-full rounded-full bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary-fixed cursor-pointer"
                >
                  Sign in (Local Session)
                </button>
              </div>
            )}

            {/* Local Case Thread */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-outline">
                  <History className="h-3.5 w-3.5" />
                  <span>Local Session</span>
                </div>
                {cases.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearSavedCases();
                      setCases([]);
                      setActiveCaseId(null);
                      setDraftMessages([]);
                    }}
                    className="text-[11px] font-semibold text-outline hover:text-error cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              {cases.length === 0 ? (
                <p className="rounded-xl border border-outline-variant/25 bg-surface-container/50 p-3 text-xs text-on-surface-variant">
                  No local session threads yet. Start a clinical case on the right.
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {cases.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCaseId(c.id)}
                      className={`w-full rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${
                        c.id === activeCaseId
                          ? 'border-primary/60 bg-primary/15 font-semibold text-on-surface'
                          : 'border-outline-variant/25 bg-surface-container/50 text-on-surface-variant hover:border-outline-variant/60'
                      }`}
                    >
                      <span className="block truncate">{c.title}</span>
                      <span className="mt-1 block text-[10px] text-outline">
                        {c.messages.length} messages
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/70 p-3 text-[11px] text-on-surface-variant">
            <strong className="text-primary">AI Endpoint:</strong>{' '}
            {isLiveAiConfigured() ? 'Connected via VITE_AI_API_URL' : 'Demo Simulation Engine (connect VITE_AI_API_URL for live LLM)'}
          </div>
        </aside>

        {/* Main Clinical Case Area */}
        <section className="order-1 lg:order-2 lg:col-span-9 min-h-[62svh] lg:min-h-[calc(100vh-8rem)] flex flex-col rounded-3xl border border-outline-variant/40 bg-surface-container-low/85 shadow-2xl backdrop-blur-xl">
          {/* Top Workspace Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-outline-variant/25 px-4 sm:px-6 py-3.5 sm:py-4">
            <div>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                <span className="text-primary">Medi</span> — The Physician&apos;s Personal Clinical Assistant
              </h2>
              <p className="text-xs text-on-surface-variant">
                Bilingual clinical reasoning · Assists doctors only · Local session
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-container/80 px-4 py-2 text-xs font-semibold text-on-surface transition-colors hover:border-primary/60 hover:text-primary cursor-pointer"
            >
              <FileDown className="h-4 w-4 text-primary" />
              <span>PDF Plan</span>
            </button>
          </div>

          {/* Messages or Empty Start Screen */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {visibleMessages.length === 0 ? (
              <div className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 text-primary shadow-[0_8px_24px_-6px_rgba(0,125,117,0.22)]">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="mt-6 font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
                  Start a clinical case
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  Send symptoms, history, vitals, labs, imaging notes, or clinical questions. Medi will answer in the same language you use.
                </p>

                <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 text-left">
                  {STARTER_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSend(undefined, item.prompt)}
                      className="rounded-2xl border border-outline-variant/40 bg-surface-container/75 p-4 transition-all hover:border-primary/60 cursor-pointer"
                    >
                      <span className="block text-xs font-bold text-primary">{item.label}</span>
                      <span className="mt-1.5 line-clamp-3 block text-[11px] leading-relaxed text-on-surface-variant">
                        {item.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {visibleMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      dir={msg.language === 'ar' ? 'rtl' : 'ltr'}
                      className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-tr-sm bg-primary text-on-primary font-medium'
                          : 'rounded-tl-sm border border-outline-variant/40 bg-surface-container/90 text-on-surface'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      {msg.structuredSummary && msg.structuredSummary.differentials && msg.structuredSummary.differentials.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-outline-variant/25 pt-3 sm:grid-cols-2 text-xs">
                          <div>
                            <span className="block font-bold uppercase tracking-wider text-primary">
                              Key Considerations
                            </span>
                            <ul className="mt-1 list-disc pl-4 space-y-1 text-on-surface-variant">
                              {msg.structuredSummary.differentials.map((d) => (
                                <li key={d}>{d}</li>
                              ))}
                            </ul>
                          </div>
                          {msg.structuredSummary.recommendedNextSteps && (
                            <div>
                              <span className="block font-bold uppercase tracking-wider text-secondary">
                                Next Steps
                              </span>
                              <ul className="mt-1 list-disc pl-4 space-y-1 text-on-surface-variant">
                                {msg.structuredSummary.recommendedNextSteps.map((s) => (
                                  <li key={s}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-4 text-[10px] opacity-70">
                        <span>{msg.timestamp}</span>
                        {msg.mode && <span>{msg.mode === 'live' ? 'Live AI' : 'Demo Clinical AI'}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center rounded-2xl rounded-tl-sm border border-outline-variant/40 bg-surface-container/90 px-4 py-2.5">
                      <TechCareLoader size="sm" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="no-print border-t border-outline-variant/25 p-4 sm:p-5">
            {error && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
                <ShieldAlert className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={(e) => handleSend(e)} className="flex items-end gap-3">
              <textarea
                id="medi-case-input"
                name="clinicalCaseInput"
                aria-label="Clinical case input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Enter symptoms, vitals, labs, imaging notes, or ask in English or Arabic..."
                className="flex-1 resize-none rounded-2xl border border-outline-variant/60 bg-surface-container-lowest/90 px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send clinical case"
                className="btn-primary-glow inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary hover:bg-primary-fixed disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
