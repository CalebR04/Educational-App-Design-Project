import { lessonConfigs } from "./lessonConfigs";
import type { VocabItem, SentenceItem } from "./lessonConfigs";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Build all vocab from every lesson config, keyed by wordKey.
// alphabet-1 and alphabet-2 are now in lessonConfigs so letters are included automatically.
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

export function selectPracticeItems(
  vocab: VocabItem[],
  progress: Record<string, ProgressEntry>,
  weakestCount = 8,
  oldestCount = 4
): PracticeItem[] {
  if (vocab.length === 0) return [];

  const withAttempts = vocab.filter(v => (progress[v.key]?.attempts ?? 0) > 0);
  const noAttempts   = vocab.filter(v => !(progress[v.key]?.attempts > 0));

  // 8 weakest: lowest correct/attempts ratio
  const weakest: PracticeItem[] = [...withAttempts]
    .sort((a, b) => {
      const ra = progress[a.key].correct / progress[a.key].attempts;
      const rb = progress[b.key].correct / progress[b.key].attempts;
      return ra - rb;
    })
    .slice(0, weakestCount)
    .map(v => ({ ...v, reason: "weakest" as const }));

  const weakestKeys = new Set(weakest.map(v => v.key));

  // 4 oldest: sorted by updated_at asc (oldest first), then never-practiced
  const oldestPool = [
    ...withAttempts.filter(v => !weakestKeys.has(v.key))
      .sort((a, b) => (progress[a.key].updated_at < progress[b.key].updated_at ? -1 : 1)),
    ...noAttempts,
  ];
  const oldest: PracticeItem[] = oldestPool
    .slice(0, oldestCount)
    .map(v => ({ ...v, reason: "oldest" as const }));

  const selected = [...weakest, ...oldest];

  // Fill up to (weakestCount + oldestCount) if pool is small
  const target = weakestCount + oldestCount;
  if (selected.length < target) {
    const used = new Set(selected.map(v => v.key));
    const extras = shuffle(vocab.filter(v => !used.has(v.key)))
      .slice(0, target - selected.length)
      .map(v => ({ ...v, reason: "oldest" as const }));
    selected.push(...extras);
  }

  return shuffle(selected);
}
