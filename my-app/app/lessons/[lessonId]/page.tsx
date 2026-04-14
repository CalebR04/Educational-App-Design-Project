"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { staticLessons, dynamicLessonConfigs, allLessonMeta } from "@/data/lessons/lessonRegistry";
import { generateSteps } from "@/data/lessons/generateSteps";
import type { LessonStep } from "@/data/lessons/alphabet";
import { createClient } from "@/lib/supabase/client";
import { upsertLessonProgress } from "@/lib/supabase/lessonProgress";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

async function trackWordProgress(wordKey: string, isCorrect: boolean) {
  // Resolve the right client + user ID (real auth or anonymous guest).
  let client;
  let userId: string;

  const regularClient = createClient();
  const { data: { user } } = await regularClient.auth.getUser();
  if (user && !user.is_anonymous) {
    client = regularClient;
    userId = user.id;
  } else {
    const { getGuestClient } = await import("@/lib/supabase/guestClient");
    const guestClient = getGuestClient();
    if (!guestClient) return;
    const { data: { user: guestUser } } = await guestClient.auth.getUser();
    if (!guestUser) return;
    client = guestClient;
    userId = guestUser.id;
  }

  const { data: existing } = await client
    .from("word_progress")
    .select("attempts, correct, streak, is_learned")
    .eq("user_id", userId)
    .eq("word_key", wordKey)
    .maybeSingle();

  const prevStreak = existing?.streak ?? 0;
  const rawStreak = isCorrect ? prevStreak + 1 : 0;
  const mastered = rawStreak >= 10;

  // At streak 10 the word is mastered — lock in 100% and reset streak
  const newAttempts = mastered ? (existing?.correct ?? 0) + 1 : (existing?.attempts ?? 0) + 1;
  const newCorrect  = mastered ? newAttempts : (existing?.correct ?? 0) + (isCorrect ? 1 : 0);
  const newStreak   = mastered ? 0 : rawStreak;
  const isLearned   = existing?.is_learned === true || (newAttempts >= 3 && newCorrect / newAttempts >= 0.8);

  await client.from("word_progress").upsert({
    user_id: userId,
    word_key: wordKey,
    attempts: newAttempts,
    correct: newCorrect,
    streak: newStreak,
    is_learned: isLearned,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,word_key" });
}

function SentencePlayer({ signs }: { signs: Array<{ src: string; mediaType: "image" | "video"; label: string }> }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [signs]);

  const current = signs[idx];
  if (!current) return null;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full gap-2">
      <div className="flex-1 min-h-0 flex items-center justify-center w-full">
        {current.mediaType === "video" ? (
          <video
            key={current.src + idx}
            src={current.src}
            autoPlay muted playsInline
            onEnded={() => setIdx(i => (i + 1) % signs.length)}
            className="max-h-full max-w-full rounded-2xl object-cover"
            style={{ maxHeight: "min(100%, 14rem)" }}
          />
        ) : (
          <div className="aspect-square overflow-hidden" style={{ height: "min(100%, 14rem)" }}>
            <img src={current.src} alt={current.label} className="h-full w-full object-contain mix-blend-multiply" />
          </div>
        )}
      </div>
      {/* Progress dots */}
      <div className="flex gap-1.5 shrink-0">
        {signs.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? "bg-blue-500 scale-125" : "bg-slate-300 hover:bg-slate-400"}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LessonPlayer() {
  const { play } = useSound();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const router = useRouter();

  const staticLesson = staticLessons[lessonId];
  const dynConfig = dynamicLessonConfigs[lessonId];
  const lessonTitle = staticLesson?.title ?? dynConfig?.title ?? lessonId;
  const lessonMeta = allLessonMeta.find(m => m.id === lessonId);

  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<LessonStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [wrongPhase, setWrongPhase] = useState<"none" | "retry">("none");
  const [lastWrongAnswer, setLastWrongAnswer] = useState<string | null>(null);
  const [practiceAgain, setPracticeAgain] = useState(false);
  const savedProgressRef = useRef<{ status: string; progress: number; correctCount: number; currentIndex: number; queue: LessonStep[] } | null>(null);
  const skipSaveRef = useRef(false);
  const everCompletedRef = useRef(false);
  const typeInputRef = useRef<HTMLInputElement>(null);

  // Generate fresh random steps and load saved progress on every mount
  useEffect(() => {
    // Generate steps fresh each time so shuffle is never cached
    const freshSteps: LessonStep[] = staticLesson
      ? staticLesson.steps
      : dynConfig
      ? generateSteps(dynConfig.vocab, dynConfig.sentences)
      : [];

    if (!freshSteps.length) { setMounted(true); return; }
    setSteps(freshSteps);

    async function load() {
      // Resolve right client + user (real auth or anonymous guest).
      let progressClient;
      let userId: string | null = null;

      const regularClient = createClient();
      const { data: { user } } = await regularClient.auth.getUser();
      if (user && !user.is_anonymous) {
        progressClient = regularClient;
        userId = user.id;
      } else {
        const { getGuestClient } = await import("@/lib/supabase/guestClient");
        const guestClient = getGuestClient();
        if (guestClient) {
          const { data: { user: guestUser } } = await guestClient.auth.getUser();
          if (guestUser) { progressClient = guestClient; userId = guestUser.id; }
        }
      }

      if (progressClient && userId) {
        const { data } = await progressClient
          .from("lesson_progress")
          .select("status, progress, ever_completed, correct_count")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .single();
        if (data) {
          if (data.ever_completed) everCompletedRef.current = true;
          const progressPct = data.progress ?? 0;
          const correctCount = data.correct_count ?? 0;
          const currentIndex = Math.round((progressPct / 100) * freshSteps.length);
          savedProgressRef.current = { status: data.status, progress: progressPct, correctCount, currentIndex, queue: freshSteps, everCompleted: data.ever_completed };
          setCorrectCount(correctCount);
          setCurrentIndex(Math.min(currentIndex, freshSteps.length - 1));
          // Skip intro if lesson is already in progress
          if (data.status === "In Progress" && progressPct > 0) setShowIntro(false);
        }
      }
      setQueue(freshSteps);
      setMounted(true);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Save progress to Supabase
  useEffect(() => {
    if (!mounted || isFinished || skipSaveRef.current || !queue.length) return;
    const progressPct = Math.min(100, Math.round((correctCount / steps.length) * 100));
    const status = correctCount === 0 ? "Not Started" : "In Progress";
    upsertLessonProgress(lessonId, { status: status as "Not Started" | "In Progress", progress: progressPct, ever_completed: everCompletedRef.current, correct_count: correctCount });
  }, [currentIndex, correctCount, mounted, isFinished, lessonId, steps.length, queue.length]);


  // Auto-focus the text input whenever a type/synthesize step becomes active
  useEffect(() => {
    const step = queue[currentIndex];
    if (step?.type === "type" || step?.type === "synthesize") {
      typeInputRef.current?.focus();
    }
  }, [currentIndex, queue]);

  // Enter key → Check / Continue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || showPauseConfirm) return;
      const step = queue[currentIndex];
      if (!step) return;
      const canAct = feedback || step.type === "teach" || selectedAnswer || textInput.length > 0;
      if (canAct) feedback ? handleNext() : handleCheck();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!mounted || (!staticLesson && !dynConfig)) return null;

  // ── Lesson Intro Screen ────────────────────────────────────────────────
  if (showIntro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 text-center">
            {lessonMeta?.levelTitle ?? "Lesson"}
          </p>
          <h1 className="text-3xl font-black text-gray-900 mb-1 text-center">{lessonTitle}</h1>
          <p className="text-sm text-gray-500 text-center mb-8">{lessonMeta?.duration}</p>

          <div className="bg-blue-50 rounded-2xl p-5 mb-8">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">By the end of this lesson you will</p>
            <ul className="space-y-2.5">
              {(lessonMeta?.outcomes ?? []).map((outcome, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full rounded-2xl bg-blue-500 py-4 font-bold text-white hover:bg-blue-600 active:scale-95 transition-all"
          >
            Begin
          </button>
          <button
            onClick={() => router.back()}
            className="w-full mt-3 py-3 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const step = queue[currentIndex];
  if (!step) return null;

  const calculatedProgress = Math.min(100, Math.round((correctCount / steps.length) * 100));
  const progress = practiceAgain && savedProgressRef.current ? savedProgressRef.current.progress : calculatedProgress;

  const handleCheck = () => {
    if (practiceAgain) setPracticeAgain(false);
    if (step.type === "teach") {
      setCorrectCount(prev => Math.min(steps.length, prev + 1));
      handleNext();
      return;
    }

    const answer = (step.type === "synthesize" || step.type === "type")
      ? textInput.trim().toUpperCase()
      : selectedAnswer;

    const accepted = step.acceptedAnswers?.length
      ? step.acceptedAnswers.map(a => a.toUpperCase())
      : [step.correctAnswer?.toUpperCase() ?? ""];
    const isCorrect = accepted.includes(answer?.toUpperCase() ?? "");

    const wordKey = step.wordKey ?? (step.correctAnswer ? `letter_${step.correctAnswer.toLowerCase()}` : null);

    if (isCorrect) {
      play("correct");
      // Only count progress on first-attempt correct answers, not retried questions
      if (wrongPhase !== "retry") setCorrectCount(prev => Math.min(steps.length, prev + 1));
      setFeedback("correct");
      setWrongPhase("none");
      setLastWrongAnswer(null);
      if (step.type === "quiz" || step.type === "match" || step.type === "type") {
        if (wordKey) trackWordProgress(wordKey, true);
      } else if (step.type === "synthesize" && step.correctAnswer) {
        for (const letter of step.correctAnswer) {
          trackWordProgress(`letter_${letter.toLowerCase()}`, true);
        }
      }
    } else {
      play("incorrect");
      setLastWrongAnswer(answer);
      setSelectedAnswer(null);
      setTextInput("");

      if (wrongPhase === "retry") {
        // Second wrong attempt — auto-reveal correct answer
        setFeedback("incorrect");
        setWrongPhase("none");
        setLastWrongAnswer(null);
        return;
      }

      // First wrong attempt — track as incorrect and queue at end of lesson
      if (step.type === "quiz" || step.type === "match" || step.type === "type") {
        if (wordKey) trackWordProgress(wordKey, false);
      } else if (step.type === "synthesize" && step.correctAnswer) {
        const typed = (answer ?? "").split("");
        step.correctAnswer.split("").forEach((letter, i) => {
          trackWordProgress(`letter_${letter.toLowerCase()}`, typed[i] === letter);
        });
      }
      setQueue(prev => [...prev, { ...step, id: `${step.id}-retry-${Date.now()}` }]);
      setWrongPhase("retry");
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setTextInput("");
    setWrongPhase("none");
    setLastWrongAnswer(null);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      play("level_complete");
      setIsFinished(true);
      setPracticeAgain(false);
      everCompletedRef.current = true;
      upsertLessonProgress(lessonId, { status: "Not Started", progress: 0, ever_completed: true, correct_count: 0 });
    }
  };

  const handleReset = () => {
    upsertLessonProgress(lessonId, { status: "Not Started", progress: 0, ever_completed: everCompletedRef.current, correct_count: 0 });
    skipSaveRef.current = true;
    const freshSteps = staticLesson ? staticLesson.steps : generateSteps(dynConfig!.vocab, dynConfig!.sentences);
    setQueue(freshSteps);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setTextInput("");
    setWrongPhase("none");
    setLastWrongAnswer(null);
    setPracticeAgain(true);
    window.requestAnimationFrame(() => { skipSaveRef.current = false; });
  };

  // ── Completion Screen ──────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-100 animate-in zoom-in">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-slate-900">Lesson Complete!</h1>
        <p className="mt-2 text-lg text-slate-600">You mastered {lessonTitle}.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/lessons" className="rounded-2xl bg-green-500 px-10 py-4 font-bold text-white transition hover:bg-green-600 shadow-md shadow-green-200">
            Back to Lessons
          </Link>
          <Link href={`/lessons/sign-practice?lesson=${lessonId}`} className="rounded-2xl bg-blue-500 px-10 py-4 font-bold text-white transition hover:bg-blue-600 shadow-md shadow-blue-200">
            Practice
          </Link>
        </div>
      </div>
    );
  }

  // ── Lesson Player ──────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-4xl items-center gap-6 px-6 py-3 shrink-0">
        <button onClick={() => setShowPauseConfirm(true)} className="text-slate-400 hover:text-slate-600 transition">
          <X className="h-7 w-7" />
        </button>
        <div className="h-3 flex-1 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="min-w-14 text-right font-black text-green-600 text-xl">{progress}%</div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col min-h-0 px-6 pt-2 pb-0">
        <h2 className="mb-3 w-full text-left text-2xl font-extrabold text-slate-900 shrink-0">{step.prompt}</h2>

        {/* TEACH */}
        {step.type === "teach" && (
          <div className="flex-1 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center w-full">
              {step.mediaType === "video" && step.videoUrl ? (
                <video
                  key={step.videoUrl}
                  src={step.videoUrl}
                  autoPlay loop muted playsInline
                  className="max-h-full max-w-full rounded-3xl object-cover shadow-sm"
                  style={{ maxHeight: "min(100%, 24rem)" }}
                />
              ) : (
                <div className="aspect-square max-h-96 w-auto rounded-3xl bg-blue-50 border-4 border-blue-100 p-1 shadow-sm overflow-hidden" style={{ height: "min(100%, 24rem)" }}>
                  <img src={step.imageUrl as string} alt="Sign" className="h-full w-full object-contain mix-blend-multiply" />
                </div>
              )}
            </div>
            {step.description && (
              <p className="mt-3 mb-1 text-lg text-slate-600 shrink-0">{step.description}</p>
            )}
          </div>
        )}

        {/* QUIZ */}
        {step.type === "quiz" && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center w-full mb-3">
              {step.mediaType === "video" && step.videoUrl ? (
                <video
                  key={step.videoUrl}
                  src={step.videoUrl}
                  autoPlay loop muted playsInline
                  className="max-h-full max-w-full rounded-2xl object-cover"
                  style={{ maxHeight: "min(100%, 14rem)" }}
                />
              ) : (
                <div className="aspect-square w-auto overflow-hidden" style={{ height: "min(100%, 14rem)" }}>
                  <img src={step.imageUrl as string} alt="Sign to guess" className="h-full w-full object-contain mix-blend-multiply" />
                </div>
              )}
            </div>
            <div className="grid w-full gap-2 shrink-0 pb-1">
              {step.options?.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrect = opt.id === step.correctAnswer;
                const wasWrong = wrongPhase === "retry" && lastWrongAnswer === opt.id;
                let style = "border-slate-200 text-slate-700 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500";
                else if (wasWrong) style = "border-red-400 bg-red-50 text-red-500";
                else if (isSelected) style = "border-blue-500 bg-blue-50 text-blue-600";
                return (
                  <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)} className={`rounded-2xl border-2 py-2 px-4 text-center text-base font-bold transition-all ${style}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MATCH */}
        {step.type === "match" && (
          <div className="flex-1 min-h-0 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full aspect-square max-w-sm max-h-full">
              {step.options?.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrect = opt.id === step.correctAnswer;
                const wasWrong = wrongPhase === "retry" && lastWrongAnswer === opt.id;
                let style = "border-slate-200 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 ring-2 ring-green-500";
                else if (wasWrong) style = "border-red-400 bg-red-50";
                else if (isSelected) style = "border-blue-500 bg-blue-50";
                return (
                  <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)} className={`flex items-center justify-center rounded-3xl border-2 p-1 transition-all overflow-hidden ${style}`}>
                    {opt.mediaType === "video" && opt.videoUrl ? (
                      <video
                        key={opt.videoUrl}
                        src={opt.videoUrl}
                        autoPlay loop muted playsInline
                        className="h-full w-full object-cover rounded-2xl pointer-events-none"
                      />
                    ) : (
                      <img src={opt.imageUrl} alt={`Option ${opt.id}`} className="h-full w-full object-contain mix-blend-multiply" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TYPE — show single sign, student types the label */}
        {step.type === "type" && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center w-full mb-3">
              {step.mediaType === "video" && step.videoUrl ? (
                <video
                  key={step.videoUrl}
                  src={step.videoUrl}
                  autoPlay loop muted playsInline
                  className="max-h-full max-w-full rounded-2xl object-cover"
                  style={{ maxHeight: "min(100%, 14rem)" }}
                />
              ) : (
                <div className="aspect-square w-auto overflow-hidden" style={{ height: "min(100%, 14rem)" }}>
                  <img src={step.imageUrl as string} alt="Sign to identify" className="h-full w-full object-contain mix-blend-multiply" />
                </div>
              )}
            </div>
            <input
              ref={typeInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={feedback !== null}
              placeholder="Type your answer..."
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-colors placeholder:text-slate-300 ${
                feedback === "incorrect"      ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct"        ? "border-green-500 bg-green-50 text-green-700" :
                wrongPhase === "retry"        ? "border-red-400 bg-red-50 text-red-700" :
                "border-slate-200 focus:border-blue-500 text-slate-900"
              }`}
            />
          </div>
        )}

        {/* SYNTHESIZE */}
        {step.type === "synthesize" && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 min-h-0 gap-5">
            <div className="flex gap-3 justify-center shrink-0">
              {(step.imageUrl as string[]).map((img, i) => (
                <div key={i} className="h-36 w-36 rounded-2xl bg-slate-50 border-2 border-slate-200 p-1 shrink-0">
                  <img src={img} alt={`Sign ${i}`} className="h-full w-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={feedback !== null}
              placeholder="Type the word here..."
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-colors placeholder:text-slate-300 ${
                feedback === "incorrect"      ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct"        ? "border-green-500 bg-green-50 text-green-700" :
                wrongPhase === "retry"        ? "border-red-400 bg-red-50 text-red-700" :
                "border-slate-200 focus:border-blue-500 text-slate-900"
              }`}
            />
          </div>
        )}
        {/* SENTENCE — sequential sign player + 3 multiple-choice text options */}
        {step.type === "sentence" && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0 gap-4 w-full">
            <SentencePlayer signs={step.sentenceMedia ?? []} />
            <div className="grid w-full gap-2 shrink-0 pb-1">
              {step.options?.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrect  = opt.id === step.correctAnswer;
                const wasWrong   = wrongPhase === "retry" && lastWrongAnswer === opt.id;
                let style = "border-slate-200 text-slate-700 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500";
                else if (wasWrong) style = "border-red-400 bg-red-50 text-red-500";
                else if (isSelected) style = "border-blue-500 bg-blue-50 text-blue-700";
                return (
                  <button
                    key={opt.id}
                    onClick={() => !feedback && setSelectedAnswer(opt.id)}
                    className={`rounded-2xl border-2 py-3 px-4 text-center text-sm font-bold transition-all ${style}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MISSING SIGN — sentence with one blank, pick the missing sign from 3 thumbnails */}
        {step.type === "missing_sign" && (() => {
          const selectedOpt = step.options?.find(o => o.id === selectedAnswer);
          const correctOpt  = step.options?.find(o => o.id === step.correctAnswer);
          return (
            <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0 gap-5 w-full">
              {/* Sentence row with blank slot */}
              <div className="flex gap-2 flex-wrap justify-center shrink-0 w-full">
                {step.sentenceMedia?.map((m, i) => {
                  const isBlank = i === step.missingIndex;
                  const showCorrect = feedback === "incorrect" && isBlank;
                  const showSelected = isBlank && selectedOpt && !showCorrect;
                  const fill = showCorrect ? correctOpt : showSelected ? selectedOpt : null;

                  return (
                    <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                      {isBlank ? (
                        <div className={`h-24 w-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                          showCorrect    ? "border-green-400 bg-green-50" :
                          selectedAnswer ? "border-blue-400 bg-blue-50"   :
                                           "border-slate-300 bg-slate-50"
                        }`}>
                          {fill ? (
                            fill.mediaType === "video" && fill.videoUrl ? (
                              <video key={fill.videoUrl} src={fill.videoUrl} autoPlay loop muted playsInline className="h-full w-full object-cover rounded-lg" />
                            ) : fill.imageUrl ? (
                              <img src={fill.imageUrl} alt={fill.label} className="h-full w-full object-contain mix-blend-multiply" />
                            ) : null
                          ) : (
                            <span className="text-3xl text-slate-300">?</span>
                          )}
                        </div>
                      ) : (
                        m.mediaType === "video" ? (
                          <video key={m.src} src={m.src} autoPlay loop muted playsInline className="h-24 w-24 rounded-xl object-cover bg-slate-900" />
                        ) : (
                          <div className="h-24 w-24 rounded-xl bg-slate-50 border border-slate-200 p-1">
                            <img src={m.src} alt={m.label} className="h-full w-full object-contain mix-blend-multiply" />
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Sign thumbnail options */}
              <div className="flex gap-3 justify-center shrink-0 flex-wrap">
                {step.options?.map((opt) => {
                  const isSelected = selectedAnswer === opt.id;
                  const isCorrect  = opt.id === step.correctAnswer;
                  const wasWrong   = wrongPhase === "retry" && lastWrongAnswer === opt.id;
                  let border = "border-slate-200 hover:border-blue-300";
                  if (feedback === "incorrect" && isCorrect) border = "border-green-500 ring-2 ring-green-400";
                  else if (wasWrong) border = "border-red-400 ring-2 ring-red-300";
                  else if (isSelected) border = "border-blue-500 ring-2 ring-blue-300";
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !feedback && setSelectedAnswer(opt.id)}
                      className={`flex flex-col items-center gap-1 h-28 w-28 rounded-2xl border-2 p-1.5 transition-all overflow-hidden ${border}`}
                    >
                      <div className="h-full w-full overflow-hidden rounded-xl">
                        {opt.mediaType === "video" && opt.videoUrl ? (
                          <video key={opt.videoUrl} src={opt.videoUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                        ) : opt.imageUrl ? (
                          <img src={opt.imageUrl} alt={opt.label ?? ""} className="h-full w-full object-contain mix-blend-multiply" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </main>

      {/* Footer */}
      <footer className={`shrink-0 border-t-2 transition-colors ${
        feedback === "correct"   ? "border-green-200 bg-green-100" :
        feedback === "incorrect" ? "border-red-200 bg-red-100"     :
        wrongPhase === "retry"   ? "border-red-200 bg-red-50"      : "border-slate-100 bg-white"
      }`}>
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4 gap-4">
          <div className="flex flex-1 min-w-0 items-center gap-4">
            {feedback === "correct" && (
              <>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-green-500 shadow-sm"><CheckCircle2 className="h-7 w-7" /></div>
                <div>
                  <div className="text-xl font-black text-green-600">Excellent!</div>
                  {(step.type === "missing_sign" || step.type === "sentence") && (
                    <div className="text-sm font-bold text-green-600">
                      {step.type === "missing_sign" ? step.description : step.correctAnswer}
                    </div>
                  )}
                </div>
              </>
            )}
            {feedback === "incorrect" && (
              <>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"><XCircle className="h-7 w-7" /></div>
                <div>
                  <div className="text-xl font-black text-red-600">Incorrect</div>
                  <div className="text-sm font-bold text-red-500">
                    {step.type === "missing_sign"
                      ? `Sentence: ${step.description}`
                      : step.type === "sentence"
                      ? `Answer: ${step.correctAnswer}`
                      : `Correct answer: ${step.correctAnswer}`}
                  </div>
                </div>
              </>
            )}
            {wrongPhase === "retry" && !feedback && (
              <>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"><XCircle className="h-7 w-7" /></div>
                <div className="text-sm font-bold text-red-500">Incorrect — pick a different answer!</div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={feedback ? handleNext : handleCheck}
              disabled={!feedback && step.type !== "teach" && !selectedAnswer && textInput.trim().length === 0}
              className={`min-w-35 ml-auto rounded-2xl px-8 py-3 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                feedback === "correct"   ? "bg-green-500 hover:bg-green-600" :
                feedback === "incorrect" ? "bg-red-500 hover:bg-red-600"     :
                wrongPhase === "retry"   ? "bg-red-500 hover:bg-red-600"     : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {feedback ? "Continue" : step.type === "teach" ? "Next" : wrongPhase === "retry" ? "Retry" : "Check"}
            </button>
          </div>
        </div>
      </footer>

      {/* Pause confirm */}
      {showPauseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Pause Lesson?</h2>
            <p className="text-slate-500 mb-8">Your progress has been saved.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push("/lessons")} className="w-full rounded-2xl bg-slate-900 py-3 font-bold text-white hover:bg-black transition">Exit Lesson</button>
              <button onClick={() => setShowPauseConfirm(false)} className="w-full rounded-2xl border-2 border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-50 transition">Keep Going</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
