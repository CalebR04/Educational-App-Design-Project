import Navbar from "../components/Navbar";

export default function Home() {
  const dailyProgress = 0;

  const quickActions = [
    {
      title: "Continue Lesson",
      subtitle: "Numbers 1-100 • 65%",
      icon: "🎓",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
    },
    {
      title: "Camera Practice",
      subtitle: "Live hand detection",
      icon: "📷",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    {
      title: "Sign Memory",
      subtitle: "Match sign pairs",
      icon: "🧠",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
    },
    {
      title: "Sign Dictionary",
      subtitle: "Search 100+ signs",
      icon: "📖",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
    },
    {
      title: "Sign Battle",
      subtitle: "Race opponents",
      icon: "⚡",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
    },
    {
      title: "Translator",
      subtitle: "Sign to text & back",
      icon: "🈯",
      iconBg: "bg-pink-100",
      iconText: "text-pink-600",
    },
  ];

  const achievements = [
    {
      title: "First 50 Signs!",
      subtitle: "Unlocked 2 days ago",
      icon: "🏅",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      title: "Week Warrior",
      subtitle: "7-day streak achieved!",
      icon: "🔥",
      gradient: "from-emerald-400 to-green-500",
    },
    {
      title: "Sharp Shooter",
      subtitle: "75% accuracy milestone",
      icon: "🎯",
      gradient: "from-blue-400 to-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Home" />

      <main className="flex flex-col items-center mt-8 px-4 pb-12">
        <div className="w-full max-w-6xl rounded-xl px-10 py-8 min-h-[300px] bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-white font-bold text-4xl">Welcome Back, User!</h2>
          <p className="text-white text-lg mt-2">Keep up the great work!</p>

          <div className="flex justify-center gap-6 mt-6 flex-wrap">
            <div className="bg-blue-500/80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Signs Learned</p>
              <p className="text-white text-2xl font-bold">(10/100)</p>
            </div>
            <div className="bg-blue-500/80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Total Score</p>
              <p className="text-white text-2xl font-bold">0</p>
            </div>
            <div className="bg-blue-500/80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Accuracy</p>
              <p className="text-white text-2xl font-bold">100%</p>
            </div>
            <div className="bg-blue-500/80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Streak</p>
              <p className="text-white text-2xl font-bold">1 days</p>
            </div>
          </div>

          <div className="w-full mt-8">
            <div className="flex justify-between mb-2 text-white font-medium">
              <span>Daily Goal Progress</span>
              <span>{dailyProgress}/5 activities</span>
            </div>
            <div className="w-full bg-blue-400/80 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full"
                style={{ width: `${(dailyProgress / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mt-8 text-left">
          <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
        </div>

        <div className="w-full max-w-6xl mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="rounded-2xl border-2 border-gray-200 bg-white px-6 py-6 min-h-[160px] hover:shadow-md transition"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${action.iconBg} ${action.iconText}`}
              >
                {action.icon}
              </div>

              <h4 className="mt-6 text-2xl font-bold text-gray-900">
                {action.title}
              </h4>
              <p className="mt-2 text-lg text-gray-600">{action.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="w-full max-w-6xl mt-10 text-left">
          <h3 className="text-2xl font-bold text-gray-900">Recent Achievements</h3>
        </div>

        <div className="w-full max-w-6xl mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              className={`rounded-2xl bg-gradient-to-r ${achievement.gradient} px-6 py-6 text-white min-h-[140px]`}
            >
              <div className="text-3xl">{achievement.icon}</div>
              <h4 className="mt-6 text-2xl font-bold">{achievement.title}</h4>
              <p className="mt-2 text-lg text-white/90">{achievement.subtitle}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}