'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/src/services/api.ts';
import { useLanguage } from '@/src/i18n/index.tsx';
import { SubmissionsView } from '@/src/components/SubmissionsView.tsx';
import { EmbedModal } from '@/src/components/EmbedModal.tsx';
import type { Form, FormSubmission } from '@/src/types/index.ts';

interface ResponsesPayload {
  form: Form;
  allForms: Form[];
  submissions: FormSubmission[];
}

/** Loaded outside of the component so the effect never triggers a state update directly. */
async function fetchResponses(formId: string): Promise<ResponsesPayload> {
  const [form, allForms, submissions] = await Promise.all([
    api.getFormById(formId),
    api.getForms(),
    api.getSubmissions(formId),
  ]);
  return { form, allForms, submissions };
}

export default function ResponsesPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const { revision } = useLanguage();

  const [form, setForm] = useState<Form | null>(null);
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [embedForm, setEmbedForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchResponses(formId);
      setForm(data.form);
      setAllForms(data.allForms);
      setSubmissions(data.submissions);
    } catch (err: any) {
      setError(
        err?.status === 404
          ? 'This form does not exist, or it does not belong to you.'
          : 'Unable to load the submissions.'
      );
    }
  }, [formId]);

  useEffect(() => {
    let cancelled = false;
    fetchResponses(formId)
      .then((data) => {
        if (cancelled) return;
        setForm(data.form);
        setAllForms(data.allForms);
        setSubmissions(data.submissions);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(
          err?.status === 404
            ? 'This form does not exist, or it does not belong to you.'
            : 'Unable to load the submissions.'
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [formId, revision]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-sm font-semibold text-zinc-900">{error}</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <SubmissionsView
        form={form}
        submissions={submissions}
        allForms={allForms}
        onSelectForm={(id) => router.push(`/forms/${id}/responses`)}
        onBack={() => router.push('/dashboard')}
        onDeleteSubmission={async (id) => {
          await api.deleteSubmission(id);
          setSubmissions((prev) => prev.filter((s) => s.id !== id));
          load();
        }}
        onRefresh={load}
        onOpenEmbed={(f) => setEmbedForm(f)}
      />
      {embedForm && <EmbedModal form={embedForm} onClose={() => setEmbedForm(null)} />}
    </>
  );
}
