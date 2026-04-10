import Navbar from "../components/Navbar";
import Link from "next/link";
import ContinueLessonButton from "../components/ContinueLessonButton";
import { BookOpen, Gamepad2, Target, Trophy, TrendingUp, Flame, Award } from "lucide-react";

export default function Home() {
  const dailyProgress = 0;

  const achievements = [
    {
      title: "First 50 Signs!",
      subtitle: "Unlocked 2 days ago",
      icon: Award,
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      title: "Week Warrior",
      subtitle: "7-day streak achieved!",
      icon: Flame,
      gradient: "from-green-400 to-emerald-500",
    },
    {
      title: "Sharp Shooter",
      subtitle: "75% accuracy milestone",
      icon: Target,
      gradient: "from-blue-400 to-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Home" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Welcome Banner and Quick Actions */}
          <div>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-blue-100 mb-4">Keep up the great work!</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-sm opacity-90">Signs Learned</span>
                  </div>
                  <p className="text-xl font-bold">10/100</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm opacity-90">Total Score</span>
                  </div>
                  <p className="text-xl font-bold">0</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm opacity-90">Accuracy</span>
                  </div>
                  <p className="text-xl font-bold">100%</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm opacity-90">Streak</span>
                  </div>
                  <p className="text-xl font-bold">1 day</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Daily Goal Progress</span>
                  <span className="text-sm font-semibold">{dailyProgress}/5 activities</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all"
                    style={{ width: `${(dailyProgress / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          </div>

          {/* Right Column: Recent Achievements */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-1 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.title}
                    className={`bg-gradient-to-br ${achievement.gradient} rounded-xl p-6 text-white`}
                  >
                    <Icon className="w-8 h-8 mb-3" />
                    <h4 className="font-bold mb-1">{achievement.title}</h4>
                    <p className="text-sm opacity-90">{achievement.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
