"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import Navbar from "./Navbar";

type Props = {
  title: string;
  navActive: string;
  requiresLevelName: string;
  lessons: string[];
};

export default function LockedScreen({ title, navActive, requiresLevelName, lessons }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar active={navActive} />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">{title} is Locked</h1>
        <p className="text-gray-500 mb-3 max-w-sm">
          Complete all <span className="font-semibold text-gray-700">{requiresLevelName}</span> lessons to unlock this.
        </p>
        <ul className="mb-6 space-y-1">
          {lessons.map(l => (
            <li key={l} className="text-sm text-gray-400 flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
              {l}
            </li>
          ))}
        </ul>
        <Link
          href="/lessons"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl transition"
        >
          Go to Lessons
        </Link>
      </div>
    </div>
  );
}
