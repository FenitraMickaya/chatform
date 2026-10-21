import { listPublicForms } from '@/lib/forms.ts';
import { jsonOk } from '@/lib/api.ts';

export const runtime = 'nodejs';

export async function GET() {
  return jsonOk(await listPublicForms());
}
