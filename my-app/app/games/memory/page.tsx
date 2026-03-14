"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";

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

function createCards(numPairs = 10): Card[] {
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
      display: `/asl_images/${letter}.png`,
      letter,
      flipped: false,
      matched: false,
    });
  });

  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(createCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [gameOver, setGameOver] = useState(false);

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
  }

  function restartGame() {
    setScore(0);
    setMoves(20);
    setCards(createCards());
    setSelected([]);
    setGameOver(false);
  }

  function handleFlip(index: number) {
    if (cards[index].flipped || cards[index].matched || gameOver) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    const newSelected = [...selected, index];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m - 1);

      const [a, b] = newSelected;
      const isMatch =
        newCards[a].letter === newCards[b].letter &&
        newCards[a].type !== newCards[b].type;

      if (isMatch) {
        newCards[a].matched = true;
        newCards[b].matched = true;
        setScore((s) => s + 10);
        setSelected([]);

        setTimeout(() => {
          if (newCards.every((card) => card.matched)) nextLevel();
        }, 300);
      } else {
        setTimeout(() => {
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setSelected([]);
        }, 800);
      }
    }
  }

  useEffect(() => {
    if (moves <= 0 && !gameOver) {
      setGameOver(true);
      setScore(0);
    }
  }, [moves]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar active="Games" />

      <main className="max-w-5xl mx-auto mt-8 px-4">

        {/* Back button */}
        <button
          onClick={() => window.location.href = "/games"}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-lg font-semibold text-blue-600 hover:bg-blue-50 transition mb-2"
        >
          <span className="text-xl">&larr;</span>
          <span>Back to Games</span>
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-black">Sign Memory</h1>
        <p className="text-black mt-1">Match the ASL sign to the corresponding letter!</p>

        {/* Info cards */}
        <div className="mt-6 flex gap-4 flex-wrap justify-center">
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex-1 max-w-[300px] justify-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            <div className="font-semibold text-black text-center">Moves: {moves}</div>
          </div>

          <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex-1 max-w-[300px] justify-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
            <div className="font-semibold text-black text-center">Score: {score}</div>
          </div>

          <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex-1 max-w-[300px] justify-center gap-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
            <div className="font-semibold text-black text-center">High Score: {highScore}</div>
          </div>
        </div>

        {/* Game board */}
        <div className="mt-6 relative bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleFlip(index)}
                className={`h-32 w-32 rounded-xl flex items-center justify-center border-2 border-gray-200 hover:border-gray-400 shadow-lg bg-blue-400`}
              >
                {card.flipped || card.matched ? (
                  card.type === "letter" ? (
                    <span className="text-4xl font-bold text-white">{card.display}</span>
                  ) : (
                    <img src={card.display} alt={card.letter} className="h-24 w-24 object-contain" />
                  )
                ) : (
                  <span className="text-4xl font-bold text-white">?</span>
                )}
              </button>
            ))}
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            bg-red-100 border border-red-300 rounded-xl p-8 flex flex-col items-center shadow-lg z-10">
              <h2 className="text-2xl font-bold text-red-600">Game Over!</h2>
              <p className="mt-2 text-black text-center">You ran out of moves.</p>
              <button
                onClick={restartGame}
                className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
