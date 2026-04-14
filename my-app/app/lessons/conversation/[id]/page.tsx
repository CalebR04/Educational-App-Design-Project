"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { conversationScenarios } from "@/data/conversations/scenarios";
import type { ConvSign, ResponseOption } from "@/data/conversations/scenarios";
import { ChevronLeft, CheckCircle2, XCircle, Eye, EyeOff, ArrowRight, RotateCcw, Trophy, Play } from "lucide-react";
import { useSound } from "@/hooks/useSound";

type Phase = "partner_signing" | "responding" | "reaction" | "complete";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Sign Sequencer (one-shot) ──────────────────────────────────────────────────
// Plays signs in order, fires onComplete when the sequence finishes.
function SignSequencer({ signs, onComplete }: { signs: ConvSign[]; onComplete: () => void }) {
  const [idx, setIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { setIdx(0); }, [signs]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  }, [idx]);

  const current = signs[idx];
  if (!current) return null;

  function handleEnded() {
    if (idx + 1 < signs.length) setIdx(i => i + 1);
    else onComplete();
  }

  return current.mediaType === "video" ? (
    <video
      ref={videoRef}
      key={current.src}
      src={current.src}
      onEnded={handleEnded}
      muted
      playsInline
      className="w-full h-full object-contain"
    />
  ) : (
    <img
      src={current.src}
      alt={current.label}
      className="w-full h-full object-contain"
      onLoad={() => setTimeout(handleEnded, 1500)}
    />
  );
}

// ── Response Card ──────────────────────────────────────────────────────────────
// Shows a static thumbnail; user presses Play to watch the sequence once.
function ResponseCard({ signs, onSelect, disabled }: {
  signs: ConvSign[];
  onSelect: () => void;
  disabled: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx]         = useState(0);
  const videoRef              = useRef<HTMLVideoElement>(null);

  function startPlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    setIdx(0);
    setPlaying(true);
  }

  useEffect(() => {
    if (!playing || !videoRef.current) return;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  }, [playing, idx]);

  function handleEnded() {
    if (idx + 1 < signs.length) {
      setIdx(i => i + 1);
    } else {
      setPlaying(false);
      setIdx(0);
    }
  }

  const current = signs[idx];

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-900">
      {/* Video area */}
      <div className="relative" style={{ height: 200 }}>
        {current?.mediaType === "video" ? (
          <video
            ref={videoRef}
            key={`${current.src}-${idx}`}
            src={current.src}
            onEnded={handleEnded}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : current ? (
          <img src={current.src} alt={current.label} className="w-full h-full object-cover" />
        ) : null}

        {/* Overlay play button when not playing */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <button
              onClick={startPlay}
              disabled={disabled}
              className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition disabled:opacity-40"
            >
              <Play className="w-5 h-5 text-gray-900 fill-gray-900 ml-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Select button */}
      <button
        onClick={onSelect}
        disabled={disabled}
        className="py-2.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-default"
      >
        Select
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ConversationRoomPage() {
  const params  = useParams<{ id: string }>();
  const router  = useRouter();
  const { play } = useSound();
  const scenario = conversationScenarios.find(s => s.id === params.id);

  const [turnIdx,         setTurnIdx]         = useState(0);
  const [phase,           setPhase]           = useState<Phase>("partner_signing");
  const [signingDone,     setSigningDone]     = useState(false);
  const [replayKey,       setReplayKey]       = useState(0);
  const [isCorrect,       setIsCorrect]       = useState<boolean | null>(null);
  const [answered,        setAnswered]        = useState(false);
  const [firstAttemptFailed, setFirstAttemptFailed] = useState(false);
  const [score,           setScore]           = useState(0);
  const [showHint,        setShowHint]        = useState(false);
  const [reactionUrl,     setReactionUrl]     = useState<string | null>(null);
  const reactionRef = useRef<HTMLVideoElement>(null);

  // ── Scenario not found ────────────────────────────────────────────────────
  if (!scenario) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Scenario not found.</p>
          <button
            onClick={() => router.push("/lessons/conversation")}
            className="text-blue-500 font-semibold"
          >
            ← Back to Scenarios
          </button>
        </div>
      </div>
    );
  }

  const turn       = scenario.turns[turnIdx];
  const isLastTurn = turnIdx === scenario.turns.length - 1;
  // Shuffle options each time the turn changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shuffledOptions = useMemo(() => shuffle(turn.options), [turnIdx]);

  // ── Play reaction video when it appears ──────────────────────────────────
  useEffect(() => {
    if (reactionUrl && reactionRef.current) {
      reactionRef.current.play().catch(() => {});
    }
  }, [reactionUrl]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handlePartnerDone() {
    setPhase("responding");
    setIsCorrect(null);
    setAnswered(false);
    setFirstAttemptFailed(false);
    setShowHint(false);
  }

  function handleNext() {
    if (isLastTurn) {
      setPhase("complete");
    } else {
      setTurnIdx(i => i + 1);
      setPhase("partner_signing");
      setIsCorrect(null);
      setAnswered(false);
      setFirstAttemptFailed(false);
      setReactionUrl(null);
      setSigningDone(false);
      setReplayKey(0);
    }
  }

  function resolveAnswer(correct: boolean, reactionVideo?: string) {
    if (!correct && !answered) setFirstAttemptFailed(true);
    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      play(isLastTurn ? "level_complete" : "correct");
      // Only count toward accuracy if the first attempt was correct (no prior failures)
      if (!firstAttemptFailed) setScore(s => s + 1);
      setTimeout(handleNext, 1000);
    } else {
      play("incorrect");
      if (reactionVideo) {
        setReactionUrl(reactionVideo);
        setPhase("reaction");
      }
    }
  }

  function handleVideoChoice(opt: ResponseOption) {
    if (answered) return;
    resolveAnswer(opt.correct, opt.reactionVideoUrl);
  }

  function handleRetry() {
    setIsCorrect(null);
    setAnswered(false);
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  if (phase === "complete") {
    const pct = Math.round((score / scenario.turns.length) * 100);
    if (typeof window !== "undefined") {
      localStorage.setItem(`conv_${scenario.id}`, JSON.stringify({ pct }));
    }
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar active="Lessons" />
        <main className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Conversation Complete!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {score}/{scenario.turns.length} turns correct
          </p>

          <div className={`bg-linear-to-br ${scenario.color} rounded-2xl p-6 text-white mb-8`}>
            <div className="text-5xl font-black mb-1">{pct}%</div>
            <div className="text-white/80">accuracy this conversation</div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setTurnIdx(0); setScore(0); setIsCorrect(null); setAnswered(false); setFirstAttemptFailed(false); setPhase("partner_signing"); }}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3.5 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => router.push("/lessons/conversation")}
              className={`w-full bg-linear-to-r ${scenario.color} text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition`}
            >
              More Scenarios
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Main game layout ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar active="Lessons" />
      <main className="max-w-7xl mx-auto px-4 py-4">

        {/* Progress */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.push("/lessons/conversation")}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-linear-to-r ${scenario.color} transition-all duration-500`}
              style={{ width: `${(turnIdx / scenario.turns.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-400 shrink-0">{turnIdx + 1}/{scenario.turns.length}</span>
        </div>

        {/* ── Partner signing ────────────────────────────────────────────── */}
        {(phase === "partner_signing" || phase === "reaction") && (
          <div className="flex flex-col items-center">
            <div
              className="relative rounded-2xl overflow-hidden bg-gray-900 mb-4 w-full max-w-sm"
              style={{ height: "44vh" }}
            >
              {phase === "partner_signing" && (
                <SignSequencer
                  key={replayKey}
                  signs={turn.partnerSigns}
                  onComplete={() => setSigningDone(true)}
                />
              )}
              {phase === "reaction" && reactionUrl && (
                <video
                  ref={reactionRef}
                  src={reactionUrl}
                  muted
                  playsInline
                  onEnded={() => { setPhase("responding"); }}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {phase === "partner_signing" && (
              <div className="flex gap-3 w-full max-w-sm">
                <button
                  onClick={() => { setSigningDone(false); setReplayKey(k => k + 1); }}
                  disabled={!signingDone}
                  className="flex-1 text-sm font-semibold py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition text-gray-400 disabled:opacity-30 disabled:cursor-default hover:enabled:border-gray-400 hover:enabled:text-gray-700 dark:hover:enabled:text-gray-200"
                >
                  Play Again
                </button>
                <button
                  onClick={handlePartnerDone}
                  disabled={!signingDone}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                    signingDone
                      ? `bg-linear-to-r ${scenario.color} text-white hover:opacity-90`
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Respond <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Responding ─────────────────────────────────────────────────── */}
        {phase === "responding" && (
          <>
            {/* Inline result banner */}
            {answered && (
              <div className={`rounded-2xl px-4 py-3 flex items-center gap-2 mb-3 border-2 ${
                isCorrect
                  ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
              }`}>
                {isCorrect
                  ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                }
                <span className={`font-bold text-sm ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {isCorrect ? "Correct!" : `Incorrect — correct answer: ${turn.yourEnglish}`}
                </span>
                {!isCorrect && (
                  <button
                    onClick={handleRetry}
                    className="ml-auto text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 px-2.5 py-1 rounded-lg transition shrink-0"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Choose your response:
              </p>
              <button
                onClick={() => setShowHint(h => !h)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition"
              >
                {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showHint ? "Hide hint" : "Hint"}
              </button>
            </div>

            {showHint && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2 mb-3 text-sm text-amber-800 dark:text-amber-300">
                Hint: {turn.yourEnglish}
              </div>
            )}

            {/* Video Choice — 3 options, centered */}
            <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto w-full">
              {shuffledOptions.map(opt => (
                <ResponseCard
                  key={opt.id}
                  signs={opt.signs}
                  onSelect={() => handleVideoChoice(opt)}
                  disabled={answered && isCorrect !== false}
                />
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
