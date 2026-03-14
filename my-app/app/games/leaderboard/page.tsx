import Navbar from "../../../components/Navbar";
import Link from "next/link";

export default function LeaderboardPage() {

  const players = [
    { rank: 1, name: "SignMaster_Pro", score: 15000 },
    { rank: 2, name: "ASL_Guru", score: 14200 },
    { rank: 3, name: "HandTalker", score: 13950 },
    { rank: 4, name: "SilentWave", score: 13500 },
    { rank: 5, name: "GestureKing", score: 12900 },
    { rank: 6, name: "Signify", score: 12000 },
    { rank: 7, name: "Trendy", score: 11850 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Games" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">

        {/* Page Title */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900">Game Center</h1>
          <p className="text-gray-500 mt-1">
            Play games and compete with learners worldwide
          </p>
        </section>

        {/* Tabs */}
        <section className="mt-6 flex gap-6 border-b pb-2 text-sm font-medium">
          <Link href="/games" className="text-gray-500 hover:text-black">
            Games
          </Link>

          <span className="text-blue-600 border-b-2 border-blue-600 pb-2">
            Leaderboard
          </span>
        </section>

        {/* Rank Card */}
        <section className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold">#42</h2>

          <div className="grid grid-cols-3 gap-6 mt-4">
            <div>
              <p className="text-sm">Total Score</p>
              <p className="text-2xl font-bold">2340</p>
            </div>

            <div>
              <p className="text-sm">Signs Learned</p>
              <p className="text-2xl font-bold">67</p>
            </div>

            <div>
              <p className="text-sm">Accuracy</p>
              <p className="text-2xl font-bold">78%</p>
            </div>
          </div>
        </section>

        {/* Top Players */}
        <section className="mt-6 grid grid-cols-3 gap-6">

          <div className="bg-gray-100 p-6 rounded-xl text-center">
            <p className="text-lg font-bold">2</p>
            <p className="font-semibold">ASL_Guru</p>
            <p className="text-sm text-gray-500">14200</p>
          </div>

          <div className="bg-yellow-200 p-6 rounded-xl text-center shadow-lg">
            <p className="text-lg font-bold">1</p>
            <p className="font-semibold">SignMaster_Pro</p>
            <p className="text-sm text-gray-500">15000</p>
          </div>

          <div className="bg-orange-200 p-6 rounded-xl text-center">
            <p className="text-lg font-bold">3</p>
            <p className="font-semibold">HandTalker</p>
            <p className="text-sm text-gray-500">13950</p>
          </div>

        </section>

        {/* Full Leaderboard */}
        <section className="mt-8 bg-gray-50 rounded-xl border">

          {players.map((player) => (
            <div
              key={player.rank}
              className="flex justify-between items-center px-6 py-4 border-b last:border-none"
            >
              <div className="flex gap-4 items-center">
                <span className="font-bold text-gray-600">
                  {player.rank}
                </span>

                <span className="font-medium">
                  {player.name}
                </span>
              </div>

              <span className="font-semibold text-gray-700">
                {player.score}
              </span>
            </div>
          ))}

        </section>

      </main>
    </div>
  );
}