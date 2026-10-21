import React, { useState } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  RotateCcw,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Form, FormSubmission } from '../types/index.ts';
import { ChatWidget } from './ChatWidget.tsx';

interface WebsiteSimulatorProps {
  form: Form;
  allForms: Form[];
  onSelectForm: (form: Form) => void;
  onBack: () => void;
  onViewSubmissions: (form: Form) => void;
}

export const WebsiteSimulator: React.FC<WebsiteSimulatorProps> = ({
  form: propForm,
  allForms,
  onSelectForm,
  onBack,
  onViewSubmissions,
}) => {
  const effectiveForms = allForms ?? [];
  const form = propForm || effectiveForms[0] || null;
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [simKey, setSimKey] = useState<number>(1);
  const [lastSubmission, setLastSubmission] = useState<FormSubmission | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100 selection:bg-zinc-800">
      {/* Simulation Sandbox Control Bar */}
      <header className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Host Site Embed Simulation
            </div>
            <div className="text-xs text-zinc-300 font-mono">
              Simulating script mount on: <span className="text-white font-medium">https://acme-cloud.io</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Form Switcher */}
          <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700 text-xs">
            <span className="text-zinc-400">Active Form:</span>
            <select
              value={form.id}
              onChange={(e) => {
                const found = effectiveForms.find((f) => f.id === e.target.value);
                if (found) {
                  onSelectForm(found);
                  setSimKey((k) => k + 1);
                }
              }}
              className="bg-transparent font-medium text-white border-none focus:outline-none cursor-pointer"
            >
              {effectiveForms.map((f) => (
                <option key={f.id} value={f.id} className="bg-zinc-900 text-white">
                  {f.title}
                </option>
              ))}
            </select>
          </div>

          {/* Device toggle */}
          <div className="inline-flex p-0.5 bg-zinc-800 rounded-lg border border-zinc-700">
            <button type="button"
              onClick={() => setDevice('desktop')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer flex items-center gap-1 ${
                device === 'desktop'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button type="button"
              onClick={() => setDevice('mobile')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer flex items-center gap-1 ${
                device === 'mobile'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>

          <button type="button"
            onClick={() => setSimKey((k) => k + 1)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Reload Frame"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Submission Success Toast */}
      {lastSubmission && (
        <div className="fixed top-16 right-6 z-50 bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-semibold text-zinc-100">Saved to Database</div>
            <div className="text-[11px] text-zinc-400 font-mono">ID: {lastSubmission.id}</div>
          </div>
          <button type="button"
            onClick={() => onViewSubmissions(form)}
            className="ml-2 px-2.5 py-1 rounded-md bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition cursor-pointer"
          >
            View Submissions
          </button>
        </div>
      )}

      {/* Simulated Browser Frame */}
      <div className="flex-1 flex justify-center items-center p-4 sm:p-6 overflow-hidden">
        <div
          className={`relative transition-all duration-200 bg-white text-zinc-900 shadow-2xl overflow-hidden flex flex-col ${
            device === 'mobile'
              ? 'w-[380px] h-[740px] rounded-[36px] border-[8px] border-zinc-800'
              : 'w-full max-w-5xl h-[calc(100vh-120px)] rounded-xl border border-zinc-800'
          }`}
        >
          {/* Browser Address Bar */}
          <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs text-zinc-500 select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
            </div>
            <div className="bg-white px-3 py-0.5 rounded-md border border-zinc-200 text-zinc-600 font-mono text-[11px] flex items-center gap-1 shadow-2xs">
              <span className="text-zinc-400">https://</span>
              <span>acme-cloud.io/solutions</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Widget Active</span>
          </div>

          {/* Webpage Content */}
          <div className="flex-1 overflow-y-auto bg-white relative">
            <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="font-bold text-base tracking-tight text-zinc-950">
                AcmeCloud
              </div>
              <div className="hidden sm:flex items-center gap-5 text-xs font-medium text-zinc-600">
                <a href="#solutions" className="hover:text-zinc-950">Platform</a>
                <a href="#solutions" className="hover:text-zinc-950">Solutions</a>
                <a href="#solutions" className="hover:text-zinc-950">Pricing</a>
              </div>
              <button type="button" className="px-3 py-1 rounded-md bg-zinc-950 text-white text-xs font-medium">
                Client Portal
              </button>
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-12 text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Cloud Computing Infrastructure
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-tight">
                High-performance edge systems for engineering teams
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
                Deploy microservices, manage databases, and capture client inquiries directly through
                automated customer pipelines.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button type="button" className="px-4 py-2 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition">
                  Start Trial
                </button>
                <button type="button" className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 text-xs font-medium hover:bg-zinc-50 transition">
                  Documentation
                </button>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs text-zinc-950">Low Latency</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Sub-20ms TTFB across regional edge points of presence.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs text-zinc-950">Data Security</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  SOC2 certified, GDPR compliant, automated DDoS scrubbing.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs text-zinc-950">Team Permissions</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Role-based access control with audit trails and webhooks.
                </p>
              </div>
            </div>

            {/* THE FLOATING CHATBOT WIDGET ACTIVE ON THIS SIMULATED SITE */}
            <ChatWidget
              key={simKey}
              form={form}
              mode="floating"
              isOpenInitial={false}
              onSubmitSuccess={(submission) => {
                setLastSubmission(submission);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
