import { createClient } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

export type LessonProgressRow = {
  lesson_id: string;
  status: "Not Started" | "In Progress" | "Completed";
  progress: number;
  ever_completed: boolean;
  correct_count: number;
};

/** Returns the right Supabase client + user ID to use for progress operations.
 *  Priority: real authenticated user → anonymous guest session (tab-scoped).
 *  Returns null if there is no session at all. */
async function getEffectiveClientAndUser(): Promise<{ client: SupabaseClient; userId: string } | null> {
  // 1. Try the regular (localStorage-backed) client for real auth users.
  const regularClient = createClient();
  const { data: { user } } = await regularClient.auth.getUser();
  if (user && !user.is_anonymous) return { client: regularClient, userId: user.id };

  // 2. Fall back to the sessionStorage-backed guest client (browser-only).
  if (typeof window !== "undefined") {
    const { getGuestClient } = await import("./guestClient");
    const guestClient = getGuestClient();
    if (guestClient) {
      const { data: { user: guestUser } } = await guestClient.auth.getUser();
      if (guestUser) return { client: guestClient, userId: guestUser.id };
    }
  }

  return null;
}

export async function fetchAllLessonProgress(): Promise<Record<string, LessonProgressRow>> {
  const ctx = await getEffectiveClientAndUser();
  if (!ctx) return {};

  const { data } = await ctx.client
    .from("lesson_progress")
    .select("lesson_id, status, progress, ever_completed, correct_count")
    .eq("user_id", ctx.userId);

  return Object.fromEntries((data ?? []).map(r => [r.lesson_id, r as LessonProgressRow]));
}

export async function upsertLessonProgress(
  lessonId: string,
  update: Omit<LessonProgressRow, "lesson_id">
) {
  const ctx = await getEffectiveClientAndUser();
  if (!ctx) return;

  await ctx.client.from("lesson_progress").upsert(
    {
      user_id: ctx.userId,
      lesson_id: lessonId,
      status: update.status,
      progress: update.progress,
      ever_completed: update.ever_completed,
      correct_count: update.correct_count,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );
}
