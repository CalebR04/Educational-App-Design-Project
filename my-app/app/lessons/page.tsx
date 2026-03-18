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
  Sparkles,
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
  status: "Completed" | "In Progress" | "Not Started" | "Locked";
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

<<<<<<< HEAD
const defaultSections: LessonSection[] = [
    {
      title: "Getting Started",
      subtitle: "Master the fundamentals of ASL",
      icon: <BookOpen className="h-5 w-5 text-white" />,
      iconBg: "bg-blue-500",
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
          status: "Not Started",
          tags: ["Hello/Goodbye", "How are you?", "+1 more"],
        },
      ],
    },
    {
      title: "Everyday Vocabulary",
      subtitle: "Common words and phrases for daily life",
      icon: <BookOpen className="h-5 w-5 text-white" />,
      iconBg: "bg-purple-500",
      lessons: [
        {
          title: "Family & Relationships",
          description: "Signs for family members and relationship terms",
          duration: "18 min",
          status: "Not Started",
          tags: ["Immediate Family", "Extended Family", "+1 more"],
        },
        {
          title: "Food & Drinks",
          description: "Express your hunger and favorite meals in ASL",
          duration: "22 min",
          status: "Locked",
          tags: ["Meals", "Beverages", "+2 more"],
        },
        {
          title: "Colors & Shapes",
          description: "Describe the world around you with colors and shapes",
          duration: "15 min",
          status: "Locked",
          tags: ["Primary Colors", "Secondary Colors", "+1 more"],
        },
      ],
    },
    {
      title: "Conversational ASL",
      subtitle: "Build fluency with natural conversations",
      icon: <Sparkles className="h-5 w-5 text-white" />,
      iconBg: "bg-green-500",
      lessons: [
        {
          title: "Question Words",
          description: "Who, What, Where, When, Why, and How in ASL",
          duration: "16 min",
          status: "Locked",
          tags: ["WH-Questions", "Facial Expressions", "+1 more"],
        },
        {
          title: "Time & Dates",
          description: "Talk about time, days, months, and years",
          duration: "20 min",
          status: "Locked",
          tags: ["Days", "Months", "+2 more"],
        },
      ],
    },
  ];

export default function LessonsPage() {
  // 1. Setup the state
  const [sections, setSections] = useState<LessonSection[]>(defaultSections);
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, overall: 0 });

  // 2. Fetch the data from Local Storage when the page loads
  useEffect(() => {
    let comp = 0;
    let inProg = 0;
    let totalTrackedLessons = 0;
    let totalProgressPoints = 0;

    const updatedSections = defaultSections.map(section => {
      const updatedLessons = section.lessons.map(lesson => {
        // Skip locked or non-linked lessons for stats
        if (!lesson.href || lesson.status === "Locked") return lesson;
        
        totalTrackedLessons++;
        
        // Extract the lesson ID from the href (e.g., "/lessons/alphabet-1" -> "alphabet-1")
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
        
        return lesson;
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
  }, []);
=======
const sectionMeta: Record<
  string,
  { subtitle: string; iconBg: string; icon: React.ReactNode }
> = {
  "Getting Started": {
    subtitle: "Master the fundamentals of ASL",
    iconBg: "bg-blue-500",
    icon: <BookOpen className="h-5 w-5 text-white" />,
  },
  "Everyday Vocabulary": {
    subtitle: "Common words and phrases for daily life",
    iconBg: "bg-purple-500",
    icon: <BookOpen className="h-5 w-5 text-white" />,
  },
  "Conversational ASL": {
    subtitle: "Build fluency with natural conversations",
    iconBg: "bg-green-500",
    icon: <Sparkles className="h-5 w-5 text-white" />,
  },
};

const lessonMeta: Record<
  string,
  { tags: string[]; status?: "Completed" | "In Progress" | "Not Started"; progress?: number }
> = {
  "ASL Alphabet": {
    tags: ["A-Z Letters", "Practice Tips", "+1 more"],
    status: "Completed",
    progress: 100,
  },
  "Numbers 1-100": {
    tags: ["1-10", "11-20", "+2 more"],
    status: "In Progress",
    progress: 65,
  },
  "Basic Greetings": {
    tags: ["Hello/Goodbye", "How are you?", "+1 more"],
    status: "Not Started",
  },
  "Family & Relationships": {
    tags: ["Immediate Family", "Extended Family", "+1 more"],
    status: "Not Started",
  },
  "Food & Drinks": {
    tags: ["Meals", "Beverages", "+2 more"],
  },
  "Colors & Shapes": {
    tags: ["Primary Colors", "Secondary Colors", "+1 more"],
  },
  "Question Words": {
    tags: ["WH-Questions", "Facial Expressions", "+1 more"],
  },
  "Time & Dates": {
    tags: ["Days", "Months", "+2 more"],
  },
};

function mapDbLessonToCard(lesson: DbLesson): LessonCard {
  const meta = lessonMeta[lesson.title];

  if (lesson.is_locked) {
    return {
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      status: "Locked",
      tags: meta?.tags ?? ["+ details soon"],
    };
  }

  return {
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
    status: meta?.status ?? "Not Started",
    progress: meta?.progress,
    tags: meta?.tags ?? ["+ details soon"],
  };
}

export default async function LessonsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar active="Lessons" />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Learn ASL
          </h1>
          <p className="mt-2 text-lg text-red-600">Failed to load lessons.</p>
        </main>
      </div>
    );
  }

  const dbLessons = (data ?? []) as DbLesson[];

  const groupedLessons = dbLessons.reduce<Record<string, DbLesson[]>>((acc, lesson) => {
    if (!acc[lesson.category]) {
      acc[lesson.category] = [];
    }
    acc[lesson.category].push(lesson);
    return acc;
  }, {});

  const sections: LessonSection[] = Object.entries(groupedLessons).map(
    ([category, lessons]) => {
      const meta = sectionMeta[category] ?? {
        subtitle: "Continue building your ASL skills",
        iconBg: "bg-slate-500",
        icon: <BookOpen className="h-5 w-5 text-white" />,
      };

      return {
        title: category,
        subtitle: meta.subtitle,
        iconBg: meta.iconBg,
        icon: meta.icon,
        lessons: lessons.map(mapDbLessonToCard),
      };
    }
  );

  const totalCompleted = sections
    .flatMap((section) => section.lessons)
    .filter((lesson) => lesson.status === "Completed").length;

  const totalInProgress = sections
    .flatMap((section) => section.lessons)
    .filter((lesson) => lesson.status === "In Progress").length;

  const totalLessons = sections.flatMap((section) => section.lessons).length;

  const overallProgress =
    totalLessons > 0
      ? Math.round(
          sections
            .flatMap((section) => section.lessons)
            .reduce((sum, lesson) => sum + (lesson.progress ?? 0), 0) / totalLessons
        )
      : 0;
>>>>>>> 2322bbea839aae61df3a1cb164baddfe3166f978

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Lessons" />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <section>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Learn ASL
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Structured lessons and practice to build your signing skills
          </p>
        </section>

        {/* Practice cards */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">Practice</h2>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-sm">
                  <Camera className="h-8 w-8 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-slate-900">
                    Camera Practice
                  </h3>
                  <p className="mt-2 max-w-xl text-lg leading-8 text-slate-600">
                    Use your camera to practice signs with real-time AI
                    feedback. Perfect your handshape, orientation, and movement.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                    <button className="font-semibold text-blue-600 transition hover:text-blue-700">
                      Start Practicing →
                    </button>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Live feedback</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Hand detection</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 shadow-sm">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-slate-900">
                    Conversation Practice
                  </h3>
                  <p className="mt-2 max-w-xl text-lg leading-8 text-slate-600">
                    Practice real-world conversations with NPCs. Build fluency
                    through interactive dialogues and scenarios.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                    <button className="font-semibold text-purple-600 transition hover:text-purple-700">
                      Start Conversation →
                    </button>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Interactive</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Real scenarios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey banner */}
        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-4xl font-bold">Your Learning Journey</h2>
              <p className="mt-2 text-lg text-white/90">Keep up the great work!</p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center self-start rounded-full bg-white/15">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
              <div className="text-5xl font-extrabold">{stats.completed}</div>
              <div className="mt-1 text-lg text-white/90">Completed</div>
            </div>

            <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
              <div className="text-5xl font-extrabold">{stats.inProgress}</div>
              <div className="mt-1 text-lg text-white/90">In Progress</div>
            </div>

            <div className="rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
              <div className="text-5xl font-extrabold">{stats.overall}%</div>
              <div className="mt-1 text-lg text-white/90">Overall</div>
            </div>
          </div>

          <div className="mt-6 h-3 w-full rounded-full bg-white/25">
            <div
              className="h-3 rounded-full bg-white"
              style={{ width: `${stats.overall}%` }}
            />
          </div>
        </section>

        {/* Lesson sections */}
        <section className="mt-10 space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${section.iconBg}`}
                >
                  {section.icon}
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    {section.title}
                  </h2>
                  <p className="text-lg text-slate-600">{section.subtitle}</p>
                </div>
              </div>

              <div
                className={`mt-5 grid gap-6 ${
                  section.lessons.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {section.lessons.map((lesson) => (
                  <LessonCardView key={lesson.title} lesson={lesson} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-10 rounded-[2rem] bg-green-500 px-6 py-12 text-center text-white shadow-sm sm:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <Sparkles className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-4xl font-extrabold">Ready to level up?</h2>
            <p className="mt-3 text-lg text-white/90">
              Complete lessons to unlock advanced content and earn achievements!
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-green-600 transition hover:scale-[1.02]">
                Practice with Camera
              </button>
              <button className="rounded-2xl bg-white/20 px-8 py-4 text-lg font-bold text-white transition hover:bg-white/25">
                Play Games
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LessonCardView({ lesson }: { lesson: LessonCard }) {
  const isCompleted = lesson.status === "Completed";
  const isInProgress = lesson.status === "In Progress";
  const isNotStarted = lesson.status === "Not Started";
  const isLocked = lesson.status === "Locked";

  const statusColor = isCompleted
    ? "text-green-600"
    : isInProgress
    ? "text-blue-600"
    : isNotStarted
    ? "text-slate-600"
    : "text-slate-400";

  const cardClasses = isCompleted
    ? "border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]"
    : "border-slate-200";

  const muted = isLocked ? "opacity-45" : "";

  const CardContent = (
    <div
      className={`flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md ${cardClasses} ${muted}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex items-center gap-2 text-sm font-semibold ${statusColor}`}>
          {isCompleted && <span>✓</span>}
          {isInProgress && <PlayCircle className="h-4 w-4" />}
          {isNotStarted && <BookOpen className="h-4 w-4" />}
          {isLocked && <Lock className="h-4 w-4" />}
          <span>{lesson.status}</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-slate-500">
          <Clock3 className="h-4 w-4" />
          <span>{lesson.duration}</span>
        </div>
      </div>

      <h3 className="mt-5 text-3xl font-bold text-slate-900">{lesson.title}</h3>
      <p className="mt-3 flex-1 text-lg leading-8 text-slate-600">{lesson.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {lesson.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {(isCompleted || isInProgress) && typeof lesson.progress === "number" && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Progress</span>
            <span>{lesson.progress}%</span>
          </div>

          <div className="h-2.5 rounded-full bg-slate-200">
            <div
              className="h-2.5 rounded-full bg-blue-500"
              style={{ width: `${lesson.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const isClickable = lesson.href && !isLocked;

  if (isClickable) {
    return (
      <Link href={lesson.href!} className="block h-full transition-transform active:scale-95">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}