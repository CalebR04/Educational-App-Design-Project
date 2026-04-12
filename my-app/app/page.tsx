"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";
import ContinueLessonButton from "../components/ContinueLessonButton";
import { BookOpen, Gamepad2, Target, Trophy, TrendingUp, Flame, Award, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUserStats, type UserStats } from "@/lib/supabase/userStats";
import { type AchievementDef, buildHomeSlots } from "@/data/achievements";

export default function Home() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats().then(s => { setStats(s); setLoading(false); });
  }, []);

  const signsLearned = stats?.signsLearned ?? 0;
  const totalScore   = stats?.totalScore   ?? 0;
  const accuracy     = stats?.accuracy ?? null;
  const streak       = stats?.streak       ?? 0;

  const achievementSlots = buildHomeSlots(stats);
  const hasAnyAchievement = achievementSlots.some(s => s !== null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Home" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (wider): Welcome Banner + Recent Achievements */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Welcome Banner */}
            <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-blue-100 mb-4">Keep up the great work!</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Target className="w-4 h-4" />, label: "Signs Learned", value: `${signsLearned}` },
                  { icon: <Trophy className="w-4 h-4" />, label: "Total Score",    value: totalScore.toLocaleString() },
                  { icon: <TrendingUp className="w-4 h-4" />, label: "Accuracy",  value: accuracy !== null ? `${accuracy}%` : "--%"  },
                  { icon: <Flame className="w-4 h-4" />, label: "Streak",         value: `${streak} ${streak === 1 ? "day" : "days"}` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {icon}
                      <span className="text-sm opacity-90">{label}</span>
                    </div>
                    {loading
                      ? <div className="h-7 w-16 bg-white/30 animate-pulse rounded mt-1" />
                      : <p className="text-xl font-bold">{value}</p>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h3>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-28" />
                  ))}
                </div>
              ) : !hasAnyAchievement ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                  <Award className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-semibold text-gray-500">Keep working towards your first achievement!</p>
                  <p className="text-sm mt-1">Complete lessons and play games to earn badges.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {achievementSlots.filter(a => a !== null).map(achievement => (
                    <AchievementBox key={achievement!.id} achievement={achievement!} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Quick Actions */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <ContinueLessonButton />
              <Link
                href="/games/combos"
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left group block cursor-pointer"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                  <Gamepad2 className="w-6 h-6 text-purple-600 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Sign Combo</h4>
                <p className="text-sm text-gray-600">Build sign sequences</p>
              </Link>
              <Link
                href="/dictionary"
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-lg transition-all text-left group block cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Dictionary</h4>
                <p className="text-sm text-gray-600">Browse all signs</p>
              </Link>
              <Link
                href="/lessons/sign-practice"
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 hover:shadow-lg transition-all text-left group block cursor-pointer"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                  <Dumbbell className="w-6 h-6 text-orange-600 group-hover:text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Sign Practice</h4>
                <p className="text-sm text-gray-600">Improve your skills</p>
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function AchievementBox({ achievement }: { achievement: AchievementDef }) {
  return (
    <div className={`bg-linear-to-br ${achievement.gradient} rounded-xl p-4 text-white flex flex-col items-center text-center gap-2`}>
      <Trophy className="w-7 h-7 shrink-0" />
      <p className="text-xs font-bold leading-tight">{achievement.title}</p>
      <p className="text-xs opacity-80 leading-tight">{achievement.subtitle}</p>
    </div>
  );
}
