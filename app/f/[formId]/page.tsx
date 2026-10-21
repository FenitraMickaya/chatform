import { headers } from 'next/headers';
import { getPublicForm } from '@/lib/forms.ts';
import { StandaloneChatView } from '@/src/components/StandaloneChatView.tsx';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public form URL — /f/<formId>
 *
 * Rendered on the server so the conversation is visible immediately and can
 * be shared/indexed. Only published forms are exposed, and the content is
 * resolved for the language requested by the browser.
 */
export default async function PublicFormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const headerList = await headers();
  const accept = headerList.get('accept-language') || '';
  const lang = accept.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  const form = await getPublicForm(formId, lang);

  return <StandaloneChatView form={form} />;
}
