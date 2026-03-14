"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";

export default function GamesPage() {
  const activeTab = "Games";

  const [memoryScore, setMemoryScore] = useState(0);

  // Load saved score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("memoryHighScore");
    if (saved) {
      setMemoryScore(Number(saved));
    }
  }, []);

  const games = [
    {
      title: "Sign Memory",
      description: "Match pairs of ASL signs to their memory card game",
      difficulty: "Easy",
      plays: 12,
      score: memoryScore,
      gradient: "from-blue-500 to-blue-400",
      icon: "⌘",
      link: "/games/memory",
    },
    {
      title: "Sign Combos",
      description: "Combine basic signs to create complete phrases and sentences",
      difficulty: "Medium",
      plays: 8,
      score: 320,
      gradient: "from-violet-500 to-fuchsia-400",
      icon: "⚡",
      link: "/games/combos",
    },
    {
      title: "Sign Battle",
      description: "Face AI match opponents to perform signs accurately",
      difficulty: "Hard",
      plays: 15,
      score: 890,
      gradient: "from-orange-500 to-red-400",
      icon: "🏆",
      link: "/games/battle",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Navbar active="Games" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">
        <section>
          <h1 className="text-4xl font-bold text-black">Game Center</h1>
          <p className="mt-2 text-lg text-gray-600">
            Play games and compete with learners worldwide
          </p>
        </section>

        <section className="mt-6 flex items-center gap-6 border-b border-gray-200 pb-3 text-sm">
          <button
            className={`relative font-bold ${
              activeTab === "Games" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Games
            {activeTab === "Games" && (
              <span className="absolute -bottom-3 left-0 h-0.5 w-full rounded bg-blue-600" />
            )}
          </button>

          <Link
            href="/games/leaderboard"
            className="font-bold text-gray-700 hover:text-gray-900"
          >
            Leaderboard
          </Link>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.title}
              href={game.link}
              className="block overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className={`bg-gradient-to-r ${game.gradient} p-6 text-white`}>
                <div className="text-2xl">{game.icon}</div>

                <h2 className="mt-4 text-2xl font-bold">{game.title}</h2>
                <p className="mt-2 text-sm text-white/90">{game.description}</p>

                <div className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  {game.difficulty}
                </div>
              </div>

              <div className="grid grid-cols-2 px-5 py-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">{game.plays}</p>
                  <p className="text-xs text-gray-500">Times Played</p>
                </div>

                <div>
                  <p className="text-lg font-bold text-gray-900">{game.score}</p>
                  <p className="text-xs text-gray-500">High Score</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
