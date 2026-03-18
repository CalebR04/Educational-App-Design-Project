"use client";

import { useState, useEffect } from 'react';
import { Trash2, Play, CheckCircle2, RefreshCcw, BookOpen, MoveHorizontal, Lightbulb, Trophy, ArrowRight } from 'lucide-react';
import Navbar from "../../../components/Navbar";

interface Sign {
  id: string;
  name: string;
  vimeoUrl: string;
}

// 1. All 20 Provided Signs
const signLibrary: Sign[] = [
  { id: 'me', name: 'ME (I)', vimeoUrl: 'https://player.vimeo.com/video/344400170' },
  { id: 'you', name: 'YOU', vimeoUrl: 'https://player.vimeo.com/video/345973780' },
  { id: 'index', name: 'HE/SHE/IT', vimeoUrl: 'https://player.vimeo.com/video/346494952' },
  { id: 'they', name: 'THEY', vimeoUrl: 'https://player.vimeo.com/video/346052458' },
  { id: 'go', name: 'GO', vimeoUrl: 'https://player.vimeo.com/video/345800220' },
  { id: 'want', name: 'WANT', vimeoUrl: 'https://player.vimeo.com/video/345798094' },
  { id: 'like', name: 'LIKE', vimeoUrl: 'https://player.vimeo.com/video/346602424' },
  { id: 'eat', name: 'EAT', vimeoUrl: 'https://player.vimeo.com/video/345536275' },
  { id: 'work', name: 'WORK', vimeoUrl: 'https://player.vimeo.com/video/344359531' },
  { id: 'sleep', name: 'SLEEP', vimeoUrl: 'https://player.vimeo.com/video/345563279' },
  { id: 'learn', name: 'LEARN', vimeoUrl: 'https://player.vimeo.com/video/344393673' },
  { id: 'see', name: 'SEE', vimeoUrl: 'https://player.vimeo.com/video/345588085' },
  { id: 'now', name: 'NOW', vimeoUrl: 'https://player.vimeo.com/video/345800480' },
  { id: 'tomorrow', name: 'TOMORROW', vimeoUrl: 'https://player.vimeo.com/video/346494879' },
  { id: 'yesterday', name: 'YESTERDAY', vimeoUrl: 'https://player.vimeo.com/video/345803814' },
  { id: 'night', name: 'NIGHT', vimeoUrl: 'https://player.vimeo.com/video/344216312' },
  { id: 'restaurant', name: 'RESTAURANT', vimeoUrl: 'https://player.vimeo.com/video/345972230' },
  { id: 'home', name: 'HOME', vimeoUrl: 'https://player.vimeo.com/video/344359901' },
  { id: 'school', name: 'SCHOOL', vimeoUrl: 'https://player.vimeo.com/video/345801623' },
  { id: 'gym', name: 'GYM', vimeoUrl: 'https://player.vimeo.com/video/346775414' },
];

// 2. Phrase Database (10 Phrases - 5 will be chosen randomly per game)
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

  // Initialize game and load from local storage
  useEffect(() => {
    setMounted(true);
    const storedHighScore = localStorage.getItem('sign_combo_highscore');
    const storedGames = localStorage.getItem('sign_combo_gamesplayed');
    if (storedHighScore) setHighScore(parseInt(storedHighScore));
    if (storedGames) setGamesPlayed(parseInt(storedGames));
    
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

    // Build the 12-sign bank: Correct signs + random signs
    const correctIds = phrase.correctOrder;
    const correctSigns = signLibrary.filter(s => correctIds.includes(s.id));
    const randomSigns = shuffleArray(signLibrary.filter(s => !correctIds.includes(s.id))).slice(0, 6 - correctSigns.length);
    setCurrentBank(shuffleArray([...correctSigns, ...randomSigns]));
  };

  const checkPhrase = () => {
    const target = gamePhrases[currentIdx].correctOrder;
    const user = workArea.map(s => s.id);
    const correctCount = user.filter(id => target.includes(id)).length;

    let pointsEarned = 0;
    let isPerfect = false;
    let currentHint = "";

    // Score Logic
    if (JSON.stringify(user) === JSON.stringify(target)) {
      pointsEarned = 150;
      isPerfect = true;
    } else if (user.length === target.length && correctCount === target.length) {
      pointsEarned = 100;
      currentHint = "Incorrect order. Remember, Time and Place usually come first in ASL!";
    } else {
      pointsEarned = correctCount * 15;
      if (user.length < target.length) {
        currentHint = `You are missing ${target.length - user.length} sign(s).`;
      } else {
        currentHint = `${user.length - correctCount} sign(s) are incorrect.`;
      }
    }

    if (!hasBeenScored) {
      setScore(prev => prev + pointsEarned);
      setHasBeenScored(true);
    }

    setIsCorrect(isPerfect);
    setHint(currentHint);
    setShowReveal(false);
  };

  const handleNextPhrase = () => {
    if (currentIdx === 4) {
      // End of Game
      setGameOver(true);
      const newGamesPlayed = gamesPlayed + 1;
      setGamesPlayed(newGamesPlayed);
      localStorage.setItem('sign_combo_gamesplayed', newGamesPlayed.toString());
      
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('sign_combo_highscore', score.toString());
      }
    } else {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      setupPhrase(gamePhrases[next]);
    }
  };


  if (!mounted || gamePhrases.length === 0) return null;

  // Filters the current bank to only show signs NOT already in the work area
  const availableSigns = currentBank.filter(
    (bankSign) => !workArea.some((workSign) => workSign.id === bankSign.id)
  );

  // GAME OVER SCREEN
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Trophy size={80} className="text-yellow-500 mb-6 animate-bounce" />
        <h1 className="text-5xl font-black text-black mb-2">Game Complete!</h1>
        {score > highScore && score > 0 ? (
          <p className="text-green-600 font-bold text-2xl mb-6">🎉 NEW HIGH SCORE! 🎉</p>
        ) : (
          <p className="text-gray-500 font-bold text-xl mb-6">Great practice!</p>
        )}
        
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 w-full max-w-md border border-gray-100 text-center">
          <p className="text-gray-400 uppercase text-sm font-bold tracking-widest mb-2">Final Score</p>
          <p className="text-7xl font-black text-blue-600 mb-8">{score}</p>
          <div className="flex justify-between border-t border-gray-100 pt-6">
            <div><p className="text-xs text-gray-400 font-bold">HIGH SCORE</p><p className="font-black text-xl">{Math.max(score, highScore)}</p></div>
            <div><p className="text-xs text-gray-400 font-bold">GAMES PLAYED</p><p className="font-black text-xl">{gamesPlayed}</p></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={startNewGame} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-colors">Play Again</button>
          <button onClick={() => window.location.href = '/games'} className="bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-colors">Exit to Games</button>
        </div>
      </div>
    );
  }

  // MAIN GAME UI
  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <Navbar active="Games" />

      <main className="w-full max-w-6xl mx-auto mt-8 px-4 pb-12">
        <div className="flex justify-between items-end mb-8 border-b pb-4 border-gray-100">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">Sign Combo</h1>
            <p className="mt-1 text-blue-600 font-bold text-sm uppercase tracking-widest">Phrase {currentIdx + 1} of 5</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Score</p>
            <p className="text-3xl font-black text-black">{score}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
              <span className="text-blue-200 text-sm font-bold uppercase tracking-widest">Translate this:</span>
              <h2 className="text-3xl font-bold mt-1">"{gamePhrases[currentIdx].english}"</h2>
            </div>

            {/* FEEDBACK OVERLAY (Correct or Hint) */}
            <div className="relative min-h-[100px] flex flex-col gap-4">
              {isCorrect && (
                <div className="bg-green-500 rounded-3xl flex items-center justify-between text-white p-6 animate-in zoom-in duration-300 shadow-lg">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 size={36} />
                    <h3 className="text-2xl font-bold">Perfect!</h3>
                  </div>
                  <button onClick={handleNextPhrase} className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex gap-2 items-center shadow-sm">
                    {currentIdx === 4 ? "Finish Game" : "Next Phrase"} <ArrowRight size={18}/>
                  </button>
                </div>
              )}

              {hint && !isCorrect && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-4 shadow-sm">
                  <div className="flex gap-3 items-start">
                    <Lightbulb className="text-orange-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-orange-900 font-bold">Hint</p>
                      <p className="text-orange-800 text-sm">{hint}</p>
                    </div>
                  </div>
                  
                  {showReveal ? (
                    <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-inner">
                      <p className="text-xs text-orange-500 font-bold uppercase mb-1">Correct Answer:</p>
                      <p className="font-black text-orange-900 text-lg">
                        {gamePhrases[currentIdx].correctOrder.map(id => signLibrary.find(s=>s.id === id)?.name).join(' + ')}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex gap-3 mt-2 border-t border-orange-200 pt-4">
                    <button onClick={() => setHint("")} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 text-sm shadow-sm">
                      Try Again
                    </button>
                    {!showReveal && (
                      <button onClick={() => setShowReveal(true)} className="bg-white border-2 border-orange-200 text-orange-700 px-6 py-2 rounded-lg font-bold hover:bg-orange-100 text-sm transition-colors">
                        Reveal Answer
                      </button>
                    )}
                    {showReveal && (
                      <button onClick={handleNextPhrase} className="ml-auto bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-black text-sm shadow-sm flex items-center gap-2">
                         {currentIdx === 4 ? "Finish Game" : "Skip Phrase"} <ArrowRight size={16}/>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DROP ZONE (WORK AREA) */}
            <div className="bg-blue-50/50 border-4 border-dashed border-blue-200 rounded-3xl p-6 min-h-[160px] flex flex-wrap gap-4 items-center justify-center transition-all">
              {workArea.length === 0 ? (
                <div className="flex flex-col items-center text-blue-300">
                  <MoveHorizontal size={32} className="mb-2" />
                  <p className="font-medium">Selected signs will appear here</p>
                </div>
              ) : (
                workArea.map((sign, idx) => (
                  <div key={`${sign.id}-work-${idx}`} className="relative bg-white p-1 rounded-2xl shadow-lg border border-blue-200 overflow-hidden group animate-in fade-in zoom-in duration-200">
                    <div className="w-32 h-24 bg-gray-100 rounded-xl overflow-hidden">
                       <iframe src={`${sign.vimeoUrl}?background=1&muted=1`} className="w-full h-full scale-150 pointer-events-none" />
                    </div>
                    <button 
                      onClick={() => setWorkArea(workArea.filter((_, i) => i !== idx))} 
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* CARD LIBRARY (THE BANK) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 uppercase tracking-tighter">Available Signs</h3>
                <button 
                  onClick={checkPhrase} 
                  disabled={workArea.length === 0 || isCorrect || showReveal}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  <Play size={18} fill="currentColor" /> Check Sentence
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 min-h-[120px]">
                {availableSigns.length === 0 && workArea.length > 0 ? (
                  <p className="col-span-full text-center text-gray-400 italic py-8">All signs have been moved to the work area.</p>
                ) : (
                  availableSigns.map((sign) => (
                    <button
                      key={`${sign.id}-bank`}
                      onClick={() => {
                        setWorkArea([...workArea, sign]);
                        setHint(""); // Clear hints when they make a new move
                      }}
                      className="aspect-[3/4] bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all active:scale-95 group animate-in fade-in duration-300"
                    >
                      <div className="w-full h-full pointer-events-none">
                          <iframe src={`${sign.vimeoUrl}?background=1&muted=1`} className="w-full h-full scale-[1.8]" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <BookOpen size={20} className="text-blue-500" />
                Scoring Guide
              </h3>
              <ul className="text-sm text-gray-600 leading-relaxed space-y-3">
                <li className="flex justify-between border-b pb-2"><span>Perfect Match:</span> <strong className="text-blue-600">150 pts</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Right Signs, Wrong Order:</span> <strong className="text-blue-600">100 pts</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Partial Match:</span> <strong className="text-blue-600">15 pts / sign</strong></li>
              </ul>
              <p className="text-xs text-gray-400 mt-4 italic">Points are awarded on your first check. Use hints to learn without losing points!</p>
            </div>

            {/* GRAMMAR TIPS */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <BookOpen size={20} className="text-blue-600" />
                ASL Grammar Tips
              </h3>
              <ul className="text-sm text-blue-800 leading-relaxed space-y-3 list-disc pl-4 marker:text-blue-400">
                <li><strong>Time First:</strong> Always place time words (NOW, YESTERDAY, TOMORROW) at the very beginning of your sentence.</li>
                <li><strong>Drop the Extras:</strong> ASL doesn't use words like "am," "is," "are," "the," or "to." Just stick to the core signs!</li>
              </ul>
            </div>
            
            <button 
              onClick={() => {setWorkArea([]); setHint(""); setShowReveal(false);}}
              className="w-full flex items-center justify-center gap-2 py-4 text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              <RefreshCcw size={18} /> Reset Signs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}