"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/server";

import {
  BookOpen,
  Camera,
  MessageSquare,
  Clock3,
  PlayCircle,
  Lock,
  RefreshCcw,
  Target,
  Users,
} from "lucide-react";

type DbLesson = {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  is_locked: boolean;
};

type LessonCard = {
  title: string;
  description: string;
  duration: string;
  status: "Completed" | "In Progress" | "Not Started" | "Locked" | "Coming Soon";
  progress?: number;
  tags: string[];
  href?: string;
};

type LessonSection = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  lessons: LessonCard[];
};

const defaultSections: LessonSection[] = [
    {
      title: "Getting Started",
      subtitle: "Master the fundamentals of ASL",
      icon: <BookOpen className="h-6 w-6 text-white" />,
      iconBg: "bg-linear-to-br from-blue-500 to-blue-600",
      lessons: [
        {
          title: "ASL Alphabet: A-M",
          description: "Master the first half of the alphabet from A to M.",
          duration: "10 min",
          status: "Completed",
          progress: 100,
          tags: ["A-M", "Fingerspelling", "Handshapes"],
          href: "/lessons/alphabet-1",
        },
        {
          title: "ASL Alphabet: N-Z",
          description: "Complete the alphabet by learning letters N through Z.",
          duration: "12 min",
          status: "In Progress",
          progress: 15,
          tags: ["N-Z", "Motion Signs", "Review"],
          href: "/lessons/alphabet-2",
        },
        {
          title: "Basic Greetings",
          description: "Essential signs for everyday conversations",
          duration: "12 min",
          status: "Coming Soon",
          tags: ["Hello/Goodbye", "How are you?", "+1 more"],
        },
      ],
    },
    {
      title: "Everyday Vocabulary",
      subtitle: "Common words and phrases for daily life",
      icon: <Target className="h-6 w-6 text-white" />,
      iconBg: "bg-linear-to-br from-purple-500 to-purple-600",
      lessons: [
        {
          title: "Family & Relationships",
          description: "Signs for family members and relationship terms",
          duration: "18 min",
          status: "Coming Soon",
          tags: ["Immediate Family", "Extended Family", "+1 more"],
        },
        {
          title: "Food & Drinks",
          description: "Express your hunger and favorite meals in ASL",
          duration: "22 min",
          status: "Coming Soon",
          tags: ["Meals", "Beverages", "+2 more"],
        },
        {
          title: "Colors & Shapes",
          description: "Describe the world around you with colors and shapes",
          duration: "15 min",
          status: "Coming Soon",
          tags: ["Primary Colors", "Secondary Colors", "+1 more"],
        },
      ],
    },
    {
      title: "Conversational ASL",
      subtitle: "Build fluency with natural conversations",
      icon: <Users className="h-6 w-6 text-white" />,
      iconBg: "bg-linear-to-br from-green-500 to-green-600",
      lessons: [
        {
          title: "Question Words",
          description: "Who, What, Where, When, Why, and How in ASL",
          duration: "16 min",
          status: "Coming Soon",
          tags: ["WH-Questions", "Facial Expressions", "+1 more"],
        },
        {
          title: "Time & Dates",
          description: "Talk about time, days, months, and years",
          duration: "20 min",
          status: "Coming Soon",
          tags: ["Days", "Months", "+2 more"],
        },
      ],
    },
  ];

export default function LessonsPage() {
  // Setup the state
  const [sections, setSections] = useState<LessonSection[]>(defaultSections);
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, overall: 0 });
  const [mounted, setMounted] = useState(false);

  // Fetch the data from Local Storage when the page loads
  useEffect(() => {
    let comp = 0;
    let inProg = 0;
    let totalTrackedLessons = 0;
    let totalProgressPoints = 0;

    const updatedSections = defaultSections.map(section => {
      const updatedLessons = section.lessons.map(lesson => {
        // Skip locked or non-linked lessons for stats
        if (!lesson.href || lesson.status === "Locked" || lesson.status === "Coming Soon") return lesson;

        totalTrackedLessons++;

        // Extract the lesson ID from the href
        const lessonId = lesson.href.split("/").pop();
        const savedData = localStorage.getItem(`sign_quest_progress_${lessonId}`);

        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.status === "Completed") {
            comp++;
            totalProgressPoints += 100;
          } else if (parsed.status === "In Progress") {
            inProg++;
            totalProgressPoints += parsed.progress;
          }
          // Return the lesson with the updated saved progress
          return { ...lesson, status: parsed.status, progress: parsed.progress };
        }

        // No saved data — treat as Not Started regardless of hardcoded default
        return { ...lesson, status: "Not Started" as const, progress: undefined };
      });
      return { ...section, lessons: updatedLessons };
    });

    // Update the UI
    setSections(updatedSections);
    setStats({
      completed: comp,
      inProgress: inProg,
      overall: totalTrackedLessons ? Math.round(totalProgressPoints / totalTrackedLessons) : 0
    });
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Lessons" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Learn ASL
          </h1>
          <p className="text-gray-600">
            Structured lessons and practice to build your signing skills
          </p>
        </div>

        {/* Practice cards */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Practice</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 opacity-60 cursor-not-allowed">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Camera className="h-8 w-8 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
                    <Lock className="h-4 w-4" /> Coming Soon
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Camera Practice
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use your camera to practice signs with real-time AI
                    feedback. Perfect your handshape, orientation, and movement.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-gray-500">Live feedback</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">Hand detection</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 opacity-60 cursor-not-allowed">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
                    <Lock className="h-4 w-4" /> Coming Soon
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Conversation Practice
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Practice real-world conversations with NPCs. Build fluency
                    through interactive dialogues and scenarios.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-gray-500">Interactive</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">Real scenarios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Journey banner */}
        <div className="bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Your Learning Journey</h2>
            <p className="text-white/90">Keep up the great work!</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
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
            <div
              className="bg-white h-3 transition-all duration-500"
              style={{ width: `${stats.overall}%` }}
            />
          </div>
        </div>

        {/* Lesson sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 ${section.iconBg} rounded-xl flex items-center justify-center`}
                >
                  {section.icon}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                  <p className="text-sm text-gray-600">{section.subtitle}</p>
                </div>
              </div>

              <div
                className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              >
                {section.lessons.map((lesson) => (
                  <LessonCardView
                    key={lesson.title}
                    lesson={lesson}
                    mounted={mounted}
                    onReset={lesson.href ? () => {
                      const lessonId = lesson.href!.split('/').pop()!;
                      localStorage.removeItem(`sign_quest_progress_${lessonId}`);
                      setSections(prev => prev.map(s => ({
                        ...s,
                        lessons: s.lessons.map(l =>
                          l.href === lesson.href ? { ...l, status: 'Not Started' as const, progress: undefined } : l
                        )
                      })));
                    } : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

function LessonCardView({ lesson, onReset, mounted }: { lesson: LessonCard; onReset?: () => void; mounted: boolean }) {
  const isCompleted = lesson.status === "Completed";
  const isInProgress = lesson.status === "In Progress";
  const isNotStarted = lesson.status === "Not Started";
  const isLocked = lesson.status === "Locked";
  const isComingSoon = lesson.status === "Coming Soon";

  const statusColor = isCompleted
    ? "text-green-600"
    : isInProgress
    ? "text-blue-600"
    : isNotStarted
    ? "text-gray-600"
    : "text-gray-400";

  const cardClasses = isLocked || isComingSoon
    ? "border-gray-200 opacity-60 cursor-not-allowed"
    : "border-gray-200 hover:border-blue-500 hover:shadow-xl cursor-pointer";

  const CardContent = (
    <div
      className={`flex h-full flex-col bg-white border-2 rounded-2xl p-6 transition-all ${cardClasses}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center gap-2 text-sm font-semibold ${mounted ? statusColor : 'text-gray-300'}`}>
          {mounted ? (
            <>
              {isCompleted && <span>✓</span>}
              {isInProgress && <PlayCircle className="h-4 w-4" />}
              {isNotStarted && <BookOpen className="h-4 w-4" />}
              {isLocked && <Lock className="h-4 w-4" />}
              {isComingSoon && <Lock className="h-4 w-4" />}
              <span>{isComingSoon ? "Coming Soon" : lesson.status}</span>
            </>
          ) : (
            <span className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-3">
          {(isCompleted || isInProgress) && onReset && (
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
      <p className="text-sm text-gray-600 mb-4 flex-1">{lesson.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {lesson.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {mounted && (isCompleted || isInProgress) && typeof lesson.progress === "number" && (
        <div>
          <div className="flex items-center justify-between mb-2 text-xs font-medium text-gray-700">
            <span>Progress</span>
            <span>{lesson.progress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${lesson.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const isClickable = lesson.href && !isLocked && !isComingSoon;

  if (isClickable) {
    return (
      <Link href={lesson.href!} className="block h-full transition-transform active:scale-95">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
