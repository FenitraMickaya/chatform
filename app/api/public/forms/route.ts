import { listPublicForms } from '@/lib/forms.ts';
import { jsonOk, resolveLanguage } from '@/lib/api.ts';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  return jsonOk(await listPublicForms(resolveLanguage(request)));
}
