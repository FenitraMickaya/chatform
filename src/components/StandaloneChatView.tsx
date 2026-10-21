'use client';

import React from 'react';
import { Form, FormSubmission } from '../types/index.ts';
import { ChatWidget } from './ChatWidget.tsx';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../i18n/index.tsx';

interface StandaloneChatViewProps {
  form: Form | null;
  onGoHome?: () => void;
  onSubmitSuccess?: (submission: FormSubmission) => void;
}

export const StandaloneChatView: React.FC<StandaloneChatViewProps> = ({
  form,
  onGoHome,
  onSubmitSuccess,
}) => {
  const { language, t } = useLanguage();

  const goHome = onGoHome ?? (() => {
    if (typeof window !== 'undefined') window.location.href = '/';
  });

  if (!form) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 text-zinc-900">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-zinc-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-zinc-950">
            {language === 'fr' ? 'Formulaire introuvable' : 'Form Not Found'}
          </h2>
          <p className="text-xs text-zinc-500">
            {language === 'fr'
              ? 'Le formulaire conversationnel demandé est introuvable.'
              : 'The conversational form you requested could not be located.'}
          </p>
          {(
            <button type="button"
              onClick={goHome}
              className="mt-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition"
            >
              {language === 'fr' ? 'Aller sur FormPulse' : 'Go to FormPulse'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Check if form is published
  if (form.status !== 'published') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 text-zinc-900">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-zinc-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-600 mx-auto flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-zinc-950">
            {language === 'fr' ? 'Formulaire non publié' : 'Form Unpublished'}
          </h2>
          <p className="text-xs text-zinc-500">
            <strong className="text-zinc-800">« {form.title} »</strong>{' '}
            {language === 'fr'
              ? 'est actuellement en mode brouillon et n’accepte pas de réponses publiques.'
              : 'is currently in draft mode and not accepting public submissions.'}
          </p>
          {(
            <button type="button"
              onClick={goHome}
              className="mt-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition"
            >
              {t('dashboard')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between p-4 sm:p-6 text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Header */}
      <div className="max-w-lg w-full mx-auto flex items-center justify-between py-2 text-xs text-zinc-500">
        <div>
          {(
            <button type="button"
              onClick={goHome}
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 transition cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>FormPulse</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <Lock className="w-3 h-3 text-zinc-500" />
            <span>{language === 'fr' ? 'Réponse enregistrée' : 'Response recorded'}</span>
          </div>
        </div>
      </div>

      {/* Standalone Chat Container */}
      <div className="flex-1 flex items-center justify-center py-2">
        <ChatWidget
          form={form}
          mode="standalone"
          onSubmitSuccess={onSubmitSuccess}
        />
      </div>

      {/* Quiet Footer */}
      <div className="text-center py-2 text-[11px] text-zinc-400">
        FormPulse Conversational Platform
      </div>
    </div>
  );
};
