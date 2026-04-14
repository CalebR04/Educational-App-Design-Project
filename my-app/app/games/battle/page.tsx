"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { Swords, Plus, LogIn, Globe, Lock, X, Users, RefreshCw } from "lucide-react";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type PublicLobby = { code: string; host_name: string; player_count: number; round_count: number };

export default function BattleLobbyHome() {
  const router = useRouter();
  const [joinCode,    setJoinCode]    = useState("");
  const [isPublic,    setIsPublic]    = useState(false);
  const [creating,    setCreating]    = useState(false);
  const [joining,     setJoining]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [userId,      setUserId]      = useState<string | null>(null);
  const [showHelp,    setShowHelp]    = useState(false);
  const [publicLobbies, setPublicLobbies] = useState<PublicLobby[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user && !user.is_anonymous) setUserId(user.id);
    });
    fetchPublicLobbies();
  }, []);

  async function fetchPublicLobbies() {
    setLoadingPublic(true);
    const supabase = createClient();

    const { data: lobbies } = await supabase
      .from("battle_lobbies")
      .select("code, host_id, round_count")
      .eq("status", "waiting")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!lobbies || lobbies.length === 0) { setPublicLobbies([]); setLoadingPublic(false); return; }

    const hostIds = [...new Set(lobbies.map((l: any) => l.host_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username")
      .in("id", hostIds);

    const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]));

    setPublicLobbies(lobbies.map((r: any) => ({
      code: r.code,
      host_name: profileMap[r.host_id]?.username || profileMap[r.host_id]?.full_name || "Unknown",
      player_count: 1,
      round_count: r.round_count,
    })));
    setLoadingPublic(false);
  }

  async function handleCreate() {
    if (!userId) { setError("You must be signed in to create a lobby."); return; }
    setCreating(true);
    setError(null);
    const supabase = createClient();

    let code = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      code = generateCode();
      const { data: existing } = await supabase
        .from("battle_lobbies").select("id").eq("code", code).maybeSingle();
      if (!existing) break;
    }

    const { error: err } = await supabase
      .from("battle_lobbies")
      .insert({ code, host_id: userId, status: "waiting", round_count: 7, is_public: isPublic });

    if (err) { setError("Failed to create lobby. Try again."); setCreating(false); return; }
    router.push(`/games/battle/${code}`);
  }

  async function handleJoin(codeOverride?: string) {
    const code = (codeOverride ?? joinCode).trim().toUpperCase();
    if (code.length !== 4) { setError("Enter a 4-character room code."); return; }
    if (!userId) { setError("You must be signed in to join a lobby."); return; }
    setJoining(true);
    setError(null);
    const supabase = createClient();

    const { data: lobby } = await supabase
      .from("battle_lobbies").select("status").eq("code", code).single();

    if (!lobby) { setError("Room not found. Check the code and try again."); setJoining(false); return; }
    if (lobby.status !== "waiting") { setError("This game has already started."); setJoining(false); return; }

    router.push(`/games/battle/${code}`);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar active="Games" />

      <main className="max-w-2xl mx-auto px-4 py-5">

        {/* Compact hero */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-linear-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Sign Battle</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Up to 4 players · identify ASL signs fastest</p>
          </div>
          {/* ? help button */}
          <button
            onClick={() => setShowHelp(true)}
            className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 transition text-sm shrink-0"
          >
            ?
          </button>
        </div>

        {/* Create + Join side by side */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Create */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Create Lobby</h2>
            </div>

            {/* Public / Private toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border-2 transition ${!isPublic ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"}`}
              >
                <Lock className="w-3.5 h-3.5" /> Private
              </button>
              <button
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border-2 transition ${isPublic ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"}`}
              >
                <Globe className="w-3.5 h-3.5" /> Public
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {isPublic ? "Anyone can find and join your lobby." : "Only players with your code can join."}
            </p>

            <button
              onClick={handleCreate}
              disabled={creating || !userId}
              className="w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating…" : "Create Lobby"}
            </button>
          </div>

          {/* Join by code */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Join by Code</h2>
            </div>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              placeholder="ABCD"
              maxLength={4}
              className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest mb-4 outline-none focus:border-blue-500 transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => handleJoin()}
              disabled={joining || !userId || joinCode.length !== 4}
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? "Joining…" : "Join Lobby"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-xl p-3 text-center text-red-600 dark:text-red-400 font-semibold text-sm mb-4">
            {error}
          </div>
        )}
        {!userId && (
          <p className="text-center text-sm text-gray-400 mb-4">Sign in to create or join a lobby.</p>
        )}

        {/* Public lobbies */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-500" /> Open Lobbies
            </h3>
            <button onClick={fetchPublicLobbies} className="text-gray-400 hover:text-blue-500 transition">
              <RefreshCw className={`w-4 h-4 ${loadingPublic ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingPublic ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
            </div>
          ) : publicLobbies.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">No open lobbies right now. Create one!</p>
          ) : (
            <div className="space-y-2">
              {publicLobbies.map(lobby => (
                <button
                  key={lobby.code}
                  onClick={() => handleJoin(lobby.code)}
                  disabled={!userId || joining}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{lobby.host_name}'s lobby</p>
                    <p className="text-xs text-gray-400">{lobby.round_count} rounds</p>
                  </div>
                  <span className="font-mono font-bold text-gray-500 dark:text-gray-400 text-sm shrink-0">{lobby.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* How to play modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">How to Play</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-6">
              <p>Watch the ASL sign video and identify it before your opponents can!</p>
              <ul className="space-y-2 list-none">
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">1.</span>A sign video plays — watch it closely.</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">2.</span>Pick the correct word from 4 options.</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">3.</span>Scores are revealed after each round.</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">4.</span>Most points after all rounds wins!</li>
              </ul>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full rounded-2xl bg-linear-to-r from-orange-500 to-red-600 py-3 font-bold text-white hover:opacity-90 transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
