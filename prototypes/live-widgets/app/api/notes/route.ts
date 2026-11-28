import { errorResponse } from '../../../lib/serverWidgets';
import { saveNote, getNotes } from '../../../lib/serverNotes';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try { return Response.json(await saveNote(await request.json())); }
  catch (error) { return errorResponse(error); }
}
export async function GET(request: Request) {
  try { return Response.json(await getNotes(new URL(request.url).searchParams.get('id'))); }
  catch (error) { return errorResponse(error); }
}
