"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    searchParams.get("tab") === "signup" ? "signup" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (activeTab === "signup") {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }

      if (!displayName.trim()) {
        setErrorMessage("Please enter a display name.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);

    if (activeTab === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check username (display name) uniqueness
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", displayName.trim())
          .maybeSingle();

        if (existing) {
          setErrorMessage("That display name is already taken. Please choose another.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          username: displayName.trim(),
        });

        if (profileError) {
          setErrorMessage(profileError.message);
          setLoading(false);
          return;
        }
      }

      // Auto sign-in after account creation
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setSuccessMessage("Account created! Please log in.");
        setActiveTab("login");
        setPassword("");
        setConfirmPassword("");
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push("/lessons");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    // If "Remember me" is unchecked, remove the persisted token from localStorage
    // so the session doesn't survive a browser restart.
    if (!rememberMe) {
      Object.keys(localStorage)
        .filter(k => k.startsWith("sb-"))
        .forEach(k => localStorage.removeItem(k));
    }

    setLoading(false);
    router.push("/lessons");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl font-bold text-purple-500 shadow-lg">
            SQ
          </div>

          <h1 className="mt-5 text-5xl font-bold text-white">SignQuest</h1>
          <p className="mt-3 text-xl font-medium text-white">
            Learn ASL through gamification
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-2xl">
          <div className="flex rounded-2xl bg-gray-100 p-1">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 rounded-xl px-4 py-4 text-lg font-semibold transition ${
                activeTab === "login"
                  ? "bg-white text-[#0f172a] shadow"
                  : "text-gray-600"
              }`}
            >
              Log In
            </button>

            <button
              onClick={() => {
                setActiveTab("signup");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 rounded-xl px-4 py-4 text-lg font-semibold transition ${
                activeTab === "signup"
                  ? "bg-white text-[#0f172a] shadow"
                  : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-8">
            {activeTab === "signup" && (
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-[#334155]">
                  Display Name
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 px-4 py-4">
                  <span className="mr-3 text-gray-400">👤</span>
                  <input
                    type="text"
                    placeholder="Your real name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {activeTab === "signup" && (
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-[#334155]">
                  Display Name <span className="text-xs font-normal text-gray-400">(public · must be unique)</span>
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 px-4 py-4">
                  <span className="mr-3 text-gray-400">🏷️</span>
                  <input
                    type="text"
                    placeholder="Shown on leaderboards"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#334155]">
                Email Address
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 px-4 py-4">
                <span className="mr-3 text-gray-400">✉️</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-[#334155]">
                Password
              </label>
              <div className="flex items-center rounded-2xl border-2 border-gray-200 px-4 py-4">
                <span className="mr-3 text-gray-400">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-3 text-gray-400 hover:text-gray-600"
                >
                  👁
                </button>
              </div>
            </div>

            {activeTab === "login" && (
              <div className="mb-2 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#334155] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                  Remember me
                </label>
              </div>
            )}

            {activeTab === "signup" && (
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-[#334155]">
                  Confirm Password
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 px-4 py-4">
                  <span className="mr-3 text-gray-400">🔒</span>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {errorMessage && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                {successMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Please wait..."
                : activeTab === "login"
                ? "Log In"
                : "Create Account"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowGuestModal(true)}
            className="text-lg font-semibold text-white underline underline-offset-4"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* Guest warning modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-3xl mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Progress Won&apos;t Be Saved</h2>
            <p className="text-gray-500 text-sm mb-6">
              As a guest your progress is not saved. You can create a free account at any time to save everything.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  // Clear any lesson progress from a previous session
                  Object.keys(localStorage)
                    .filter(k => k.startsWith("sign_quest_progress_"))
                    .forEach(k => localStorage.removeItem(k));
                  await supabase.auth.signInAnonymously();
                  setShowGuestModal(false);
                  router.push("/");
                  router.refresh();
                }}
                className="w-full rounded-2xl bg-gray-900 py-3 font-bold text-white hover:bg-black transition"
              >
                Continue as Guest
              </button>
              <button
                onClick={() => { setShowGuestModal(false); setActiveTab("signup"); }}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 py-3 font-bold text-white hover:opacity-95 transition"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-500 via-purple-500 to-pink-500" />}>
      <AuthInner />
    </Suspense>
  );
}
