"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

export default function GamesPage() {
  const activeTab = "Games";

  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryPlayed, setMemoryPlayed] = useState(0);
  const [combosScore, setCombosScore] = useState(0);
  const [combosPlayed, setCombosPlayed] = useState(0);

  // Load saved scores from localStorage
  useEffect(() => {
    const savedMemoryScore = localStorage.getItem("memoryHighScore");
    const savedMemoryPlayed = localStorage.getItem("memoryWins");
    const savedCombosScore = localStorage.getItem("sign_combo_highscore");
    const savedCombosPlayed = localStorage.getItem("sign_combo_gamesplayed");

    if (savedMemoryScore) setMemoryScore(Number(savedMemoryScore));
    if (savedMemoryPlayed) setMemoryPlayed(Number(savedMemoryPlayed));
    if (savedCombosScore) setCombosScore(Number(savedCombosScore));
    if (savedCombosPlayed) setCombosPlayed(Number(savedCombosPlayed));
  }, []);

  const games = [
    {
      title: "Sign Memory",
      description: "Match pairs of ASL signs to their memory card game",
      difficulty: "Easy",
      plays: memoryPlayed,
      score: memoryScore,
      gradient: "from-blue-400 to-blue-600",
      icon: "⌘",
      link: "/games/memory",
      available: true,
    },
    {
      title: "Sign Combos",
      description: "Combine basic signs to create complete phrases and sentences",
      difficulty: "Medium",
      plays: combosPlayed,
      score: combosScore,
      gradient: "from-purple-400 to-purple-600",
      icon: "⚡",
      link: "/games/combos",
      available: true,
    },
    {
      title: "Sign Battle",
      description: "Face AI match opponents to perform signs accurately",
      difficulty: "Hard",
      plays: 0,
      score: 0,
      gradient: "from-orange-400 to-red-600",
      icon: "🏆",
      link: "/games/battle",
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Games" />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Game Center</h1>
          <p className="text-gray-600">
            Play games and compete with learners worldwide
          </p>
        </div>

        <div className="flex gap-2 mb-4 border-b-2 border-gray-200">
          <button
            className={`px-6 py-2 font-bold text-lg transition-all relative ${
              activeTab === "Games" ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Games
            {activeTab === "Games" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <Link
            href="/games/leaderboard"
            className="px-6 py-2 font-bold text-lg text-gray-600 hover:text-gray-900 transition-all"
          >
            Leaderboard
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {games.map((game) => {
            const inner = (
              <>
                <div className={`flex-1 bg-linear-to-br ${game.gradient} p-6 text-white`}>
                  <div className="text-3xl mb-3">{game.icon}</div>
                  <h2 className="text-xl font-bold mb-2">{game.title}</h2>
                  <p className="text-white/90 text-sm mb-3">{game.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                      {game.difficulty}
                    </div>
                    {game.comingSoon && (
                      <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                        <Lock className="w-3.5 h-3.5" /> Coming Soon
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{game.plays}</p>
                    <p className="text-xs text-gray-600">Games Played</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{game.score}</p>
                    <p className="text-xs text-gray-600">High Score</p>
                  </div>
                </div>
              </>
            );

            if (game.comingSoon) {
              return (
                <div key={game.title} className="flex flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white opacity-60 cursor-not-allowed">
                  {inner}
                </div>
              );
            }

            return (
              <Link key={game.title} href={game.link} className="flex flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl transition-all">
                {inner}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );}