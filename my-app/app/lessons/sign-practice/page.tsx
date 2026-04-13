"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, CheckCircle2, XCircle, Zap, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAllVocab, getLessonVocab, selectPracticeItems, getLeitnerBox } from "@/data/lessons/practiceVocab";
import type { VocabItem } from "@/data/lessons/lessonConfigs";
import type { LessonStep } from "@/data/lessons/alphabet";
import Link from "next/link";
import { useProgress } from "@/components/ProgressProvider";
import LockedScreen from "@/components/LockedScreen";

// ── Leitner box display config ─────────────────────────────────────────────

const BOX_CONFIG: { label: string; color: string }[] = [
  { label: "New",          color: "bg-slate-100 text-slate-600"   },
  { label: "Needs Review", color: "bg-red-100 text-red-700"       },
  { label: "Developing",   color: "bg-orange-100 text-orange-700" },
  { label: "Familiar",     color: "bg-amber-100 text-amber-700"   },
  { label: "Strong",       color: "bg-blue-100 text-blue-700"     },
  { label: "Mastered",     color: "bg-green-100 text-green-700"   },
];

function getSessionMessage(accuracy: number): string {
  if (accuracy >= 80) return "Excellent work. You're mastering these signs.";
  if (accuracy >= 50) return "Good progress. Keep practicing your weaker areas.";
  return "Don't worry — repetition is key to learning ASL. Try again later.";
}

// ── Step builders ──────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getItemType(item: VocabItem): string {
  if (item.key.startsWith("letter_")) return "letter";
  if (item.key.startsWith("num_")) return "number";
  return "word";
}

function pickDistractors(correct: VocabItem, globalPool: VocabItem[], count: number): VocabItem[] {
  const sameType = globalPool.filter(v => v.key !== correct.key && getItemType(v) === getItemType(correct));
  const candidates = sameType.length >= count ? sameType : globalPool.filter(v => v.key !== correct.key);
  return shuffle(candidates).slice(0, count);
}

function makeAccepted(label: string): string[] {
  const upper = label.trim().toUpperCase();
  const parts = upper.split("/").map(p => p.trim()).filter(Boolean);
  if (parts.length <= 1) return [upper];
  return [...new Set([...parts, upper, upper.replace(/ \/ /g, "/"), upper.replace(/ \/ /g, " ")])];
}

// Derive filler words between signs from the first accepted answer.
// Returns an array of length signs.length+1: fillersBefore[i] is the
// filler text that appears before sign[i] (index signs.length = after last sign).
function deriveFillers(signs: { label: string }[], acceptedAnswer: string): string[][] {
  const words    = acceptedAnswer.toUpperCase().split(/\s+/);
  const signSeqs = signs.map(s => s.label.toUpperCase().split(/\s+/));
  const fillers: string[][] = Array.from({ length: signs.length + 1 }, () => []);
  let wi = 0, si = 0;
  while (si < signSeqs.length && wi < words.length) {
    const seq = signSeqs[si];
    if (words.slice(wi, wi + seq.length).join(" ") === seq.join(" ")) {
      wi += seq.length; si++;
    } else {
      fillers[si].push(words[wi++]);
    }
  }
  while (wi < words.length) fillers[signs.length].push(words[wi++]);
  return fillers;
}

const TYPE_PROMPTS_GENERIC = ["What sign is this? Type it:", "Name this sign:", "Type the word shown:"];
const TYPE_PROMPTS_LETTER  = ["What letter is this?", "Type this letter:", "Name this letter:"];
const TYPE_PROMPTS_NUMBER  = ["What number is this?", "Type this number:", "Which number is shown?"];

function typePrompt(item: VocabItem): string {
  if (item.key.startsWith("letter_")) return shuffle(TYPE_PROMPTS_LETTER)[0];
  if (item.key.startsWith("num_"))    return shuffle(TYPE_PROMPTS_NUMBER)[0];
  return shuffle(TYPE_PROMPTS_GENERIC)[0];
}

function makeTypeStep(item: VocabItem): LessonStep {
  const accepted = makeAccepted(item.label);
  return {
    id: `prac-type-${item.key}-${Date.now()}`,
    type: "type",
    prompt: typePrompt(item),
    description: accepted.length > 1 ? `Accepted: ${accepted.slice(0, 2).join(" or ")}` : "",
    mediaType: item.mediaType,
    imageUrl: item.mediaType === "image" ? item.mediaSrc : undefined,
    videoUrl: item.mediaType === "video" ? item.mediaSrc : undefined,
    correctAnswer: item.label,
    acceptedAnswers: accepted,
    wordKey: item.key,
  };
}

function makeQuizStep(item: VocabItem, globalPool: VocabItem[]): LessonStep {
  const distractors = pickDistractors(item, globalPool, 2);
  return {
    id: `prac-quiz-${item.key}-${Date.now()}`,
    type: "quiz",
    prompt: "What is this sign?",
    mediaType: item.mediaType,
    imageUrl: item.mediaType === "image" ? item.mediaSrc : undefined,
    videoUrl: item.mediaType === "video" ? item.mediaSrc : undefined,
    options: shuffle([item, ...distractors]).map(v => ({ id: v.label, label: v.label })),
    correctAnswer: item.label,
    wordKey: item.key,
  };
}

function makeMatchStep(item: VocabItem, globalPool: VocabItem[]): LessonStep {
  const distractors = pickDistractors(item, globalPool, 3);
  return {
    id: `prac-match-${item.key}-${Date.now()}`,
    type: "match",
    prompt: `Find the sign for: ${item.label}`,
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

function makeSentencePracticeStep(s: SentenceItem): LessonStep {
  return {
    id: `prac-sentence-${s.id}-${Date.now()}`,
    type: "sentence",
    prompt: s.prompt ?? "Translate this ASL sentence:",
    sentenceMedia: s.signs.map(sign => ({ src: sign.src, mediaType: sign.mediaType, label: sign.label })),
    correctAnswer: s.acceptedAnswers[0],
    acceptedAnswers: s.acceptedAnswers,
  };
}

function generatePracticeSteps(selected: VocabItem[], globalPool: VocabItem[]): LessonStep[] {
  return selected.map(item => {
    const roll = Math.random();
    if (roll < 0.40) return makeTypeStep(item);
    const sameTypeCount = globalPool.filter(v => getItemType(v) === getItemType(item)).length;
    if (roll < 0.75 && sameTypeCount >= 4) return makeMatchStep(item, globalPool);
    return makeQuizStep(item, globalPool);
  });
}

// ── Supabase helpers ──────────────────────────────────────────────────────

const supabase = createClient();

async function trackWordProgress(wordKey: string, isCorrect: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("word_progress")
    .select("attempts, correct, streak, is_learned")
    .eq("user_id", user.id)
    .eq("word_key", wordKey)
    .maybeSingle();

  const prevStreak = existing?.streak ?? 0;
  const rawStreak  = isCorrect ? prevStreak + 1 : 0;
  const mastered   = rawStreak >= 10;

  const newAttempts = mastered ? (existing?.correct ?? 0) + 1 : (existing?.attempts ?? 0) + 1;
  const newCorrect  = mastered ? newAttempts : (existing?.correct ?? 0) + (isCorrect ? 1 : 0);
  const newStreak   = mastered ? 0 : rawStreak;
  const isLearned   = existing?.is_learned === true || (newAttempts >= 3 && newCorrect / newAttempts >= 0.8);

  await supabase.from("word_progress").upsert({
    user_id: user.id,
    word_key: wordKey,
    attempts: newAttempts,
    correct: newCorrect,
    streak: newStreak,
    is_learned: isLearned,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,word_key" });
}

// ── Session summary types ─────────────────────────────────────────────────

type SessionStat = { correct: number; attempts: number };

type SessionResult = {
  wordKey: string;
  label: string;
  preBox:  0 | 1 | 2 | 3 | 4 | 5;
  postBox: 0 | 1 | 2 | 3 | 4 | 5;
  sessionCorrect: number;
  sessionAttempts: number;
  improved: boolean;
  sessionStreak: boolean; // 100% correct in this session
};

// ── Inner component (needs useSearchParams) ────────────────────────────────

function SignPracticeInner() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const router = useRouter();

  const [loading, setLoading]               = useState(true);
  const [noVocab, setNoVocab]               = useState(false);
  const [isLocked, setIsLocked]             = useState(false);
  const [queue, setQueue]                   = useState<LessonStep[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [selectedAnswer, setSelectedAnswer]   = useState<string | null>(null);
  const [textInput, setTextInput]             = useState("");
  const [sentenceInputs, setSentenceInputs]   = useState<string[]>([]);
  const [feedback, setFeedback]             = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount]     = useState(0);
  const [wrongPhase, setWrongPhase]         = useState<"none" | "hint" | "retry">("none");
  const [retryHint, setRetryHint]           = useState<string | null>(null);
  const [isFinished, setIsFinished]         = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);

  // ── Session tracking ───────────────────────────────────────────────────
  // sessionStatsRef: per-wordKey { correct, attempts } accumulated this session.
  // Includes retries so it mirrors what trackWordProgress writes to the DB.
  const sessionStatsRef    = useRef<Map<string, SessionStat>>(new Map());
  // initialProgressRef: DB state at session start (for pre/post box comparison).
  const initialProgressRef = useRef<Record<string, { correct: number; attempts: number; updated_at: string }>>({});
  // allVocabRef: lookup map for labels/items in the summary.
  const allVocabRef        = useRef<Record<string, VocabItem>>({});

  useEffect(() => {
    async function init() {
      const globalVocab = Object.values(getAllVocab());
      allVocabRef.current = Object.fromEntries(globalVocab.map(v => [v.key, v]));

      const { data: { user } } = await supabase.auth.getUser();

      let pool: VocabItem[];
      let completedLessonIds: string[] = [];

      if (lessonId) {
        // Lesson-specific practice — use that lesson's vocab directly
        pool = getLessonVocab(lessonId);
      } else {
        // Global practice — only include vocab from lessons the user has completed
        if (user) {
          const { data } = await supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", user.id)
            .eq("ever_completed", true);
          completedLessonIds = (data ?? []).map((r: { lesson_id: string }) => r.lesson_id);
        }

        const LEVEL_1_IDS = ["alphabet-1", "alphabet-2", "numbers-1", "deixis-1"];
        const allLevel1Done = LEVEL_1_IDS.every(id => completedLessonIds.includes(id));
        if (!allLevel1Done) {
          setIsLocked(true);
          setLoading(false);
          return;
        }

        pool = completedLessonIds.flatMap(id => getLessonVocab(id));
      }

      if (pool.length === 0) { setNoVocab(true); setLoading(false); return; }

      const progressMap: Record<string, { attempts: number; correct: number; updated_at: string }> = {};
      if (user) {
        const { data } = await supabase
          .from("word_progress")
          .select("word_key, attempts, correct, updated_at")
          .eq("user_id", user.id);
        for (const row of data ?? []) {
          progressMap[row.word_key] = row;
        }
      }

      // Save pre-session state for summary comparison
      initialProgressRef.current = progressMap;

      const distractorPool = lessonId ? pool : globalVocab;
      const selected       = selectPracticeItems(pool, progressMap);
      const vocabSteps     = generatePracticeSteps(selected, distractorPool);

      setQueue(vocabSteps);
      setTotalQuestions(vocabSteps.length);
      setLoading(false);
    }
    init();
  }, [lessonId]);

  // Enter key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || showPauseConfirm) return;
      const step = queue[currentIndex];
      if (!step) return;
      if (feedback) handleNext();
      else if (wrongPhase !== "hint" && (
        selectedAnswer ||
        textInput.trim().length > 0 ||
        (step.type === "sentence" && sentenceInputs.some(s => s.trim().length > 0))
      )) handleCheck();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // ── Helpers ────────────────────────────────────────────────────────────

  function recordStat(wordKey: string, isCorrect: boolean) {
    const s = sessionStatsRef.current.get(wordKey) ?? { correct: 0, attempts: 0 };
    s.attempts += 1;
    if (isCorrect) s.correct += 1;
    sessionStatsRef.current.set(wordKey, s);
  }

  function buildSessionResults(): SessionResult[] {
    const results: SessionResult[] = [];
    for (const [wordKey, stats] of sessionStatsRef.current.entries()) {
      const item = allVocabRef.current[wordKey];
      if (!item) continue;
      const pre       = initialProgressRef.current[wordKey] ?? { correct: 0, attempts: 0 };
      const preBox    = getLeitnerBox(pre.correct ?? 0, pre.attempts ?? 0);
      const postBox   = getLeitnerBox((pre.correct ?? 0) + stats.correct, (pre.attempts ?? 0) + stats.attempts);
      results.push({
        wordKey,
        label: item.label,
        preBox,
        postBox,
        sessionCorrect:  stats.correct,
        sessionAttempts: stats.attempts,
        improved:       postBox > preBox,
        sessionStreak:  stats.attempts > 0 && stats.correct === stats.attempts,
      });
    }
    return results.sort((a, b) => {
      // Improved signs first, then by session accuracy descending
      if (a.improved !== b.improved) return a.improved ? -1 : 1;
      return b.sessionCorrect / Math.max(b.sessionAttempts, 1) - a.sessionCorrect / Math.max(a.sessionAttempts, 1);
    });
  }

  const getRetryHint = (s: LessonStep) => {
    if (s.type === "sentence") return "Watch each sign and try again.";
    if (s.mediaType === "video") return "Review the video and try again.";
    return "Review the image and try again.";
  };

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleCheck = () => {
    const step = queue[currentIndex];

    // Sentence: check each bubble against its sign label
    let isCorrect: boolean;
    if (step.type === "sentence" && step.sentenceMedia) {
      isCorrect = step.sentenceMedia.every((m, i) => {
        const input = (sentenceInputs[i] ?? "").trim().toUpperCase();
        return makeAccepted(m.label).includes(input);
      });
    } else {
      const answer = step.type === "type" ? textInput.trim().toUpperCase() : selectedAnswer;
      const accepted = step.acceptedAnswers?.length
        ? step.acceptedAnswers.map(a => a.toUpperCase())
        : [step.correctAnswer?.toUpperCase() ?? ""];
      isCorrect = accepted.includes(answer?.toUpperCase() ?? "");
    }

    if (wrongPhase === "retry" && !isCorrect) {
      handleReveal();
      return;
    }

    if (isCorrect) {
      const isRetry = step.id.includes("-retry-");
      if (!isRetry) setCorrectCount(c => c + 1);
      setFeedback("correct");
      setWrongPhase("none");
      setRetryHint(null);
      if (step.wordKey) {
        recordStat(step.wordKey, true);
        trackWordProgress(step.wordKey, true);
      }
    } else {
      setWrongPhase("hint");
      setRetryHint(getRetryHint(step));
    }
  };

  const handleReveal = () => {
    const step = queue[currentIndex];
    setFeedback("incorrect");
    setWrongPhase("none");
    setRetryHint(null);
    if (step.wordKey) {
      recordStat(step.wordKey, false);
      trackWordProgress(step.wordKey, false);
    }
    const newQueue = [...queue];
    newQueue.push({ ...step, id: `${step.id}-retry-${Date.now()}` });
    setQueue(newQueue);
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setTextInput("");
    setSentenceInputs([]);
    setWrongPhase("retry");
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setTextInput("");
    setSentenceInputs([]);
    setWrongPhase("none");
    setRetryHint(null);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsFinished(true);
    }
  };

  // ── Loading / empty states ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Building your practice session...</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 mb-6">
          <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Practice is Locked</h2>
        <p className="text-slate-500 mb-8 max-w-xs">Complete at least one lesson to unlock sign practice.</p>
        <Link href="/lessons" className="rounded-2xl bg-blue-500 px-8 py-4 font-bold text-white hover:bg-blue-600 transition shadow-md shadow-blue-200">
          Go to Lessons
        </Link>
      </div>
    );
  }

  if (noVocab) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <p className="text-xl text-slate-600 mb-6">No vocabulary found for this session.</p>
        <Link href="/lessons" className="rounded-2xl bg-blue-500 px-8 py-4 font-bold text-white hover:bg-blue-600 transition">
          Back to Lessons
        </Link>
      </div>
    );
  }

  // ── Summary screen ─────────────────────────────────────────────────────

  if (isFinished) {
    const sessionAccuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const results         = buildSessionResults();
    const improvedCount   = results.filter(r => r.improved).length;
    const streakCount     = results.filter(r => r.sessionStreak).length;
    const message         = getSessionMessage(sessionAccuracy);

    return (
      <div className="min-h-screen bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 mb-5 animate-in zoom-in">
              <Zap className="h-14 w-14 text-blue-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">Practice Complete</h1>
            <p className="text-slate-500 text-base">{message}</p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-center">
              <div className={`text-3xl font-black mb-1 ${sessionAccuracy >= 80 ? "text-green-600" : sessionAccuracy >= 50 ? "text-blue-600" : "text-red-500"}`}>
                {sessionAccuracy}%
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Accuracy</div>
            </div>
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-center">
              <div className="text-3xl font-black text-purple-600 mb-1">{improvedCount}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Improved</div>
            </div>
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-center">
              <div className="text-3xl font-black text-amber-500 mb-1">{streakCount}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Perfect</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/lessons"
              className="flex-1 rounded-2xl bg-blue-500 py-4 text-center font-bold text-white transition hover:bg-blue-600 shadow-md shadow-blue-200">
              Back to Lessons
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-2xl border-2 border-slate-200 py-4 font-bold text-slate-600 transition hover:bg-slate-50">
              Practice Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Practice player ────────────────────────────────────────────────────

  const step     = queue[currentIndex];
  if (!step) return null;
  const progress = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-4xl items-center gap-6 px-6 py-3 shrink-0">
        <button onClick={() => setShowPauseConfirm(true)} className="text-slate-400 hover:text-slate-600 transition">
          <X className="h-7 w-7" />
        </button>
        <div className="h-3 flex-1 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="min-w-14 text-right font-black text-blue-600 text-xl">{correctCount}/{totalQuestions}</div>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col min-h-0 px-6 pt-2 pb-0">
        <h2 className="mb-3 w-full text-left text-2xl font-extrabold text-slate-900 shrink-0">{step.prompt}</h2>

        {/* QUIZ */}
        {step.type === "quiz" && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center w-full mb-3">
              {step.mediaType === "video" && step.videoUrl ? (
                <video key={step.videoUrl} src={step.videoUrl} autoPlay loop muted playsInline
                  className="max-h-full max-w-full rounded-2xl object-cover" style={{ maxHeight: "min(100%, 14rem)" }} />
              ) : (
                <div className="aspect-square w-auto overflow-hidden" style={{ height: "min(100%, 14rem)" }}>
                  <img src={step.imageUrl as string} alt="Sign" className="h-full w-full object-contain mix-blend-multiply" />
                </div>
              )}
            </div>
            <div className="grid w-full gap-2 shrink-0 pb-1">
              {step.options?.map(opt => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrect  = opt.id === step.correctAnswer;
                let style = "border-slate-200 text-slate-700 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500";
                else if (isSelected) style = feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-600" : "border-blue-500 bg-blue-50 text-blue-600";
                return (
                  <button key={opt.id} onClick={() => !feedback && wrongPhase !== "hint" && setSelectedAnswer(opt.id)}
                    className={`rounded-2xl border-2 py-2 px-4 text-center text-base font-bold transition-all ${style}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TYPE */}
        {step.type === "type" && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center w-full mb-3">
              {step.mediaType === "video" && step.videoUrl ? (
                <video key={step.videoUrl} src={step.videoUrl} autoPlay loop muted playsInline
                  className="max-h-full max-w-full rounded-2xl object-cover" style={{ maxHeight: "min(100%, 14rem)" }} />
              ) : (
                <div className="aspect-square w-auto overflow-hidden" style={{ height: "min(100%, 14rem)" }}>
                  <img src={step.imageUrl as string} alt="Sign" className="h-full w-full object-contain mix-blend-multiply" />
                </div>
              )}
            </div>
            <input autoFocus type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
              disabled={feedback !== null || wrongPhase === "hint"}
              placeholder="Type your answer..."
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-colors placeholder:text-slate-300 ${
                feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-700"     :
                feedback === "correct"   ? "border-green-500 bg-green-50 text-green-700" :
                wrongPhase === "hint"    ? "border-yellow-300 bg-yellow-50 text-slate-700" :
                "border-slate-200 focus:border-blue-500 text-slate-900"
              }`}
            />
          </div>
        )}

        {/* MATCH */}
        {step.type === "match" && (
          <div className="flex-1 min-h-0 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full aspect-square max-w-sm max-h-full">
              {step.options?.map(opt => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrect  = opt.id === step.correctAnswer;
                let style = "border-slate-200 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 ring-2 ring-green-500";
                else if (isSelected) style = feedback === "incorrect" ? "border-red-500 bg-red-50" : "border-blue-500 bg-blue-50";
                return (
                  <button key={opt.id} onClick={() => !feedback && wrongPhase !== "hint" && setSelectedAnswer(opt.id)}
                    className={`flex items-center justify-center rounded-3xl border-2 p-1 transition-all overflow-hidden ${style}`}>
                    {opt.mediaType === "video" && opt.videoUrl ? (
                      <video key={opt.videoUrl} src={opt.videoUrl} autoPlay loop muted playsInline
                        className="h-full w-full object-cover rounded-2xl pointer-events-none" />
                    ) : (
                      <img src={opt.imageUrl} alt={opt.id} className="h-full w-full object-contain mix-blend-multiply" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SENTENCE */}
        {step.type === "sentence" && step.sentenceMedia && (() => {
          const fillers = deriveFillers(step.sentenceMedia, step.acceptedAnswers?.[0] ?? step.correctAnswer ?? "");
          const disabled = feedback !== null || wrongPhase === "hint";
          return (
            <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 min-h-0 gap-5">
              {/* Signs row */}
              <div className="flex items-end justify-center gap-3 flex-wrap shrink-0">
                {step.sentenceMedia.map((m, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                    {m.mediaType === "video" ? (
                      <video key={m.src} src={m.src} autoPlay loop muted playsInline
                        className="h-28 w-28 rounded-xl object-cover bg-slate-900" />
                    ) : (
                      <div className="h-28 w-28 rounded-xl bg-slate-50 border border-slate-200 p-1">
                        <img src={m.src} alt={m.label} className="h-full w-full object-contain mix-blend-multiply" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input bubbles row with filler words between */}
              <div className="flex items-center justify-center gap-2 flex-wrap shrink-0">
                {step.sentenceMedia.map((m, i) => {
                  const fillerBefore = fillers[i];
                  const val = sentenceInputs[i] ?? "";
                  const accepted = makeAccepted(m.label);
                  const inputCorrect = feedback && accepted.includes(val.trim().toUpperCase());
                  const inputWrong   = feedback === "incorrect" && !inputCorrect;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      {fillerBefore.length > 0 && (
                        <span className="text-slate-400 font-semibold text-sm">{fillerBefore.join(" ")}</span>
                      )}
                      <input
                        autoFocus={i === 0}
                        type="text"
                        value={val}
                        onChange={e => {
                          const next = [...sentenceInputs];
                          next[i] = e.target.value;
                          setSentenceInputs(next);
                        }}
                        disabled={disabled}
                        placeholder="..."
                        className={`w-28 rounded-xl border-2 px-2 py-2 text-center text-sm font-bold uppercase tracking-wide outline-none transition-colors placeholder:text-slate-300 placeholder:normal-case placeholder:font-normal ${
                          inputCorrect  ? "border-green-500 bg-green-50 text-green-700" :
                          inputWrong    ? "border-red-500 bg-red-50 text-red-600" :
                          wrongPhase === "hint" ? "border-yellow-300 bg-yellow-50 text-slate-700" :
                          "border-slate-200 focus:border-blue-500 text-slate-900"
                        }`}
                      />
                    </div>
                  );
                })}
                {fillers[step.sentenceMedia.length].length > 0 && (
                  <span className="text-slate-400 font-semibold text-sm">
                    {fillers[step.sentenceMedia.length].join(" ")}
                  </span>
                )}
              </div>

              {feedback === "incorrect" && (
                <p className="text-sm text-slate-500 text-center shrink-0">
                  Correct: {step.sentenceMedia.map(m => m.label).join(" · ")}
                </p>
              )}
            </div>
          );
        })()}
      </main>

      {/* Footer */}
      <footer className={`shrink-0 border-t-2 transition-colors ${
        feedback === "correct"   ? "border-green-200 bg-green-100"   :
        feedback === "incorrect" ? "border-red-200 bg-red-100"       :
        wrongPhase === "hint"    ? "border-yellow-200 bg-yellow-50"  : "border-slate-100 bg-white"
      }`}>
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4 gap-4">
          <div className="flex flex-1 min-w-0 items-center gap-4">
            {feedback === "correct" && (
              <><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-green-500 shadow-sm"><CheckCircle2 className="h-7 w-7" /></div>
              <div className="text-xl font-black text-green-600">Excellent!</div></>
            )}
            {feedback === "incorrect" && (
              <><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"><XCircle className="h-7 w-7" /></div>
              <div><div className="text-xl font-black text-red-600">Incorrect</div>
              <div className="text-sm font-bold text-red-500">Correct answer: {step.correctAnswer}</div></div></>
            )}
            {wrongPhase === "hint" && !feedback && (
              <><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-yellow-500 shadow-sm"><Lightbulb className="h-7 w-7" /></div>
              <div className="flex-1 min-w-0 text-sm font-bold text-yellow-600 leading-snug">{retryHint}</div></>
            )}
          </div>
          <div className="flex gap-2">
            {wrongPhase === "hint" && !feedback ? (
              <>
                <button onClick={handleReveal}
                  className="rounded-2xl px-5 py-3 text-base font-bold text-slate-600 border-2 border-slate-200 hover:bg-slate-100 transition-transform active:scale-95">
                  Reveal Answer
                </button>
                <button onClick={handleRetry}
                  className="rounded-2xl px-6 py-3 text-lg font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-transform active:scale-95">
                  Retry
                </button>
              </>
            ) : (
              <button onClick={feedback ? handleNext : handleCheck}
                disabled={!feedback && !selectedAnswer && textInput.trim().length === 0 && sentenceInputs.every(s => !s.trim())}
                className={`min-w-32 ml-auto rounded-2xl px-8 py-3 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                  feedback === "correct"   ? "bg-green-500 hover:bg-green-600" :
                  feedback === "incorrect" ? "bg-red-500 hover:bg-red-600"     : "bg-blue-500 hover:bg-blue-600"
                }`}>
                {feedback ? "Continue" : "Check"}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Pause confirm */}
      {showPauseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Exit Practice?</h2>
            <p className="text-slate-500 mb-8">Your session progress will be lost.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push("/lessons")} className="w-full rounded-2xl bg-slate-900 py-3 font-bold text-white hover:bg-black transition">Exit</button>
              <button onClick={() => setShowPauseConfirm(false)} className="w-full rounded-2xl border-2 border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-50 transition">Keep Going</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Suspense wrapper required for useSearchParams
export default function SignPracticePage() {
  const { level1Complete, loaded } = useProgress();

  if (!loaded) return <div className="min-h-screen bg-white" />;
  if (!level1Complete) return (
    <LockedScreen
      title="Sign Practice"
      navActive="Lessons"
      requiresLevelName="Level 1 — The Basics"
      lessons={["Alphabet A – M", "Alphabet N – Z", "Numbers 0 – 9", "Deixis – Pointing"]}
    />
  );

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    }>
      <SignPracticeInner />
    </Suspense>
  );
}
