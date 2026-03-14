"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center text-center text-white">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl font-bold text-purple-500 shadow-lg">
            SQ
          </div>

          <h1 className="mt-5 text-4xl font-bold">SignQuest</h1>
          <p className="mt-2 text-white/90">Learn ASL through gamification</p>
        </div>

        <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-2xl">

          <div className="flex rounded-2xl bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 rounded-xl px-4 py-2 font-semibold transition ${
                activeTab === "login"
                  ? "bg-white text-black shadow"
                  : "text-gray-600"
              }`}
            >
              Log In
            </button>

            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 rounded-xl px-4 py-2 font-semibold transition ${
                activeTab === "signup"
                  ? "bg-white text-black shadow"
                  : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-6">

            {activeTab === "signup" && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="mt-1 w-full rounded-xl border px-4 py-2"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="mt-1 w-full rounded-xl border px-4 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>

              <div className="flex items-center rounded-xl border px-4 py-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="flex-1 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400"
                >
                  👁
                </button>
              </div>
            </div>

            {activeTab === "signup" && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="mt-1 w-full rounded-xl border px-4 py-2"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-bold text-white"
            >
              {activeTab === "login" ? "↪ Log In" : "✨ Create Account"}
            </button>

          </div>

          <div className="mt-6 flex items-center gap-3 text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm">Or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <button className="rounded-xl border py-2">G</button>
            <button className="rounded-xl border py-2"></button>
            <button className="rounded-xl border py-2">f</button>
          </div>

        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-white underline"
          >
            Continue as Guest
          </button>
        </div>

      </div>
    </div>
  );
}