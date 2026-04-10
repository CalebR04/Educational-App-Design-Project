"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          username: email.split("@")[0],
        });

        if (profileError) {
          setErrorMessage(profileError.message);
          setLoading(false);
          return;
        }
      }

      setSuccessMessage("Account created successfully. You can now sign in.");
      setActiveTab("login");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
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
                  Full Name
                </label>
                <div className="flex items-center rounded-2xl border-2 border-gray-200 px-4 py-4">
                  <span className="mr-3 text-gray-400">👤</span>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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

            <div className="mt-2 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#334155]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>Remember me</span>
              </label>

              {activeTab === "login" ? (
                <button
                  type="button"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              ) : (
                <button
                  type="button"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Terms
                </button>
              )}
            </div>

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
                ? "↪ Log In"
                : "✨ Create Account"}
            </button>
          </div>

          <div className="mt-8 flex items-center gap-4 text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm">Or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button className="rounded-2xl border-2 border-gray-200 py-4 text-2xl hover:bg-gray-50">
              G
            </button>
            <button className="rounded-2xl border-2 border-gray-200 py-4 text-2xl hover:bg-gray-50">
              
            </button>
            <button className="rounded-2xl border-2 border-gray-200 py-4 text-2xl hover:bg-gray-50">
              f
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-lg font-semibold text-white underline underline-offset-4"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}