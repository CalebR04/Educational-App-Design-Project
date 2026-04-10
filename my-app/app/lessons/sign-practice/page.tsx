"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, CheckCircle2, XCircle, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAllVocab, getLessonVocab, selectPracticeItems } from "@/data/lessons/practiceVocab";
import type { VocabItem } from "@/data/lessons/lessonConfigs";
import type { LessonStep } from "@/data/lessons/alphabet";
import Link from "next/link";

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
  // Always source same-type distractors from the full global vocab pool
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
  const hint = accepted.length > 1
    ? `Accepted: ${accepted.slice(0, 2).join(" or ")}`
    : "";
  return {
    id: `prac-type-${item.key}-${Date.now()}`,
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

function generatePracticeSteps(selected: VocabItem[], globalPool: VocabItem[]): LessonStep[] {
  return selected.map(item => {
    const roll = Math.random();
    // 40% type, 35% match (when enough same-type available), 25% quiz
    if (roll < 0.40) return makeTypeStep(item);
    const sameTypeCount = globalPool.filter(v => getItemType(v) === getItemType(item)).length;
    if (roll < 0.75 && sameTypeCount >= 4) return makeMatchStep(item, globalPool);
    return makeQuizStep(item, globalPool);
  });
}

// ── Word progress tracker ──────────────────────────────────────────────────

const supabase = createClient();

async function trackWordProgress(wordKey: string, isCorrect: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("word_progress")
    .select("attempts, correct, streak")
    .eq("user_id", user.id)
    .eq("word_key", wordKey)
    .single();

  const prevStreak = existing?.streak ?? 0;
  const rawStreak = isCorrect ? prevStreak + 1 : 0;
  const mastered = rawStreak >= 10;

  const newAttempts = mastered ? (existing?.correct ?? 0) + 1 : (existing?.attempts ?? 0) + 1;
  const newCorrect  = mastered ? newAttempts : (existing?.correct ?? 0) + (isCorrect ? 1 : 0);
  const newStreak   = mastered ? 0 : rawStreak;

  await supabase.from("word_progress").upsert({
    user_id: user.id,
    word_key: wordKey,
    attempts: newAttempts,
    correct: newCorrect,
    streak: newStreak,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,word_key" });
}

// ── Inner component (needs useSearchParams) ────────────────────────────────

function SignPracticeInner() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [noVocab, setNoVocab] = useState(false);
  const [queue, setQueue] = useState<LessonStep[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [retryHint, setRetryHint] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);

  useEffect(() => {
    async function init() {
      // Global vocab is always loaded — used for distractor selection across all types
      const globalVocab = Object.values(getAllVocab());
      const pool: VocabItem[] = lessonId ? getLessonVocab(lessonId) : globalVocab;

      if (pool.length === 0) { setNoVocab(true); setLoading(false); return; }

      // Fetch progress
      const progressMap: Record<string, { attempts: number; correct: number; updated_at: string }> = {};
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("word_progress")
          .select("word_key, attempts, correct, updated_at")
          .eq("user_id", user.id);
        for (const row of data ?? []) {
          progressMap[row.word_key] = row;
        }
      }

      const selected = selectPracticeItems(pool, progressMap);
      // Always use globalVocab as the distractor pool so same-type items span the full vocabulary
      const steps = generatePracticeSteps(selected, globalVocab);

      setQueue(steps);
      setTotalQuestions(steps.length);
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
      else if (selectedAnswer || textInput.trim().length > 0) handleCheck();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

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

  if (isFinished) {
    const pct = Math.round((correctCount / totalQuestions) * 100);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 animate-in zoom-in">
          <Zap className="h-16 w-16 text-blue-500" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-slate-900">Practice Complete!</h1>
        <p className="mt-2 text-lg text-slate-600">
          {correctCount} of {totalQuestions} correct — {pct}%
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/lessons" className="rounded-2xl bg-blue-500 px-10 py-4 font-bold text-white transition hover:bg-blue-600 shadow-md shadow-blue-200">
            Back to Lessons
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl border-2 border-slate-200 px-10 py-4 font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  const step = queue[currentIndex];
  if (!step) return null;

  const progress = Math.round((currentIndex / (queue.length)) * 100);

  const getRetryHint = (s: LessonStep) => {
    if (s.type === "type") {
      return s.acceptedAnswers && s.acceptedAnswers.length > 1
        ? `Accepted: ${s.acceptedAnswers.slice(0, 2).join(" or ")}`
        : "Look carefully and type what you see.";
    }
    if (s.type === "quiz") return "Compare the sign carefully with each option.";
    if (s.type === "match") return "Find the sign that matches the label shown.";
    return "Try again.";
  };

  const handleCheck = () => {
    const answer = step.type === "type" ? textInput.trim().toUpperCase() : selectedAnswer;
    const accepted = step.acceptedAnswers?.length
      ? step.acceptedAnswers.map(a => a.toUpperCase())
      : [step.correctAnswer?.toUpperCase() ?? ""];
    const isCorrect = accepted.includes(answer?.toUpperCase() ?? "");
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setFeedback("correct");
      setAttempts(0);
      setRetryHint(null);
      if (step.wordKey) trackWordProgress(step.wordKey, true);
    } else {
      if (attempts === 0) {
        setAttempts(1);
        setRetryHint(getRetryHint(step));
      } else {
        setFeedback("incorrect");
        setAttempts(0);
        setRetryHint(null);
        if (step.wordKey) trackWordProgress(step.wordKey, false);
        // Push to back of queue
        const newQueue = [...queue];
        newQueue.push({ ...step, id: `${step.id}-retry-${Date.now()}` });
        setQueue(newQueue);
      }
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setTextInput("");
    setAttempts(0);
    setRetryHint(null);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsFinished(true);
    }
  };

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
        <div className="min-w-14 text-right font-black text-blue-600 text-xl">{currentIndex + 1}/{queue.length}</div>
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
                const isCorrect = opt.id === step.correctAnswer;
                let style = "border-slate-200 text-slate-700 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500";
                else if (isSelected) style = feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-600" : "border-blue-500 bg-blue-50 text-blue-600";
                return (
                  <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)}
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
            {step.acceptedAnswers && step.acceptedAnswers.length > 1 && !feedback && (
              <p className="text-sm text-slate-400 mb-2 shrink-0">
                Accepted: {step.acceptedAnswers.slice(0, 2).join(" or ")}
              </p>
            )}
            <input
              autoFocus
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={feedback !== null}
              placeholder="Type your answer..."
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-colors placeholder:text-slate-300 ${
                feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct"   ? "border-green-500 bg-green-50 text-green-700" :
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
                const isCorrect = opt.id === step.correctAnswer;
                let style = "border-slate-200 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 ring-2 ring-green-500";
                else if (isSelected) style = feedback === "incorrect" ? "border-red-500 bg-red-50" : "border-blue-500 bg-blue-50";
                return (
                  <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)}
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
      </main>

      {/* Footer */}
      <footer className={`shrink-0 border-t-2 transition-colors ${
        feedback === "correct" ? "border-green-200 bg-green-100" :
        feedback === "incorrect" ? "border-red-200 bg-red-100" : "border-slate-100 bg-white"
      }`}>
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {feedback === "correct" && (
              <><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-500 shadow-sm"><CheckCircle2 className="h-7 w-7" /></div>
              <div className="text-xl font-black text-green-600">Excellent!</div></>
            )}
            {feedback === "incorrect" && (
              <><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"><XCircle className="h-7 w-7" /></div>
              <div><div className="text-xl font-black text-red-600">Incorrect</div>
              <div className="text-sm font-bold text-red-500">Correct answer: {step.correctAnswer}</div></div></>
            )}
            {attempts === 1 && !feedback && (
              <><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-yellow-500 shadow-sm"><XCircle className="h-7 w-7" /></div>
              <div><div className="text-xl font-black text-yellow-600">Try Again</div>
              <div className="text-sm font-bold text-yellow-500">{retryHint}</div></div></>
            )}
          </div>
          <div className="flex gap-2">
            {attempts === 1 && !feedback && (
              <button onClick={() => { setSelectedAnswer(null); setTextInput(""); setAttempts(0); }}
                className="rounded-2xl px-6 py-3 text-lg font-bold text-white bg-yellow-500 hover:bg-yellow-600 transition-transform active:scale-95">
                Try Again
              </button>
            )}
            <button
              onClick={feedback ? handleNext : handleCheck}
              disabled={!feedback && !selectedAnswer && textInput.trim().length === 0}
              className={`min-w-32 ml-auto rounded-2xl px-8 py-3 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                feedback === "correct" ? "bg-green-500 hover:bg-green-600" :
                feedback === "incorrect" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {feedback ? "Continue" : "Check"}
            </button>
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
