import Navbar from "../components/Navbar";

export default function Home() {
  const dailyProgress = 0;

  const quickActions = [
    "Continue Lesson",
    "Camera Practice",
    "Sign Memory",
    "Sign Dictionary",
    "Sign Battle",
    "Translator",
  ];

  const squareColors = [
    "bg-red-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-purple-400",
    "bg-pink-400",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Home" />

      <main className="flex flex-col items-center mt-8 px-4">
        <div className="w-full max-w-6xl rounded-xl px-10 py-8 min-h-[300px] bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-90">
          <h2 className="text-white font-bold text-4xl">Welcome Back, User!</h2>
          <p className="text-white text-lg mt-2">Keep up the great work!</p>

          <div className="flex justify-center gap-6 mt-6 flex-wrap">
            <div className="bg-blue-500 bg-opacity-80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Signs Learned</p>
              <p className="text-white text-2xl font-bold">(10/100)</p>
            </div>
            <div className="bg-blue-500 bg-opacity-80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Total Score</p>
              <p className="text-white text-2xl font-bold">0</p>
            </div>
            <div className="bg-blue-500 bg-opacity-80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Accuracy</p>
              <p className="text-white text-2xl font-bold">100%</p>
            </div>
            <div className="bg-blue-500 bg-opacity-80 rounded-xl px-6 py-4 text-left w-40">
              <p className="text-white text-sm">Streak</p>
              <p className="text-white text-2xl font-bold">1 days</p>
            </div>
          </div>

          <div className="w-full mt-8">
            <div className="flex justify-between mb-2 text-white font-medium">
              <span>Daily Goal Progress</span>
              <span>{dailyProgress}/5 activities</span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-80 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full"
                style={{ width: `${(dailyProgress / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mt-8 text-left">
          <h3 className="text-2xl font-bold text-gray-800">Quick Actions</h3>
        </div>

        <div className="w-full max-w-6xl mt-4 grid grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="relative bg-white border-2 border-gray-200 rounded-xl h-32 flex flex-col justify-end items-start px-4 cursor-pointer hover:shadow-lg transition"
            >
              <div
                className={`absolute top-4 left-4 w-8 h-8 rounded-md ${squareColors[index]}`}
              />
              <span className="text-gray-700 font-bold mb-4">{action}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-6xl mt-8 text-left mb-[250px]">
          <h3 className="text-2xl font-bold text-gray-800">Recent Achievements</h3>
        </div>
      </main>
    </div>
  );
}