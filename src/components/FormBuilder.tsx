import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Palette,
  Check,
  Share2,
  Type,
  Mail,
  ListOrdered,
  ToggleLeft,
  Star,
  Smartphone,
  Monitor,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { Form, FormQuestion, QuestionType, BotAvatar, WidgetPosition } from '../types/index.ts';
import { ChatWidget } from './ChatWidget.tsx';
import { useLanguage, LanguageSwitcher } from '../i18n/index.tsx';

interface FormBuilderProps {
  form: Form;
  onSave: (form: Form) => void;
  onBack: () => void;
  onOpenEmbed: (form: Form) => void;
}

const PRESET_COLORS = [
  { name: 'Obsidian', value: '#18181b' },
  { name: 'Indigo', value: '#4338ca' },
  { name: 'Cobalt', value: '#1d4ed8' },
  { name: 'Emerald', value: '#047857' },
  { name: 'Rose', value: '#be123c' },
  { name: 'Amber', value: '#b45309' },
  { name: 'Slate', value: '#334155' },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({
  form: initialForm,
  onSave,
  onBack,
  onOpenEmbed,
}) => {
  const { language, t } = useLanguage();
  const [form, setForm] = useState<Form>(initialForm);
  const [activeTab, setActiveTab] = useState<'questions' | 'theme'>('questions');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(1);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const updateForm = (updater: (prev: Form) => Form) => {
    setForm((prev) => {
      const updated = updater(prev);
      onSave(updated);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
      return updated;
    });
  };

  const addQuestion = (type: QuestionType = 'text') => {
    const newId = `q_${Date.now()}`;
    let newQ: FormQuestion = {
      id: newId,
      type,
      title: type === 'rating' ? 'How would you rate your experience?' : 'New Question Title',
      description: '',
      required: true,
      placeholder: type === 'email' ? 'name@example.com' : 'Your answer...',
    };

    if (type === 'multiple_choice') {
      newQ.options = ['Option 1', 'Option 2', 'Option 3'];
    }
    if (type === 'rating') {
      newQ.minRating = 1;
      newQ.maxRating = 5;
    }

    updateForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setPreviewKey((k) => k + 1);
  };

  const updateQuestion = (index: number, updates: Partial<FormQuestion>) => {
    updateForm((prev) => {
      const nextQ = [...prev.questions];
      nextQ[index] = { ...nextQ[index], ...updates };
      return { ...prev, questions: nextQ };
    });
    setPreviewKey((k) => k + 1);
  };

  const deleteQuestion = (index: number) => {
    if (form.questions.length <= 1) {
      setWarningMessage('Un formulaire doit comporter au moins une question.');
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }
    updateForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index),
    }));
    setPreviewKey((k) => k + 1);
  };

  const duplicateQuestion = (index: number) => {
    const target = form.questions[index];
    const cloned: FormQuestion = {
      ...target,
      id: `q_${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    updateForm((prev) => {
      const nextQ = [...prev.questions];
      nextQ.splice(index + 1, 0, cloned);
      return { ...prev, questions: nextQ };
    });
    setPreviewKey((k) => k + 1);
  };

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= form.questions.length) return;
    updateForm((prev) => {
      const nextQ = [...prev.questions];
      const [moved] = nextQ.splice(fromIndex, 1);
      nextQ.splice(toIndex, 0, moved);
      return { ...prev, questions: nextQ };
    });
    setPreviewKey((k) => k + 1);
  };

  const addOption = (qIndex: number) => {
    const q = form.questions[qIndex];
    const options = q.options ? [...q.options, `Option ${q.options.length + 1}`] : ['Option 1'];
    updateQuestion(qIndex, { options });
  };

  const updateOption = (qIndex: number, optIndex: number, text: string) => {
    const q = form.questions[qIndex];
    if (!q.options) return;
    const nextOpts = [...q.options];
    nextOpts[optIndex] = text;
    updateQuestion(qIndex, { options: nextOpts });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = form.questions[qIndex];
    if (!q.options || q.options.length <= 2) {
      setWarningMessage('Les questions à choix multiples requièrent au moins 2 options.');
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }
    const nextOpts = q.options.filter((_, i) => i !== optIndex);
    updateQuestion(qIndex, { options: nextOpts });
  };

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-zinc-600" />;
      case 'multiple_choice':
        return <ListOrdered className="w-3.5 h-3.5 text-zinc-600" />;
      case 'yes_no':
        return <ToggleLeft className="w-3.5 h-3.5 text-zinc-600" />;
      case 'rating':
        return <Star className="w-3.5 h-3.5 text-zinc-600" />;
      default:
        return <Type className="w-3.5 h-3.5 text-zinc-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Studio Header */}
      <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-zinc-200/80 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
            title={t('backToDashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={language === 'fr' ? 'Formulaire sans titre' : 'Untitled Form'}
              className="text-sm sm:text-base font-semibold text-zinc-950 bg-transparent hover:bg-white px-2 py-0.5 rounded-md border border-transparent hover:border-zinc-200 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
            />
            <div className="text-xs text-zinc-400 px-2 flex items-center gap-2">
              <span className="font-mono tabular-nums">{form.questions.length} questions</span>
              <span aria-hidden="true">·</span>
              <span className={form.status === 'published' ? 'text-emerald-700 font-medium' : 'text-zinc-500'}>
                {form.status === 'published' ? t('published') : t('draft')}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <div className="inline-flex p-1 bg-zinc-100 rounded-lg border border-zinc-200/60 text-xs">
          <button type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1 font-medium rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>{t('questionsTab')}</span>
          </button>
          <button type="button"
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-1 font-medium rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'theme'
                ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t('designTab')}</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {savedFeedback && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <Check className="w-3.5 h-3.5" /> {language === 'fr' ? 'Enregistré' : 'Saved'}
            </span>
          )}

          <button type="button"
            onClick={() =>
              updateForm((prev) => ({
                ...prev,
                status: prev.status === 'published' ? 'draft' : 'published',
              }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
              form.status === 'published'
                ? 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {form.status === 'published'
              ? (language === 'fr' ? 'Dépublier' : 'Unpublish')
              : (language === 'fr' ? 'Publier' : 'Publish')}
          </button>

          <button type="button"
            onClick={() => onOpenEmbed(form)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('shareAndEmbed')}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: 2-Column Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Questions or Theme Controls */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white border-r border-zinc-200/80 flex flex-col h-[calc(100vh-61px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === 'questions' ? (
              <>
                {/* Form Subtitle / Purpose */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Form Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      updateForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Briefly state what this form captures..."
                    className="w-full text-xs text-zinc-800 bg-[#fafafa] border border-zinc-200 rounded-lg p-2.5 focus:bg-white focus:border-zinc-900 focus:outline-none transition"
                  />
                </div>

                {/* Question List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold uppercase tracking-wider text-zinc-600">
                      Sequential Flow ({form.questions.length})
                    </span>
                    <span>Answered one by one</span>
                  </div>

                  {form.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-zinc-200/90 bg-white shadow-2xs space-y-3 transition"
                    >
                      {/* Question Header & Order */}
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-400">
                            {idx + 1}.
                          </span>
                          <span className="font-medium text-zinc-700 capitalize flex items-center gap-1.5">
                            {getTypeIcon(q.type)}
                            {q.type.replace('_', ' ')}
                          </span>
                          {q.required && (
                            <span className="text-[11px] text-zinc-500 font-medium">
                              (Required)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button type="button"
                            onClick={() => moveQuestion(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button type="button"
                            onClick={() => moveQuestion(idx, idx + 1)}
                            disabled={idx === form.questions.length - 1}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button type="button"
                            onClick={() => duplicateQuestion(idx)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button type="button"
                            onClick={() => deleteQuestion(idx)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Prompt Inputs */}
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                            Prompt Question
                          </label>
                          <input
                            type="text"
                            value={q.title}
                            onChange={(e) => updateQuestion(idx, { title: e.target.value })}
                            placeholder="e.g. What is your full name?"
                            className="w-full text-xs text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-zinc-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                            Helper Text (Optional)
                          </label>
                          <input
                            type="text"
                            value={q.description || ''}
                            onChange={(e) => updateQuestion(idx, { description: e.target.value })}
                            placeholder="e.g. First and last name so we know how to address you"
                            className="w-full text-[11px] text-zinc-700 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-zinc-900 focus:outline-none"
                          />
                        </div>

                        {/* Type & Required */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                              Response Type
                            </label>
                            <select
                              value={q.type}
                              onChange={(e) => {
                                const newType = e.target.value as QuestionType;
                                const updates: Partial<FormQuestion> = { type: newType };
                                if (newType === 'multiple_choice' && !q.options) {
                                  updates.options = ['Option 1', 'Option 2', 'Option 3'];
                                }
                                updateQuestion(idx, updates);
                              }}
                              className="w-full text-xs font-medium text-zinc-800 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-zinc-900 focus:outline-none cursor-pointer"
                            >
                              <option value="text">Short Text</option>
                              <option value="email">Email Address (Validated)</option>
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="yes_no">Yes / No Toggle</option>
                              <option value="rating">1–5 Star Rating</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-end pt-5">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-700">
                              <input
                                type="checkbox"
                                checked={q.required}
                                onChange={(e) =>
                                  updateQuestion(idx, { required: e.target.checked })
                                }
                                className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
                              />
                              <span>Required Question</span>
                            </label>
                          </div>
                        </div>

                        {/* Multiple Choice Options Builder */}
                        {q.type === 'multiple_choice' && (
                          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-2 mt-2">
                            <label className="block text-[11px] font-semibold text-zinc-700">
                              Choice Options
                            </label>
                            {(q.options || []).map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <span className="text-[11px] text-zinc-400 w-3">{optIdx + 1}.</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                  className="flex-1 text-xs text-zinc-900 bg-white border border-zinc-200 rounded-md px-2 py-1 focus:border-zinc-900 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(idx, optIdx)}
                                  className="p-1 text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addOption(idx)}
                              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 pt-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Choice
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Question Controls */}
                <div className="pt-2">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                    Append Question
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button type="button"
                      onClick={() => addQuestion('text')}
                      className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-400 bg-white text-xs font-medium text-zinc-700 flex flex-col items-center gap-1 transition cursor-pointer"
                    >
                      <Type className="w-3.5 h-3.5 text-zinc-500" />
                      Text
                    </button>
                    <button type="button"
                      onClick={() => addQuestion('email')}
                      className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-400 bg-white text-xs font-medium text-zinc-700 flex flex-col items-center gap-1 transition cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      Email
                    </button>
                    <button type="button"
                      onClick={() => addQuestion('multiple_choice')}
                      className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-400 bg-white text-xs font-medium text-zinc-700 flex flex-col items-center gap-1 transition cursor-pointer"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-zinc-500" />
                      Choices
                    </button>
                    <button type="button"
                      onClick={() => addQuestion('yes_no')}
                      className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-400 bg-white text-xs font-medium text-zinc-700 flex flex-col items-center gap-1 transition cursor-pointer"
                    >
                      <ToggleLeft className="w-3.5 h-3.5 text-zinc-500" />
                      Yes / No
                    </button>
                    <button type="button"
                      onClick={() => addQuestion('rating')}
                      className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-400 bg-white text-xs font-medium text-zinc-700 flex flex-col items-center gap-1 transition cursor-pointer col-span-2 sm:col-span-1"
                    >
                      <Star className="w-3.5 h-3.5 text-zinc-500" />
                      Rating
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Theme & Tone Settings */
              <div className="space-y-6">
                {/* Brand Color Tokens */}
                <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Primary Accent Color
                  </label>
                  <p className="text-xs text-zinc-500">
                    Defines user chat bubbles, launcher button, and active focus boundaries.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => {
                          updateForm((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, primaryColor: col.value },
                          }));
                          setPreviewKey((k) => k + 1);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                          form.theme?.primaryColor === col.value
                            ? 'ring-2 ring-offset-2 ring-zinc-950 scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.value }}
                        title={col.name}
                      >
                        {form.theme?.primaryColor === col.value && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </button>
                    ))}

                    <div className="flex items-center gap-1 border border-zinc-200 rounded-lg px-2 py-1 bg-zinc-50 text-xs font-mono">
                      <span className="text-zinc-400">#</span>
                      <input
                        type="text"
                        value={(form.theme?.primaryColor || '#18181b').replace('#', '')}
                        onChange={(e) => {
                          const hex = '#' + e.target.value;
                          updateForm((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, primaryColor: hex },
                          }));
                          setPreviewKey((k) => k + 1);
                        }}
                        className="w-16 bg-transparent text-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bot Profile */}
                <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Assistant Identity
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Bot Display Name
                      </label>
                      <input
                        type="text"
                        value={form.theme?.botName || ''}
                        onChange={(e) =>
                          updateForm((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, botName: e.target.value },
                          }))
                        }
                        placeholder="Assistant"
                        className="w-full text-xs text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Launcher Label
                      </label>
                      <input
                        type="text"
                        value={form.theme?.launcherText || ''}
                        onChange={(e) =>
                          updateForm((prev) => ({
                            ...prev,
                            theme: { ...prev.theme, launcherText: e.target.value },
                          }))
                        }
                        placeholder="Chat with Us"
                        className="w-full text-xs text-zinc-900 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Script Copy */}
                <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Conversational Copy
                  </label>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Welcome Greeting
                    </label>
                    <textarea
                      rows={2}
                      value={form.theme?.welcomeMessage || ''}
                      onChange={(e) =>
                        updateForm((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, welcomeMessage: e.target.value },
                        }))
                      }
                      className="w-full text-xs text-zinc-900 border border-zinc-200 rounded-lg p-2 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Completion Message
                    </label>
                    <textarea
                      rows={2}
                      value={form.theme?.thankYouMessage || ''}
                      onChange={(e) =>
                        updateForm((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, thankYouMessage: e.target.value },
                        }))
                      }
                      className="w-full text-xs text-zinc-900 border border-zinc-200 rounded-lg p-2 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Placement */}
                <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                    Corner Placement
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateForm((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, position: 'bottom-right' },
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                        form.theme?.position === 'bottom-right'
                          ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-semibold'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50/50'
                      }`}
                    >
                      Bottom Right
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateForm((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, position: 'bottom-left' },
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                        form.theme?.position === 'bottom-left'
                          ? 'border-zinc-900 bg-zinc-50 text-zinc-950 font-semibold'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50/50'
                      }`}
                    >
                      Bottom Left
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Synchronized Preview */}
        <div className="lg:col-span-6 xl:col-span-5 bg-[#f4f4f5]/60 p-6 flex flex-col items-center justify-between overflow-y-auto">
          {/* Preview Toolbar */}
          <div className="w-full max-w-sm flex items-center justify-between mb-4 bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
            <span className="text-xs font-semibold text-zinc-700">
              Live Preview
            </span>

            <div className="flex items-center gap-1">
              <button type="button"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="p-1 rounded text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                title="Reset Flow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-zinc-200 mx-1" />
              <button type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1 rounded transition cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1 rounded transition cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Widget Box */}
          <div
            className={`w-full transition-all duration-200 flex justify-center items-center ${
              previewDevice === 'mobile' ? 'max-w-[340px]' : 'max-w-sm'
            }`}
          >
            <div className="w-full h-[540px] bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              <ChatWidget
                key={previewKey}
                form={form}
                mode="inline"
              />
            </div>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[11px] text-zinc-400">
              Interactive test session: Submissions made in preview are not recorded.
            </p>
          </div>
        </div>
      </div>

      {warningMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-rose-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-rose-800 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <span>{warningMessage}</span>
        </div>
      )}
    </div>
  );
};
