import React, { useState } from 'react';
import {
  Plus,
  Search,
  BarChart3,
  Edit3,
  Share2,
  Trash2,
  Copy,
  X,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
} from 'lucide-react';
import { Form, FormStatus, FormSubmission, FormQuestion, User } from '../types/index.ts';
import { ChatWidget } from './ChatWidget.tsx';
import { useLanguage, LanguageSwitcher } from '../i18n/index.tsx';

interface DashboardProps {
  forms: Form[];
  submissions: FormSubmission[];
  currentUser?: User | null;
  onCreateForm: (newForm: Partial<Form>) => void;
  onEditForm: (form: Form) => void;
  onViewSubmissions: (form: Form) => void;
  onOpenEmbed: (form: Form) => void;
  onOpenSimulator?: (form: Form) => void;
  onTogglePublish: (formId: string) => void;
  onDeleteForm: (formId: string) => void;
  onDuplicateForm: (form: Form) => void;
  onGoToLanding: () => void;
  onSignOut?: () => void;
  onGoToAuth?: () => void;
  onNewSubmission?: (submission: FormSubmission) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  forms,
  submissions,
  currentUser,
  onCreateForm,
  onEditForm,
  onViewSubmissions,
  onOpenEmbed,
  onTogglePublish,
  onDeleteForm,
  onDuplicateForm,
  onGoToLanding,
  onSignOut,
  onGoToAuth,
  onNewSubmission,
}) => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'lead_gen' | 'feedback' | 'rsvp'>('feedback');

  // Interactive Form Testing & In-App Deletion state
  const [testingForm, setTestingForm] = useState<Form | null>(null);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter forms
  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalForms = forms.length;
  const totalSubmissions = submissions.length;
  const publishedForms = forms.filter((f) => f.status === 'published').length;

  // Global "Would you recommend this tool?" calculation across submissions
  const recommendAnswers = submissions
    .map((s) => {
      if (s.answers['q3_recommend'] !== undefined) {
        return String(s.answers['q3_recommend']);
      }
      for (const [k, v] of Object.entries(s.answers)) {
        if (k.toLowerCase().includes('recommend') || k.toLowerCase().includes('recommand')) {
          return String(v);
        }
      }
      const f = forms.find((form) => form.id === s.formId);
      if (f) {
        const recQ = f.questions.find(
          (q) =>
            q.title.toLowerCase().includes('recommend') ||
            q.title.toLowerCase().includes('recommand')
        );
        if (recQ && s.answers[recQ.id] !== undefined) {
          return String(s.answers[recQ.id]);
        }
      }
      return null;
    })
    .filter((ans): ans is string => ans !== null && ans !== '');

  const totalRecommendCount = recommendAnswers.length;
  const positiveRecommendCount = recommendAnswers.filter((a) => {
    const lower = a.toLowerCase();
    return lower === 'yes' || lower.includes('oui') || lower === 'true' || lower.includes('absolument');
  }).length;

  const overallRecommendPct =
    totalRecommendCount > 0
      ? Math.round((positiveRecommendCount / totalRecommendCount) * 100)
      : 100;

  // Helper for per-form recommendation stats
  const getFormRecommendStats = (formId: string) => {
    const formSubs = submissions.filter((s) => s.formId === formId);
    const targetForm = forms.find((f) => f.id === formId);
    const recQ = targetForm?.questions.find(
      (q) =>
        q.id.toLowerCase().includes('recommend') ||
        q.title.toLowerCase().includes('recommend') ||
        q.title.toLowerCase().includes('recommand')
    );
    if (!recQ) return null;

    const answers = formSubs
      .map((s) => s.answers[recQ.id])
      .filter((a) => a !== undefined && a !== null && a !== '');

    if (answers.length === 0) return { pct: null, count: 0, total: 0, title: recQ.title };
    const yesCount = answers.filter((a) => {
      const lower = String(a).toLowerCase();
      return lower === 'yes' || lower.includes('oui') || lower.includes('absolument');
    }).length;
    const pct = Math.round((yesCount / answers.length) * 100);
    return { pct, count: yesCount, total: answers.length, title: recQ.title };
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let initialQuestions: FormQuestion[] = [
      {
        id: `q_${Date.now()}_1`,
        type: 'text',
        title: language === 'fr' ? 'Quel est votre nom ?' : "What's your name?",
        required: true,
        placeholder: 'Demo',
      },
      {
        id: `q_${Date.now()}_2`,
        type: 'email',
        title: language === 'fr' ? 'Quelle est votre adresse email ?' : "What's your email address?",
        required: true,
        placeholder: 'demo@example.com',
      },
    ];

    if (selectedTemplate === 'feedback') {
      initialQuestions = [
        {
          id: `q_${Date.now()}_1`,
          type: 'rating',
          title: language === 'fr' ? 'Comment évaluez-vous votre expérience globale ?' : 'How would you rate your overall experience?',
          required: true,
          minRating: 1,
          maxRating: 5,
        },
        {
          id: `q_${Date.now()}_2`,
          type: 'multiple_choice',
          title: language === 'fr' ? 'Quelle fonctionnalité avez-vous préférée ?' : 'What was your favorite aspect?',
          required: true,
          options: language === 'fr'
            ? ['Flux conversationnel', 'Vitesse d’affichage', 'Support réactif', 'Design du widget']
            : ['Conversational Flow', 'Interface Speed', 'Customer Support', 'Widget Styling'],
        },
        {
          id: `q_${Date.now()}_3`,
          type: 'yes_no',
          title: language === 'fr' ? 'Recommanderiez-vous cet outil à un collègue ?' : 'Would you recommend this tool to a teammate?',
          required: true,
        },
      ];
    } else if (selectedTemplate === 'rsvp') {
      initialQuestions = [
        {
          id: `q_${Date.now()}_1`,
          type: 'text',
          title: language === 'fr' ? 'Nom pour le badge' : 'Full Name for badge check-in',
          required: true,
          placeholder: 'Utilisateur 1',
        },
        {
          id: `q_${Date.now()}_2`,
          type: 'email',
          title: language === 'fr' ? 'Email professionnel' : 'Work email address for confirmation',
          required: true,
          placeholder: 'utilisateur1@example.com',
        },
        {
          id: `q_${Date.now()}_3`,
          type: 'yes_no',
          title: language === 'fr' ? 'Participerez-vous au cocktail de networking ?' : 'Will you join the networking dinner?',
          required: true,
        },
      ];
    }

    onCreateForm({
      title: newTitle.trim(),
      description: newDescription.trim() || (language === 'fr' ? 'Formulaire conversationnel interactif' : 'Conversational interaction form'),
      status: 'draft',
      questions: initialQuestions,
      theme: {
        primaryColor: '#18181b',
        accentColor: '#f4f4f5',
        position: 'bottom-right',
        botName: `${newTitle.trim()} Assistant`,
        botAvatar: 'bot',
        welcomeMessage: language === 'fr'
          ? 'Bonjour ! Commençons par quelques questions rapides.'
          : "Hi there! Let's get started with a few quick questions.",
        thankYouMessage: language === 'fr'
          ? 'Merci beaucoup ! Vos réponses ont été enregistrées avec succès.'
          : 'Thank you! Your response has been securely saved.',
        launcherText: language === 'fr' ? 'Discuter avec nous' : 'Chat with Us',
        showProgressBar: true,
      },
    });

    setNewTitle('');
    setNewDescription('');
    setIsCreateModalOpen(false);
    showToast(language === 'fr' ? 'Formulaire créé avec succès !' : 'Form created successfully!');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Workspace Top Bar */}
      <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={onGoToLanding}
              className="font-bold text-base tracking-tight text-zinc-950 hover:opacity-80 transition cursor-pointer"
            >
              FormPulse
            </button>
            <span className="text-zinc-300 font-light" aria-hidden="true">/</span>
            <span className="text-xs font-medium text-zinc-500">{t('dashboard')}</span>
          </div>

          {/* Actions & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSwitcher />

            <button type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('newForm')}</span>
            </button>

            {/* User Session Profile & Sign Out */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
                <button type="button"
                  onClick={onGoToAuth}
                  className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 text-[11px] font-bold flex items-center justify-center cursor-pointer transition"
                  title={`${currentUser.name} (${currentUser.email})`}
                >
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </button>
                {onSignOut && (
                  <button type="button"
                    onClick={onSignOut}
                    className="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition cursor-pointer"
                    title={t('signOut')}
                  >
                    {t('signOut')}
                  </button>
                )}
              </div>
            ) : (
              <div className="pl-2 border-l border-zinc-200">
                <button type="button"
                  onClick={onGoToAuth}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 hover:border-zinc-400 bg-white text-zinc-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
                >
                  {t('signIn')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1">
            <div className="text-xs font-medium text-zinc-500">{t('kpiTotalForms')}</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              {totalForms}
            </div>
            <div className="text-[11px] text-zinc-400">{publishedForms} {t('published').toLowerCase()}</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1">
            <div className="text-xs font-medium text-zinc-500">{t('kpiTotalSubmissions')}</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              {totalSubmissions}
            </div>
            <div className="text-[11px] text-zinc-400">{t('kpiTotalSubmissionsSub')}</div>
          </div>

          {/* Highlighted Tool Recommendation Metric KPI */}
          <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                {t('kpiRecommendRate')}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                NPS Pulse
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-950 font-mono tabular-nums">
              {overallRecommendPct}%
            </div>
            <div className="text-[11px] text-emerald-700 font-medium truncate">
              {positiveRecommendCount}/{totalRecommendCount} {t('kpiRecommendRateSub')}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-1">
            <div className="text-xs font-medium text-zinc-500">{t('kpiAvgQuestions')}</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              {forms.length > 0
                ? (forms.reduce((a, b) => a + b.questions.length, 0) / forms.length).toFixed(1)
                : '0.0'}
            </div>
            <div className="text-[11px] text-zinc-400">{t('kpiAvgQuestionsSub')}</div>
          </div>
        </div>

        {/* Search & Segmented Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchForms')}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>

          {/* Segmented Filter Controls */}
          <div className="inline-flex p-1 bg-zinc-100 rounded-lg border border-zinc-200/60">
            <button type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {t('allForms')} ({forms.length})
            </button>
            <button type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'published'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {t('publishedFilter')} ({publishedForms})
            </button>
            <button type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {t('draftFilter')} ({forms.length - publishedForms})
            </button>
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-zinc-200 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-500 mx-auto flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-zinc-900">{t('noFormsFound')}</div>
            <button type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
            >
              {t('newForm')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredForms.map((form) => {
              const formSubmissions = submissions.filter((s) => s.formId === form.id);
              const responseCount = formSubmissions.length;
              const isPublished = form.status === 'published';
              const recStats = getFormRecommendStats(form.id);

              return (
                <div
                  key={form.id}
                  className="bg-white rounded-xl border border-zinc-200/90 hover:border-zinc-300 shadow-2xs transition flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    {/* Metadata Header */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <span>{form.questions.length} questions</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-zinc-900 font-semibold">{responseCount} {t('entries')}</span>
                      </div>

                      {/* Clean Status Switch */}
                      <button type="button"
                        onClick={() => onTogglePublish(form.id)}
                        className={`text-xs font-medium cursor-pointer transition flex items-center gap-1.5 ${
                          isPublished
                            ? 'text-emerald-700 hover:text-emerald-800'
                            : 'text-zinc-500 hover:text-zinc-700'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isPublished ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`}
                        />
                        <span>{isPublished ? t('published') : t('draft')}</span>
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3
                        onClick={() => onEditForm(form)}
                        className="font-semibold text-sm text-zinc-950 hover:text-indigo-600 transition cursor-pointer line-clamp-1"
                      >
                        {form.title}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {form.description}
                      </p>
                    </div>

                    {/* Tool Recommendation Badge if question present */}
                    {recStats && (
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('recommendationRate')}</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-950 tabular-nums">
                          {recStats.pct !== null ? `${recStats.pct}% (${recStats.count}/${recStats.total})` : '—'}
                        </span>
                      </div>
                    )}

                    {/* Quick Submissions Link Strip */}
                    <button type="button"
                      onClick={() => onViewSubmissions(form)}
                      className="w-full text-left py-2 px-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/60 transition cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <span className="text-zinc-600 font-medium">{t('submissionsSheet')}</span>
                      <span className="text-zinc-900 font-semibold font-mono tabular-nums group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        {responseCount} {t('entries')} <ArrowRight className="w-3 h-3 text-zinc-400" />
                      </span>
                    </button>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {/* Test / Fill Form in conversational interactive session */}
                      <button type="button"
                        onClick={() => setTestingForm(form)}
                        className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white font-medium cursor-pointer transition flex items-center gap-1.5 shadow-2xs text-xs active:scale-[0.98]"
                        title={language === 'fr' ? 'Tester et répondre au formulaire' : 'Test and fill form in chat'}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-200" />
                        <span>{t('testForm')}</span>
                      </button>

                      <button type="button"
                        onClick={() => onEditForm(form)}
                        className="text-zinc-700 hover:text-zinc-950 font-medium cursor-pointer transition flex items-center gap-1 px-1.5 py-1 rounded hover:bg-zinc-100"
                      >
                        <Edit3 className="w-3 h-3 text-zinc-400" />
                        {t('editForm')}
                      </button>

                      <button type="button"
                        onClick={() => onOpenEmbed(form)}
                        className="text-zinc-700 hover:text-zinc-950 font-medium cursor-pointer transition flex items-center gap-1 px-1.5 py-1 rounded hover:bg-zinc-100"
                      >
                        <Share2 className="w-3 h-3 text-zinc-400" />
                        {t('embedForm')}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button type="button"
                        onClick={() => onDuplicateForm(form)}
                        className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded hover:bg-zinc-100 cursor-pointer transition"
                        title={t('duplicateForm')}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => setFormToDelete(form)}
                        className="text-zinc-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 cursor-pointer transition"
                        title={t('deleteForm')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Form Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-950 text-sm">{t('createModalTitle')}</h3>
                <p className="text-xs text-zinc-500">{t('createModalDesc')}</p>
              </div>
              <button type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  {t('formTitleLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('formTitlePlaceholder')}
                  className="w-full text-xs text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  {t('descriptionLabel')}
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full text-xs text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-2">
                  {t('startingTemplate')}
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => setSelectedTemplate('feedback')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedTemplate === 'feedback'
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:bg-zinc-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      checked={selectedTemplate === 'feedback'}
                      onChange={() => setSelectedTemplate('feedback')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                        <span>{t('tplFeedback')}</span>
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-1 rounded">
                          ★ NPS
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {t('tplFeedbackDesc')}
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setSelectedTemplate('lead_gen')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedTemplate === 'lead_gen'
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:bg-zinc-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      checked={selectedTemplate === 'lead_gen'}
                      onChange={() => setSelectedTemplate('lead_gen')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">
                        {t('tplLeadGen')}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {t('tplLeadGenDesc')}
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setSelectedTemplate('rsvp')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      selectedTemplate === 'rsvp'
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:bg-zinc-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      checked={selectedTemplate === 'rsvp'}
                      onChange={() => setSelectedTemplate('rsvp')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">
                        {t('tplRsvp')}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {t('tplRsvpDesc')}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition cursor-pointer shadow-xs"
                >
                  {t('createFormBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (NO window.confirm) */}
      {formToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-950 text-sm">
                  {t('confirmDeleteTitle')}
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5 line-clamp-1">
                  « {formToDelete.title} »
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              {t('confirmDeleteDesc')}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setFormToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = formToDelete.id;
                  const title = formToDelete.title;
                  onDeleteForm(id);
                  setFormToDelete(null);
                  showToast(language === 'fr' ? `Formulaire « ${title} » supprimé.` : `Form "${title}" deleted.`);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer shadow-xs"
              >
                {t('deleteConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Form Test Session Modal (Full Conversational Experience) */}
      {testingForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-zinc-950 text-sm">{testingForm.title}</h3>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      {language === 'fr' ? 'Session Interactive' : 'Live Interactive Test'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {t('testModalDesc')}
                  </p>
                </div>
              </div>
              <button type="button"
                onClick={() => setTestingForm(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition cursor-pointer"
                title={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversational Widget Body */}
            <div className="p-4 flex-1 overflow-y-auto bg-zinc-50/50 flex justify-center items-center">
              <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-zinc-200/80 p-2">
                <ChatWidget
                  form={testingForm}
                  mode="standalone"
                  onSubmitSuccess={(sub) => {
                    if (onNewSubmission) onNewSubmission(sub);
                    showToast(
                      language === 'fr'
                        ? `Réponse enregistrée avec succès pour « ${testingForm.title} » !`
                        : `Response recorded for "${testingForm.title}"!`
                    );
                    setTimeout(() => {
                      setTestingForm(null);
                    }, 1400);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
