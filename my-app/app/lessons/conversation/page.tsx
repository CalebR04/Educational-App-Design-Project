"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { conversationScenarios } from "@/data/conversations/scenarios";
import { ChevronLeft, X, CheckCircle2 } from "lucide-react";

function loadCompletions(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const data: Record<string, number> = {};
  for (const s of conversationScenarios) {
    const raw = localStorage.getItem(`conv_${s.id}`);
    if (raw) { try { data[s.id] = JSON.parse(raw).pct; } catch {} }
  }
  return data;
}

export default function ConversationListPage() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [completions] = useState<Record<string, number>>(loadCompletions);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar active="Lessons" />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="mb-4">
          <button
            onClick={() => router.push("/lessons")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-3 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Lessons
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Conversation Practice</h1>
              <p className="text-gray-600 dark:text-gray-400">Interactive ASL scenarios with a partner</p>
            </div>
            <button
              onClick={() => setShowHelp(true)}
              className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 transition text-sm shrink-0"
            >
              ?
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {conversationScenarios.map(scenario => (
            <Link
              key={scenario.id}
              href={`/lessons/conversation/${scenario.id}`}
              className={`relative flex flex-col overflow-hidden rounded-2xl bg-linear-to-br ${scenario.color} hover:shadow-xl hover:scale-[1.02] transition-all`}
            >
              {completions[scenario.id] !== undefined && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-bold">{completions[scenario.id]}%</span>
                </div>
              )}
              <div className="p-6 text-white">
                <h2 className="text-xl font-bold mb-2">{scenario.title}</h2>
                <p className="text-white/90 text-sm">{scenario.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">How to Play</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
              <li className="flex gap-2"><span className="text-purple-500 font-bold shrink-0">1.</span>Watch a partner sign a sentence to you</li>
              <li className="flex gap-2"><span className="text-purple-500 font-bold shrink-0">2.</span>Pick the correct ASL response from 3 video options</li>
              <li className="flex gap-2"><span className="text-purple-500 font-bold shrink-0">3.</span>Complete all turns to finish the conversation and earn a score badge</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-5 bg-linear-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-bold"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
