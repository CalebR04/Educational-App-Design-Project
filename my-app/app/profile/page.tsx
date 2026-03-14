import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const badges = [
    {
      title: "First Signs",
      subtitle: "Learned 10 signs",
      color: "from-blue-500 to-blue-400",
      earned: true,
    },
    {
      title: "Fast Learner",
      subtitle: "3 day streak",
      color: "from-orange-500 to-orange-400",
      earned: true,
    },
    {
      title: "Video Explorer",
      subtitle: "Watched 25 videos",
      color: "from-green-500 to-emerald-400",
      earned: true,
    },
    {
      title: "Practice Warrior",
      subtitle: "5 practice sessions",
      color: "from-cyan-500 to-sky-400",
      earned: true,
    },
    {
      title: "Century Club",
      subtitle: "Learned 100 signs",
      color: "from-gray-200 to-gray-100",
      earned: false,
    },
    {
      title: "Monthly Master",
      subtitle: "30 day streak",
      color: "from-gray-200 to-gray-100",
      earned: false,
    },
    {
      title: "Precision Pro",
      subtitle: "95% accuracy",
      color: "from-gray-200 to-gray-100",
      earned: false,
    },
    {
      title: "Game Master",
      subtitle: "Win 50 games",
      color: "from-gray-200 to-gray-100",
      earned: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Navbar active="Profile" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">
        <section className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
              U
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold">Timothy</h1>
              <p className="mt-2 text-lg text-white/90">
                ASL learner since January 2024
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-blue-500/70 px-4 py-4">
                  <p className="text-sm text-white">Signs Learned</p>
                  <p className="text-2xl font-bold">67</p>
                </div>

                <div className="rounded-xl bg-blue-500/70 px-4 py-4">
                  <p className="text-sm text-white">Total Score</p>
                  <p className="text-2xl font-bold">2,340</p>
                </div>

                <div className="rounded-xl bg-blue-500/70 px-4 py-4">
                  <p className="text-sm text-white">Accuracy</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>

                <div className="rounded-xl bg-blue-500/70 px-4 py-4">
                  <p className="text-sm text-white">Streak</p>
                  <p className="text-2xl font-bold">7 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Progress Milestones
                </h2>
                <span className="text-sm text-gray-400">4 / 5 completed</span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Signs Learned</span>
                    <span className="text-gray-400">67 / 100</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div className="h-3 w-[67%] rounded-full bg-blue-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Target Accuracy</span>
                    <span className="text-gray-400">78% / 85%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div className="h-3 w-[78%] rounded-full bg-green-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Score Goal</span>
                    <span className="text-gray-400">2340 / 5000</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div className="h-3 w-[47%] rounded-full bg-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Badges & Achievements
                </h2>
                <span className="text-sm text-gray-400">4 / 8 earned</span>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {badges.map((badge) => (
                  <div
                    key={badge.title}
                    className="rounded-xl border border-gray-200 bg-white p-3 text-center"
                  >
                    <div
                      className={`mx-auto mb-3 flex h-16 w-full items-center justify-center rounded-lg bg-gradient-to-r ${
                        badge.earned ? badge.color : "from-gray-100 to-gray-50"
                      } ${badge.earned ? "text-white" : "text-gray-300"}`}
                    >
                      ★
                    </div>

                    <p
                      className={`text-sm font-bold ${
                        badge.earned ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {badge.title}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        badge.earned ? "text-gray-500" : "text-gray-300"
                      }`}
                    >
                      {badge.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Stats</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                  ○
                </div>
                <div>
                  <p className="text-xs text-gray-400">Global Rank</p>
                  <p className="text-sm font-bold">#42</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                  ▣
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current Rank</p>
                  <p className="text-sm font-bold">Rookie</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                  ↗
                </div>
                <div>
                  <p className="text-xs text-gray-400">Best Streak</p>
                  <p className="text-sm font-bold">12 days</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
                  ⏱
                </div>
                <div>
                  <p className="text-xs text-gray-400">Daily Active</p>
                  <p className="text-sm font-bold">2h</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}