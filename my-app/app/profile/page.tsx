"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { User, Award, Flame, Trophy, Lock, Target } from "lucide-react";
import { fetchUserStats, type UserStats } from "@/lib/supabase/userStats";
import { createClient } from "@/lib/supabase/client";
import { ALL_ACHIEVEMENTS, CATEGORY_META } from "@/data/achievements";

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats().then(s => { setStats(s); setLoading(false); });
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      if (user.created_at) {
        const d = new Date(user.created_at);
        setJoinedDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();
      setAvatarUrl(profile?.avatar_url ?? null);
    });
  }, []);

  const signsLearned = stats?.signsLearned ?? 0;
  const totalScore   = stats?.totalScore   ?? 0;
  const accuracy     = stats?.accuracy ?? null;
  const streak       = stats?.streak       ?? 0;
  const displayName  = stats?.displayName  ?? "";

  const badges = stats
    ? ALL_ACHIEVEMENTS.map(a => ({ ...a, isUnlocked: a.unlocked(stats) }))
    : ALL_ACHIEVEMENTS.map(a => ({ ...a, isUnlocked: false }));

  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  const nextMilestone = signsLearned < 50
    ? { goal: 50,  label: "signs to reach 50 and unlock Half Century!" }
    : signsLearned < 105
    ? { goal: 105, label: "signs to reach 105 and unlock Sign Master!" }
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar active="Profile" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                : <User className="w-12 h-12" />
              }
            </div>
            <div className="flex-1">
              {loading
                ? <div className="h-9 w-40 bg-white/30 animate-pulse rounded mb-2" />
                : <h2 className="text-3xl font-bold mb-2">{displayName || "Learner"}</h2>
              }
              {loading
                ? <div className="h-4 w-52 bg-white/20 animate-pulse rounded mb-4" />
                : <p className="text-blue-100 mb-4">ASL Learner since {joinedDate || "..."}</p>
              }
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Signs Learned", value: `${signsLearned}` },
                  { label: "Total Score",   value: totalScore.toLocaleString() },
                  { label: "Accuracy",      value: accuracy !== null ? `${accuracy}%` : "–%" },
                  { label: "Day Streak",    value: `${streak}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-xs opacity-90 mb-1">{label}</div>
                    {loading
                      ? <div className="h-7 w-16 bg-white/30 animate-pulse rounded" />
                      : <div className="text-2xl font-bold">{value}</div>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Badges */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Badges & Achievements
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{unlockedCount} / {badges.length} unlocked</span>
              </div>

              {(["streak", "signs", "accuracy", "games", "highscore"] as const).map(category => {
                const categoryBadges = badges.filter(b => b.category === category);
                return (
                  <div key={category} className="mb-6 last:mb-0">
                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      {CATEGORY_META[category].label}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {categoryBadges.map(badge => (
                        <div
                          key={badge.id}
                          className={`relative rounded-xl p-4 text-center ${
                            badge.isUnlocked
                              ? `bg-linear-to-br ${badge.gradient} text-white`
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {!badge.isUnlocked && (
                            <div className="absolute top-2 right-2">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <Trophy className={`w-7 h-7 mx-auto mb-2 ${badge.isUnlocked ? "" : "opacity-30"}`} />
                          <div className="font-bold text-xs mb-1 leading-tight">{badge.title}</div>
                          <div className="text-xs opacity-80 leading-tight">{badge.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="space-y-4">
                {[
                  { label: "Games Played",       value: stats?.gamesPlayed ?? 0,  bg: "bg-purple-50 dark:bg-purple-900/30", iconBg: "bg-purple-500", icon: <Trophy className="w-5 h-5 text-white" /> },
                  { label: "Longest Streak",      value: `${streak} ${streak === 1 ? "day" : "days"}`, bg: "bg-green-50 dark:bg-green-900/30",  iconBg: "bg-green-500",  icon: <Flame className="w-5 h-5 text-white" /> },
                  { label: "Memory High Score",   value: stats?.memoryHigh ?? 0,  bg: "bg-sky-50 dark:bg-sky-900/30",    iconBg: "bg-sky-500",    icon: <Trophy className="w-5 h-5 text-white" /> },
                  { label: "Combos High Score",   value: stats?.comboHigh ?? 0,   bg: "bg-violet-50 dark:bg-violet-900/30", iconBg: "bg-violet-500", icon: <Trophy className="w-5 h-5 text-white" /> },
                  { label: "Battle High Score",   value: stats?.battleHigh ?? 0,  bg: "bg-orange-50 dark:bg-orange-900/30", iconBg: "bg-orange-500", icon: <Trophy className="w-5 h-5 text-white" /> },
                ].map(({ label, value, bg, iconBg, icon }) => (
                  <div key={label} className={`flex items-center gap-3 p-3 ${bg} rounded-lg`}>
                    <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                      {icon}
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
                      {loading
                        ? <div className="h-5 w-12 bg-gray-200 dark:bg-gray-600 animate-pulse rounded mt-1" />
                        : <div className="font-bold text-gray-900 dark:text-white">{value}</div>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {nextMilestone && (
              <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                <Target className="w-12 h-12 mb-4" />
                <h3 className="font-bold text-xl mb-2">Next Milestone</h3>
                <p className="text-sm opacity-90 mb-4">
                  {nextMilestone.goal - signsLearned} more {nextMilestone.label}
                </p>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(100, (signsLearned / nextMilestone.goal) * 100)}%` }}
                  />
                </div>
                <div className="text-xs opacity-90">
                  {Math.round((signsLearned / nextMilestone.goal) * 100)}% complete
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
