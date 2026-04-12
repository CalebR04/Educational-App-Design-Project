import type { UserStats } from "@/lib/supabase/userStats";

export type Category = "streak" | "signs" | "accuracy" | "games" | "highscore";

export type AchievementDef = {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  unlocked: (s: UserStats) => boolean;
};

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  // ── Streak ────────────────────────────────────────────────────────────────
  { id: "streak_7",  category: "streak", title: "Week Warrior",   subtitle: "7-day streak",  description: "Maintain a 7-day login streak",  gradient: "from-green-400 to-emerald-500", unlocked: s => s.streak >= 7 },
  { id: "streak_30", category: "streak", title: "Monthly Master", subtitle: "30-day streak", description: "Maintain a 30-day login streak", gradient: "from-orange-400 to-red-500",    unlocked: s => s.streak >= 30 },

  // ── Signs Learned ─────────────────────────────────────────────────────────
  { id: "signs_1",   category: "signs", title: "First Steps",  subtitle: "Learned 1 sign",        description: "Learn your first ASL sign",    gradient: "from-blue-400 to-blue-600",     unlocked: s => s.signsLearned >= 1 },
  { id: "signs_50",  category: "signs", title: "Half Century", subtitle: "Learned 50 signs",       description: "Learn 50 ASL signs",           gradient: "from-yellow-400 to-orange-500", unlocked: s => s.signsLearned >= 50 },
  { id: "signs_105", category: "signs", title: "Sign Master",  subtitle: "Learned all 105 signs",  description: "Learn all 105 signs in the app", gradient: "from-purple-400 to-purple-600", unlocked: s => s.signsLearned >= 105 },

  // ── Accuracy ──────────────────────────────────────────────────────────────
  { id: "acc_80",  category: "accuracy", title: "Sharp Shooter", subtitle: "80% accuracy",  description: "Reach 80% average accuracy",  gradient: "from-blue-400 to-indigo-500",   unlocked: s => s.accuracy >= 80 },
  { id: "acc_90",  category: "accuracy", title: "Precision Pro", subtitle: "90% accuracy",  description: "Reach 90% average accuracy",  gradient: "from-pink-400 to-pink-600",     unlocked: s => s.accuracy >= 90 },
  { id: "acc_95",  category: "accuracy", title: "Near Perfect",  subtitle: "95% accuracy",  description: "Reach 95% average accuracy",  gradient: "from-violet-400 to-violet-600", unlocked: s => s.accuracy >= 95 },
  { id: "acc_100", category: "accuracy", title: "Flawless",      subtitle: "100% accuracy", description: "Reach 100% average accuracy", gradient: "from-yellow-300 to-yellow-500", unlocked: s => s.accuracy >= 100 },

  // ── Games Played ──────────────────────────────────────────────────────────
  { id: "games_10",  category: "games", title: "Game Newbie",  subtitle: "Played 10 games",  description: "Play 10 mini-games",  gradient: "from-teal-400 to-cyan-500",     unlocked: s => s.gamesPlayed >= 10 },
  { id: "games_50",  category: "games", title: "Game Regular", subtitle: "Played 50 games",  description: "Play 50 mini-games",  gradient: "from-blue-400 to-blue-600",    unlocked: s => s.gamesPlayed >= 50 },
  { id: "games_100", category: "games", title: "Game Veteran", subtitle: "Played 100 games", description: "Play 100 mini-games", gradient: "from-purple-400 to-indigo-600", unlocked: s => s.gamesPlayed >= 100 },
  { id: "games_250", category: "games", title: "Game Master",  subtitle: "Played 250 games", description: "Play 250 mini-games", gradient: "from-yellow-400 to-orange-500", unlocked: s => s.gamesPlayed >= 250 },

  // ── High Score — Memory ───────────────────────────────────────────────────
  { id: "hs_mem_1", category: "highscore", title: "Memory Rookie",  subtitle: "Memory: 50+ score",  description: "Score 50+ in Sign Memory",  gradient: "from-sky-400 to-blue-500",      unlocked: s => s.memoryHigh >= 50 },
  { id: "hs_mem_2", category: "highscore", title: "Memory Pro",     subtitle: "Memory: 150+ score", description: "Score 150+ in Sign Memory", gradient: "from-blue-500 to-indigo-600",   unlocked: s => s.memoryHigh >= 150 },
  { id: "hs_mem_3", category: "highscore", title: "Memory Legend",  subtitle: "Memory: 300+ score", description: "Score 300+ in Sign Memory", gradient: "from-indigo-500 to-purple-600", unlocked: s => s.memoryHigh >= 300 },

  // ── High Score — Combos ───────────────────────────────────────────────────
  { id: "hs_combo_1", category: "highscore", title: "Combo Rookie", subtitle: "Combos: 300+ score", description: "Score 300+ in Sign Combos", gradient: "from-purple-400 to-purple-600", unlocked: s => s.comboHigh >= 300 },
  { id: "hs_combo_2", category: "highscore", title: "Combo Expert", subtitle: "Combos: 550+ score", description: "Score 550+ in Sign Combos", gradient: "from-violet-500 to-pink-500",   unlocked: s => s.comboHigh >= 550 },
  { id: "hs_combo_3", category: "highscore", title: "Combo Master", subtitle: "Combos: 700+ score", description: "Score 700+ in Sign Combos", gradient: "from-pink-500 to-rose-600",     unlocked: s => s.comboHigh >= 700 },

  // ── High Score — Battle ───────────────────────────────────────────────────
  { id: "hs_battle_1", category: "highscore", title: "Battle Rookie",   subtitle: "Battle: 200+ score", description: "Score 200+ in Sign Battle", gradient: "from-orange-400 to-red-500",  unlocked: s => s.battleHigh >= 200 },
  { id: "hs_battle_2", category: "highscore", title: "Battle Expert",   subtitle: "Battle: 400+ score", description: "Score 400+ in Sign Battle", gradient: "from-red-500 to-rose-600",    unlocked: s => s.battleHigh >= 400 },
  { id: "hs_battle_3", category: "highscore", title: "Battle Champion", subtitle: "Battle: 700+ score", description: "Score 700+ in Sign Battle", gradient: "from-rose-500 to-pink-600",   unlocked: s => s.battleHigh >= 700 },
];

export const CATEGORY_ORDER: Category[] = ["signs", "streak", "accuracy", "games", "highscore"];

export const CATEGORY_META: Record<Category, { label: string }> = {
  streak:    { label: "Streak" },
  signs:     { label: "Signs Learned" },
  accuracy:  { label: "Accuracy" },
  games:     { label: "Games Played" },
  highscore: { label: "High Score" },
};

/** Returns the highest-tier unlocked achievement for a category, or null */
export function getTopForCategory(category: Category, stats: UserStats): AchievementDef | null {
  const defs = ALL_ACHIEVEMENTS.filter(a => a.category === category);
  return [...defs].reverse().find(a => a.unlocked(stats)) ?? null;
}

/** Returns 4 slots: categories with achievements first, then nulls */
export function buildHomeSlots(stats: UserStats | null): (AchievementDef | null)[] {
  if (!stats) return [null, null, null, null];
  const withAchievement: AchievementDef[] = [];
  const empty: null[] = [];
  for (const cat of CATEGORY_ORDER) {
    const top = getTopForCategory(cat, stats);
    if (top) withAchievement.push(top);
    else empty.push(null);
  }
  return [...withAchievement, ...empty].slice(0, 4);
}
