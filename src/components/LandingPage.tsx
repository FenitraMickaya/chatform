import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Layers,
  BarChart3,
  Code2,
  Globe,
  Sliders,
  LogOut,
} from 'lucide-react';
import { Form, User } from '../types/index.ts';
import { ChatWidget } from './ChatWidget.tsx';
import { useLanguage, LanguageSwitcher } from '../i18n/index.tsx';

interface LandingPageProps {
  forms: Form[];
  currentUser?: User | null;
  isLoading?: boolean;
  onGoToDashboard: () => void;
  onCreateNew: () => void;
  onOpenEmbed: (form: Form) => void;
  onGoToAuth: () => void;
  onSignOut: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  forms,
  currentUser,
  isLoading = false,
  onGoToDashboard,
  onCreateNew,
  onOpenEmbed,
  onGoToAuth,
  onSignOut,
}) => {
  const { language, t } = useLanguage();
  const effectiveForms = forms ?? [];
  const [selectedDemoFormId, setSelectedDemoFormId] = useState<string>('');
  const [demoKey, setDemoKey] = useState<number>(1);
  const [demoSubmissionsCount, setDemoSubmissionsCount] = useState<number>(0);
  // Resolved on the client only (the server has no window), which keeps the
  // hydration consistent.
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ''
  );

  const activeDemoForm =
    effectiveForms.find((f) => f.id === selectedDemoFormId) || effectiveForms[0] || null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Nav links) — Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 hover:opacity-80 transition"
          >
            FormPulse
          </Link>

          {/* Zone 2: 4 Single-line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-600">
            <a href="#demo" className="hover:text-zinc-950 transition whitespace-nowrap shrink-0">
              Interactive Demo
            </a>
            <a href="#capabilities" className="hover:text-zinc-950 transition whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <a href="#workflow" className="hover:text-zinc-950 transition whitespace-nowrap shrink-0">
              Workflow
            </a>
            <a href="#embed" className="hover:text-zinc-950 transition whitespace-nowrap shrink-0">
              Embed Script
            </a>
          </nav>

          {/* Zone 3: Actions + Language Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher />

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={onGoToDashboard}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  {t('dashboard')}
                </button>
                <button type="button"
                  onClick={onGoToDashboard}
                  className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-900 text-[11px] font-bold flex items-center justify-center cursor-pointer transition"
                  title={`${currentUser.name} (${currentUser.email})`}
                >
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </button>
                <button type="button"
                  onClick={onSignOut}
                  className="w-7 h-7 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 flex items-center justify-center cursor-pointer transition"
                  title={t('signOut')}
                  aria-label={t('signOut')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={onGoToAuth}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
                >
                  {t('signIn')}
                </button>
                <button type="button"
                  onClick={onGoToAuth}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                >
                  {language === 'fr' ? 'Démarrer' : 'Get Started'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {language === 'fr' ? 'Moteur de formulaires conversationnels' : 'Conversational Form Engine'}
            </p>

            <h1
              className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              {language === 'fr'
                ? 'Des formulaires interactifs que vos utilisateurs complètent vraiment.'
                : 'Interactive forms that people actually finish.'}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed">
              {language === 'fr'
                ? 'Remplacez les formulaires austères par des conversations fluides et engageantes. Intégrez une bulle interactive ou un widget avec une seule ligne de code et suivez vos métriques de recommandation en direct.'
                : 'Replace rigid web forms with responsive, stepped chatbot conversations. Embed a floating widget on any site with a single script tag and manage submissions in a real-time analytics workspace.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button type="button"
                onClick={currentUser ? onCreateNew : onGoToAuth}
                className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-[0.98]"
              >
                <span>{currentUser ? t('dashboard') : (language === 'fr' ? 'Accéder au Studio' : 'Get Started Free')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#demo"
                className="px-5 py-2.5 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-800 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs"
              >
                {language === 'fr' ? 'Tester la démo en direct' : 'Try Live Playground'}
              </a>
            </div>

            {/* Unboxed metadata proof row */}
            <div className="pt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>{language === 'fr' ? 'Sans code' : 'Zero-code setup'}</span>
              <span aria-hidden="true">·</span>
              <span>{language === 'fr' ? '1 ligne de script' : '1-line JavaScript embed'}</span>
              <span aria-hidden="true">·</span>
              <span>{language === 'fr' ? 'Exports CSV & JSON' : 'CSV & JSON data exports'}</span>
              <span aria-hidden="true">·</span>
              <span>{language === 'fr' ? 'Métrique de recommandation' : 'NPS Recommendation Pulse'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section */}
      <section id="demo" className="py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Interactive Showcase
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Test the chatbot flow in real-time
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl">
              Select a form preset to inspect how inputs adapt per question type (text, email validation,
              multiple choice, yes/no, and star ratings).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#fafafa] border border-zinc-200 space-y-3">
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                  Select Form Preset
                </span>
                <div className="space-y-2">
                  {effectiveForms.map((f) => {
                    const isSelected = selectedDemoFormId === f.id;
                    return (
                      <button type="button"
                        key={f.id}
                        onClick={() => {
                          setSelectedDemoFormId(f.id);
                          setDemoKey((k) => k + 1);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-white border-zinc-900 shadow-xs'
                            : 'bg-white/80 border-zinc-200/80 hover:border-zinc-300'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-zinc-900">{f.title}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {f.questions.length} questions · {f.theme?.botName}
                          </div>
                        </div>
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: f.theme?.primaryColor || '#18181b' }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    Test submissions: <strong className="tabular-nums text-zinc-900">{demoSubmissionsCount}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => activeDemoForm && onOpenEmbed(activeDemoForm)}
                      className="text-zinc-700 hover:text-zinc-950 font-medium flex items-center gap-1 cursor-pointer transition"
                    >
                      <Code2 className="w-3.5 h-3.5" /> Embed
                    </button>
                    <button type="button"
                      onClick={() => setDemoKey((k) => k + 1)}
                      className="text-zinc-700 hover:text-zinc-950 font-medium flex items-center gap-1 cursor-pointer transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature Insight Card */}
              <div className="p-5 rounded-2xl bg-zinc-900 text-white space-y-3">
                <div className="text-xs font-semibold text-zinc-300">
                  Conversational Step Engine
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Respondents answer one prompt at a time with instant validation, keyboard submit, and zero overwhelm.
                </p>
                <div className="pt-1 text-[11px] text-zinc-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interactive responses captured live</span>
                </div>
              </div>
            </div>

            {/* Right: Chat Widget Container */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md h-[580px] bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                {activeDemoForm ? (
                  <ChatWidget
                    key={demoKey}
                    form={activeDemoForm}
                    mode="inline"
                    onSubmitSuccess={() => {
                      setDemoSubmissionsCount((c) => c + 1);
                    }}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {isLoading
                        ? 'Loading the live demo…'
                        : 'No published form yet'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {isLoading
                        ? 'Fetching the conversational forms published on this workspace.'
                        : 'Publish a form from the dashboard to see it live here.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Core Capabilities
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Engineered for response completion
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl">
              Every detail is calibrated to eliminate friction and maintain engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-950">Sequential Step Flow</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Presents one prompt at a time. Respondents focus on immediate answers without feeling
                overwhelmed by towering questionnaire columns.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-950">5 Input Archetypes</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Includes text fields, regex-validated email addresses, multiple-choice buttons,
                instant Yes/No toggles, and 1–5 star ratings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-950">1-Line Embed Snippet</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Add a lightweight &lt;script&gt; tag to any page. Works instantly on Shopify, Webflow,
                WordPress, React, or static HTML.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-950">Real-Time Data Sheets</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Submissions land in your database instantaneously. View individual records, breakdown
                charts, and export to CSV or JSON with one click.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-950">Direct Public Links</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Each published form generates an unbranded, distraction-free public URL tailored for
                direct sharing via email, social posts, or QR codes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-zinc-950">Theme & Tone Control</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Set accent colors, custom bot avatars, personalized greetings, and widget corner
                placement without touching frontend code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section with clean human numbering */}
      <section id="workflow" className="py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Architecture
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              From draft to live collection in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-zinc-400">01.</div>
              <h3 className="text-base font-semibold text-zinc-950">Assemble questions</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Compose questions, reorder steps, mark fields required, and test the conversational
                cadence inside the live studio builder.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-zinc-400">02.</div>
              <h3 className="text-base font-semibold text-zinc-950">Publish & copy snippet</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Toggle form status to Published. Copy your unique embed script or grab the standalone
                hosted link.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-zinc-400">03.</div>
              <h3 className="text-base font-semibold text-zinc-950">Analyze submissions</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Monitor incoming responses in real time. Review submission speed, check answer
                breakdowns, and export raw data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Embed Script Feature Highlight */}
      <section id="embed" className="py-20 bg-zinc-950 text-white border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Developer Embed Snippet
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              One script tag, zero external dependencies
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Paste this snippet right before &lt;/body&gt; on any website to mount the floating
              conversational widget.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
            <div className="text-zinc-500 mb-1">
              &lt;!-- FormPulse Embed Snippet --&gt;
            </div>
            <div>
              &lt;script src=&quot;{origin}/widget.js&quot;
                data-form-id=&quot;{activeDemoForm?.id ?? 'your-form-id'}&quot; data-position=&quot;bottom-right&quot; async&gt;&lt;/script&gt;
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <a
              href="#demo"
              className="px-4 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-100 transition cursor-pointer inline-flex items-center gap-2"
            >
              <span>Test Interactive Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="py-12 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-900">FormPulse</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Form & Chatbot Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button type="button"
              onClick={currentUser ? onGoToDashboard : onGoToAuth}
              className="hover:text-zinc-900 transition cursor-pointer"
            >
              {currentUser ? 'Dashboard' : 'Sign In'}
            </button>
            <button type="button"
              onClick={currentUser ? onCreateNew : onGoToAuth}
              className="hover:text-zinc-900 transition cursor-pointer"
            >
              Form Builder
            </button>
            <a href="#demo" className="hover:text-zinc-900 transition">
              Live Demo
            </a>
            <a href="#capabilities" className="hover:text-zinc-900 transition">
              Capabilities
            </a>
          </div>

          <div>
            <span>© 2026 FormPulse. Built with precision.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
