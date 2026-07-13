import { desc, eq } from "drizzle-orm";

import { db } from "../index";
import { voiceNotes, type NewVoiceNote } from "../schema";

/**
 * Fetch all voice notes for a given repair request, newest first.
 */
export async function getVoiceNotesByRepair(repairRequestId: string) {
  return db.query.voiceNotes.findMany({
    where: eq(voiceNotes.repairRequestId, repairRequestId),
    orderBy: [desc(voiceNotes.createdAt)],
  });
}

/**
 * Create a new voice note record.
 */
export async function createVoiceNote(data: NewVoiceNote) {
  const [note] = await db.insert(voiceNotes).values(data).returning();
  return note;
}

/**
 * Delete all voice notes for a repair request (used during cleanup).
 */
export async function deleteVoiceNotesByRepair(repairRequestId: string) {
  await db
    .delete(voiceNotes)
    .where(eq(voiceNotes.repairRequestId, repairRequestId));
}
