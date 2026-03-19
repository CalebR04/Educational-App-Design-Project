"use client";

import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  signsLearned: number;
  accuracy: number;
  streak: number;
  isYou?: boolean;
}

const globalLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "SignMaster_Pro", score: 15000, signsLearned: 95, accuracy: 96, streak: 42 },
  { rank: 2, name: "ASL_Guru", score: 14200, signsLearned: 89, accuracy: 94, streak: 38 },
  { rank: 3, name: "HandTalker", score: 13950, signsLearned: 87, accuracy: 92, streak: 35 },
  { rank: 4, name: "SilentWave", score: 13500, signsLearned: 84, accuracy: 91, streak: 30 },
  { rank: 5, name: "GestureKing", score: 12900, signsLearned: 79, accuracy: 89, streak: 28 },
  { rank: 6, name: "Signify", score: 12000, signsLearned: 76, accuracy: 88, streak: 25 },
  { rank: 7, name: "Trendy", score: 11850, signsLearned: 73, accuracy: 87, streak: 22 },
  { rank: 42, name: "You", score: 2340, signsLearned: 67, accuracy: 78, streak: 7, isYou: true },
];

const yourEntry = globalLeaderboard.find(e => e.isYou)!;

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Games" />

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Compete with learners from around the world</p>
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-gray-200">
          <Link href="/games" className="px-6 py-3 font-bold text-lg text-gray-600 hover:text-gray-900 transition-all">
            Games
          </Link>
          <span className="px-6 py-3 font-bold text-lg text-blue-600 relative">
            Leaderboard
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          </span>
        </div>

        {/* Your Rank Card */}
        <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm opacity-90 mb-1">Your Current Rank</div>
              <div className="text-5xl font-bold">#{yourEntry.rank}</div>
            </div>
            <div className="text-sm opacity-90"><span className="font-bold">300</span> points to rank up</div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-bold">{yourEntry.score}</div>
              <div className="text-xs opacity-90">Score</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-bold">{yourEntry.signsLearned}</div>
              <div className="text-xs opacity-90">Signs</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-bold">{yourEntry.accuracy}%</div>
              <div className="text-xs opacity-90">Accuracy</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="text-2xl font-bold">{yourEntry.streak}</div>
              <div className="text-xs opacity-90">Streak</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">

          {/* Podium */}
          <div className="bg-linear-to-br from-yellow-50 to-orange-50 p-8 border-b-2 border-gray-200">
            <div className="flex items-end justify-center gap-8 max-w-4xl mx-auto">

              {/* 2nd */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-10 h-10 text-gray-700" />
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="font-semibold text-gray-900 mb-1">{globalLeaderboard[1].name}</div>
                  <div className="text-sm text-gray-600">{globalLeaderboard[1].score} pts</div>
                </div>
              </div>

              {/* 1st */}
              <div className="flex-1 text-center -translate-y-4">
                <div className="w-24 h-24 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <div className="bg-white rounded-xl p-6 shadow-2xl border-2 border-yellow-400">
                  <div className="text-3xl font-bold text-yellow-600">1</div>
                  <div className="font-bold text-gray-900 mb-1 text-lg">{globalLeaderboard[0].name}</div>
                  <div className="text-sm text-gray-600">{globalLeaderboard[0].score} pts</div>
                </div>
              </div>

              {/* 3rd */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Medal className="w-10 h-10 text-orange-900" />
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-orange-300">
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="font-semibold text-gray-900 mb-1">{globalLeaderboard[2].name}</div>
                  <div className="text-sm text-gray-600">{globalLeaderboard[2].score} pts</div>
                </div>
              </div>

            </div>
          </div>

          {/* Rankings */}
          <div className="divide-y divide-gray-200">
            {globalLeaderboard.slice(3).map((entry) => (
              <div
                key={entry.rank}
                className={`p-4 transition-colors ${
                  entry.isYou ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    entry.isYou ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {entry.rank}
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{entry.name}</div>
                    <div className="text-sm text-gray-600">{entry.signsLearned} signs learned</div>
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{entry.accuracy}%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{entry.streak}</div>
                      <div className="text-xs text-gray-600">Streak</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{entry.score}</div>
                    <div className="text-xs text-gray-600">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </main>
    </div>
  );
}
