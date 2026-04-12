"use client";

import { useState, useEffect } from 'react';
import { addGameScore, fetchGameHighScores, updateGameHighScore } from "@/lib/supabase/userStats";
import { Play, CheckCircle2, RefreshCcw, BookOpen, MoveHorizontal, Lightbulb, Trophy, ArrowRight, Info, X, LogOut } from 'lucide-react';

interface Sign {
  id: string;
  name: string;
  videoUrl: string;
}

// Sign Bank
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

// Question Bank
const allPhrases = [
  { english: "I am going home now", correctOrder: ['now', 'me', 'go', 'home'] },
  { english: "Yesterday they worked at school", correctOrder: ['yesterday', 'school', 'they', 'work'] },
  { english: "Tomorrow you want to eat at the restaurant", correctOrder: ['tomorrow', 'restaurant', 'you', 'want', 'eat'] },
  { english: "I see you at the gym at night", correctOrder: ['night', 'gym', 'me', 'see', 'you'] },
  { english: "He likes to sleep at home", correctOrder: ['home', 'index', 'like', 'sleep'] },
  { english: "They learn at school now", correctOrder: ['now', 'school', 'they', 'learn'] },
  { english: "Yesterday I went to the restaurant", correctOrder: ['yesterday', 'restaurant', 'me', 'go'] },
  { english: "Tomorrow she wants to go to the gym", correctOrder: ['tomorrow', 'gym', 'index', 'want', 'go'] },
  { english: "I like to eat at home", correctOrder: ['home', 'me', 'like', 'eat'] },
  { english: "You sleep at school at night", correctOrder: ['night', 'school', 'you', 'sleep'] },
];

export default function SignComboPage() {
  const [mounted, setMounted] = useState(false);
  const [gamePhrases, setGamePhrases] = useState<typeof allPhrases>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [workArea, setWorkArea] = useState<Sign[]>([]);
  const [currentBank, setCurrentBank] = useState<Sign[]>([]);
  
  // Game & Score State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Phrase Check State
  const [hasBeenScored, setHasBeenScored] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hint, setHint] = useState("");
  const [showReveal, setShowReveal] = useState(false);
  const [colorMap, setColorMap] = useState<('green' | 'yellow' | 'gray')[]>([]);

  // UI & Drag States
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Initialize game
  useEffect(() => {
    setMounted(true);
    fetchGameHighScores().then(s => {
      setHighScore(s.comboHigh);
      setGamesPlayed(s.comboPlayed);
    });
    startNewGame();
  }, []);

  const shuffleArray = (array: any[]) => [...array].sort(() => 0.5 - Math.random());

  const startNewGame = () => {
    const selectedPhrases = shuffleArray(allPhrases).slice(0, 5);
    setGamePhrases(selectedPhrases);
    setCurrentIdx(0);
    setScore(0);
    setGameOver(false);
    setupPhrase(selectedPhrases[0]);
  };

  const setupPhrase = (phrase: typeof allPhrases[0]) => {
    setWorkArea([]);
    setHasBeenScored(false);
    setIsCorrect(false);
    setHint("");
    setShowReveal(false);
    setColorMap([]);

    // Build the 6-sign bank
    const correctIds = phrase.correctOrder;
    const correctSigns = signLibrary.filter(s => correctIds.includes(s.id));
    const randomSigns = shuffleArray(signLibrary.filter(s => !correctIds.includes(s.id))).slice(0, 6 - correctSigns.length);
    setCurrentBank(shuffleArray([...correctSigns, ...randomSigns]));
  };

  const checkPhrase = () => {
    const target = gamePhrases[currentIdx].correctOrder;
    const user = workArea.map(s => s.id);

    // Wordle-like coloring
    const colorMap: ('green' | 'yellow' | 'gray')[] = user.map((id, idx) => {
      if (id === target[idx]) return 'green'; // Correct position
      if (target.includes(id)) return 'yellow'; // In phrase, wrong position
      return 'gray'; // Not in phrase
    });

    let pointsEarned = 0;
    const correctPositions = colorMap.filter(c => c === 'green').length;
    const correctSigns = colorMap.filter(c => c === 'green' || c === 'yellow').length;

    if (correctPositions === target.length) {
      pointsEarned = 150;
      setIsCorrect(true);
    } else {
      pointsEarned = correctSigns * 15;
      setIsCorrect(false);
    }

    if (!hasBeenScored) {
      setScore(prev => prev + pointsEarned);
      setHasBeenScored(true);
    }

    setColorMap(colorMap);
    setHint(`Correct positions: ${correctPositions}, Correct signs: ${correctSigns}`);
    setShowReveal(false);
  };

  const handleNextPhrase = () => {
    if (currentIdx === 4) {
      setGameOver(true);
      setGamesPlayed(prev => prev + 1);
      if (score > 0) addGameScore(score, "combo");
      if (score > highScore) {
        setHighScore(score);
        updateGameHighScore("combo", score);
      }
    } else {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      setupPhrase(gamePhrases[next]);
    }
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
    const draggedItem = newWorkArea.splice(draggedIdx, 1)[0]; // Remove from old spot
    newWorkArea.splice(targetIdx, 0, draggedItem); // Insert into new spot
    
    setWorkArea(newWorkArea);
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  if (!mounted || gamePhrases.length === 0) return null;

  const availableSigns = currentBank.filter(
    (bankSign) => !workArea.some((workSign) => workSign.id === bankSign.id)
  );

  if (gameOver) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Trophy size={48} className="text-yellow-500 mb-3 animate-bounce" />
        <h1 className="text-3xl font-black text-black mb-1">Game Complete!</h1>
        {score > highScore && score > 0 ? (
          <p className="text-green-600 font-bold text-lg mb-4">🎉 NEW HIGH SCORE! 🎉</p>
        ) : (
          <p className="text-gray-500 font-bold text-base mb-4">Great practice!</p>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-xl mb-5 w-full max-w-sm border border-gray-100 text-center">
          <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">Final Score</p>
          <p className="text-5xl font-black text-blue-600 mb-4">{score}</p>
          <div className="flex justify-between border-t border-gray-100 pt-4">
            <div><p className="text-xs text-gray-400 font-bold">HIGH SCORE</p><p className="font-black text-lg">{Math.max(score, highScore)}</p></div>
            <div><p className="text-xs text-gray-400 font-bold">GAMES PLAYED</p><p className="font-black text-lg">{gamesPlayed}</p></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={startNewGame} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors">Play Again</button>
          <button onClick={() => window.location.href = '/games'} className="bg-white text-gray-800 border-2 border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">Exit to Games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-[#111827] flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 py-2 flex-1 flex flex-col justify-start h-full">

        <div className="w-full flex flex-col gap-2">

          {/* Header */}
          <div className="flex justify-between items-center shrink-0 mb-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-none">Sign Combo</h1>
              <p className="text-blue-600 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1">Phrase {currentIdx + 1} of 5</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="text-right">
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase leading-none">Score</p>
                <p className="text-xl sm:text-2xl font-black text-black leading-none mt-1">{score}</p>
              </div>
              <button onClick={() => setShowInfoModal(true)} className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 font-bold transition-colors">
                <Info size={20} />
                <span className="text-sm">Info</span>
              </button>
              <button
                onClick={() => setShowExitConfirm(true)}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-base">Exit Game</span>
              </button>
            </div>
          </div>

          {/* --- SIDE-BY-SIDE ROW: Translation Banner & Feedback Popups --- */}
          <div className="flex flex-row gap-2 shrink-0 items-stretch">

            {/* Translation Banner */}
            <div className="bg-blue-600 rounded-xl p-3 sm:p-4 text-white shadow-md flex-1 flex flex-col justify-center transition-all">
              <span className="text-blue-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest block mb-1">Translate this phrase:</span>
              <h2 className="text-lg sm:text-xl font-bold leading-tight">"{gamePhrases[currentIdx].english}"</h2>
            </div>

            {/* Correct Feedback Box */}
            {isCorrect && (
              <div className="bg-green-500 rounded-xl flex-1 flex items-center justify-between gap-3 text-white p-3 sm:p-4 shadow-md animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={24} />
                  <span className="font-bold text-lg">Perfect!</span>
                </div>
                <button onClick={handleNextPhrase} className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors flex gap-2 items-center text-sm shadow-sm shrink-0">
                  {currentIdx === 4 ? "Finish" : "Next"} <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Hint / Wrong Feedback Box */}
            {hint && !isCorrect && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 sm:p-4 flex-1 flex items-center gap-2 animate-in slide-in-from-right-4 shadow-md">
                {!showReveal ? (
                  <>
                    <Lightbulb className="text-orange-500 shrink-0" size={18} />
                    <p className="text-orange-900 font-bold text-xs sm:text-sm leading-tight flex-1 min-w-0">
                      Hint: <span className="text-orange-800 font-normal">{hint}</span>
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setHint("")} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-orange-600 text-xs shadow-sm">
                        Try Again
                      </button>
                      <button onClick={() => setShowReveal(true)} className="bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-100 text-xs transition-colors">
                        Reveal
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-orange-900 text-xs sm:text-sm flex-1 min-w-0 truncate">
                      <span className="font-bold text-orange-500 uppercase text-[10px] sm:text-xs mr-1">Correct Answer:</span>
                      <span className="font-black">{gamePhrases[currentIdx].correctOrder.map(id => signLibrary.find(s=>s.id === id)?.name).join(' + ')}</span>
                    </p>
                    <button onClick={handleNextPhrase} className="bg-gray-800 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-black text-xs shadow-sm flex items-center gap-1 shrink-0">
                      {currentIdx === 4 ? "Finish" : "Skip"} <ArrowRight size={12}/>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {/* --- END SIDE-BY-SIDE ROW --- */}


          {/* WORK AREA */}
          <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-xl p-3 h-32 flex flex-wrap gap-2 sm:gap-3 items-center justify-center overflow-hidden shrink-0">
            {workArea.length === 0 ? (
              <div className="flex flex-col items-center text-blue-300">
                <MoveHorizontal size={20} className="mb-1" />
                <p className="font-medium text-xs">Selected signs will appear here</p>
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
                    className={`relative bg-white p-1 rounded-lg shadow-md border border-blue-200 overflow-hidden animate-in fade-in zoom-in duration-200 cursor-grab active:cursor-grabbing transition-all ${
                      isDragging ? "opacity-40 scale-95" : ""
                    } ${hasBeenScored ? (colorMap[idx] === 'green' ? 'ring-2 ring-green-500' : colorMap[idx] === 'yellow' ? 'ring-2 ring-yellow-500' : 'ring-2 ring-gray-500') : ''}`}
                  >
                    {/* Sizes for the Work Area */}
                    <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden shrink-0">
                       <video
                          src={sign.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover scale-[1] origin-center pointer-events-none"
                        />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CARD LIBRARY BANK */}
          <div
            className="relative bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-sm w-full shrink-0 mt-1"
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={() => { if (draggedIdx !== null) { setWorkArea(workArea.filter((_, i) => i !== draggedIdx)); setDraggedIdx(null); } }}
          >
            {draggedIdx !== null && (
              <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none z-10">
                <span className="text-black text-3xl font-black tracking-widest">Remove Sign</span>
              </div>
            )}
            <div className={`transition-opacity duration-150 ${draggedIdx !== null ? 'opacity-[0.06]' : 'opacity-100'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900 uppercase tracking-tighter text-xs sm:text-sm">Available Signs</h3>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {setWorkArea([]); setHint(""); setShowReveal(false);}}
                  disabled={workArea.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <RefreshCcw size={14} /> <span className="hidden sm:inline">Reset</span>
                </button>
                <button 
                  onClick={checkPhrase} 
                  disabled={workArea.length === 0 || isCorrect || showReveal}
                  className="bg-black text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-30 transition-all flex items-center gap-1.5 text-xs sm:text-sm shadow-sm"
                >
                  <Play size={14} fill="currentColor" /> Check
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {availableSigns.length === 0 && workArea.length > 0 ? (
                <p className="w-full text-center text-gray-400 italic py-4 text-xs">All signs moved to work area.</p>
              ) : (
                availableSigns.map((sign) => {
                  const uniqueKey = `${sign.id}-bank`;
                  return (
                    <button
                      key={uniqueKey}
                      onClick={() => {
                        setWorkArea([...workArea, sign]);
                        setHint(""); 
                      }}
                      // Sizes for the Bank Area
                      className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-40 2xl:h-48 aspect-[3/4] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all active:scale-95 group animate-in fade-in duration-300 relative shrink-0"
                    >
                      <div className="w-full h-full pointer-events-none bg-slate-900">
                          <video 
                            src={sign.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline 
                            className="w-full h-full object-cover scale-[1] origin-center" 
                          />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- INFO MODAL (Grammar & Scoring) --- */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowInfoModal(false)}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInfoModal(false)} className="absolute top-4 right-4 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"><X size={18}/></button>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg"><Trophy size={18} className="text-yellow-500" /> Scoring Guide</h3>
                <ul className="text-xs text-gray-600 leading-relaxed space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <li className="flex justify-between border-b border-gray-200 pb-1.5"><span>Perfect Match:</span> <strong className="text-blue-600">150 pts</strong></li>
                  <li className="flex justify-between border-b border-gray-200 pb-1.5"><span>Right Signs, Wrong Order:</span> <strong className="text-blue-600">100 pts</strong></li>
                  <li className="flex justify-between"><span>Partial Match:</span> <strong className="text-blue-600">15 pts / sign</strong></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg"><BookOpen size={18} className="text-blue-600" /> ASL Grammar Tips</h3>
                <ul className="text-xs text-blue-800 leading-relaxed space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100 list-disc pl-6 marker:text-blue-400">
                  <li><strong>Time First:</strong> Always place time words (NOW, YESTERDAY, TOMORROW) at the very beginning of your sentence.</li>
                  <li><strong>Drop the Extras:</strong> ASL doesn't use words like "am," "is," "are," "the," or "to." Just stick to the core signs!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Exit Game?</h2>
            <p className="text-slate-500 mb-8">Are you sure you want to exit? Progress will not be saved.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => (window.location.href = '/games')} className="w-full rounded-2xl bg-slate-900 py-3 font-bold text-white hover:bg-black transition">
                Exit
              </button>
              <button onClick={() => setShowExitConfirm(false)} className="w-full rounded-2xl border-2 border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-50 transition">
                Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}