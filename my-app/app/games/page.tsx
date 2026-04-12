"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import { fetchGameHighScores } from "@/lib/supabase/userStats";

export default function GamesPage() {
  const activeTab = "Games";

  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryPlayed, setMemoryPlayed] = useState(0);
  const [combosScore, setCombosScore] = useState(0);
  const [combosPlayed, setCombosPlayed] = useState(0);
  const [battleScore, setBattleScore] = useState(0);
  const [battlePlayed, setBattlePlayed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameHighScores().then(s => {
      setMemoryScore(s.memoryHigh);
      setMemoryPlayed(s.memoryPlayed);
      setCombosScore(s.comboHigh);
      setCombosPlayed(s.comboPlayed);
      setBattleScore(s.battleHigh);
      setBattlePlayed(s.battlePlayed);
      setLoading(false);
    });
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
    },
    {
      title: "Sign Battle",
      description: "Face AI opponents in fast-paced sign challenges",
      difficulty: "Hard",
      plays: battlePlayed,
      score: battleScore,
      gradient: "from-orange-400 to-red-600",
      icon: "🏆",
      link: "/games/battle",
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
          <button className="px-6 py-2 font-bold text-lg text-blue-600 relative">
            Games
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
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
            return (
              <Link
                key={game.title}
                href={game.link}
                className="flex flex-col overflow-hidden rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl transition-all"
              >
                <div className={`flex-1 bg-linear-to-br ${game.gradient} p-6 text-white`}>
                  <div className="text-3xl mb-3">{game.icon}</div>
                  <h2 className="text-xl font-bold mb-2">{game.title}</h2>
                  <p className="text-white/90 text-sm mb-3">{game.description}</p>
                  <div className="inline-flex bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                    {game.difficulty}
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    {loading
                      ? <div className="h-7 w-12 bg-gray-200 animate-pulse rounded mb-1" />
                      : <p className="text-2xl font-bold text-gray-900">{game.plays}</p>
                    }
                    <p className="text-xs text-gray-600">Games Played</p>
                  </div>
                  <div>
                    {loading
                      ? <div className="h-7 w-12 bg-gray-200 animate-pulse rounded mb-1" />
                      : <p className="text-2xl font-bold text-gray-900">{game.score}</p>
                    }
                    <p className="text-xs text-gray-600">High Score</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}