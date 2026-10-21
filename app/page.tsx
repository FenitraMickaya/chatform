'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/src/services/api.ts';
import { authService } from '@/src/services/auth.ts';
import { useLanguage } from '@/src/i18n/index.tsx';
import { LandingPage } from '@/src/components/LandingPage.tsx';
import { EmbedModal } from '@/src/components/EmbedModal.tsx';
import type { Form, User } from '@/src/types/index.ts';

export default function Landing() {
  const router = useRouter();
  const { revision } = useLanguage();
  const [forms, setForms] = useState<Form[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [embedForm, setEmbedForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [publicForms, user] = await Promise.all([
        api.getPublicForms().catch(() => [] as Form[]),
        authService.getCurrentUser(),
      ]);
      if (cancelled) return;
      setForms(publicForms);
      setCurrentUser(user);
      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [revision]);

  async function handleSignOut() {
    await authService.signOut();
    setCurrentUser(null);
    router.refresh();
  }

  return (
    <>
      <LandingPage
        forms={forms}
        currentUser={currentUser}
        isLoading={isLoading}
        onGoToDashboard={() => router.push('/dashboard')}
        onCreateNew={() => router.push('/dashboard')}
        onOpenEmbed={(form) => setEmbedForm(form)}
        onGoToAuth={() => router.push('/login')}
        onSignOut={handleSignOut}
      />
      {embedForm && <EmbedModal form={embedForm} onClose={() => setEmbedForm(null)} />}
    </>
  );
}
