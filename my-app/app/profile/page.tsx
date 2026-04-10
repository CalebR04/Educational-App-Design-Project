import Navbar from "../../components/Navbar";
import { User, Award, Target, Flame, Calendar, Trophy, Star, Lock } from "lucide-react";

const badges = [
  { id: "first-sign", name: "First Steps", description: "Learn your first ASL sign", icon: Star, color: "from-blue-400 to-blue-600", unlocked: true, unlockedDate: "Jan 15, 2026" },
  { id: "50-signs", name: "Half Century", description: "Learn 50 ASL signs", icon: Target, color: "from-yellow-400 to-orange-500", unlocked: true, unlockedDate: "Jan 28, 2026" },
  { id: "week-streak", name: "Week Warrior", description: "Maintain a 7-day streak", icon: Flame, color: "from-green-400 to-emerald-500", unlocked: true, unlockedDate: "Feb 3, 2026" },
  { id: "75-accuracy", name: "Sharp Shooter", description: "Reach 75% accuracy", icon: Target, color: "from-blue-400 to-indigo-500", unlocked: true, unlockedDate: "Feb 1, 2026" },
  { id: "100-signs", name: "Century Club", description: "Master 100 ASL signs", icon: Trophy, color: "from-purple-400 to-purple-600", unlocked: false },
  { id: "month-streak", name: "Monthly Master", description: "Maintain a 30-day streak", icon: Flame, color: "from-orange-400 to-red-600", unlocked: false },
  { id: "90-accuracy", name: "Precision Pro", description: "Reach 90% accuracy", icon: Target, color: "from-pink-400 to-pink-600", unlocked: false },
  { id: "game-master", name: "Game Master", description: "Win 100 mini-games", icon: Trophy, color: "from-indigo-400 to-purple-600", unlocked: false },
];

const milestones = [
  { value: 67, max: 100, label: "Signs Learned", color: "bg-blue-500" },
  { value: 78, max: 85, label: "Target Accuracy", color: "bg-green-500" },
  { value: 2340, max: 5000, label: "Score Goal", color: "bg-purple-500" },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Profile" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Timothy</h2>
              <p className="text-blue-100 mb-4">ASL Learner since January 2024</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="text-2xl font-bold">67</div>
                  <div className="text-xs opacity-90">Signs Learned</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="text-2xl font-bold">2,340</div>
                  <div className="text-xs opacity-90">Total Score</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-xs opacity-90">Accuracy</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                  <div className="text-2xl font-bold">7</div>
                  <div className="text-xs opacity-90">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Progress Milestones */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Progress Milestones
              </h3>
              <div className="space-y-6">
                {milestones.map((milestone) => (
                  <div key={milestone.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{milestone.label}</span>
                      <span className="text-sm text-gray-600">{milestone.value} / {milestone.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${milestone.color} rounded-full h-3 transition-all`}
                        style={{ width: `${(milestone.value / milestone.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Badges & Achievements
                </h3>
                <span className="text-sm text-gray-600">
                  {badges.filter(b => b.unlocked).length} / {badges.length} unlocked
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`relative rounded-xl p-4 text-center ${
                        badge.unlocked ? `bg-linear-to-br ${badge.color} text-white` : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {!badge.unlocked && (
                        <div className="absolute top-2 right-2">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-bold text-sm mb-1">{badge.name}</div>
                      <div className="text-xs opacity-90 line-clamp-2">{badge.description}</div>
                      {badge.unlocked && badge.unlockedDate && (
                        <div className="text-xs opacity-75 mt-2">{badge.unlockedDate}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Global Rank</div>
                    <div className="font-bold text-gray-900">#42</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Games Won</div>
                    <div className="font-bold text-gray-900">35</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Best Streak</div>
                    <div className="font-bold text-gray-900">12 days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Days Active</div>
                    <div className="font-bold text-gray-900">21</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <Target className="w-12 h-12 mb-4" />
              <h3 className="font-bold text-xl mb-2">Next Milestone</h3>
              <p className="text-sm opacity-90 mb-4">
                33 more signs to reach 100 and unlock the Century Club badge!
              </p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white rounded-full h-2" style={{ width: "67%" }} />
              </div>
              <div className="text-xs opacity-90">67% complete</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
