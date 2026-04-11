"use client";

import { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { staticLessons, dynamicLessonConfigs } from "@/data/lessons/lessonRegistry";
import { generateSteps } from "@/data/lessons/generateSteps";
import type { LessonStep } from "@/data/lessons/alphabet";
import { createClient } from "@/lib/supabase/client";
import { upsertLessonProgress } from "@/lib/supabase/lessonProgress";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

  // At streak 10 the word is mastered — lock in 100% and reset streak
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

export default function LessonPlayer() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const router = useRouter();

  const staticLesson = staticLessons[lessonId];
  const dynConfig = dynamicLessonConfigs[lessonId];
  const lessonTitle = staticLesson?.title ?? dynConfig?.title ?? lessonId;
  const lessonTip = dynConfig?.tip;

  // Generate steps once on mount
  const [steps] = useState<LessonStep[]>(() => {
    if (staticLesson) return staticLesson.steps;
    if (dynConfig) return generateSteps(dynConfig.vocab, dynConfig.sentences);
    return [];
  });

  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<LessonStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [wrongPhase, setWrongPhase] = useState<"none" | "hint" | "retry">("none");
  const [retryHint, setRetryHint] = useState<string | null>(null);
  const [practiceAgain, setPracticeAgain] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const savedProgressRef = useRef<{ status: string; progress: number; correctCount: number; currentIndex: number; queue: LessonStep[] } | null>(null);
  const skipSaveRef = useRef(false);
  const everCompletedRef = useRef(false);

  // Load saved progress
  useEffect(() => {
    if (!steps.length) { setMounted(true); return; }
    const saved = localStorage.getItem(`sign_quest_progress_${lessonId}`);
    if (saved) {
      const p = JSON.parse(saved);
      savedProgressRef.current = p;
      if (p.everCompleted) everCompletedRef.current = true;
      if (p.status === "Completed") {
        setIsFinished(true);
      } else {
        const stepMap = new Map(steps.map(s => [s.id, s]));
        const rebuilt = (p.queue || []).map((s: LessonStep) => {
          const baseId = s.id.replace(/-retry-\d+$/, "");
          return stepMap.get(s.id) ?? stepMap.get(baseId) ?? s;
        });
        setQueue(rebuilt.length ? rebuilt : steps);
        setCurrentIndex(p.currentIndex || 0);
        setCorrectCount(p.correctCount || 0);
      }
    } else {
      setQueue(steps);
    }
    setMounted(true);
    if (dynConfig?.tip) setShowTip(true);
  }, [lessonId, steps, dynConfig]);

  // Save progress
  useEffect(() => {
    if (!mounted || isFinished || skipSaveRef.current || !queue.length) return;
    const progressPct = Math.min(100, Math.round((correctCount / steps.length) * 100));
    const status = correctCount === 0 ? "Not Started" : "In Progress";
    const progressData = {
      status,
      progress: progressPct,
      correctCount,
      currentIndex,
      queue,
      everCompleted: everCompletedRef.current,
    };
    localStorage.setItem(`sign_quest_progress_${lessonId}`, JSON.stringify(progressData));
    savedProgressRef.current = progressData;
    upsertLessonProgress(lessonId, { status: status as "Not Started" | "In Progress", progress: progressPct, ever_completed: everCompletedRef.current, correct_count: correctCount });
  }, [currentIndex, queue, correctCount, mounted, isFinished, lessonId, steps.length]);

  // Warn on close mid-lesson
  useEffect(() => {
    if (isFinished) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isFinished]);

  // Enter key → Check / Continue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || showPauseConfirm) return;
      const step = queue[currentIndex];
      if (!step) return;
      const canAct = feedback || step.type === "teach" || selectedAnswer || textInput.length > 0;
      if (canAct && wrongPhase !== "hint") feedback ? handleNext() : handleCheck();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!mounted || (!staticLesson && !dynConfig)) return null;

  const step = queue[currentIndex];
  if (!step) return null;

  const calculatedProgress = Math.min(100, Math.round((correctCount / steps.length) * 100));
  const progress = practiceAgain && savedProgressRef.current ? savedProgressRef.current.progress : calculatedProgress;

  const getRetryHint = (s: LessonStep) => {
    if (s.type === "sentence") return "Watch each sign carefully and type the full English sentence.";
    if (s.type === "type") {
      return s.acceptedAnswers && s.acceptedAnswers.length > 1
        ? `Accepted: ${s.acceptedAnswers.slice(0, 2).join(" or ")}`
        : s.description ?? "Look at the handshape carefully and type what you see.";
    }
    if (s.description) return s.description;
    if (s.type === "quiz") return "Compare the sign in the video/image with each option.";
    if (s.type === "match") return "Watch each option and find the one matching the label.";
    if (s.type === "synthesize") return `This spells a ${s.correctAnswer?.length ?? "?"}-letter word.`;
    return "Try again and pay attention to the handshape.";
  };

  const handleCheck = () => {
    if (practiceAgain) setPracticeAgain(false);
    if (step.type === "teach") {
      setCorrectCount(prev => Math.min(steps.length, prev + 1));
      handleNext();
      return;
    }

    const answer = (step.type === "synthesize" || step.type === "type" || step.type === "sentence")
      ? textInput.trim().toUpperCase()
      : selectedAnswer;

    const accepted = step.acceptedAnswers?.length
      ? step.acceptedAnswers.map(a => a.toUpperCase())
      : [step.correctAnswer?.toUpperCase() ?? ""];
    const isCorrect = accepted.includes(answer?.toUpperCase() ?? "");

    const wordKey = step.wordKey ?? (step.correctAnswer ? `letter_${step.correctAnswer.toLowerCase()}` : null);

    // On retry (second chance): wrong = fail, push to back
    if (wrongPhase === "retry" && !isCorrect) {
      handleReveal();
      return;
    }

    if (isCorrect) {
      setCorrectCount(prev => Math.min(steps.length, prev + 1));
      setFeedback("correct");
      setWrongPhase("none");
      setRetryHint(null);
      if (step.type === "quiz" || step.type === "match" || step.type === "type") {
        if (wordKey) trackWordProgress(wordKey, true);
      } else if (step.type === "synthesize" && step.correctAnswer) {
        for (const letter of step.correctAnswer) {
          trackWordProgress(`letter_${letter.toLowerCase()}`, true);
        }
      }
    } else {
      setWrongPhase("hint");
      setRetryHint(getRetryHint(step));
    }
  };

  const handleReveal = () => {
    const wordKey = step.wordKey ?? (step.correctAnswer ? `letter_${step.correctAnswer.toLowerCase()}` : null);
    setFeedback("incorrect");
    setWrongPhase("none");
    setRetryHint(null);
    if (step.type === "quiz" || step.type === "match" || step.type === "type") {
      if (wordKey) trackWordProgress(wordKey, false);
    } else if (step.type === "synthesize" && step.correctAnswer) {
      const typed = textInput.trim().toUpperCase().split("");
      step.correctAnswer.split("").forEach((letter, i) => {
        trackWordProgress(`letter_${letter.toLowerCase()}`, typed[i] === letter);
      });
    }
    const newQueue = [...queue];
    const remaining = newQueue.length - currentIndex;
    const insertAt = remaining > 2
      ? Math.floor(Math.random() * (remaining - 2)) + (currentIndex + 2)
      : newQueue.length;
    newQueue.splice(insertAt, 0, { ...step, id: `${step.id}-retry-${Date.now()}` });
    setQueue(newQueue);
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setTextInput("");
    setWrongPhase("retry");
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setTextInput("");
    setWrongPhase("none");
    setRetryHint(null);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      setPracticeAgain(false);
      everCompletedRef.current = true;
      // Show completion screen, then immediately reset progress so next visit starts fresh
      const reset = { status: "Not Started", progress: 0, correctCount: 0, currentIndex: 0, queue: [], everCompleted: true };
      localStorage.setItem(`sign_quest_progress_${lessonId}`, JSON.stringify(reset));
      savedProgressRef.current = reset;
      upsertLessonProgress(lessonId, { status: "Not Started", progress: 0, ever_completed: true, correct_count: 0 });
    }
  };

  const handleReset = () => {
    const resetData = { status: "Not Started", progress: 0, correctCount: 0, currentIndex: 0, queue: [], everCompleted: everCompletedRef.current };
    localStorage.setItem(`sign_quest_progress_${lessonId}`, JSON.stringify(resetData));
    savedProgressRef.current = resetData;
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
    setRetryHint(null);
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

  // ── Lesson Tip Modal ───────────────────────────────────────────────────
  if (showTip && lessonTip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <div className="max-w-sm">
          <div className="mb-4 text-5xl">💡</div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Helpful Tip</h2>
          <p className="text-lg text-slate-600 mb-8">{lessonTip}</p>
          <button onClick={() => setShowTip(false)} className="w-full rounded-2xl bg-blue-500 py-4 font-bold text-white hover:bg-blue-600 transition">
            Got it, let's go!
          </button>
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
                let style = "border-slate-200 text-slate-700 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500";
                else if (isSelected) style = feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-600" : "border-blue-500 bg-blue-50 text-blue-600";
                return (
                  <button key={opt.id} onClick={() => !feedback && wrongPhase !== "hint" && setSelectedAnswer(opt.id)} className={`rounded-2xl border-2 py-2 px-4 text-center text-base font-bold transition-all ${style}`}>
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
                let style = "border-slate-200 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrect) style = "border-green-500 bg-green-50 ring-2 ring-green-500";
                else if (isSelected) style = feedback === "incorrect" ? "border-red-500 bg-red-50" : "border-blue-500 bg-blue-50";
                return (
                  <button key={opt.id} onClick={() => !feedback && wrongPhase !== "hint" && setSelectedAnswer(opt.id)} className={`flex items-center justify-center rounded-3xl border-2 p-1 transition-all overflow-hidden ${style}`}>
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
              autoFocus
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={feedback !== null || wrongPhase === "hint"}
              placeholder="Type your answer..."
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-colors placeholder:text-slate-300 ${
                feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct"   ? "border-green-500 bg-green-50 text-green-700" :
                wrongPhase === "hint"    ? "border-yellow-300 bg-yellow-50 text-slate-700" :
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
              disabled={feedback !== null || wrongPhase === "hint"}
              placeholder="Type the word here..."
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-colors placeholder:text-slate-300 ${
                feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct"   ? "border-green-500 bg-green-50 text-green-700" :
                wrongPhase === "hint"    ? "border-yellow-300 bg-yellow-50 text-slate-700" :
                "border-slate-200 focus:border-blue-500 text-slate-900"
              }`}
            />
          </div>
        )}
        {/* SENTENCE — show a row of signs, student types the English translation */}
        {step.type === "sentence" && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0 gap-4">
            <div className="flex gap-2 flex-wrap justify-center shrink-0 overflow-x-auto w-full">
              {step.sentenceMedia?.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                  {m.mediaType === "video" ? (
                    <video key={m.src} src={m.src} autoPlay loop muted playsInline
                      className="h-24 w-24 rounded-xl object-cover bg-slate-900" />
                  ) : (
                    <div className="h-24 w-24 rounded-xl bg-slate-50 border border-slate-200 p-1">
                      <img src={m.src} alt={m.label} className="h-full w-full object-contain mix-blend-multiply" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{m.label}</span>
                </div>
              ))}
            </div>
            <input
              autoFocus
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={feedback !== null || wrongPhase === "hint"}
              placeholder="Type the English sentence..."
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-xl font-bold uppercase tracking-wider outline-none transition-colors placeholder:text-slate-300 ${
                feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct"   ? "border-green-500 bg-green-50 text-green-700" :
                wrongPhase === "hint"    ? "border-yellow-300 bg-yellow-50 text-slate-700" :
                "border-slate-200 focus:border-blue-500 text-slate-900"
              }`}
            />
            {feedback === "incorrect" && step.acceptedAnswers && (
              <p className="text-sm text-slate-500 shrink-0">
                Also accepted: {step.acceptedAnswers.slice(0, 2).join(" / ")}
              </p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`shrink-0 border-t-2 transition-colors ${
        feedback === "correct"   ? "border-green-200 bg-green-100" :
        feedback === "incorrect" ? "border-red-200 bg-red-100"     :
        wrongPhase === "hint"    ? "border-yellow-200 bg-yellow-50" : "border-slate-100 bg-white"
      }`}>
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            {feedback === "correct" && (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-500 shadow-sm"><CheckCircle2 className="h-7 w-7" /></div>
                <div className="text-xl font-black text-green-600">Excellent!</div>
              </>
            )}
            {feedback === "incorrect" && (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"><XCircle className="h-7 w-7" /></div>
                <div>
                  <div className="text-xl font-black text-red-600">Incorrect</div>
                  <div className="text-sm font-bold text-red-500">Correct answer: {step.correctAnswer}</div>
                </div>
              </>
            )}
            {wrongPhase === "hint" && !feedback && (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-yellow-500 shadow-sm"><XCircle className="h-7 w-7" /></div>
                <div>
                  <div className="text-xl font-black text-yellow-600">Not Quite</div>
                  <div className="text-sm font-bold text-yellow-500">{retryHint ?? "Look closely at the handshape."}</div>
                </div>
              </>
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
              <button
                onClick={feedback ? handleNext : handleCheck}
                disabled={!feedback && step.type !== "teach" && !selectedAnswer && textInput.trim().length === 0}
                className={`min-w-35 ml-auto rounded-2xl px-8 py-3 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                  feedback === "correct"   ? "bg-green-500 hover:bg-green-600" :
                  feedback === "incorrect" ? "bg-red-500 hover:bg-red-600"     : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {feedback ? "Continue" : step.type === "teach" ? "Next" : "Check"}
              </button>
            )}
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
