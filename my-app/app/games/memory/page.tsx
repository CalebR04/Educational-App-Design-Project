"use client";

import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

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
  const [cards, setCards] = useState<Card[]>(() => createCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    const savedScore = localStorage.getItem("memoryHighScore");
    if (savedScore) setHighScore(Number(savedScore));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("memoryHighScore", score.toString());
    }
  }, [score]);

  function nextLevel() {
    setMoves(20);
    setCards(createCards());
    setSelected([]);
    setIsChecking(false);
  }

  function restartGame() {
    setScore(0);
    setMoves(20);
    setCards(createCards());
    setSelected([]);
    setGameOver(false);
    setIsChecking(false);
  }

  function handleFlip(index: number) {
    if (isChecking || gameOver || cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    const newSelected = [...selected, index];

    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      setMoves((m) => m - 1);

      const [a, b] = newSelected;
      const isMatch =
        newCards[a].letter === newCards[b].letter &&
        newCards[a].type !== newCards[b].type;

      if (isMatch) {
        newCards[a].matched = true;
        newCards[b].matched = true;
        setCards([...newCards]);
        setScore((s) => s + 10);

        setTimeout(() => {
          setSelected([]);
          setIsChecking(false);

          if (newCards.every((c) => c.matched)) {
            const wins = Number(localStorage.getItem("memoryWins") || 0);
            localStorage.setItem("memoryWins", (wins + 1).toString());
            setTimeout(nextLevel, 400);
          }
        }, 600);
      } else {
        setTimeout(() => {
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setSelected([]);
          setIsChecking(false);
        }, 800);
      }
    }
  }

  useEffect(() => {
    if (moves <= 0 && !gameOver) {
      setGameOver(true);
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
            <h1 className="text-2xl font-bold text-black leading-tight">Sign Memory</h1>
            <p className="text-black text-sm">Match the ASL sign to the corresponding letter!</p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-3 py-2 gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm shrink-0"></div>
              <div className="font-semibold text-black text-sm whitespace-nowrap">Moves: {moves}</div>
            </div>
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-3 py-2 gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm shrink-0"></div>
              <div className="font-semibold text-black text-sm whitespace-nowrap">Score: {score}</div>
            </div>
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-3 py-2 gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm shrink-0"></div>
              <div className="font-semibold text-black text-sm whitespace-nowrap">High Score: {highScore}</div>
            </div>
          </div>

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

              // Add green border if matched
              const borderClass = isMatched ? "border-4 border-green-500" : "border-2 border-gray-200";
              const bgClass = isMatched ? "bg-green-500" : "bg-blue-400";
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

          {gameOver && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          bg-red-100 border border-red-300 rounded-xl p-8 flex flex-col items-center shadow-lg z-10"
            >
              <h2 className="text-2xl font-bold text-red-600">Game Over!</h2>
              <p className="mt-2 text-black text-center">You ran out of moves.</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={restartGame}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Play Again
                </button>
                <button
                  onClick={() => (window.location.href = "/games")}
                  className="px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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