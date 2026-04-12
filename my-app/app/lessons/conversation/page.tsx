"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { conversationScenarios } from "@/data/conversations/scenarios";
import { ChevronLeft, MessageSquare, X } from "lucide-react";

export default function ConversationListPage() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

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
            <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
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
              className={`flex flex-col overflow-hidden rounded-2xl bg-linear-to-br ${scenario.color} hover:shadow-xl hover:scale-[1.02] transition-all`}
            >
              <div className="p-6 text-white">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">{scenario.title}</h2>
                <p className="text-white/90 text-sm mb-3">{scenario.description}</p>
                <div className="inline-flex bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                  {scenario.difficulty}
                </div>
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
              <li className="flex gap-2"><span className="text-purple-500 font-bold shrink-0">2.</span>Pick the correct response from 4 video options, or build it using a word bank</li>
              <li className="flex gap-2"><span className="text-purple-500 font-bold shrink-0">3.</span>When using the word bank the sentence will only need the words for an ASL response (i.e. no filler words)</li>
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
