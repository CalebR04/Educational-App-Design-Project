import { createClient } from "./client";

export type UserStats = {
  signsLearned: number;
  totalScore: number;
  accuracy: number | null;
  streak: number;
  displayName: string;
  gamesPlayed: number;
  memoryHigh: number;
  comboHigh: number;
  battleHigh: number;
};

export async function fetchUserStats(): Promise<UserStats | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return null;

  const [profileRes, wordRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, username, login_streak, total_game_score, games_played, memory_high_score, combo_high_score, battle_high_score")
      .eq("id", user.id)
      .single(),
    supabase
      .from("word_progress")
      .select("correct, attempts, is_learned")
      .eq("user_id", user.id),
  ]);

  const profile = profileRes.data;
  const words = wordRes.data ?? [];

  const signsLearned = words.filter(w => w.is_learned).length;

  const attempted = words.filter(w => (w.attempts ?? 0) > 0);
  const accuracy = attempted.length > 0
    ? Math.round(
        attempted.reduce((sum, w) => sum + (w.correct ?? 0) / (w.attempts ?? 1), 0)
        / attempted.length * 100
      )
    : null;

  return {
    signsLearned,
    totalScore: profile?.total_game_score ?? 0,
    accuracy,
    streak: profile?.login_streak ?? 0,
    displayName: profile?.full_name ?? profile?.username ?? "Learner",
    gamesPlayed: profile?.games_played ?? 0,
    memoryHigh: profile?.memory_high_score ?? 0,
    comboHigh: profile?.combo_high_score ?? 0,
    battleHigh: profile?.battle_high_score ?? 0,
  };
}

export async function updateLoginStreak(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return;

  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("login_streak, last_login_date")
    .eq("id", user.id)
    .single();

  if (!profile) return;

  const last = profile.last_login_date as string | null;
  if (last === today) return; // Already updated today

  let newStreak = 1;
  if (last) {
    const lastDate = new Date(last);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak = (profile.login_streak ?? 0) + 1;
    }
    // diffDays > 1: reset to 1 (default)
  }

  await supabase
    .from("profiles")
    .update({ login_streak: newStreak, last_login_date: today })
    .eq("id", user.id);
}

export async function addGameScore(points: number, game: "memory" | "combo" | "battle"): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return;

  const col = game === "memory" ? "memory_games_played" : game === "combo" ? "combo_games_played" : "battle_games_played";

  const { data: profile } = await supabase
    .from("profiles")
    .select(`total_game_score, games_played, ${col}`)
    .eq("id", user.id)
    .single();

  await supabase
    .from("profiles")
    .update({
      total_game_score: (profile?.total_game_score ?? 0) + points,
      games_played: (profile?.games_played ?? 0) + 1,
      [col]: ((profile as Record<string, number> | null)?.[col] ?? 0) + 1,
    })
    .eq("id", user.id);
}

export async function fetchGameHighScores(): Promise<{ memoryHigh: number; comboHigh: number; battleHigh: number; memoryPlayed: number; comboPlayed: number; battlePlayed: number }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return { memoryHigh: 0, comboHigh: 0, battleHigh: 0, memoryPlayed: 0, comboPlayed: 0, battlePlayed: 0 };

  const { data } = await supabase
    .from("profiles")
    .select("memory_high_score, combo_high_score, battle_high_score, memory_games_played, combo_games_played, battle_games_played")
    .eq("id", user.id)
    .single();

  return {
    memoryHigh: data?.memory_high_score ?? 0,
    comboHigh: data?.combo_high_score ?? 0,
    battleHigh: data?.battle_high_score ?? 0,
    memoryPlayed: data?.memory_games_played ?? 0,
    comboPlayed: data?.combo_games_played ?? 0,
    battlePlayed: data?.battle_games_played ?? 0,
  };
}

export async function updateGameHighScore(game: "memory" | "combo" | "battle", score: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return;

  const col = game === "memory" ? "memory_high_score" : game === "combo" ? "combo_high_score" : "battle_high_score";

  const { data } = await supabase
    .from("profiles")
    .select(col)
    .eq("id", user.id)
    .single();

  const current = (data as Record<string, number> | null)?.[col] ?? 0;
  if (score > current) {
    await supabase
      .from("profiles")
      .update({ [col]: score })
      .eq("id", user.id);
  }
}

/**
 * Updates is_learned on word_progress. Call this alongside the existing
 * trackWordProgress in lesson/practice pages to persist the "learned" flag.
 * A sign is permanently learned once correct/attempts >= 0.8 with >= 3 attempts.
 */
export async function markLearnedIfEligible(wordKey: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("word_progress")
    .select("correct, attempts, is_learned")
    .eq("user_id", user.id)
    .eq("word_key", wordKey)
    .maybeSingle();

  if (!existing) return;
  if (existing.is_learned) return; // Already learned, never unlearn

  const { correct = 0, attempts = 0 } = existing;
  if (attempts >= 3 && correct / attempts >= 0.8) {
    await supabase
      .from("word_progress")
      .update({ is_learned: true })
      .eq("user_id", user.id)
      .eq("word_key", wordKey);
  }
}
