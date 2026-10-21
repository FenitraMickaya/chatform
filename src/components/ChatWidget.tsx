'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  X,
  RotateCcw,
  Bot,
  Sparkles,
  HelpCircle,
  User,
  Zap,
  CheckCircle2,
  ChevronRight,
  Star,
  CornerDownLeft,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Form, FormQuestion, FormSubmission } from '../types/index.ts';
import { useLanguage } from '../i18n/index.tsx';

interface ChatWidgetProps {
  form: Form;
  mode?: 'floating' | 'inline' | 'standalone';
  onSubmitSuccess?: (submission: FormSubmission) => void;
  isOpenInitial?: boolean;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  questionId?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  form: propForm,
  mode = 'inline',
  onSubmitSuccess,
  isOpenInitial = true,
}) => {
  const { language, t } = useLanguage();
  const form = propForm;
  const [isOpen, setIsOpen] = useState(mode !== 'floating' ? true : isOpenInitial);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const primaryColor = form.theme?.primaryColor || '#18181b';
  const botName = form.theme?.botName || 'Assistant';
  const botAvatar = form.theme?.botAvatar || 'bot';
  const questions = form.questions || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial greeting
  useEffect(() => {
    resetChat();
  }, [form.id]);

  const resetChat = () => {
    setAnswers({});
    setIsCompleted(false);
    setInputError(null);
    setCurrentQuestionIndex(-1);

    const welcomeMsg: Message = {
      id: 'welcome',
      sender: 'bot',
      text: form.theme?.welcomeMessage || 'Hello! Let us get started with a few questions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcomeMsg]);

    if (questions.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        const q0 = questions[0];
        setCurrentQuestionIndex(0);
        setMessages((prev) => [
          ...prev,
          {
            id: `q_${q0.id}`,
            sender: 'bot',
            text: q0.title + (q0.description ? `\n${q0.description}` : ''),
            questionId: q0.id,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 600);
      return () => clearTimeout(timer);
    }
  };

  const renderBotAvatar = () => {
    switch (botAvatar) {
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-white" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-white" />;
      case 'help':
        return <HelpCircle className="w-4 h-4 text-white" />;
      case 'user':
        return <User className="w-4 h-4 text-white" />;
      default:
        return <Bot className="w-4 h-4 text-white" />;
    }
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleNextQuestion = async (
    qIndex: number,
    value: string | number,
    newAnswers: Record<string, string | number | string[]>
  ) => {
    const nextIndex = qIndex + 1;

    if (nextIndex < questions.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const nextQ = questions[nextIndex];
        setCurrentQuestionIndex(nextIndex);
        setMessages((prev) => [
          ...prev,
          {
            id: `q_${nextQ.id}`,
            sender: 'bot',
            text: nextQ.title + (nextQ.description ? `\n${nextQ.description}` : ''),
            questionId: nextQ.id,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 550);
    } else {
      setIsTyping(true);
      setIsSubmitting(true);
      const completionSeconds = Math.round((Date.now() - startTime) / 1000);

      try {
        const { api } = await import('../services/api.ts');
        const submission = await api.submitResponse(form.id, newAnswers, completionSeconds);
        if (onSubmitSuccess) {
          onSubmitSuccess(submission);
        }

        setIsSubmitting(false);
        setIsTyping(false);
        setIsCompleted(true);
        setCurrentQuestionIndex(questions.length);

        setMessages((prev) => [
          ...prev,
          {
            id: 'thankyou',
            sender: 'bot',
            text:
              form.theme?.thankYouMessage ||
              'Thank you! Your response has been securely saved.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        try {
          confetti({
            particleCount: 65,
            spread: 60,
            origin: { y: 0.65 },
          });
        } catch {}
      } catch (e) {
        // The response was NOT recorded: keep the user in the flow and say so.
        console.error('Failed to submit response', e);
        setIsSubmitting(false);
        setIsTyping(false);
        setInputError(
          language === 'fr'
            ? 'Votre réponse n’a pas pu être enregistrée. Veuillez réessayer.'
            : 'Your response could not be saved. Please try again.'
        );
        setMessages((prev) => [
          ...prev,
          {
            id: `submit_error_${Date.now()}`,
            sender: 'bot',
            text:
              language === 'fr'
                ? 'Oups, l’envoi a échoué. Vos réponses sont conservées — réessayez.'
                : 'Oops, the submission failed. Your answers are kept — please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  };

  const submitAnswer = (val: string | number, customDisplayText?: string) => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) return;
    const currentQ = questions[currentQuestionIndex];

    if (currentQ.required) {
      if (val === '' || val === undefined || val === null) {
        setInputError(language === 'fr' ? 'Ce champ est obligatoire.' : 'This field is required.');
        return;
      }
    }

    if (currentQ.type === 'email' && val) {
      if (!validateEmail(String(val))) {
        setInputError(language === 'fr' ? 'Veuillez saisir une adresse email valide.' : 'Please enter a valid email address.');
        return;
      }
    }

    setInputError(null);

    const displayVal = customDisplayText || String(val);
    const userMsg: Message = {
      id: `ans_${currentQ.id}_${Date.now()}`,
      sender: 'user',
      text: displayVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newAnswers = {
      ...answers,
      [currentQ.id]: val,
    };

    setAnswers(newAnswers);
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    handleNextQuestion(currentQuestionIndex, val, newAnswers);
  };

  const handleSkip = () => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) return;
    const currentQ = questions[currentQuestionIndex];
    if (currentQ.required) return;

    setInputError(null);
    const userMsg: Message = {
      id: `ans_skip_${currentQ.id}`,
      sender: 'user',
      text: language === 'fr' ? '(Ignoré)' : '(Skipped)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newAnswers = {
      ...answers,
      [currentQ.id]: '',
    };

    setAnswers(newAnswers);
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    handleNextQuestion(currentQuestionIndex, '', newAnswers);
  };

  const currentQ: FormQuestion | undefined =
    currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : undefined;

  const progressPercent =
    questions.length > 0
      ? Math.min(100, Math.round(((currentQuestionIndex + (isCompleted ? 1 : 0)) / questions.length) * 100))
      : 100;

  // Floating trigger button
  if (mode === 'floating' && !isOpen) {
    const isLeft = form.theme?.position === 'bottom-left';
    return (
      <button type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${
          isLeft ? 'left-6' : 'right-6'
        } z-50 flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer`}
        style={{ backgroundColor: primaryColor }}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {renderBotAvatar()}
        </div>
        <span className="text-xs font-semibold tracking-wide">
          {form.theme?.launcherText || 'Chat with Us'}
        </span>
      </button>
    );
  }

  const containerClasses =
    mode === 'floating'
      ? `fixed bottom-6 ${
          form.theme?.position === 'bottom-left' ? 'left-6' : 'right-6'
        } z-50 w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[85vh] flex flex-col rounded-2xl shadow-xl overflow-hidden border border-zinc-200 bg-white transition-all`
      : mode === 'standalone'
      ? 'w-full max-w-lg mx-auto h-[640px] max-h-[88vh] flex flex-col rounded-2xl shadow-sm overflow-hidden border border-zinc-200 bg-white'
      : 'w-full h-full min-h-[480px] flex flex-col rounded-2xl shadow-none overflow-hidden bg-white';

  return (
    <div className={containerClasses}>
      {/* Widget Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between text-white shrink-0 select-none"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
            {renderBotAvatar()}
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight text-white">
              {botName}
            </div>
            <div className="text-[11px] text-white/80">
              Online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button type="button"
            onClick={resetChat}
            title="Restart"
            className="p-1 rounded-md hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {mode === 'floating' && (
            <button type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {form.theme?.showProgressBar && (
        <div className="w-full bg-zinc-100 h-1 overflow-hidden shrink-0">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: primaryColor,
            }}
          />
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#fafafa]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                  isBot
                    ? 'bg-white text-zinc-900 border border-zinc-200/90 rounded-bl-xs'
                    : 'text-white rounded-br-xs'
                }`}
                style={!isBot ? { backgroundColor: primaryColor } : {}}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1 text-right tabular-nums ${
                    isBot ? 'text-zinc-400' : 'text-white/70'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs pl-8 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.3s]" />
          </div>
        )}

        {/* Completed Card */}
        {isCompleted && (
          <div className="mt-4 p-5 rounded-xl bg-white border border-zinc-200 text-center space-y-2">
            <div className="w-9 h-9 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-semibold text-zinc-950 text-sm">{t('responseSaved')}</div>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              {t('responseSavedDesc')}
            </p>
            <button type="button"
              onClick={resetChat}
              className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              {t('fillAgain')}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Answer Controls */}
      {!isCompleted && currentQ && !isTyping && (
        <div className="p-3 sm:p-4 border-t border-zinc-200/80 bg-white shrink-0">
          {inputError && (
            <div className="text-xs text-rose-600 mb-2 font-medium">
              {inputError}
            </div>
          )}

          {/* Multiple Choice */}
          {currentQ.type === 'multiple_choice' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                {(currentQ.options || []).map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => submitAnswer(opt)}
                    className="w-full text-left px-3 py-2 rounded-lg border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 text-zinc-800 text-xs font-medium transition cursor-pointer flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                ))}
              </div>
              {!currentQ.required && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                >
                  {t('skipOptional')}
                </button>
              )}
            </div>
          )}

          {/* Yes / No & Recommendation */}
          {currentQ.type === 'yes_no' && (() => {
            const isRecommendQ =
              currentQ.id.toLowerCase().includes('recommend') ||
              currentQ.title.toLowerCase().includes('recommend') ||
              currentQ.title.toLowerCase().includes('recommand');

            const yesLabel = isRecommendQ ? t('recommendYes') : t('yes');
            const noLabel = isRecommendQ ? t('recommendNo') : t('no');

            return (
              <div className="space-y-2">
                {isRecommendQ && (
                  <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50/90 px-3 py-1.5 rounded-lg border border-emerald-200/80 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {language === 'fr' ? 'Recommandation de l’outil' : 'Tool Recommendation'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold">Pulse NPS</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => submitAnswer('Yes', yesLabel)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                      isRecommendQ
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
                        : 'border-zinc-300 hover:border-zinc-900 bg-white text-zinc-900'
                    }`}
                  >
                    {yesLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => submitAnswer('No', noLabel)}
                    className="py-2.5 px-3 rounded-xl border border-zinc-300 hover:border-zinc-500 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition-all cursor-pointer text-center shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {noLabel}
                  </button>
                </div>
                {!currentQ.required && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                  >
                    {t('skipOptional')}
                  </button>
                )}
              </div>
            );
          })()}

          {/* Rating */}
          {currentQ.type === 'rating' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => submitAnswer(star)}
                    className="p-1.5 rounded-lg text-zinc-300 hover:text-amber-500 transition cursor-pointer hover:scale-110"
                    title={`${star} ${t('starsOutOfFive')}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                    <span className="block text-[10px] font-mono tabular-nums text-zinc-400 text-center mt-0.5">
                      {star}
                    </span>
                  </button>
                ))}
              </div>
              {!currentQ.required && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                  >
                    {t('skipOptional')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text & Email */}
          {(currentQ.type === 'text' || currentQ.type === 'email') && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitAnswer(inputValue.trim());
              }}
              className="space-y-2"
            >
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type={currentQ.type === 'email' ? 'email' : 'text'}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder={
                    currentQ.placeholder ||
                    (currentQ.type === 'email' ? 'name@example.com' : t('typeYourAnswer'))
                  }
                  className="w-full pl-3 pr-10 py-2 rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() && currentQ.required}
                  className="absolute right-1 p-1.5 rounded-md text-white disabled:opacity-30 transition cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
                <span className="flex items-center gap-1 font-mono text-[10px]">
                  <CornerDownLeft className="w-3 h-3" /> {t('pressEnter')}
                </span>
                {!currentQ.required && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="hover:text-zinc-600 underline cursor-pointer"
                  >
                    {t('skip')}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Footer Branding */}
      <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 select-none">
        <span>FormPulse Chat</span>
        <span>{language === 'fr' ? 'Réponse sécurisée' : 'Secure response'}</span>
      </div>
    </div>
  );
};
