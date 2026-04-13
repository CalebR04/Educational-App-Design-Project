"use client";

import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { Trophy, Medal, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  gamesPlayed: number;
  streak: number;
  avatarUrl: string | null;
  isYou: boolean;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [yourEntry, setYourEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const myId = user?.is_anonymous ? null : user?.id ?? null;

      const { data: rows } = await supabase
        .from("profiles")
        .select("id, full_name, username, total_game_score, games_played, login_streak, avatar_url")
        .order("total_game_score", { ascending: false })
        .limit(100);

      if (!rows) { setLoading(false); return; }

      const built: LeaderboardEntry[] = rows.map((row, i) => ({
        rank: i + 1,
        name: row.username || row.full_name || "Anonymous",
        score: row.total_game_score ?? 0,
        gamesPlayed: row.games_played ?? 0,
        streak: row.login_streak ?? 0,
        avatarUrl: row.avatar_url ?? null,
        isYou: row.id === myId,
      }));

      setEntries(built);
      setYourEntry(built.find(e => e.isYou) ?? null);
      setLoading(false);
    }
    load();
  }, []);

  const top3   = entries.slice(0, 3);
  const rest   = entries.slice(3);
  // If user is outside top 7, show them separately at the bottom
  const visibleRest = rest.slice(0, 7);
  const yourEntryBelow = yourEntry && yourEntry.rank > 10 ? yourEntry : null;

  const pointsToRankUp = yourEntry
    ? (entries[yourEntry.rank - 2]?.score ?? yourEntry.score) - yourEntry.score
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Games" />

      <main className="max-w-7xl mx-auto px-4 py-4">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Leaderboard</h1>
          <p className="text-gray-600">Compete with learners from around the world</p>
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-2 mb-4 border-b-2 border-gray-200">
          <Link href="/games" className="px-6 py-2 font-bold text-lg text-gray-600 hover:text-gray-900 transition-all">
            Games
          </Link>
          <span className="px-6 py-2 font-bold text-lg text-blue-600 relative">
            Leaderboard
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          </span>
        </div>

        {/* Your Rank Card */}
        {loading ? (
          <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8 animate-pulse">
            <div className="h-4 w-32 bg-white/30 rounded mb-2" />
            <div className="h-12 w-24 bg-white/30 rounded mb-4" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/20 rounded-lg p-3 h-16" />
              ))}
            </div>
          </div>
        ) : yourEntry ? (
          <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Your Current Rank</div>
                <div className="text-5xl font-bold">#{yourEntry.rank}</div>
              </div>
              {yourEntry.rank > 1 && (
                <div className="text-sm opacity-90">
                  <span className="font-bold">{pointsToRankUp.toLocaleString()}</span> points to rank up
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                <div className="text-2xl font-bold">{yourEntry.score.toLocaleString()}</div>
                <div className="text-xs opacity-90">Score</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                <div className="text-2xl font-bold">{yourEntry.gamesPlayed}</div>
                <div className="text-xs opacity-90">Games</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                <div className="text-2xl font-bold">{yourEntry.streak}</div>
                <div className="text-xs opacity-90">Streak</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-8 text-center">
            <p className="font-semibold opacity-90">Sign in to see your rank</p>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">

          {/* Podium */}
          <div className="bg-linear-to-br from-yellow-50 to-orange-50 p-8 border-b-2 border-gray-200">
            <div className="flex items-end justify-center gap-8 max-w-4xl mx-auto">

              {/* 2nd */}
              <div className="flex-1 text-center">
                {loading
                  ? <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mx-auto mb-3" />
                  : <AvatarCircle entry={top3[1] ?? null} size="md" />
                }
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300">
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  {loading ? (
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mx-auto my-1" />
                  ) : (
                    <div className="font-semibold text-gray-900 mb-1 truncate">{top3[1]?.name ?? "—"}</div>
                  )}
                  <div className="text-sm text-gray-600">{loading ? "—" : `${(top3[1]?.score ?? 0).toLocaleString()} pts`}</div>
                </div>
              </div>

              {/* 1st */}
              <div className="flex-1 text-center -translate-y-4">
                {loading
                  ? <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mx-auto mb-3" />
                  : <AvatarCircle entry={top3[0] ?? null} size="lg" gold />
                }
                <div className="bg-white rounded-xl p-6 shadow-2xl border-2 border-yellow-400">
                  <div className="text-3xl font-bold text-yellow-600">1</div>
                  {loading ? (
                    <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mx-auto my-1" />
                  ) : (
                    <div className="font-bold text-gray-900 mb-1 text-lg truncate">{top3[0]?.name ?? "—"}</div>
                  )}
                  <div className="text-sm text-gray-600">{loading ? "—" : `${(top3[0]?.score ?? 0).toLocaleString()} pts`}</div>
                </div>
              </div>

              {/* 3rd */}
              <div className="flex-1 text-center">
                {loading
                  ? <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mx-auto mb-3" />
                  : <AvatarCircle entry={top3[2] ?? null} size="md" bronze />
                }
                <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-orange-300">
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  {loading ? (
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mx-auto my-1" />
                  ) : (
                    <div className="font-semibold text-gray-900 mb-1 truncate">{top3[2]?.name ?? "—"}</div>
                  )}
                  <div className="text-sm text-gray-600">{loading ? "—" : `${(top3[2]?.score ?? 0).toLocaleString()} pts`}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Rankings 4+ */}
          <div className="divide-y divide-gray-200">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                    <div className="h-7 w-16 bg-gray-200 rounded" />
                  </div>
                ))
              : visibleRest.map((entry) => (
                  <RankRow key={entry.rank} entry={entry} />
                ))
            }

            {/* Current user below top 10 */}
            {yourEntryBelow && !loading && (
              <>
                <div className="px-4 py-2 text-center text-xs text-gray-400 bg-gray-50">• • •</div>
                <RankRow entry={yourEntryBelow} />
              </>
            )}
          </div>

          {!loading && entries.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No scores yet. Be the first!</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

function AvatarCircle({
  entry,
  size,
  gold,
  bronze,
}: {
  entry: LeaderboardEntry | null;
  size: "md" | "lg";
  gold?: boolean;
  bronze?: boolean;
}) {
  const dim     = size === "lg" ? "w-24 h-24" : "w-20 h-20";
  const iconDim = size === "lg" ? "w-12 h-12" : "w-10 h-10";
  const bg      = gold   ? "bg-linear-to-br from-yellow-400 to-yellow-600 shadow-xl"
                : bronze ? "bg-orange-300"
                :          "bg-gray-300";
  const iconColor = gold ? "text-white" : "text-gray-700";

  return (
    <div className={`${dim} ${bg} rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden`}>
      {entry?.avatarUrl ? (
        <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
      ) : gold ? (
        <Trophy className={`${iconDim} text-white`} />
      ) : (
        <Medal className={`${iconDim} ${iconColor}`} />
      )}
    </div>
  );
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`p-4 transition-colors ${
        entry.isYou ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
          entry.isYou ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
        }`}>
          {entry.rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">
            {entry.name}{entry.isYou && <span className="ml-2 text-xs font-semibold text-blue-500">(You)</span>}
          </div>
          <div className="text-sm text-gray-600">{entry.gamesPlayed} games played</div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm shrink-0">
          <div className="text-center">
            <div className="font-bold text-gray-900">{entry.streak}</div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-gray-900">{entry.score.toLocaleString()}</div>
          <div className="text-xs text-gray-600">points</div>
        </div>
      </div>
    </div>
  );
}
