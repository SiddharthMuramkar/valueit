/** Throwaway prototype-only storage. Never deploy with production data or credentials. */
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { dataModelSchema, historySchema, snapshotHistory, PrototypeError } from './serverWidgets';

const noteInputSchema = z.object({
  title: z.string().min(1).max(200),
  briefId: z.string().min(1).max(100),
  messages: historySchema,
  dataModel: dataModelSchema,
  reply: z.string().max(12000).optional(),
});
type StoredNote = Omit<z.infer<typeof noteInputSchema>, 'messages'> & { id: string; createdAt: string; messages: unknown[] };
const localPath = join(process.cwd(), '.prototype-notes.json');
const storageName = () => process.env.DATABASE_URL ? 'neon' : 'scratch';
async function connect() {
  if (!process.env.DATABASE_URL) throw new Error('No database URL');
  const sql = neon(process.env.DATABASE_URL);
  // Only this dedicated prototype table is created; no reads/writes elsewhere.
  await sql`CREATE TABLE IF NOT EXISTS valueit_prototype_widget_notes_v1 (
    id uuid PRIMARY KEY, created_at timestamptz NOT NULL,
    note jsonb NOT NULL
  )`;
  return sql;
}
async function readLocal() {
  try { return JSON.parse(await readFile(localPath, 'utf8')) as StoredNote[]; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}
function metadata(note: StoredNote) {
  return { id: note.id, title: note.title, briefId: note.briefId, createdAt: note.createdAt };
}
export async function saveNote(body: unknown) {
  const input = noteInputSchema.parse(body);
  // The original messages alone are insufficient: append current Student state to replay.
  const { messages } = snapshotHistory(input.messages, input.dataModel);
  const note: StoredNote = { ...input, messages, id: randomUUID(), createdAt: new Date().toISOString() };
  if (storageName() === 'neon') {
    try {
      const sql = await connect();
      await sql`INSERT INTO valueit_prototype_widget_notes_v1 (id, created_at, note) VALUES (${note.id}, ${note.createdAt}, ${JSON.stringify(note)}::jsonb)`;
    } catch { throw new PrototypeError('Saving to the configured Neon database failed. No scratch save was substituted.', 502, 'NEON_SAVE_FAILED'); }
  } else {
    const notes = await readLocal();
    notes.push(note);
    const tempPath = `${localPath}.tmp`;
    await writeFile(tempPath, JSON.stringify(notes), { mode: 0o600 });
    await rename(tempPath, localPath);
  }
  return { ...metadata(note), storage: storageName() };
}
export async function getNotes(id: string | null) {
  if (id && !z.string().uuid().safeParse(id).success) throw new PrototypeError('Invalid Note id.');
  let notes: StoredNote[];
  if (storageName() === 'neon') {
    try {
      const sql = await connect();
      const rows = id
        ? await sql`SELECT note FROM valueit_prototype_widget_notes_v1 WHERE id = ${id}`
        : await sql`SELECT note FROM valueit_prototype_widget_notes_v1 ORDER BY created_at DESC LIMIT 100`;
      notes = rows.map(row => row.note as StoredNote);
    } catch { throw new PrototypeError('Reading from the configured Neon database failed.', 502, 'NEON_READ_FAILED'); }
  } else { notes = (await readLocal()).reverse(); }
  if (id) {
    const note = notes.find(n => n.id === id);
    if (!note) throw new PrototypeError('Note not found.', 404, 'NOTE_NOT_FOUND');
    // Refuse saved history if it is no longer valid with this catalog version.
    snapshotHistory(note.messages, note.dataModel);
    return { note, storage: storageName() };
  }
  return { notes: notes.map(metadata), storage: storageName() };
}
