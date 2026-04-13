"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { generateRounds, type BattleRound } from "@/data/battleSigns";
import { useSound } from "@/hooks/useSound";
import { addGameScore, updateGameHighScore } from "@/lib/supabase/userStats";
import { Trophy, Copy, Check, Crown, Snowflake, LogOut, Users, Play, X } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROUND_TIMEOUT_MS  = 12_000;
const FREEZE_MS         = 3_000;
const RESULT_DISPLAY_MS = 3_000;
const MAX_PLAYERS       = 4;

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = "loading" | "lobby" | "countdown" | "round" | "round_result" | "game_over";

type PlayerPresence = {
  userId:      string;
  displayName: string;
  avatarUrl:   string | null;
  isReady:     boolean;
};

type PlayerRoundResult = {
  answer:     string | null;
  reactionMs: number | null;
  correct:    boolean;
  points:     number;
};

type RoundResultPayload = {
  roundIndex:    number;
  correctAnswer: string;
  results:       Record<string, PlayerRoundResult>;
  updatedScores: Record<string, number>;
  frozenUntil:   Record<string, number>;
  winnerId:      string | null;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function BattleRoom() {
  const params   = useParams<{ code: string }>();
  const code     = params.code?.toUpperCase();
  const router   = useRouter();
  const { play, stop } = useSound();

  function handleLeave() {
    stop("theme_song");
    stop("correct");
    stop("incorrect");
    stop("combo");
    stop("level_complete");
    stop("game_over");
    router.push("/games/battle");
  }

  // My identity
  const [myUserId,      setMyUserId]      = useState<string | null>(null);
  const [myDisplayName, setMyDisplayName] = useState("Player");
  const [myAvatarUrl,   setMyAvatarUrl]   = useState<string | null>(null);

  // Lobby
  const [lobbyId,       setLobbyId]       = useState<string | null>(null);
  const [hostId,        setHostId]        = useState<string | null>(null);
  const [roundCount,    setRoundCount]    = useState(5);
  const [lobbyError,    setLobbyError]    = useState<string | null>(null);
  const [copied,        setCopied]        = useState(false);
  const [showLobbyHelp,    setShowLobbyHelp]    = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Players (presence)
  const [players,        setPlayers]        = useState<PlayerPresence[]>([]);
  const [playerLeftMsg,  setPlayerLeftMsg]  = useState<string | null>(null);

  // Game
  const [phase,           setPhase]          = useState<Phase>("loading");
  const [countdown,       setCountdown]      = useState(3);
  const [rounds,          setRounds]         = useState<BattleRound[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx]= useState(0);
  const [roundStartedAt,  setRoundStartedAt] = useState(0);
  const [myAnswer,        setMyAnswer]       = useState<string | null>(null);
  const [scores,          setScores]         = useState<Record<string, number>>({});
  const [frozen,          setFrozen]         = useState<Record<string, number>>({});
  const [roundResult,     setRoundResult]    = useState<RoundResultPayload | null>(null);
  const [timeRemaining,   setTimeRemaining]  = useState(ROUND_TIMEOUT_MS);
  const [freezeRemaining, setFreezeRemaining]= useState(0);

  // Stable refs
  const channelRef         = useRef<any>(null);
  const pendingAnswersRef  = useRef<Map<string, { answer: string; reactionMs: number }>>(new Map());
  const roundTimeoutRef    = useRef<ReturnType<typeof setTimeout>>();
  const advanceTimeoutRef  = useRef<ReturnType<typeof setTimeout>>();
  const scoresRef          = useRef<Record<string, number>>({});
  const playersRef         = useRef<PlayerPresence[]>([]);
  const roundsRef          = useRef<BattleRound[]>([]);
  const currentRoundIdxRef = useRef(0);
  const myUserIdRef        = useRef<string | null>(null);
  const hostIdRef          = useRef<string | null>(null);
  const isHostRef          = useRef(false);
  const roundCountRef      = useRef(5);
  const phaseRef           = useRef<Phase>("loading");
  const roundStartedAtRef  = useRef(0);

  // Sync refs
  useEffect(() => { scoresRef.current          = scores;         }, [scores]);
  useEffect(() => { playersRef.current         = players;        }, [players]);
  useEffect(() => { roundsRef.current          = rounds;         }, [rounds]);
  useEffect(() => { currentRoundIdxRef.current = currentRoundIdx;}, [currentRoundIdx]);
  useEffect(() => { myUserIdRef.current        = myUserId;       }, [myUserId]);
  useEffect(() => { hostIdRef.current          = hostId;         }, [hostId]);
  useEffect(() => { roundCountRef.current      = roundCount;     }, [roundCount]);
  useEffect(() => { phaseRef.current           = phase;          }, [phase]);
  useEffect(() => { roundStartedAtRef.current  = roundStartedAt; }, [roundStartedAt]);
  useEffect(() => {
    isHostRef.current = myUserId === hostId && !!myUserId;
  }, [myUserId, hostId]);

  // ── Round timer bar ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "round") return;
    const iv = setInterval(() => {
      setTimeRemaining(Math.max(0, ROUND_TIMEOUT_MS - (Date.now() - roundStartedAt)));
    }, 80);
    return () => clearInterval(iv);
  }, [phase, roundStartedAt]);

  // ── Freeze countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (!myUserId) return;
    const until = frozen[myUserId] ?? 0;
    if (until <= Date.now()) { setFreezeRemaining(0); return; }
    const iv = setInterval(() => {
      const r = frozen[myUserId] - Date.now();
      if (r <= 0) { setFreezeRemaining(0); clearInterval(iv); }
      else          setFreezeRemaining(r);
    }, 80);
    return () => clearInterval(iv);
  }, [frozen, myUserId]);

  // ── Step 1: load identity + lobby ───────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.is_anonymous) { setLobbyError("You must be signed in to play."); setPhase("lobby"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("full_name, username, avatar_url").eq("id", user.id).single();
      setMyUserId(user.id);
      setMyDisplayName(profile?.username || profile?.full_name || "Player");
      setMyAvatarUrl(profile?.avatar_url ?? null);

      const { data: lobby } = await supabase
        .from("battle_lobbies").select("id, host_id, status, round_count").eq("code", code).single();

      if (!lobby) { setLobbyError("Room not found."); setPhase("lobby"); return; }
      if (lobby.status === "finished") { setLobbyError("This game has already ended."); setPhase("lobby"); return; }

      setLobbyId(lobby.id);
      setHostId(lobby.host_id);
      setRoundCount(lobby.round_count);
    })();
  }, [code]);

  // ── Step 2: subscribe once lobbyId + myUserId known ────────────────────
  useEffect(() => {
    if (!lobbyId || !myUserId) return;
    const supabase = createClient();

    const channel = supabase.channel(`battle:${lobbyId}`, {
      config: { broadcast: { self: true } },
    });
    channelRef.current = channel;

    // ── Presence sync (player joined/left) ────────────────────────────
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, any[]>;
      const seen  = new Set<string>();
      const list: PlayerPresence[] = [];
      for (const entries of Object.values(state)) {
        for (const e of entries) {
          if (seen.has(e.userId)) continue;
          seen.add(e.userId);
          list.push({ userId: e.userId, displayName: e.displayName, avatarUrl: e.avatarUrl ?? null, isReady: e.isReady ?? false });
        }
      }
      setPlayers(list.slice(0, MAX_PLAYERS));
    });

    channel.on("presence", { event: "leave" }, ({ leftPresences }: any) => {
      const leftIds: string[] = leftPresences.map((p: any) => p.userId);

      // Show notification during game
      const lp = leftPresences[0];
      if (lp && phaseRef.current !== "lobby" && phaseRef.current !== "game_over") {
        setPlayerLeftMsg(`${lp.displayName} left the game`);
        setTimeout(() => setPlayerLeftMsg(null), 3000);
      }

      const wasHostLeaving = leftIds.includes(hostIdRef.current ?? "");
      if (!wasHostLeaving) return;

      // Host left — elect new host deterministically (smallest userId)
      const remaining = playersRef.current.filter(p => !leftIds.includes(p.userId));
      if (remaining.length === 0) return;

      const newHostId = [...remaining].sort((a, b) => a.userId.localeCompare(b.userId))[0].userId;
      setHostId(newHostId);
      hostIdRef.current = newHostId;
      isHostRef.current = myUserIdRef.current === newHostId;

      if (myUserIdRef.current !== newHostId) return;

      // I'm the new host — broadcast and resume game
      channelRef.current?.send({
        type: "broadcast", event: "HOST_TRANSFER",
        payload: { newHostId },
      });

      const curPhase = phaseRef.current;

      if (curPhase === "round") {
        // Re-arm the round timeout for remaining time
        clearTimeout(roundTimeoutRef.current);
        const elapsed = Date.now() - roundStartedAtRef.current;
        const remaining_ms = Math.max(500, ROUND_TIMEOUT_MS - elapsed);
        roundTimeoutRef.current = setTimeout(resolveRound, remaining_ms);
      }

      if (curPhase === "round_result") {
        // Re-arm the advance timeout
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = setTimeout(() => {
          const next = currentRoundIdxRef.current + 1;
          if (next >= roundsRef.current.length) {
            channelRef.current?.send({ type: "broadcast", event: "GAME_OVER", payload: { finalScores: scoresRef.current } });
          } else {
            startNextRound(next);
          }
        }, 1200);
      }
    });

    // ── Broadcast handlers ────────────────────────────────────────────
    channel.on("broadcast", { event: "HOST_TRANSFER" }, ({ payload }: any) => {
      setHostId(payload.newHostId);
      hostIdRef.current = payload.newHostId;
      isHostRef.current = myUserIdRef.current === payload.newHostId;
    });

    channel.on("broadcast", { event: "LOBBY_UPDATE" }, ({ payload }: any) => {
      if (payload.hostId)     setHostId(payload.hostId);
      if (payload.roundCount != null) setRoundCount(payload.roundCount);
    });

    channel.on("broadcast", { event: "GAME_START" }, ({ payload }: any) => {
      setRounds(payload.rounds);
      const initScores = Object.fromEntries((payload.playerIds as string[]).map((id: string) => [id, 0]));
      setScores(initScores);
      scoresRef.current = initScores;
      setCountdown(3);
      setPhase("countdown");
    });

    channel.on("broadcast", { event: "ROUND_START" }, ({ payload }: any) => {
      setCurrentRoundIdx(payload.roundIndex);
      setRoundStartedAt(Date.now());
      setMyAnswer(null);
      setTimeRemaining(ROUND_TIMEOUT_MS);
      setPhase("round");
    });

    channel.on("broadcast", { event: "PLAYER_ANSWER" }, ({ payload }: any) => {
      if (!isHostRef.current) return;
      pendingAnswersRef.current.set(payload.userId, { answer: payload.answer, reactionMs: payload.reactionMs });
      // Resolve early only if ALL remaining active players answered
      const activePlayers = playersRef.current.filter(p => (scoresRef.current[p.userId] !== undefined));
      if (activePlayers.every(p => pendingAnswersRef.current.has(p.userId))) {
        clearTimeout(roundTimeoutRef.current);
        resolveRound();
      }
    });

    channel.on("broadcast", { event: "ROUND_RESULT" }, ({ payload }: any) => {
      const p = payload as RoundResultPayload;
      setRoundResult(p);
      setScores(p.updatedScores);
      setFrozen(p.frozenUntil);
      setPhase("round_result");

      const uid = myUserIdRef.current;
      if (uid) {
        const myRes = p.results[uid];
        if (myRes?.correct) play(p.winnerId === uid ? "combo" : "correct");
        else if (myRes?.answer !== null) play("incorrect");
      }

      if (isHostRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = setTimeout(() => {
          const next = p.roundIndex + 1;
          if (next >= roundsRef.current.length) {
            channelRef.current?.send({ type: "broadcast", event: "GAME_OVER", payload: { finalScores: p.updatedScores } });
          } else {
            startNextRound(next);
          }
        }, RESULT_DISPLAY_MS);
      }
    });

    channel.on("broadcast", { event: "GAME_OVER" }, ({ payload }: any) => {
      setScores(payload.finalScores);
      setPhase("game_over");
      stop("theme_song");
      const uid = myUserIdRef.current;
      const sortedScores = Object.entries(payload.finalScores as Record<string, number>)
        .sort(([, a], [, b]) => b - a);
      const myRank = sortedScores.findIndex(([id]) => id === uid) + 1;
      play(myRank === 1 ? "level_complete" : "game_over");
      // Save this player's score to Supabase
      const myScore = payload.finalScores[myUserId] ?? 0;
      if (myScore > 0) {
        addGameScore(myScore, "battle");
        updateGameHighScore("battle", myScore);
      }
    });

    // Subscribe and track
    channel.subscribe(async (status: string) => {
      if (status !== "SUBSCRIBED") return;
      await channel.track({ userId: myUserId, displayName: myDisplayName, avatarUrl: myAvatarUrl, isReady: false });
      setPhase("lobby");
    });

    return () => {
      clearTimeout(roundTimeoutRef.current);
      clearTimeout(advanceTimeoutRef.current);
      // If we're leaving a waiting lobby and no one else is here, delete it
      if (phaseRef.current === "lobby" && playersRef.current.length <= 1) {
        createClient().from("battle_lobbies").delete().eq("code", code).eq("status", "waiting").then(() => {});
      }
      supabase.removeChannel(channel);
    };
  }, [lobbyId, myUserId]);

  // ── Countdown effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (isHostRef.current) startNextRound(0);
  }, [phase, countdown]);

  // ── Theme song — plays while the sign video is shown ───────────────────
  useEffect(() => {
    if (phase === "round") {
      play("theme_song", { loop: true });
    } else {
      stop("theme_song");
    }
  }, [phase]);

  // ── Host helpers ────────────────────────────────────────────────────────
  const startNextRound = useCallback((roundIndex: number) => {
    pendingAnswersRef.current = new Map();
    channelRef.current?.send({
      type: "broadcast", event: "ROUND_START",
      payload: { roundIndex, startedAt: Date.now() },
    });
    clearTimeout(roundTimeoutRef.current);
    roundTimeoutRef.current = setTimeout(resolveRound, ROUND_TIMEOUT_MS);
  }, []);

  const resolveRound = useCallback(() => {
    clearTimeout(roundTimeoutRef.current);
    const roundIdx  = currentRoundIdxRef.current;
    const round     = roundsRef.current[roundIdx];
    const curScores = { ...scoresRef.current };
    const frozenUntil: Record<string, number> = {};
    const results: Record<string, PlayerRoundResult> = {};
    let fastestMs = Infinity;
    let winnerId: string | null = null;

    // Only score players still present
    const activePlayers = playersRef.current.filter(p => curScores[p.userId] !== undefined);
    for (const p of activePlayers) {
      const sub = pendingAnswersRef.current.get(p.userId);
      if (!sub) {
        results[p.userId] = { answer: null, reactionMs: null, correct: false, points: 0 };
        continue;
      }
      const correct    = sub.answer === round.signName;
      const points = correct ? Math.max(1, Math.round(100 * (1 - sub.reactionMs / ROUND_TIMEOUT_MS))) : 0;
      results[p.userId] = { answer: sub.answer, reactionMs: sub.reactionMs, correct, points };
      if (correct && sub.reactionMs < fastestMs) { fastestMs = sub.reactionMs; winnerId = p.userId; }
      if (!correct) frozenUntil[p.userId] = Date.now() + FREEZE_MS;
      curScores[p.userId] = (curScores[p.userId] ?? 0) + points;
    }

    channelRef.current?.send({
      type: "broadcast", event: "ROUND_RESULT",
      payload: { roundIndex: roundIdx, correctAnswer: round.signName, results, updatedScores: curScores, frozenUntil, winnerId },
    });
  }, []);

  // ── Player actions ──────────────────────────────────────────────────────
  function submitAnswer(answer: string) {
    if (myAnswer || phase !== "round" || !myUserId) return;
    if ((frozen[myUserId] ?? 0) > Date.now()) return;
    const reactionMs = Date.now() - roundStartedAt;
    setMyAnswer(answer);
    channelRef.current?.send({
      type: "broadcast", event: "PLAYER_ANSWER",
      payload: { userId: myUserId, answer, reactionMs },
    });
  }

  async function toggleReady() {
    if (!channelRef.current || !myUserId) return;
    const next = !players.find(p => p.userId === myUserId)?.isReady;
    await channelRef.current.track({ userId: myUserId, displayName: myDisplayName, avatarUrl: myAvatarUrl, isReady: next });
  }

  async function startGame() {
    if (!isHostRef.current || players.length < 1) return;
    const generatedRounds = generateRounds(roundCountRef.current);
    await createClient().from("battle_lobbies").update({ status: "playing", round_count: roundCountRef.current }).eq("id", lobbyId);
    channelRef.current?.send({
      type: "broadcast", event: "GAME_START",
      payload: { rounds: generatedRounds, playerIds: playersRef.current.map(p => p.userId) },
    });
  }

  async function updateRoundCount(n: number) {
    setRoundCount(n);
    await createClient().from("battle_lobbies").update({ round_count: n }).eq("id", lobbyId);
    channelRef.current?.send({ type: "broadcast", event: "LOBBY_UPDATE", payload: { roundCount: n } });
  }

  function copyCode() {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  const isHost       = myUserId === hostId;
  const myIsFrozen   = (frozen[myUserId ?? ""] ?? 0) > Date.now();
  const currentRound = rounds[currentRoundIdx];
  const sortedPlayers = [...players].sort((a, b) => (scores[b.userId] ?? 0) - (scores[a.userId] ?? 0));

  function PlayerAvatar({ p, size = "sm" }: { p: PlayerPresence; size?: "sm" | "md" }) {
    const dim = size === "md" ? "w-12 h-12" : "w-8 h-8";
    return (
      <div className={`${dim} rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden flex items-center justify-center shrink-0`}>
        {p.avatarUrl
          ? <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
          : <span className="font-bold text-blue-600 dark:text-blue-300 text-xs">{p.displayName[0]?.toUpperCase()}</span>
        }
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold">Connecting…</p>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (lobbyError && phase === "lobby" && !lobbyId) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar active="Games" />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Room not found</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{lobbyError}</p>
          <button onClick={() => router.push("/games/battle")} className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  // ─── Lobby ────────────────────────────────────────────────────────────────
  if (phase === "lobby") {
    const myPlayer = players.find(p => p.userId === myUserId);
    return (
      <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        <Navbar active="Games" />

        <main className="flex-1 flex flex-col px-6 py-4 max-w-4xl mx-auto w-full gap-3 overflow-hidden">

          {/* Top row: Sign Battle title + ? Leave (same row = same height) */}
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Sign Battle</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Waiting for players…</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLobbyHelp(true)}
                className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 transition text-sm"
              >
                ?
              </button>
              <button onClick={() => setShowLeaveConfirm(true)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition">
                <LogOut className="w-3.5 h-3.5" /> Leave
              </button>
            </div>
          </div>

          {/* Two columns — start at exactly the same level */}
          <div className="grid grid-cols-2 gap-4">

            {/* Left: player slots */}
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-3">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs mb-2">
                <Users className="w-3.5 h-3.5" /> Players ({players.length}/{MAX_PLAYERS})
              </h2>
              <div className="space-y-2">
                {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
                  const p = players[i];
                  if (!p) return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0" />
                      <span className="text-xs text-gray-400">Waiting…</span>
                    </div>
                  );
                  return (
                    <div key={p.userId} className={`flex items-center gap-2 p-2 rounded-xl border-2 ${p.userId === myUserId ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                      <PlayerAvatar p={p} />
                      <span className="font-semibold text-gray-900 dark:text-white flex-1 truncate text-xs">{p.displayName}</span>
                      {p.userId === hostId && <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                      {p.userId !== hostId && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${p.isReady ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                          {p.isReady ? "Ready" : "Not Ready"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: room code + rounds + action */}
            <div className="flex flex-col gap-3">
              {/* Room code — same level as players box */}
              <div className="bg-linear-to-br from-orange-400 to-red-600 rounded-2xl p-4 text-white text-center">
                <p className="text-xs font-semibold opacity-80 mb-1">Room Code</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-widest">{code}</span>
                  <button onClick={copyCode} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Rounds selector */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Rounds</p>
                <div className="flex gap-2">
                  {[3, 5, 10].map(n => (
                    <button key={n}
                      onClick={() => isHost && updateRoundCount(n)}
                      disabled={!isHost}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition text-sm ${
                        roundCount === n
                          ? "bg-blue-500 text-white"
                          : isHost
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
                {!isHost && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">Host sets the round count</p>}
              </div>

              {/* Primary action — directly below rounds */}
              {isHost ? (
                <button onClick={startGame}
                  className="w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 fill-white" /> Start Game
                </button>
              ) : myPlayer ? (
                <button onClick={toggleReady}
                  className={`w-full py-3.5 rounded-xl font-bold transition ${myPlayer.isReady ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
                  {myPlayer.isReady ? "✓ Ready!" : "Click to Ready Up"}
                </button>
              ) : null}
            </div>

          </div>
        </main>

        {/* How to play modal */}
        {showLobbyHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">How to Play</h2>
                <button onClick={() => setShowLobbyHelp(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">1.</span>Watch the ASL sign video and pick the correct word from 4 options</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">2.</span>Answer faster than opponents to earn a speed bonus (up to +50 pts)</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">3.</span>Wrong answers freeze you for 3 seconds</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold shrink-0">4.</span>Most points after all rounds wins</li>
              </ul>
              <button
                onClick={() => setShowLobbyHelp(false)}
                className="w-full mt-5 bg-linear-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Leave the battle?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Your progress will be lost.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Stay
                </button>
                <button
                  onClick={handleLeave}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Countdown ────────────────────────────────────────────────────────────
  if (phase === "countdown") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest">Get Ready!</p>
        <div className="text-[9rem] font-black text-orange-500 leading-none">{countdown || "GO!"}</div>
      </div>
    );
  }

  // ─── Round ────────────────────────────────────────────────────────────────
  if (phase === "round" && currentRound) {
    const timerPct   = (timeRemaining / ROUND_TIMEOUT_MS) * 100;
    const timerColor = timerPct > 50 ? "bg-green-500" : timerPct > 25 ? "bg-yellow-500" : "bg-red-500";

    return (
      <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between shrink-0">
          <span className="font-bold text-gray-900 dark:text-white text-sm">Round {currentRoundIdx + 1}/{rounds.length}</span>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{(timeRemaining / 1000).toFixed(1)}s</span>
          <button onClick={() => setShowLeaveConfirm(true)} className="text-gray-400 hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 shrink-0">
          <div className={`h-full ${timerColor} transition-all duration-100`} style={{ width: `${timerPct}%` }} />
        </div>

        {/* Player left notification */}
        {playerLeftMsg && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-xs text-yellow-700 dark:text-yellow-400 font-semibold text-center shrink-0">
            {playerLeftMsg}
          </div>
        )}

        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-3 flex flex-col gap-3 overflow-hidden">
          {/* Video — tall, prioritise height */}
          <div className="rounded-xl overflow-hidden bg-gray-900 shadow-md flex-1 min-h-0 flex items-center justify-center">
            <video
              key={currentRound.videoUrl}
              src={currentRound.videoUrl}
              autoPlay loop muted playsInline
              className="h-full w-full object-contain"
            />
          </div>

          {/* Freeze bar */}
          {myIsFrozen && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-xl px-3 py-2 flex items-center gap-2 text-blue-700 dark:text-blue-300 shrink-0">
              <Snowflake className="w-4 h-4 shrink-0" />
              <span className="font-bold text-xs">Frozen — {(freezeRemaining / 1000).toFixed(1)}s</span>
            </div>
          )}

          {/* 2×2 answer options — fixed size, don't stretch */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            {currentRound.options.map(opt => {
              const isSelected = myAnswer === opt;
              return (
                <button
                  key={opt}
                  onClick={() => submitAnswer(opt)}
                  disabled={!!myAnswer || myIsFrozen}
                  className={`h-14 rounded-2xl font-bold text-base transition active:scale-95 border-2 ${
                    isSelected
                      ? "bg-blue-500 border-blue-500 text-white"
                      : myAnswer
                      ? "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                      : myIsFrozen
                      ? "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-blue-400 hover:shadow-md"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </main>

        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Leave the battle?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Your progress will be lost.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Stay</button>
                <button onClick={handleLeave} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition">Leave</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Round result ─────────────────────────────────────────────────────────
  if (phase === "round_result" && roundResult) {
    return (
      <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2.5 shrink-0">
          <span className="font-bold text-gray-900 dark:text-white text-sm">Round {roundResult.roundIndex + 1}/{rounds.length} — Results</span>
        </div>

        {playerLeftMsg && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-xs text-yellow-700 dark:text-yellow-400 font-semibold text-center shrink-0">
            {playerLeftMsg}
          </div>
        )}

        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
          <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-2xl p-4 text-center">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Correct Answer</p>
            <p className="text-2xl font-black text-green-700 dark:text-green-300">{roundResult.correctAnswer}</p>
          </div>

          <div className="space-y-2">
            {sortedPlayers.map(p => {
              const res      = roundResult.results[p.userId];
              const isWinner = roundResult.winnerId === p.userId;
              return (
                <div key={p.userId} className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${
                  isWinner ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                  : res?.correct ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}>
                  <PlayerAvatar p={p} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5 truncate">
                      {p.displayName}
                      {isWinner && <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {res?.answer ?? "No answer"}{res?.reactionMs != null ? ` · ${(res.reactionMs / 1000).toFixed(2)}s` : ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-black ${res?.correct ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                      {res?.points ? `+${res.points}` : "0"}
                    </div>
                    <div className="text-xs text-gray-400">{scores[p.userId] ?? 0} total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ─── Game over ────────────────────────────────────────────────────────────
  if (phase === "game_over") {
    const medals = ["🥇", "🥈", "🥉"];
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar active="Games" />
        <main className="max-w-md mx-auto px-4 py-8 text-center">
          <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-3" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Game Over!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Final standings</p>

          <div className="space-y-3 mb-6">
            {sortedPlayers.map((p, i) => (
              <div key={p.userId} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
                i === 0 ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}>
                <span className="text-2xl">{medals[i] ?? `#${i + 1}`}</span>
                <PlayerAvatar p={p} size="md" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white truncate">{p.displayName}</div>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white shrink-0">{scores[p.userId] ?? 0}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push("/games/battle")}
              className="flex-1 bg-linear-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
              New Game
            </button>
            <button onClick={() => router.push("/games")}
              className="flex-1 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Exit
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
