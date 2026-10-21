import { getPublicForm } from '@/lib/forms.ts';
import { StandaloneChatView } from '@/src/components/StandaloneChatView.tsx';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public form URL — /f/<formId>
 *
 * Rendered on the server so the conversation is visible immediately and can
 * be shared/indexed. Only published forms are exposed.
 */
export default async function PublicFormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const form = await getPublicForm(formId);

  return <StandaloneChatView form={form} />;
}
