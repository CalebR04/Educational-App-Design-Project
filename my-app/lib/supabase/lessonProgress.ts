import { createClient } from "./client";

export type LessonProgressRow = {
  lesson_id: string;
  status: "Not Started" | "In Progress" | "Completed";
  progress: number;
  ever_completed: boolean;
  correct_count: number;
};

export async function fetchAllLessonProgress(): Promise<Record<string, LessonProgressRow>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status, progress, ever_completed, correct_count")
    .eq("user_id", user.id);

  return Object.fromEntries((data ?? []).map(r => [r.lesson_id, r as LessonProgressRow]));
}

export async function upsertLessonProgress(
  lessonId: string,
  update: Omit<LessonProgressRow, "lesson_id">
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
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
