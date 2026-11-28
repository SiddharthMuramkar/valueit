import { generateWidget, errorResponse } from '../../../lib/serverWidgets';
export const runtime = 'nodejs';
export const maxDuration = 900;
export async function POST(request: Request) {
  try { return Response.json(await generateWidget(await request.json())); }
  catch (error) { return errorResponse(error); }
}
