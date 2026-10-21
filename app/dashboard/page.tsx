'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/services/api.ts';
import { useLanguage } from '@/src/i18n/index.tsx';
import { authService } from '@/src/services/auth.ts';
import { Dashboard } from '@/src/components/Dashboard.tsx';
import { EmbedModal } from '@/src/components/EmbedModal.tsx';
import type { Form, FormSubmission, User } from '@/src/types/index.ts';

interface Workspace {
  forms: Form[];
  submissions: FormSubmission[];
  user: User | null;
}

/** Loaded outside of the component so the effect never triggers a state update directly. */
async function fetchWorkspace(): Promise<Workspace> {
  const [forms, submissions, user] = await Promise.all([
    api.getForms(),
    api.getSubmissions(),
    authService.getCurrentUser(),
  ]);
  return { forms, submissions, user };
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, language, revision } = useLanguage();
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [embedForm, setEmbedForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchWorkspace();
      setForms(data.forms);
      setSubmissions(data.submissions);
      setCurrentUser(data.user);
      if (!data.user) router.replace('/login?next=/dashboard');
    } catch (err: any) {
      if (err?.status === 401) router.replace('/login?next=/dashboard');
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    fetchWorkspace()
      .then((data) => {
        if (cancelled) return;
        setForms(data.forms);
        setSubmissions(data.submissions);
        setCurrentUser(data.user);
        if (!data.user) router.replace('/login?next=/dashboard');
      })
      .catch((err: any) => {
        if (cancelled) return;
        console.error('Failed to load the workspace:', err);
        if (err?.status === 401) {
          router.replace('/login?next=/dashboard');
        } else {
          setLoadError(t('dashboardLoadError'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router, t, revision]);

  async function handleSignOut() {
    await authService.signOut();
    router.push('/');
    router.refresh();
  }

  async function handleCreate(data: Partial<Form>) {
    const newForm: Form = {
      id: `form_${Date.now()}`,
      title: data.title || 'New Interactive Form',
      description: data.description || 'Conversational form',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: data.questions || [],
      theme: data.theme || {
        primaryColor: '#4F46E5',
        accentColor: '#EEF2FF',
        position: 'bottom-right',
        botName: 'Assistant',
        botAvatar: 'bot',
        welcomeMessage: 'Hello! Welcome to our interactive assistant.',
        thankYouMessage: 'Thank you! Your response is recorded.',
        launcherText: 'Chat with Us',
        showProgressBar: true,
      },
      responseCount: 0,
      defaultLang: language,
      locales: {},
    };

    const saved = await api.saveForm(newForm);
    setForms((prev) => [saved, ...prev]);
    router.push(`/forms/${saved.id}`);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-sm font-semibold text-zinc-900">{loadError}</p>
        <button
          type="button"
          onClick={() => router.push('/login?next=/dashboard')}
          className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold"
        >
          {t('signIn')}
        </button>
      </div>
    );
  }

  return (
    <>
      <Dashboard
        forms={forms}
        submissions={submissions}
        currentUser={currentUser}
        onCreateForm={handleCreate}
        onEditForm={(form) => router.push(`/forms/${form.id}`)}
        onViewSubmissions={(form) => router.push(`/forms/${form.id}/responses`)}
        onOpenEmbed={(form) => setEmbedForm(form)}
        onTogglePublish={async (formId) => {
          const updated = await api.togglePublish(formId);
          if (updated) {
            setForms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
          }
        }}
        onDeleteForm={async (formId) => {
          await api.deleteForm(formId);
          setForms((prev) => prev.filter((f) => f.id !== formId));
          setSubmissions((prev) => prev.filter((s) => s.formId !== formId));
        }}
        onDuplicateForm={async (form) => {
          const cloned = {
            ...form,
            id: `form_${Date.now()}`,
            title: `${form.title} (Copy)`,
            status: 'draft' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responseCount: 0,
            questions: form.questions.map((q) => ({
              ...q,
              id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            })),
          };
          const saved = await api.saveForm(cloned);
          setForms((prev) => [saved, ...prev]);
        }}
        onGoToLanding={() => router.push('/')}
        onSignOut={handleSignOut}
        onGoToAuth={() => router.push('/login')}
        onNewSubmission={() => load()}
      />
      {embedForm && <EmbedModal form={embedForm} onClose={() => setEmbedForm(null)} />}
    </>
  );
}
