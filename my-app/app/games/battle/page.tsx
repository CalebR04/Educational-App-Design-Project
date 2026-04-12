"use client";

import { useState, useEffect, useRef } from 'react';
import { Play, CheckCircle2, RefreshCcw, Trophy, ArrowRight, LogOut, Timer, Flame } from 'lucide-react';
import Navbar from "../../../components/Navbar";
import { addGameScore, updateGameHighScore, fetchGameHighScores } from "@/lib/supabase/userStats";

interface Sign {
  id: string;
  name: string;
  videoUrl: string;
}

// Sign Bank (reuse from combos)
const signLibrary: Sign[] = [
  { id: 'me', name: 'ME (I)', videoUrl: '/asl_videos/daily_life/me.mp4' },
  { id: 'you', name: 'YOU', videoUrl: '/asl_videos/pronouns/you.mp4' },
  { id: 'index', name: 'HE/SHE/IT', videoUrl: '/asl_videos/pronouns/index.mp4' },
  { id: 'they', name: 'THEY', videoUrl: '/asl_videos/pronouns/they.mp4' },
  { id: 'go', name: 'GO', videoUrl: '/asl_videos/verbs/go.mp4' },
  { id: 'want', name: 'WANT', videoUrl: '/asl_videos/verbs/want.mp4' },
  { id: 'like', name: 'LIKE', videoUrl: '/asl_videos/verbs/like.mp4' },
  { id: 'eat', name: 'EAT', videoUrl: '/asl_videos/verbs/eat.mp4' },
  { id: 'work', name: 'WORK', videoUrl: '/asl_videos/daily_life/work.mp4' },
  { id: 'sleep', name: 'SLEEP', videoUrl: '/asl_videos/verbs/sleep.mp4' },
  { id: 'learn', name: 'LEARN', videoUrl: '/asl_videos/verbs/learn.mp4' },
  { id: 'see', name: 'SEE', videoUrl: '/asl_videos/verbs/see.mp4' },
  { id: 'now', name: 'NOW', videoUrl: '/asl_videos/time/now.mp4' },
  { id: 'tomorrow', name: 'TOMORROW', videoUrl: '/asl_videos/time/tomorrow.mp4' },
  { id: 'yesterday', name: 'YESTERDAY', videoUrl: '/asl_videos/time/yesterday.mp4' },
  { id: 'night', name: 'NIGHT', videoUrl: '/asl_videos/time/night.mp4' },
  { id: 'restaurant', name: 'RESTAURANT', videoUrl: '/asl_videos/daily_life/restaurant.mp4' },
  { id: 'home', name: 'HOME', videoUrl: '/asl_videos/daily_life/home.mp4' },
  { id: 'school', name: 'SCHOOL', videoUrl: '/asl_videos/daily_life/school.mp4' },
  { id: 'gym', name: 'GYM', videoUrl: '/asl_videos/daily_life/gym.mp4' },
];

// 3-word phrases for battle
const battlePhrases = [
  { english: "I go home", correctOrder: ['me', 'go', 'home'] },
  { english: "You want eat", correctOrder: ['you', 'want', 'eat'] },
  { english: "They see me", correctOrder: ['they', 'see', 'me'] },
  { english: "He likes work", correctOrder: ['index', 'like', 'work'] },
  { english: "I learn now", correctOrder: ['me', 'learn', 'now'] },
  { english: "You sleep home", correctOrder: ['you', 'sleep', 'home'] },
  { english: "They want go", correctOrder: ['they', 'want', 'go'] },
  { english: "I see you", correctOrder: ['me', 'see', 'you'] },
  { english: "He eats now", correctOrder: ['index', 'eat', 'now'] },
  { english: "You like school", correctOrder: ['you', 'like', 'school'] },
  { english: "I work gym", correctOrder: ['me', 'work', 'gym'] },
  { english: "They learn school", correctOrder: ['they', 'learn', 'school'] },
  { english: "He sees restaurant", correctOrder: ['index', 'see', 'restaurant'] },
  { english: "You go tomorrow", correctOrder: ['you', 'go', 'tomorrow'] },
  { english: "I like home", correctOrder: ['me', 'like', 'home'] },
];

export default function BattlePage() {
  const [mounted, setMounted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const scoreSavedRef = useRef(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState<typeof battlePhrases[0] | null>(null);
  const [workArea, setWorkArea] = useState<Sign[]>([]);
  const [currentBank, setCurrentBank] = useState<Sign[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string>("");
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // CPU scoring effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const cpuInterval = setInterval(() => {
      const cpuDelta = difficulty === 'easy'
        ? Math.floor(Math.random() * 5) + 8 // 8-12
        : difficulty === 'hard'
          ? Math.floor(Math.random() * 9) + 18 // 18-26
          : Math.floor(Math.random() * 5) + 14; // 14-18
      setCpuScore(prev => prev + cpuDelta);
    }, difficulty === 'easy' ? 4200 : difficulty === 'hard' ? 2400 : 2800);

    return () => clearInterval(cpuInterval);
  }, [gameStarted, gameOver, difficulty]);

  // Initialize
  useEffect(() => {
    setMounted(true);
    fetchGameHighScores().then(s => setHighScore(s.battleHigh));
  }, []);

  // Save score when game ends
  useEffect(() => {
    if (!gameOver || !gameStarted || scoreSavedRef.current) return;
    scoreSavedRef.current = true;
    if (playerScore > 0) addGameScore(playerScore, "battle");
    if (playerScore > highScore) updateGameHighScore("battle", playerScore);
  }, [gameOver]);

  const shuffleArray = (array: any[]) => [...array].sort(() => 0.5 - Math.random());

  const startGame = () => {
    scoreSavedRef.current = false;
    setGameStarted(true);
    setTimeLeft(60);
    setPlayerScore(0);
    setCpuScore(0);
    setStreak(0);
    setGameOver(false);
    setLastFeedback("");
    setAutoSubmitted(false);
    setIsChecked(false);
    loadNewPhrase();
  };

  const loadNewPhrase = () => {
    const randomPhrase = shuffleArray(battlePhrases)[0];
    setCurrentPhrase(randomPhrase);
    setWorkArea([]);
    setLastFeedback("");
    setAutoSubmitted(false);
    setIsChecked(false);

    // Build 6-sign bank
    const correctIds = randomPhrase.correctOrder;
    const correctSigns = signLibrary.filter(s => correctIds.includes(s.id));
    const randomSigns = shuffleArray(signLibrary.filter(s => !correctIds.includes(s.id))).slice(0, 6 - correctSigns.length);
    setCurrentBank(shuffleArray([...correctSigns, ...randomSigns]));
  };

  const checkAnswer = () => {
    if (!currentPhrase || workArea.length === 0) return;

    const target = currentPhrase.correctOrder;
    const user = workArea.map(s => s.id);

    let baseScore = 0;
    let isPerfect = false;

    // Count correct signs in any position
    const correctSigns = user.filter(id => target.includes(id)).length;

    // Check if perfect match
    if (user.length === target.length && user.every((id, idx) => id === target[idx])) {
      baseScore = 150;
      isPerfect = true;
    } else {
      baseScore = correctSigns * 15;
    }

    const nextStreak = isPerfect ? streak + 1 : Math.max(0, streak - 1);
    setStreak(nextStreak);

    const bonus = nextStreak * 10;
    const totalPoints = baseScore + bonus;

    setPlayerScore(prev => prev + totalPoints);

    if (isPerfect) {
      setLastFeedback(`Perfect! +${baseScore} (+${bonus} bonus)`);
    } else {
      setLastFeedback(`Partial +${baseScore}`);
    }

    setIsChecked(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const newWorkArea = [...workArea];
    const draggedItem = newWorkArea.splice(draggedIdx, 1)[0];
    newWorkArea.splice(targetIdx, 0, draggedItem);
    
    setWorkArea(newWorkArea);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const getWinner = () => {
    if (playerScore > cpuScore) return "Player";
    if (cpuScore > playerScore) return "CPU";
    return "Tie";
  };

  if (!mounted) return null;

  if (gameOver) {
    const winner = getWinner();
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Trophy size={48} className="text-yellow-500 mb-3" />
        <h1 className="text-3xl font-black text-black mb-1">Battle Complete!</h1>
        <p className="text-gray-500 font-bold text-base mb-4">
          {winner === "Player" ? "You Won!" : winner === "CPU" ? "CPU Wins!" : "It's a Tie!"}
        </p>

        <div className="bg-white rounded-2xl p-5 shadow-xl mb-5 w-full max-w-sm border border-gray-100 text-center">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">YOU</p>
              <p className="text-3xl font-black text-blue-600">{playerScore}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">CPU</p>
              <p className="text-3xl font-black text-red-600">{cpuScore}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={startGame} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors">Play Again</button>
          <button onClick={() => window.location.href = '/games'} className="bg-white text-gray-800 border-2 border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">Exit to Games</button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="h-screen bg-white text-[#111827] flex flex-col overflow-hidden">
        <Navbar active="Games" />
        <main className="w-full max-w-7xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center items-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-black mb-2">Sign Battle</h1>
            <p className="text-lg text-gray-600 max-w-md">
              Race against time and a CPU opponent! Translate 3-word phrases into ASL order as fast as you can.
            </p>
          </div>

          <div className="flex flex-row gap-8 w-full max-w-4xl">
            {/* Instructions on the left */}
            <div className="flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-3">How to Play:</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• 60 seconds to score higher than your opponent</li>
                  <li>• Perfect match: 150 points</li>
                  <li>• Partial: 15 points per correct sign</li>
                  <li>• Streak bonus: 10 points × streak</li>
                  <li>• Build streaks by getting perfect matches (all 3 signs correct).</li>
                  <li>• Imperfect matches reduce your streak</li>
                </ul>
              </div>
            </div>

            {/* Modes on the right */}
            <div className="flex-1 flex flex-col gap-6">
              {/* CPU Mode */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">CPU Mode</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['easy', 'normal', 'hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level as 'easy' | 'normal' | 'hard')}
                      className={`rounded-2xl py-4 font-bold transition ${difficulty === level ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {level === 'easy' ? 'Easy' : level === 'normal' ? 'Normal' : 'Hard'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {difficulty === 'easy'
                    ? 'CPU is very slow and struggles to score quickly.'
                    : difficulty === 'hard'
                      ? 'CPU scores faster and stays competitive.'
                      : 'Balanced CPU pace.'}
                </p>
                <button onClick={startGame} className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors">
                  Start Battle
                </button>
              </div>

              {/* Multiplayer Mode */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Multiplayer Mode</h3>
                <p className="text-xs text-gray-500 mb-4">Coming soon!</p>
                <button className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-bold cursor-not-allowed">
                  Multiplayer
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const availableSigns = currentBank.filter(
    (bankSign) => !workArea.some((workSign) => workSign.id === bankSign.id)
  );

  return (
    <div className="h-screen bg-white text-[#111827] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-xl font-black text-black">Sign Battle</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-lg font-bold text-gray-700">
            <Timer size={20} className="text-gray-400" />
            {timeLeft}s
          </span>
          <span className="flex items-center gap-2 text-lg font-bold text-orange-600">
            <Flame size={20} className="text-orange-400" />
            Streak: {streak}
          </span>
          <span className="text-lg font-bold text-gray-700 uppercase tracking-widest">
            {difficulty === 'easy' ? 'Easy CPU' : difficulty === 'hard' ? 'Hard CPU' : 'Normal CPU'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 uppercase">YOU</p>
            <p className="text-xl font-black text-blue-600">{playerScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 uppercase">CPU</p>
            <p className="text-xl font-black text-red-600">{cpuScore}</p>
          </div>
          <button
            onClick={() => setGameOver(true)}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Exit</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 py-4 flex-1 flex flex-col justify-start h-full">

        {/* Translation Banner */}
        <div className="bg-blue-600 rounded-xl p-4 text-white shadow-md mb-4">
          <span className="text-blue-200 text-xs font-bold uppercase tracking-widest block mb-1">Translate:</span>
          <h2 className="text-xl font-bold">"{currentPhrase?.english}"</h2>
        </div>

        {/* Feedback */}
        {lastFeedback && (
          <div className="mb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={20} />
              <span className="text-green-800 font-bold">{lastFeedback}</span>
              {streak > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <Flame className="text-orange-500" size={16} />
                  <span className="text-orange-600 font-bold">Streak x{streak}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WORK AREA */}
        <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl p-4 h-32 flex flex-wrap gap-3 items-center justify-center overflow-hidden mb-4">
          {workArea.length === 0 ? (
            <div className="flex flex-col items-center text-blue-300">
              <span className="font-medium text-sm">Selected signs will appear here</span>
            </div>
          ) : (
            workArea.map((sign, idx) => {
              const uniqueKey = `${sign.id}-work-${idx}`;
              const isDragging = draggedIdx === idx;

              return (
                <div
                  key={uniqueKey}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`relative bg-white p-2 rounded-lg shadow-md border border-blue-200 overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                    isDragging ? "opacity-40 scale-95" : ""
                  }`}
                >
                  <div className="relative w-16 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <video
                      src={sign.videoUrl}
                      preload="auto"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SIGN BANK */}
        <div
          className="relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm w-full flex-1"
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={() => { if (draggedIdx !== null) { setWorkArea(workArea.filter((_, i) => i !== draggedIdx)); setDraggedIdx(null); } }}
        >
          {draggedIdx !== null && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none z-10">
              <span className="text-black text-2xl font-black tracking-widest">Remove Sign</span>
            </div>
          )}
          <div className={`transition-opacity duration-150 ${draggedIdx !== null ? 'opacity-[0.06]' : 'opacity-100'}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <div>
                <h3 className="font-bold text-gray-900 uppercase tracking-tighter text-sm">Available Signs</h3>
                <p className="text-xs text-gray-500 mt-1">Selected {workArea.length}/3 signs</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setWorkArea([])}
                  disabled={workArea.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <RefreshCcw size={16} /> Reset
                </button>
                <button 
                  onClick={isChecked ? loadNewPhrase : checkAnswer} 
                  disabled={workArea.length === 0 && !isChecked}
                  className="bg-black text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-30 transition-all flex items-center gap-2 text-sm shadow-sm"
                >
                  {isChecked ? <ArrowRight size={16} /> : <Play size={16} fill="currentColor" />} {isChecked ? 'Next' : 'Check'}
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {availableSigns.length === 0 && workArea.length > 0 ? (
                <p className="w-full text-center text-gray-400 italic py-8 text-sm">All signs moved to work area.</p>
              ) : (
                availableSigns.map((sign) => {
                  const uniqueKey = `${sign.id}-bank`;
                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => setWorkArea([...workArea, sign])}
                      disabled={workArea.length >= 3}
                      className={`h-24 aspect-[3/4] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden transition-all active:scale-95 group ${workArea.length >= 3 ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400 hover:shadow-md'}`}
                    >
                      <div className="relative w-full h-full pointer-events-none bg-slate-900">
                        <video 
                          src={sign.videoUrl}
                          preload="auto"
                          autoPlay
                          loop
                          muted
                          playsInline 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}