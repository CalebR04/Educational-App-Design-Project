"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

const LESSON_IDS = ["alphabet-1", "alphabet-2"];

export default function ContinueLessonButton() {
  const [href, setHref] = useState("/lessons");
  const [subtitle, setSubtitle] = useState("Pick up where you left off");

  useEffect(() => {
    for (const id of LESSON_IDS) {
      const saved = localStorage.getItem(`sign_quest_progress_${id}`);
      if (!saved) {
        // First lesson with no progress — start it
        setHref(`/lessons/${id}`);
        setSubtitle("Start your next lesson");
        return;
      }
      const parsed = JSON.parse(saved);
      if (parsed.status !== "Completed") {
        // In progress — continue it
        setHref(`/lessons/${id}`);
        setSubtitle(`Resume · ${parsed.progress ?? 0}% complete`);
        return;
      }
    }
    // All lessons completed
    setHref("/lessons");
    setSubtitle("All lessons complete!");
  }, []);

  return (
    <Link
      href={href}
      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left group block"
    >
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
        <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-white" />
      </div>
      <h4 className="font-bold text-gray-900 mb-1">Continue Lesson</h4>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </Link>
  );
}
