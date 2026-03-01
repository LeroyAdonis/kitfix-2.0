"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { updateProfileSchema } from "@/lib/validators/profile";
import type { ActionResult } from "@/types";

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult<{ name: string }>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "You must be signed in." };
  }

  const raw = {
    name: formData.get("name") as string,
    image: (formData.get("image") as string) || undefined,
  };

  const result = updateProfileSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return { success: false, error: "Validation failed.", fieldErrors };
  }

  const data = result.data;
  await db
    .update(user)
    .set({ name: data.name })
    .where(eq(user.id, session.user.id));

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true, data: { name: data.name } };
}
