'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/src/services/api.ts';
import { useLanguage } from '@/src/i18n/index.tsx';
import { FormBuilder } from '@/src/components/FormBuilder.tsx';
import { EmbedModal } from '@/src/components/EmbedModal.tsx';
import type { Form } from '@/src/types/index.ts';

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const { revision } = useLanguage();

  const [form, setForm] = useState<Form | null>(null);
  const [embedForm, setEmbedForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loaded = await api.getFormById(formId);
        if (cancelled) return;
        setForm(loaded);
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.status === 404
              ? 'This form does not exist, or it does not belong to you.'
              : 'Unable to load this form.'
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [formId, revision]);

  async function handleSave(updated: Form) {
    try {
      const saved = await api.saveForm(updated);
      setForm(saved);
    } catch (err) {
      console.error('Failed to save form:', err);
    }
  }

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
      <FormBuilder
        form={form}
        onSave={handleSave}
        onBack={() => router.push('/dashboard')}
        onOpenEmbed={(f) => setEmbedForm(f)}
      />
      {embedForm && <EmbedModal form={embedForm} onClose={() => setEmbedForm(null)} />}
    </>
  );
}
