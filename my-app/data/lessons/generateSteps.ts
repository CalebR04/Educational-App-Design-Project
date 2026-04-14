import type { LessonStep } from "./alphabet";
import type { VocabItem, SentenceItem } from "./lessonConfigs";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function pickDistractors(correct: VocabItem, pool: VocabItem[], count: number): VocabItem[] {
  return shuffle(pool.filter(v => v.key !== correct.key)).slice(0, count);
}

// ── Accepted answers for labels with "/" (e.g. "EAT / FOOD" → ["EAT","FOOD","EAT / FOOD","EAT/FOOD"]) ──
function makeAccepted(label: string): string[] {
  const upper = label.trim().toUpperCase();
  const parts = upper.split("/").map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) return [upper];
  return [...new Set([...parts, upper, upper.replace(/ \/ /g, "/"), upper.replace(/ \/ /g, " ")])];
}

// ── Varied prompts ──
const QUIZ_PROMPTS  = ["What is this sign?", "Name this sign:", "Which sign is shown?", "Identify this sign:"];
const MATCH_PROMPTS = ["Find the sign for:", "Which image matches:", "Select the sign for:", "Pick the correct sign for:"];
const TYPE_PROMPTS_GENERIC = ["What sign is this? Type it:", "Name this sign:", "Type the word shown:"];
const TYPE_PROMPTS_LETTER  = ["What letter is this?", "Type this letter:", "Name this letter:"];
const TYPE_PROMPTS_NUMBER  = ["What number is this?", "Type this number:", "Which number is shown?"];

function typePrompt(item: VocabItem): string {
  if (item.key.startsWith("letter_")) return shuffle(TYPE_PROMPTS_LETTER)[0];
  if (item.key.startsWith("num_"))    return shuffle(TYPE_PROMPTS_NUMBER)[0];
  return shuffle(TYPE_PROMPTS_GENERIC)[0];
}

// ── Step builders ──────────────────────────────────────────────────────────

function makeTeachStep(item: VocabItem): LessonStep {
  return {
    id: `teach-${item.key}`,
    type: "teach",
    prompt: item.key.startsWith("letter_")
      ? `This is the letter ${item.label}`
      : item.key.startsWith("num_")
      ? `This is the number ${item.label}`
      : `This is: ${item.label}`,
    description: item.description,
    mediaType: item.mediaType,
    imageUrl: item.mediaType === "image" ? item.mediaSrc : undefined,
    videoUrl: item.mediaType === "video" ? item.mediaSrc : undefined,
    wordKey: item.key,
  };
}

function makeQuizStep(item: VocabItem, pool: VocabItem[], idSuffix = ""): LessonStep {
  const distractors = pickDistractors(item, pool, 2);
  return {
    id: `quiz-${item.key}${idSuffix}`,
    type: "quiz",
    prompt: shuffle(QUIZ_PROMPTS)[0],
    mediaType: item.mediaType,
    imageUrl: item.mediaType === "image" ? item.mediaSrc : undefined,
    videoUrl: item.mediaType === "video" ? item.mediaSrc : undefined,
    options: shuffle([item, ...distractors]).map(v => ({ id: v.label, label: v.label })),
    correctAnswer: item.label,
    wordKey: item.key,
  };
}

function makeMatchStep(item: VocabItem, pool: VocabItem[], idSuffix = ""): LessonStep {
  const distractors = pickDistractors(item, pool, 3);
  return {
    id: `match-${item.key}${idSuffix}`,
    type: "match",
    prompt: `${shuffle(MATCH_PROMPTS)[0]} ${item.label}`,
    options: shuffle([item, ...distractors]).map(v => ({
      id: v.label,
      imageUrl: v.mediaType === "image" ? v.mediaSrc : undefined,
      videoUrl: v.mediaType === "video" ? v.mediaSrc : undefined,
      mediaType: v.mediaType,
    })),
    correctAnswer: item.label,
    wordKey: item.key,
  };
}

function makeTypeStep(item: VocabItem, idSuffix = ""): LessonStep {
  const accepted = makeAccepted(item.label);
  const hint = accepted.length > 1
    ? `Type any of: ${accepted.slice(0, 2).join(" or ")}`
    : item.description ?? "";
  return {
    id: `type-${item.key}${idSuffix}`,
    type: "type",
    prompt: typePrompt(item),
    description: hint,
    mediaType: item.mediaType,
    imageUrl: item.mediaType === "image" ? item.mediaSrc : undefined,
    videoUrl: item.mediaType === "video" ? item.mediaSrc : undefined,
    correctAnswer: item.label,
    acceptedAnswers: accepted,
    wordKey: item.key,
  };
}

/**
 * Missing sign step — shows a sentence with one sign blanked out, learner picks the
 * correct sign from 3 video/image thumbnails.
 */
function makeMissingSignStep(
  s: SentenceItem,
  vocab: VocabItem[],
  allSentences: SentenceItem[],
  idSuffix = "",
): LessonStep {
  const missingIdx = Math.floor(Math.random() * s.signs.length);
  const correctSign = s.signs[missingIdx];

  // Build distractor pool: signs from other sentences + lesson vocab (deduplicated by label)
  const otherSigns = allSentences
    .filter(other => other.id !== s.id)
    .flatMap(other => other.signs)
    .map(sign => ({ src: sign.src, mediaType: sign.mediaType, label: sign.label }));

  const vocabSigns = vocab.map(v => ({
    src: v.mediaSrc,
    mediaType: v.mediaType,
    label: v.label,
  }));

  const usedLabels = new Set([correctSign.label]);
  const distractors: typeof otherSigns = [];

  for (const candidate of shuffle([...otherSigns, ...vocabSigns])) {
    if (!usedLabels.has(candidate.label)) {
      usedLabels.add(candidate.label);
      distractors.push(candidate);
      if (distractors.length >= 2) break;
    }
  }

  const options = shuffle([
    { id: correctSign.label, label: correctSign.label, videoUrl: correctSign.mediaType === "video" ? correctSign.src : undefined, imageUrl: correctSign.mediaType === "image" ? correctSign.src : undefined, mediaType: correctSign.mediaType },
    ...distractors.map(d => ({ id: d.label, label: d.label, videoUrl: d.mediaType === "video" ? d.src : undefined, imageUrl: d.mediaType === "image" ? d.src : undefined, mediaType: d.mediaType })),
  ]);

  return {
    id: `missing-${s.id}-${missingIdx}${idSuffix}`,
    type: "missing_sign",
    prompt: "Which sign completes the sentence?",
    description: s.answer,
    sentenceMedia: s.signs.map(sign => ({ src: sign.src, mediaType: sign.mediaType, label: sign.label })),
    missingIndex: missingIdx,
    options,
    correctAnswer: correctSign.label,
  };
}

/**
 * Sentence step — shows signs played sequentially, learner picks from 3 text options.
 * Distractors come from the sentence's own custom `distractors` field.
 */
function makeSentenceStep(s: SentenceItem, _allSentences: SentenceItem[], idSuffix = ""): LessonStep {
  const correct = s.answer;
  const options = shuffle([correct, ...s.distractors]).map(text => ({
    id: text,
    label: text,
  }));
  return {
    id: `sentence-${s.id}${idSuffix}`,
    type: "sentence",
    prompt: s.prompt ?? "What does this sentence mean?",
    sentenceMedia: s.signs.map(sign => ({
      src: sign.src,
      mediaType: sign.mediaType,
      label: sign.label,
    })),
    options,
    correctAnswer: correct,
  };
}

function makeSynthesizeStep(word: string, idSuffix = ""): LessonStep {
  const letters = word.toUpperCase().split("");
  const prompts = ["What does this spell?", "Fingerspell this word — what is it?", "Read each letter and type the word:"];
  return {
    id: `synth-${word.toLowerCase()}${idSuffix}`,
    type: "synthesize",
    prompt: shuffle(prompts)[0],
    imageUrl: letters.map(l => `/asl_images/letters/${l.toLowerCase()}.svg`),
    correctAnswer: word.toUpperCase(),
    acceptedAnswers: [word.toUpperCase()],
  };
}

// ── Word pools for synthesize steps ───────────────────────────────────────

const WORDS_AM = [
  "ACE","AGE","AID","AIM","BAD","BAG","BIG","BID","CAB","CAM","DAD","DAM","DIG","DIM",
  "EGG","ELF","ELM","FAD","FIG","GAB","GEL","GEM","HAD","HAM","HEM","HID","HIM","ICE",
  "ILL","JAB","JAM","JIG","KID","LAB","LAD","LAG","LID","MAD","GAL","CAD",
  "BEAD","BEAM","BAIL","BALE","BILE","BILL","CAFE","CAGE","CAKE","CALF","CALL","CLAD",
  "CLAM","CLEF","CELL","DAME","DEAD","DEAL","DEAF","DELI","DIKE","DILL","DIME","FACE",
  "FADE","FAKE","FAME","FELL","FILL","FILM","FLAG","FLED","FLAB","GALE","GAME","GLAD",
  "HACK","HALE","HALF","HELM","HIDE","HIKE","HILL","IDEA","JACK","JADE","JAIL","JELL",
  "KICK","KILL","LACE","LACK","LAKE","LAME","LEAF","LEAK","LIKE","LIME","MAKE","MACE",
  "MAID","MAIL","MALE","MILD","MILK","MILL","BEAM","BILE","GILD","BILL",
  "CAMEL","CLAIM","FLAME","GLEAM","IDEAL","IMAGE","MAGIC","MEDAL",
];

const WORDS_ALL = [
  "CAT","DOG","RUN","SIT","TOP","POT","PAN","TAP","MAP","SUN","GUN","FUN","MAN","PEN",
  "TEN","HEN","NOT","HOT","ROT","LOT","NET","SET","MET","PET","WET","LET","CUP","NUT",
  "GUT","CUT","RUB","TUB","TUG","RUG","MUG","JUG","LOG","FOX","BOX","COW","OWL","OAK",
  "STOP","PLAY","OPEN","NEXT","JUMP","FLOW","SNOW","STAR","STEP","CLAP","DRUM","SPIN",
  "SHOP","TRIM","BLOW","DRIP","PLAN","SLOT","RUST","GUST","JUST","MUST","HUNT","PUNT",
  "RUNT","STUN","KNOT","PLOT","TROT","FROG","PROP","PLUS","TWIN","SPIT","SPOT","WORD",
  "WORK","WORM","WORN","CROW","PLOW","SLOW","GROW","GLOW","FLOW","SHOW","BLOW",
  "FROST","STORM","SPORT","STORK","STRIP","STOMP","SNORE","SNOWY","TROUT","CLOUD",
  "CROWN","CROWS","FLOWN","BLOWN","GROWN","SHOWN","KNOWN","DRAWN","PRAWN","BRAWN",
  "QUICK","QUIZ","ZERO","LAZY","FIZZ","FUZZ","BUZZ","JAZZ","ZINC","ZONE","ZOOM",
];

function filterWordsByLetters(words: string[], available: Set<string>): string[] {
  return words.filter(w => w.split("").every(l => available.has(l.toUpperCase())));
}

/**
 * Generates lesson steps dynamically.
 *
 * For each chunk:
 *   Teach all → Quiz (shuffled) → Match (if ≥4 seen) → Type (chunk 2+)
 *
 * Adaptive interleaving: for every 5 new signs taught, injects 1 weak sign
 *   review step (quiz or type) from a previous lesson to reinforce memory.
 *
 * For letter lessons: add Synthesize words after chunks of ≥5 seen letters.
 *
 * Final review (if >1 chunk): quiz + type + match mix over all vocab.
 *
 * Sentence steps at the end: sequential video player + 3 multiple-choice text options.
 */
export function generateSteps(
  vocab: VocabItem[],
  sentences: SentenceItem[] = [],
  weakSigns: VocabItem[] = [],
): LessonStep[] {
  if (!vocab.length) return [];

  const isLetterLesson = vocab[0].key.startsWith("letter_");
  const isNZLesson     = isLetterLesson && vocab.some(v => ["N","O","P","Q","R","S","T","U","V","W","X","Y","Z"].includes(v.label.toUpperCase()));
  const CHUNK_SIZE     = vocab[0].mediaType === "image" ? 4 : 3;

  const shuffledVocab = shuffle(vocab);
  const chunks        = chunkArray(shuffledVocab, CHUNK_SIZE);
  const steps: LessonStep[] = [];
  const seen: VocabItem[]   = [];

  const AM_LETTERS = new Set("ABCDEFGHIJKLM".split(""));

  // ── Adaptive interleaving ──────────────────────────────────────────────────
  const currentKeys = new Set(vocab.map(v => v.key));
  const weakQueue   = shuffle(weakSigns.filter(w => !currentKeys.has(w.key)));
  let   nextWeakAt  = 5;

  function injectWeakSignReviews() {
    while (seen.length >= nextWeakAt && weakQueue.length > 0) {
      const weakItem = weakQueue.shift()!;
      const distPool = shuffle([...seen, weakItem]).filter(v => v.key !== weakItem.key).slice(0, 3);
      const useType  = (nextWeakAt / 5) % 2 === 0;
      steps.push(
        useType
          ? makeTypeStep(weakItem, `-review-${nextWeakAt}`)
          : makeQuizStep(weakItem, [weakItem, ...distPool], `-review-${nextWeakAt}`),
      );
      nextWeakAt += 5;
    }
  }

  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    const isFirstChunk = ci === 0;

    // Teach
    for (const item of chunk) steps.push(makeTeachStep(item));
    seen.push(...chunk);

    injectWeakSignReviews();

    for (const item of shuffle(chunk)) {
      steps.push(makeQuizStep(item, seen, `-c${ci}`));
    }

    if (seen.length >= 4) {
      for (const item of shuffle(chunk)) {
        steps.push(makeMatchStep(item, seen, `-c${ci}`));
      }
    }

    if (!isFirstChunk) {
      for (const item of shuffle(chunk)) {
        steps.push(makeTypeStep(item, `-c${ci}`));
      }
    }

    // Synthesize (letter lessons only, ≥5 letters seen)
    if (isLetterLesson && seen.length >= 5) {
      const availableLetters = new Set(seen.map(v => v.label.toUpperCase()));
      if (isNZLesson) AM_LETTERS.forEach(l => availableLetters.add(l));
      const wordPool   = isNZLesson ? WORDS_ALL : WORDS_AM;
      const candidates = shuffle(filterWordsByLetters(wordPool, availableLetters));
      const short  = candidates.find(w => w.length === 3);
      const medium = candidates.find(w => w.length >= 4 && w.length <= 5);
      const wordsToUse = shuffle([short, medium].filter(Boolean) as string[]).slice(0, 2);
      for (const [i, word] of wordsToUse.entries()) {
        steps.push(makeSynthesizeStep(word, `-c${ci}-${i}`));
      }
    }
  }

  // Final cumulative review (only if >1 chunk)
  if (chunks.length > 1) {
    const reviewItems = shuffle(shuffledVocab);

    reviewItems.forEach((item, i) => {
      if (i % 3 === 0) {
        steps.push(makeTypeStep(item, `-final`));
      } else if (i % 3 === 1 && seen.length >= 4) {
        steps.push(makeMatchStep(item, shuffledVocab, `-final`));
      } else {
        steps.push(makeQuizStep(item, shuffledVocab, `-final`));
      }
    });

    if (isLetterLesson) {
      const allLetters = new Set(shuffledVocab.map(v => v.label.toUpperCase()));
      if (isNZLesson) AM_LETTERS.forEach(l => allLetters.add(l));
      const wordPool   = isNZLesson ? WORDS_ALL : WORDS_AM;
      const candidates = shuffle(filterWordsByLetters(wordPool, allLetters));
      const finalWords = candidates.filter(w => w.length >= 4).slice(0, 3);
      for (const [i, word] of finalWords.entries()) {
        steps.push(makeSynthesizeStep(word, `-final-${i}`));
      }
    }
  }

  // Sentence steps first (shuffled), then missing-sign steps (re-shuffled separately)
  // so the same sentence never appears back-to-back with its fill-in-the-blank variant
  const sentenceOrder     = shuffle([...sentences]);
  const missingSignOrder  = shuffle([...sentences].filter(s => s.signs.length >= 2));

  for (const [i, s] of sentenceOrder.entries()) {
    steps.push(makeSentenceStep(s, sentences, `-${i}`));
  }
  for (const [i, s] of missingSignOrder.entries()) {
    steps.push(makeMissingSignStep(s, vocab, sentences, `-ms${i}`));
  }

  return steps;
}
