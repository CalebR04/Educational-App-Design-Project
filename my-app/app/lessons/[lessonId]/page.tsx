"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { alphabetLessons } from "@/data/lessons/alphabet";
import Link from "next/link";
import { useParams } from "next/navigation";


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

  // Load Saved Progress
  useEffect(() => {
    if (originalLesson) {
      const saved = localStorage.getItem(`sign_quest_progress_${lessonId}`);
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (parsedData.status === "Completed") {
          setIsFinished(true);
        } else {
          setQueue(parsedData.queue || originalLesson.steps);
          setCurrentIndex(parsedData.currentIndex || 0);
        }
      }
    }
    setMounted(true);
  }, [lessonId, originalLesson]);

  // Save Progress
  useEffect(() => {
    if (!mounted || isFinished) return;
    
    const progressPct = Math.min(100, Math.round((currentIndex / queue.length) * 100));
    const status = currentIndex === 0 ? "Not Started" : "In Progress";
    
    localStorage.setItem(`sign_quest_progress_${lessonId}`, JSON.stringify({
      status,
      progress: progressPct,
      currentIndex,
      queue
    }));
  }, [currentIndex, queue, mounted, isFinished, lessonId]);

  // Fallback if URL is invalid
  if (!originalLesson || !mounted) return null; 

  const step = queue[currentIndex];
  const progress = Math.min(100, Math.round((currentIndex / queue.length) * 100));

  const handleCheck = () => {
    if (step.type === "teach") {
      handleNext();
      return;
    }

    const answerToCheck = step.type === "synthesize" ? textInput.trim().toUpperCase() : selectedAnswer;

    if (answerToCheck === step.correctAnswer?.toUpperCase()) {
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* HEADER: Nav & Progress */}
      <header className="mx-auto flex w-full max-w-4xl items-center gap-6 p-6">
        <Link href="/lessons" className="text-slate-400 hover:text-slate-600 transition">
          <X className="h-8 w-8" />
        </Link>
        <div className="h-4 flex-1 rounded-full bg-slate-100 overflow-hidden">
          <div 
            className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="font-bold text-slate-400 min-w-[3rem] text-right">
          {progress}%
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6">
        <h2 className="mb-8 w-full text-left text-3xl font-extrabold text-slate-900">
          {step.prompt}
        </h2>

        {/* 1. TEACH STEP */}
        {step.type === "teach" && (
          <div className="flex w-full flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="relative h-64 w-64 rounded-3xl bg-blue-50 border-4 border-blue-100 p-4 shadow-sm">
              <img src={step.imageUrl as string} alt="Sign" className="h-full w-full object-contain mix-blend-multiply" />
            </div>
            {step.description && (
              <p className="mt-8 text-xl text-slate-600">{step.description}</p>
            )}
          </div>
        )}

        {/* 2. QUIZ STEP */}
        {step.type === "quiz" && (
          <div className="flex w-full flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <img src={step.imageUrl as string} alt="Sign to guess" className="mb-8 h-48 w-48 object-contain" />
            <div className="grid w-full gap-4">
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
                  <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)} className={`rounded-2xl border-2 p-4 text-center text-xl font-bold transition-all ${btnStyle}`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MATCH STEP */}
        {step.type === "match" && (
          <div className="grid w-full grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
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
                <button key={opt.id} onClick={() => !feedback && setSelectedAnswer(opt.id)} className={`flex aspect-square flex-col items-center justify-center rounded-3xl border-2 p-4 transition-all ${btnStyle}`}>
                  <img src={opt.imageUrl} alt={`Option ${opt.id}`} className="h-full w-full object-contain mix-blend-multiply" />
                </button>
              );
            })}
          </div>
        )}

        {/* 4. SYNTHESIZE STEP */}
        {step.type === "synthesize" && (
          <div className="flex w-full flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8 flex gap-4">
              {(step.imageUrl as string[]).map((img, i) => (
                <div key={i} className="h-32 w-32 rounded-2xl bg-slate-50 border border-slate-200 p-2">
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
              className={`w-full rounded-2xl border-2 p-6 text-center text-3xl font-bold uppercase tracking-widest outline-none transition-colors ${
                feedback === "incorrect" ? "border-red-500 bg-red-50 text-red-700" :
                feedback === "correct" ? "border-green-500 bg-green-50 text-green-700" :
                "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
        )}
      </main>

      {/* FOOTER: Validation & Feedback */}
      <footer className={`mt-auto border-t-2 transition-colors ${
        feedback === "correct" ? "border-green-200 bg-green-100" :
        feedback === "incorrect" ? "border-red-200 bg-red-100" : "border-slate-100 bg-white"
      }`}>
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between p-6">
          <div className="flex items-center gap-4">
            {feedback === "correct" && (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-green-500 shadow-sm"><CheckCircle2 className="h-8 w-8" /></div>
                <div className="text-2xl font-black text-green-600">Excellent!</div>
              </>
            )}
            {feedback === "incorrect" && (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"><XCircle className="h-8 w-8" /></div>
                <div>
                  <div className="text-2xl font-black text-red-600">Incorrect</div>
                  <div className="font-bold text-red-500">Correct answer: {step.correctAnswer}</div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={feedback ? handleNext : handleCheck}
            disabled={!feedback && step.type !== "teach" && !selectedAnswer && textInput.length === 0}
            className={`min-w-[150px] ml-auto rounded-2xl px-8 py-4 text-xl font-bold text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
              feedback === "correct" ? "bg-green-500 hover:bg-green-600 shadow-sm shadow-green-200" :
              feedback === "incorrect" ? "bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200" : 
              "bg-blue-500 hover:bg-blue-600 shadow-sm shadow-blue-200"
            }`}
          >
            {feedback ? "Continue" : (step.type === "teach" ? "Next" : "Check")}
          </button>
        </div>
      </footer>
    </div>
  );
}