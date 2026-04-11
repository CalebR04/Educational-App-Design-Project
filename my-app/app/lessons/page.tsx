"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { allLessonMeta } from "@/data/lessons/lessonRegistry";
import type { LessonMeta } from "@/data/lessons/lessonRegistry";
import { BookOpen, Target, MessageSquare, Users, Lock, PlayCircle, RefreshCcw, Clock3 } from "lucide-react";
import { fetchAllLessonProgress, upsertLessonProgress } from "@/lib/supabase/lessonProgress";
import type { LessonProgressRow } from "@/lib/supabase/lessonProgress";

type LessonStatus = "Completed" | "In Progress" | "Not Started";

type LessonWithStatus = LessonMeta & {
  status: LessonStatus;
  progress?: number;
  everCompleted: boolean;
  locked: boolean;
};

const LEVEL_META: Record<number, { title: string; subtitle: string; color: string; icon: React.ReactNode }> = {
  1: { title: "The Basics",            subtitle: "Alphabet, numbers, and pointing signs",      color: "from-blue-500 to-blue-600",    icon: <BookOpen className="h-6 w-6 text-white" /> },
  2: { title: "Greetings & Social",    subtitle: "Introductions, manners, and survival signs", color: "from-purple-500 to-purple-600", icon: <MessageSquare className="h-6 w-6 text-white" /> },
  3: { title: "Everyday Vocab",        subtitle: "Family, food, drinks, and colors",           color: "from-orange-500 to-orange-600", icon: <Target className="h-6 w-6 text-white" /> },
  4: { title: "Conversational ASL",    subtitle: "Questions, time, and directions",            color: "from-green-500 to-green-600",   icon: <Users className="h-6 w-6 text-white" /> },
};

function applyLocks(raw: LessonWithStatus[]): LessonWithStatus[] {
  return raw.map(lesson => {
    if (lesson.level === 1) return lesson;
    const prevLevel = raw.filter(l => l.level === lesson.level - 1);
    const unlocked = prevLevel.length > 0 && prevLevel.every(l => l.everCompleted);
    return { ...lesson, locked: !unlocked };
  });
}

function buildFromLocal(dbOverrides: Record<string, LessonProgressRow> = {}): LessonWithStatus[] {
  const raw: LessonWithStatus[] = allLessonMeta.map(meta => {
    const db = dbOverrides[meta.id];
    const saved = localStorage.getItem(`sign_quest_progress_${meta.id}`);
    const local = saved ? JSON.parse(saved) : null;

    // ever_completed: Supabase is authoritative; fall back to localStorage
    const everCompleted = db?.ever_completed === true || local?.everCompleted === true;
    const status: LessonStatus = db?.status ?? local?.status ?? "Not Started";
    const progress: number = db?.progress ?? local?.progress ?? 0;

    // Keep localStorage in sync if Supabase has newer data
    if (db && local && db.ever_completed && !local.everCompleted) {
      localStorage.setItem(`sign_quest_progress_${meta.id}`, JSON.stringify({ ...local, everCompleted: true }));
    }

    return { ...meta, status, progress, everCompleted, locked: false };
  });
  return applyLocks(raw);
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonWithStatus[]>([]);
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, overall: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Render immediately from localStorage, then merge Supabase data
    const initial = buildFromLocal();
    setLessons(initial);
    setMounted(true);
    computeStats(initial);

    fetchAllLessonProgress().then(dbData => {
      if (Object.keys(dbData).length === 0) return;
      const merged = buildFromLocal(dbData);
      setLessons(merged);
      computeStats(merged);
    });
  }, []);

  function computeStats(ls: LessonWithStatus[]) {
    let comp = 0, inProg = 0, totalPts = 0;
    for (const l of ls) {
      if (l.everCompleted) { comp++; totalPts += 100; }
      else if (l.status === "In Progress") { inProg++; totalPts += l.progress ?? 0; }
    }
    setStats({ completed: comp, inProgress: inProg, overall: allLessonMeta.length ? Math.round(totalPts / allLessonMeta.length) : 0 });
  }

  const handleReset = (id: string) => {
    const saved = localStorage.getItem(`sign_quest_progress_${id}`);
    const wasCompleted = saved ? JSON.parse(saved).everCompleted === true : false;
    const resetData = { status: "Not Started", progress: 0, correctCount: 0, currentIndex: 0, queue: [], everCompleted: wasCompleted };
    localStorage.setItem(`sign_quest_progress_${id}`, JSON.stringify(resetData));
    // Sync reset to Supabase (keeps ever_completed, clears active progress)
    upsertLessonProgress(id, { status: "Not Started", progress: 0, ever_completed: wasCompleted, correct_count: 0 });
    setLessons(prev => applyLocks(prev.map(l => l.id === id ? { ...l, status: "Not Started", progress: 0 } : l)));
  };

  const levels = [1, 2, 3, 4];

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Lessons" />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Learn ASL</h1>
          <p className="text-gray-600">Structured lessons to build your signing skills.</p>
        </div>

        {/* Journey banner */}
        <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-1">Your Learning Journey</h2>
          <p className="text-white/80 mb-6">Keep up the great work!</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.completed}</div>
              <div className="text-sm text-white/90">Completed</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.inProgress}</div>
              <div className="text-sm text-white/90">In Progress</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.overall}%</div>
              <div className="text-sm text-white/90">Overall</div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-full h-3 overflow-hidden">
            <div className="bg-white h-3 transition-all duration-500" style={{ width: `${stats.overall}%` }} />
          </div>
        </div>

        {/* Practice modes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Practice Modes</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Link href="/lessons/sign-practice" className="block">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Sign Practice</h3>
                    <p className="text-gray-600 text-sm">12 questions focused on your weakest signs. Gets smarter as you learn.</p>
                  </div>
                </div>
              </div>
            </Link>
            <ComingSoonCard icon={<MessageSquare className="h-8 w-8 text-white" />} color="from-purple-500 to-purple-600" title="Conversation Practice" desc="Build fluency through interactive scenarios." />
          </div>
        </div>

        {/* Level sections */}
        <div className="space-y-10">
          {levels.map(level => {
            const meta = LEVEL_META[level];
            const levelLessons = lessons.filter(l => l.level === level);
            const isLevelLocked = levelLessons.length > 0 && levelLessons[0].locked;

            return (
              <div key={level}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 bg-linear-to-br ${meta.color} rounded-xl flex items-center justify-center shrink-0 ${isLevelLocked ? "opacity-40" : ""}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isLevelLocked ? "text-gray-400" : "text-gray-900"}`}>{meta.title}</h2>
                    <p className="text-sm text-gray-500">{meta.subtitle}</p>
                  </div>
                </div>

                {/* Lock notice */}
                {isLevelLocked && (
                  <p className="text-sm text-gray-500 mb-3 ml-1 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                    Complete all <span className="font-semibold">{LEVEL_META[level - 1].title}</span> lessons to unlock these lessons.
                  </p>
                )}

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-2">
                  {levelLessons.map(lesson => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      mounted={mounted}
                      onReset={() => handleReset(lesson.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function compLabel(stats: { completed: number }) {
  if (stats.completed === 0) return "Just getting started";
  if (stats.completed === 1) return "1 lesson complete";
  return `${stats.completed} lessons complete`;
}

function ComingSoonCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 opacity-60 cursor-not-allowed">
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 bg-linear-to-br ${color} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-1">
            <Lock className="h-4 w-4" /> Coming Soon
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{desc}</p>
        </div>
      </div>
    </div>
  );
}


function LessonCard({ lesson, mounted, onReset }: { lesson: LessonWithStatus; mounted: boolean; onReset: () => void }) {
  const isCompleted  = lesson.status === "Completed";
  const isInProgress = lesson.status === "In Progress";
  const isLocked     = lesson.locked;

  // Show Completed badge once ever completed, regardless of current status
  const showCompleted  = mounted && lesson.everCompleted;
  const showInProgress = mounted && !lesson.everCompleted && isInProgress;
  const showNotStarted = mounted && !lesson.everCompleted && !isInProgress;

  // Progress bar is always rendered (invisible when not applicable) to keep card height fixed
  const showBar = mounted && (isInProgress || isCompleted) && typeof lesson.progress === "number";
  const barPct  = isCompleted ? 100 : (lesson.progress ?? 0);

  const cardBase = "flex h-full flex-col bg-white border-2 rounded-2xl p-6 transition-all";
  const cardStyle = isLocked
    ? `${cardBase} border-gray-100 opacity-50 cursor-not-allowed`
    : `${cardBase} border-gray-200 hover:border-blue-500 hover:shadow-xl cursor-pointer`;

  const inner = (
    <div className={cardStyle}>
      {/* Top row: status + controls */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {!mounted && <span className="h-4 w-20 rounded bg-gray-100 animate-pulse inline-block" />}
          {showCompleted  && <><span className="text-green-600">✓</span><span className="text-green-600">Completed</span></>}
          {showInProgress && <><PlayCircle className="h-4 w-4 text-blue-600" /><span className="text-blue-600">In Progress</span></>}
          {showNotStarted && !isLocked && <><BookOpen className="h-4 w-4 text-gray-500" /><span className="text-gray-500">Not Started</span></>}
          {isLocked       && <><Lock className="h-4 w-4 text-gray-400" /><span className="text-gray-400">Locked</span></>}
        </div>

        <div className="flex items-center gap-3">
          {mounted && (isCompleted || isInProgress) && !isLocked && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReset(); }}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
              title="Reset progress"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Reset
            </button>
          )}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock3 className="h-4 w-4" />
            <span>{lesson.duration}</span>
          </div>
        </div>
      </div>

      <h3 className="font-bold text-gray-900 mb-2">{lesson.title}</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {lesson.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{tag}</span>
        ))}
      </div>

      {/* Progress bar — always rendered at fixed height; invisible when not applicable */}
      <div className={showBar ? "mb-3" : "invisible mb-3"}>
        <div className="flex justify-between mb-1 text-xs font-medium text-gray-700">
          <span>Progress</span><span>{barPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${barPct}%` }} />
        </div>
      </div>

      {/* Practice button — always rendered at fixed height; invisible when not applicable */}
      <a
        href={mounted && lesson.everCompleted && !isLocked ? `/lessons/sign-practice?lesson=${lesson.id}` : undefined}
        onClick={e => { if (!mounted || !lesson.everCompleted || isLocked) { e.preventDefault(); return; } e.stopPropagation(); }}
        className={`flex w-full items-center justify-center rounded-xl border-2 py-2 text-sm font-bold transition-colors ${
          mounted && lesson.everCompleted && !isLocked
            ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
            : "invisible border-transparent"
        }`}
      >
        Practice
      </a>
    </div>
  );

  if (isLocked || !lesson.href) return inner;

  return (
    <div
      className="block h-full transition-transform active:scale-95 cursor-pointer"
      onClick={() => window.location.href = lesson.href}
    >
      {inner}
    </div>
  );
}
