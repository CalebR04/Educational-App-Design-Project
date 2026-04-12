import { lessonConfigs } from "./lessonConfigs";
import type { VocabItem, SentenceItem } from "./lessonConfigs";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Build all vocab from every lesson config, keyed by wordKey.
export function getAllVocab(): Record<string, VocabItem> {
  const map: Record<string, VocabItem> = {};
  for (const config of Object.values(lessonConfigs)) {
    for (const item of config.vocab) {
      map[item.key] = item;
    }
  }
  return map;
}

// Get vocab for a specific lesson
export function getLessonVocab(lessonId: string): VocabItem[] {
  return lessonConfigs[lessonId]?.vocab ?? [];
}

// Get all sentences from all lessons (for global practice sessions)
export function getAllSentences(): SentenceItem[] {
  return Object.values(lessonConfigs).flatMap(c => c.sentences ?? []);
}

// Get sentences for a specific lesson
export function getLessonSentences(lessonId: string): SentenceItem[] {
  return lessonConfigs[lessonId]?.sentences ?? [];
}

type ProgressEntry = {
  attempts: number;
  correct: number;
  updated_at: string;
};

export type PracticeItem = VocabItem & {
  reason: "weakest" | "oldest";
};

// ── Leitner Box SRS ───────────────────────────────────────────────────────────
//
// Box assignment based on accuracy ratio (correct / attempts):
//   Box 0 — Never practiced (highest review priority)
//   Box 1 — Weak         ratio < 0.40   → 70% of session slots
//   Box 2 — Developing   ratio 0.40–0.59
//   Box 3 — Familiar     ratio 0.60–0.74 → 25% combined (Boxes 2–4)
//   Box 4 — Strong       ratio 0.75–0.89
//   Box 5 — Mastered     ratio ≥ 0.90   →  5% of session slots
//
// Priority score = accuracy / max(hoursSinceLastReview, 0.1)
//   Lower score → higher urgency (weak AND stale rises to the top).
//
// 12-hour cooldown: items practiced within the last 12 hours receive a large
// priority penalty so they sort to the end of every tier and are only selected
// as back-fill if nothing else is available.

/** Minimum rest period between sessions for the same sign (milliseconds). */
export const COOLDOWN_MS = 12 * 60 * 60 * 1000;

/**
 * Returns the Leitner Box (0–5) for a sign based on cumulative accuracy.
 * Exported so the practice summary UI can display mastery levels.
 */
export function getLeitnerBox(correct: number, attempts: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (attempts === 0) return 0;
  const ratio = correct / attempts;
  if (ratio < 0.40) return 1;
  if (ratio < 0.60) return 2;
  if (ratio < 0.75) return 3;
  if (ratio < 0.90) return 4;
  return 5;
}

function reviewPriority(entry: ProgressEntry | undefined, now: number): number {
  if (!entry || entry.attempts === 0) return -Infinity; // never practiced = absolute top priority
  const ratio = entry.correct / entry.attempts;
  const msSince = now - new Date(entry.updated_at).getTime();
  const hoursSince = msSince / (1000 * 60 * 60);
  // Lower ratio + more time elapsed → lower score → higher urgency
  const base = ratio / Math.max(hoursSince, 0.1);
  // Cooldown: signs reviewed within 12 h are de-prioritised below everything else.
  // Adding 1e9 keeps them in their tier but always after non-cooldown items.
  return msSince < COOLDOWN_MS ? 1e9 + base : base;
}

/**
 * Selects practice items using Leitner Box spaced-repetition logic.
 *
 * Target distribution over a (weakestCount + oldestCount) session:
 *   70% — Box 0/1 (Weak / Never-practiced)
 *    5% — Box 5   (Mastered — long-term retention check)
 *   25% — Boxes 2–4 (Developing → Strong)
 *
 * Within each tier, items are sorted by review urgency so the most
 * overdue, least accurate signs surface first.
 */
export function selectPracticeItems(
  vocab: VocabItem[],
  progress: Record<string, ProgressEntry>,
  weakestCount = 8,
  oldestCount = 4,
): PracticeItem[] {
  if (vocab.length === 0) return [];

  const totalTarget = weakestCount + oldestCount;
  const now = Date.now();

  // Enrich each item with its box and priority score
  const enriched = vocab.map(item => ({
    item,
    box: getLeitnerBox(
      progress[item.key]?.correct  ?? 0,
      progress[item.key]?.attempts ?? 0,
    ),
    priority: reviewPriority(progress[item.key], now),
  }));

  // Sort within each tier by priority ascending (most urgent first)
  const tier0and1 = enriched.filter(e => e.box <= 1).sort((a, b) => a.priority - b.priority);
  const tier2to4  = enriched.filter(e => e.box >= 2 && e.box <= 4).sort((a, b) => a.priority - b.priority);
  const tier5     = enriched.filter(e => e.box === 5).sort((a, b) => a.priority - b.priority);

  // Target slot counts
  const weakSlots    = Math.round(totalTarget * 0.70);
  const masteredSlots = Math.max(1, Math.round(totalTarget * 0.05));
  const midSlots     = totalTarget - weakSlots - masteredSlots;

  const selected: PracticeItem[] = [
    ...tier0and1.slice(0, weakSlots).map(e => ({ ...e.item, reason: "weakest" as const })),
    ...tier2to4.slice(0, midSlots).map(e => ({ ...e.item, reason: "weakest" as const })),
    ...tier5.slice(0, masteredSlots).map(e => ({ ...e.item, reason: "oldest" as const })),
  ];

  // Back-fill any remaining slots with the highest-urgency items not yet chosen
  if (selected.length < totalTarget) {
    const usedKeys = new Set(selected.map(v => v.key));
    const backfill = enriched
      .filter(e => !usedKeys.has(e.item.key))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, totalTarget - selected.length)
      .map(e => ({ ...e.item, reason: "oldest" as const }));
    selected.push(...backfill);
  }

  return shuffle(selected).slice(0, totalTarget);
}
