"use client";

import { useState, useEffect } from "react";
import { LogOut, HelpCircle, X } from "lucide-react";
import { addGameScore, fetchGameHighScores, updateGameHighScore } from "@/lib/supabase/userStats";
import { useSound } from "@/hooks/useSound";

const allLetters = [
  "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"
];

type Card = {
  id: number;
  type: "letter" | "image";
  display: string;
  letter: string;
  flipped: boolean;
  matched: boolean;
};

function createCards(numPairs = 9): Card[] {
  // Randomly select letters from the full alphabet
  const shuffledLetters = allLetters.sort(() => 0.5 - Math.random());
  const selectedLetters = shuffledLetters.slice(0, numPairs);

  const cards: Card[] = [];

  selectedLetters.forEach((letter, index) => {
    cards.push({
      id: index * 2,
      type: "letter",
      display: letter.toUpperCase(),
      letter,
      flipped: false,
      matched: false,
    });

    cards.push({
      id: index * 2 + 1,
      type: "image",
      display: `/asl_images/letters/${letter}.svg`,
      letter,
      flipped: false,
      matched: false,
    });
  });

  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const { play, playReverse } = useSound();
  const [cards, setCards] = useState<Card[]>(() => createCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [youWin, setYouWin] = useState(false);
  const [winScore, setWinScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [mismatched, setMismatched] = useState<number[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchGameHighScores().then(s => setHighScore(s.memoryHigh));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      updateGameHighScore("memory", score);
    }
  }, [score]);

  function restartGame() {
    setScore(0);
    setMoves(20);
    setCards(createCards());
    setSelected([]);
    setGameOver(false);
    setYouWin(false);
    setWinScore(0);
    setIsChecking(false);
    setMismatched([]);
  }

  function handleFlip(index: number) {
    if (isChecking || gameOver || youWin || cards[index].flipped || cards[index].matched) return;

    play("flip");

    const newCards = [...cards];
    newCards[index].flipped = true;
    const newSelected = [...selected, index];

    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);

      const [a, b] = newSelected;
      const isMatch =
        newCards[a].letter === newCards[b].letter &&
        newCards[a].type !== newCards[b].type;

      if (isMatch) {
        newCards[a].matched = true;
        newCards[b].matched = true;
        setCards([...newCards]);
        setScore((s) => s + 50);
        play("correct");

        setTimeout(() => {
          setSelected([]);
          setIsChecking(false);

          if (newCards.every((c) => c.matched)) {
            // moves unchanged on correct — full remaining moves count as bonus
            const total = score + 50 + moves * 25;
            setScore(total);
            setWinScore(total);
            play("level_complete");
            addGameScore(total, "memory");
            setTimeout(() => setYouWin(true), 600);
          }
        }, 600);
      } else {
        setMoves((m) => m - 1);
        setMismatched([a, b]);
        setTimeout(() => {
          playReverse("flip");
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setSelected([]);
          setMismatched([]);
          setIsChecking(false);
        }, 2000);
      }
    }
  }

  useEffect(() => {
    if (moves <= 0 && !gameOver) {
      play("game_over");
      setGameOver(true);
      if (score > 0) addGameScore(score, "memory");
      setScore(0);
      setIsChecking(false);
    }
  }, [moves, gameOver]);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 py-3">
        {/* Header row: title + stats + exit */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Sign Memory</h1>
            <p className="text-gray-900 text-sm">Match the ASL sign to the corresponding letter!</p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-3 py-2 gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm shrink-0"></div>
              <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">Moves: {moves}</div>
            </div>
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-3 py-2 gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm shrink-0"></div>
              <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">Score: {score}</div>
            </div>
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-3 py-2 gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm shrink-0"></div>
              <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">High Score: {highScore}</div>
            </div>
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition shrink-0"
            aria-label="How to play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold transition shrink-0"
          >
            <LogOut className="w-5 h-5" />
            Exit Game
          </button>
        </div>

        <div className="relative bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-6 gap-4 justify-items-center">
            {cards.map((card, index) => {
              const isMatched = card.matched;
              const isFlipped = card.flipped || card.matched;
              const isMismatched = mismatched.includes(index);

              const borderClass = isMatched ? "border-4 border-green-500" : isMismatched ? "border-4 border-red-500" : "border-2 border-gray-200";
              const bgClass = isMatched ? "bg-green-500" : isMismatched ? "bg-red-400" : "bg-blue-400";
              const pointerClass = isChecking && !isMatched ? "pointer-events-none opacity-90" : "";

              return (
                <button
                  key={card.id}
                  onClick={() => handleFlip(index)}
                  className={`h-32 w-32 rounded-xl flex items-center justify-center shadow-lg overflow-hidden ${bgClass} ${borderClass} ${pointerClass} cursor-pointer hover:border-blue-500 hover:border-4 transition-all`}
                >
                  {isFlipped ? (
                    card.type === "letter" ? (
                      <span className="text-4xl font-bold text-white">{card.display}</span>
                    ) : (
                      <img
                        src={card.display}
                        alt={card.letter}
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <span className="text-4xl font-bold text-white">?</span>
                  )}
                </button>
              );
            })}
          </div>

          {youWin && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-10">
              <div className="bg-white border-2 border-green-300 rounded-2xl p-8 flex flex-col items-center shadow-2xl text-center max-w-xs">
                <div className="text-5xl mb-3">🏆</div>
                <h2 className="text-2xl font-black text-green-600 mb-1">You Win!</h2>
                <p className="text-gray-500 text-sm mb-1">You matched all {cards.length / 2} pairs!</p>
                <div className="text-xs text-gray-400 mb-1">{cards.length / 2} pairs × 50 pts + {moves} moves left × 25 pts</div>
                <p className="text-lg font-bold text-gray-900 mb-5">Score: {winScore}</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={restartGame}
                    className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => (window.location.href = "/games")}
                    className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-10">
              <div className="bg-white border-2 border-red-300 rounded-2xl p-8 flex flex-col items-center shadow-2xl text-center max-w-xs">
                <div className="text-5xl mb-3">💀</div>
                <h2 className="text-2xl font-black text-red-600 mb-1">Game Over!</h2>
                <p className="text-gray-500 text-sm mb-5">You ran out of moves.</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={restartGame}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => (window.location.href = "/games")}
                    className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-900">How to Play</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <p>Flip two cards to find matching pairs — each pair is an ASL sign and its letter.</p>
              <ul className="space-y-2 list-none">
                <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">1.</span>Click any card to flip it over.</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">2.</span>Click a second card. If the letter and sign match, they stay face up!</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">3.</span>If they don't match, both cards flip back over — remember their positions!</li>
                <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">4.</span>Match all 9 pairs before you run out of moves to win.</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Scoring</p>
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex justify-between"><span>Correct match</span><span className="font-bold text-green-600">+50 pts</span></div>
                <div className="flex justify-between"><span>Moves remaining (on win)</span><span className="font-bold text-green-600">×25 pts each</span></div>
                <div className="flex justify-between"><span>Wrong match</span><span className="font-bold text-red-500">−1 move</span></div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full rounded-2xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-600 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Exit Game?</h2>
            <p className="text-slate-500 mb-8">Are you sure you want to exit? Progress will not be saved.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => (window.location.href = "/games")} className="w-full rounded-2xl bg-slate-900 py-3 font-bold text-white hover:bg-black transition">
                Exit
              </button>
              <button onClick={() => setShowExitConfirm(false)} className="w-full rounded-2xl border-2 border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-50 transition">
                Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}