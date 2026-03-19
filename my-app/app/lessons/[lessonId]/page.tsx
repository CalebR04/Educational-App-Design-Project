"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { alphabetLessons } from "@/data/lessons/alphabet";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";


export default function LessonPlayer() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const originalLesson = alphabetLessons[lessonId];

  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState(originalLesson?.steps || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const router = useRouter();

  // Load Saved Progress
  useEffect(() => {
    if (originalLesson) {
      const saved = localStorage.getItem(`sign_quest_progress_${lessonId}`);
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (parsedData.status === "Completed") {
          setIsFinished(true);
        } else {
          // Rebuild queue from current lesson data using saved IDs to avoid stale paths
          const freshStepMap = new Map(originalLesson.steps.map(s => [s.id, s]));
          const rebuiltQueue = (parsedData.queue || []).map((saved: { id: string }) => {
            const baseId = saved.id.replace(/-retry-\d+$/, "");
            return freshStepMap.get(saved.id) ?? freshStepMap.get(baseId) ?? saved;
          });
          setQueue(rebuiltQueue.length ? rebuiltQueue : originalLesson.steps);
          setCurrentIndex(parsedData.currentIndex || 0);
          setCorrectCount(parsedData.correctCount || 0);
        }
      }
    }
    setMounted(true);
  }, [lessonId, originalLesson]);

  // Save Progress
  useEffect(() => {
    if (!mounted || isFinished) return;
    const progressPct = Math.min(100, Math.round((correctCount / originalLesson.steps.length) * 100));
    const status = correctCount === 0 ? "Not Started" : "In Progress";
    localStorage.setItem(`sign_quest_progress_${lessonId}`, JSON.stringify({
      status,
      progress: progressPct,
      correctCount,
      currentIndex,
      queue
    }));
  }, [currentIndex, queue, correctCount, mounted, isFinished, lessonId, originalLesson.steps.length]);

  // Warn on browser close/refresh mid-lesson
  useEffect(() => {
    if (isFinished) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isFinished]);

  // Enter key → Check / Continue
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || showPauseConfirm) return;
      const currentStep = queue[currentIndex];
      const canCheck = feedback || currentStep?.type === 'teach' || selectedAnswer || textInput.length > 0;
      if (canCheck) feedback ? handleNext() : handleCheck();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [feedback, queue, currentIndex, selectedAnswer, textInput, showPauseConfirm]);

  // Fallback if URL is invalid
  if (!originalLesson || !mounted) return null; 

  const step = queue[currentIndex];
  const progress = Math.min(100, Math.round((correctCount / originalLesson.steps.length) * 100));

  const handleCheck = () => {
    if (step.type === "teach") {
      setCorrectCount(prev => Math.min(originalLesson.steps.length, prev + 1));
      handleNext();
      return;
    }

    const answerToCheck = step.type === "synthesize" ? textInput.trim().toUpperCase() : selectedAnswer;

    if (answerToCheck === step.correctAnswer?.toUpperCase()) {
      setCorrectCount(prev => Math.min(originalLesson.steps.length, prev + 1));
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
      
      const newQueue = [...queue];
      const remainingSteps = newQueue.length - currentIndex;
      let insertIndex = newQueue.length; 
      
      if (remainingSteps > 2) {
        insertIndex = Math.floor(Math.random() * (remainingSteps - 2)) + (currentIndex + 2);
      }
      
      newQueue.splice(insertIndex, 0, { ...step, id: `${step.id}-retry-${Date.now()}` });
      setQueue(newQueue);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setTextInput("");

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      // Mark as completed in storage
      localStorage.setItem(`sign_quest_progress_${lessonId}`, JSON.stringify({
        status: "Completed",
        progress: 100
      }));
    }
  };

  const handleReset = () => {
    localStorage.removeItem(`sign_quest_progress_${lessonId}`);
    setQueue(originalLesson.steps);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-100 animate-in zoom-in">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-slate-900">Lesson Complete!</h1>
        <p className="mt-2 text-lg text-slate-600">You mastered {originalLesson.title}.</p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/lessons" className="rounded-2xl bg-green-500 px-10 py-4 font-bold text-white transition hover:bg-green-600 shadow-md shadow-green-200">
            Back to Lessons
          </Link>
          <button onClick={handleReset} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-10 py-4 font-bold text-slate-600 transition hover:bg-slate-50">
            <RefreshCcw size={20} /> Practice Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white">
      {/* HEADER: Nav & Progress */}
      <header className="mx-auto flex w-full max-w-4xl items-center gap-6 px-6 py-3 shrink-0">
        <button onClick={() => setShowPauseConfirm(true)} className="text-slate-400 hover:text-slate-600 transition">
          <X className="h-7 w-7" />
        </button>
        <div className="h-3 flex-1 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="min-w-[3.5rem] text-right font-black text-green-600 text-xl">
          {progress}%
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col min-h-0 px-6 pt-2 pb-0">
        <h2 className="mb-3 w-full text-left text-2xl font-extrabold text-slate-900 shrink-0">
          {step.prompt}
        </h2>

        {/* 1. TEACH STEP */}
        {step.type === "teach" && (
          <div className="flex-1 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center w-full">
              <div className="aspect-square max-h-full max-h-96 w-auto rounded-3xl bg-blue-50 border-4 border-blue-100 p-1 shadow-sm overflow-hidden" style={{height: 'min(100%, 24rem)'}}>
                <img src={step.imageUrl as string} alt="Sign" className="h-full w-full object-contain mix-blend-multiply" />
              </div>
            </div>
            {step.description && (
              <p className="mt-3 mb-1 text-lg text-slate-600 shrink-0">{step.description}</p>
            )}
          </div>
        )}

        {/* 2. QUIZ STEP */}
        {step.type === "quiz" && (
          <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center w-full mb-3">
              <div className="aspect-square max-h-full w-auto overflow-hidden" style={{height: 'min(100%, 14rem)'}}>
                <img src={step.imageUrl as string} alt="Sign to guess" className="h-full w-full object-contain mix-blend-multiply" />
              </div>
            </div>
            <div className="grid w-full gap-2 shrink-0 pb-1">
              {step.options?.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrectAnswer = opt.id === step.correctAnswer;
                let btnStyle = "border-slate-200 text-slate-700 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrectAnswer) {
                  btnStyle = "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500 shadow-sm";
                } else if (isSelected) {
                  btnStyle = feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-600 shadow-sm" : "border-blue-500 bg-blue-50 text-blue-600 shadow-sm";
                }
                return (
                  <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)} className={`rounded-2xl border-2 py-2 px-4 text-center text-base font-bold transition-all ${btnStyle}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MATCH STEP */}
        {step.type === "match" && (
          <div className="flex-1 min-h-0 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full aspect-square max-w-sm max-h-full">
              {step.options?.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrectAnswer = opt.id === step.correctAnswer;
                let btnStyle = "border-slate-200 hover:bg-slate-50";
                if (feedback === "incorrect" && isCorrectAnswer) {
                  btnStyle = "border-green-500 bg-green-50 ring-2 ring-green-500 shadow-sm";
                } else if (isSelected) {
                  btnStyle = feedback === "incorrect" ? "border-red-500 bg-red-50 shadow-sm" : "border-blue-500 bg-blue-50 shadow-sm";
                }
                return (
                  <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)} className={`flex items-center justify-center rounded-3xl border-2 p-1 transition-all ${btnStyle}`}>
                    <img src={opt.imageUrl} alt={`Option ${opt.id}`} className="h-full w-full object-contain mix-blend-multiply" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SYNTHESIZE STEP */}
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
              className={`w-full shrink-0 rounded-2xl border-2 p-4 text-center text-2xl font-bold uppercase tracking-widest outline-none transition-colors ${
                feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct" ? "border-green-500 bg-green-50 text-green-700" :
                "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
        )}
      </main>

      {/* FOOTER: Validation & Feedback */}
      <footer className={`shrink-0 border-t-2 transition-colors ${
        feedback === "correct" ? "border-green-200 bg-green-100" :
        feedback === "incorrect" ? "border-red-200 bg-red-100" : "border-slate-100 bg-white"
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
          </div>
          <button
            onClick={feedback ? handleNext : handleCheck}
            disabled={!feedback && step.type !== "teach" && !selectedAnswer && textInput.length === 0}
            className={`min-w-35 ml-auto rounded-2xl px-8 py-3 text-lg font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
              feedback === "correct" ? "bg-green-500 hover:bg-green-600 shadow-sm shadow-green-200" :
              feedback === "incorrect" ? "bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200" :
              "bg-blue-500 hover:bg-blue-600 shadow-sm shadow-blue-200"
            }`}
          >
            {feedback ? "Continue" : (step.type === "teach" ? "Next" : "Check")}
          </button>
        </div>
      </footer>

      {/* Pause Confirmation */}
      {showPauseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Pause Lesson?</h2>
            <p className="text-slate-500 mb-8">Your progress has been saved.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/lessons')} className="w-full rounded-2xl bg-slate-900 py-3 font-bold text-white hover:bg-black transition">
                Exit Lesson
              </button>
              <button onClick={() => setShowPauseConfirm(false)} className="w-full rounded-2xl border-2 border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-50 transition">
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}