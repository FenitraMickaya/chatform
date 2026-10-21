'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthPage } from '@/src/components/AuthPage.tsx';

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  return (
    <AuthPage
      onSuccess={() => {
        router.push(next);
        router.refresh();
      }}
      onGoHome={() => router.push('/')}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
