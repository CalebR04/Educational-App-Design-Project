"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useDarkMode } from "@/components/DarkModeProvider";
import { Check, X, Moon, Sun, ChevronLeft, Volume2, VolumeX, Type } from "lucide-react";
import { getSoundMuted, setSoundMuted } from "@/hooks/useSound";

function getDyslexiaFont(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sq_dyslexia") === "true";
}
function setDyslexiaFont(value: boolean) {
  localStorage.setItem("sq_dyslexia", value ? "true" : "false");
  if (value) document.documentElement.classList.add("dyslexia");
  else document.documentElement.classList.remove("dyslexia");
}

const supabase = createClient();

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);

  // Saved (original) values
  const [savedFullName, setSavedFullName] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(null);

  // Working values
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [muted, setMuted] = useState(false);
  const [dyslexia, setDyslexia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Unsaved changes modal
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const pendingNavRef = useRef<(() => void) | null>(null);

  const hasChanges =
    username !== "" ||
    avatarFile !== null;

  useEffect(() => { setMuted(getSoundMuted()); setDyslexia(getDyslexiaFont()); }, []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setSavedFullName(profile.full_name ?? "");
        setSavedUsername(profile.username ?? "");
        setSavedAvatarUrl(profile.avatar_url ?? null);
        setAvatarUrl(profile.avatar_url ?? null);
        // Leave fullName/username empty — saved values show as placeholder
      }
    }
    load();
  }, [router]);

  // Warn on browser back / tab close
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasChanges) e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // Debounced username uniqueness check
  useEffect(() => {
    if (!username.trim() || !userId) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.trim())
        .neq("id", userId)
        .maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    }, 500);
    return () => clearTimeout(timer);
  }, [username, userId]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  // Navigate with unsaved-changes guard
  const guardedNavigate = useCallback((nav: () => void) => {
    if (hasChanges) {
      pendingNavRef.current = nav;
      setShowUnsavedModal(true);
    } else {
      nav();
    }
  }, [hasChanges]);

  function handleDiscard() {
    setShowUnsavedModal(false);
    const nav = pendingNavRef.current;
    pendingNavRef.current = null;
    nav?.();
  }

  async function handleSaveAndNavigate() {
    await handleSave();
    setShowUnsavedModal(false);
    const nav = pendingNavRef.current;
    pendingNavRef.current = null;
    nav?.();
  }

  async function handleSave() {
    if (!userId) return;
    if (usernameStatus === "taken") { setSaveMessage({ type: "error", text: "That display name is already taken." }); return; }
    setSaving(true);
    setSaveMessage(null);

    let newAvatarUrl = avatarUrl;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setSaveMessage({ type: "error", text: "Failed to upload avatar: " + uploadError.message });
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(path);
      newAvatarUrl = urlData.publicUrl + `?t=${Date.now()}`;
    }

    const newUsername = username.trim() || savedUsername;

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: newUsername,
      avatar_url: newAvatarUrl,
    });

    if (error) {
      setSaveMessage({ type: "error", text: error.message });
    } else {
      setAvatarUrl(newAvatarUrl);
      setSavedAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setUsername("");
      setSavedUsername(newUsername);
      setSaveMessage({ type: "success", text: "Settings saved!" });
    }
    setSaving(false);
  }

  const avatarSrc = avatarPreview ?? avatarUrl;

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Profile" />

      <main className="max-w-5xl mx-auto px-4 py-3">
        {/* Back */}
        <button
          onClick={() => guardedNavigate(() => router.back())}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-2 transition-colors text-sm font-semibold"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h1>

        <div className="grid md:grid-cols-2 gap-5">

          {/* ── Profile section ── */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Profile</h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-400">👤</span>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div>
                <p className="font-semibold text-gray-900">{savedFullName || savedUsername || "Your Name"}</p>
                <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-500 hover:underline mt-0.5">
                  Change picture
                </button>
              </div>
            </div>

            {/* Display name */}
            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Display Name <span className="text-xs font-normal text-gray-400">(shown on leaderboards)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={savedUsername || "Unique display name"}
                  className={`w-full rounded-xl border-2 px-4 py-3 pr-10 text-sm font-medium text-gray-900 outline-none transition-colors ${
                    usernameStatus === "taken"     ? "border-red-400 focus:border-red-500" :
                    usernameStatus === "available" ? "border-green-400 focus:border-green-500" :
                    "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === "checking"  && <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />}
                  {usernameStatus === "available" && <Check className="h-4 w-4 text-green-500" />}
                  {usernameStatus === "taken"     && <X className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {usernameStatus === "taken"     && <p className="mt-1 text-xs text-red-500">That display name is already taken.</p>}
              {usernameStatus === "available" && <p className="mt-1 text-xs text-green-600">Available!</p>}
            </div>

            {/* Save */}
            <div className="mt-auto">
              {saveMessage && (
                <p className={`mb-3 text-sm font-medium px-4 py-3 rounded-xl ${
                  saveMessage.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}>
                  {saveMessage.text}
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saving || usernameStatus === "taken"}
                className="w-full rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 py-4 font-bold text-white hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* ── Accessibility section ── */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Accessibility</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                <div>
                  <p className="font-semibold text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-500">Changes the app to a dark theme</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${darkMode ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {muted ? <VolumeX className="h-5 w-5 text-gray-400" /> : <Volume2 className="h-5 w-5 text-green-500" />}
                <div>
                  <p className="font-semibold text-gray-900">Sound Effects</p>
                  <p className="text-xs text-gray-500">Play sounds for correct/incorrect answers</p>
                </div>
              </div>
              <button
                onClick={() => { const next = !muted; setMuted(next); setSoundMuted(next); }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${!muted ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${!muted ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className={`h-5 w-5 ${dyslexia ? "text-purple-500" : "text-gray-400"}`} />
                <div>
                  <p className="font-semibold text-gray-900">Dyslexia-Friendly Font</p>
                  <p className="text-xs text-gray-500">Switches all text to OpenDyslexic</p>
                </div>
              </div>
              <button
                onClick={() => { const next = !dyslexia; setDyslexia(next); setDyslexiaFont(next); }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${dyslexia ? "bg-purple-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${dyslexia ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Unsaved changes modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Unsaved Changes</h2>
            <p className="text-gray-500 text-sm mb-6">
              You have unsaved changes. Would you like to save them before leaving?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveAndNavigate}
                disabled={saving}
                className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 py-3 font-bold text-white transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save & Leave"}
              </button>
              <button
                onClick={handleDiscard}
                className="w-full rounded-2xl border-2 border-red-200 py-3 font-bold text-red-600 hover:bg-red-50 transition"
              >
                Discard Changes
              </button>
              <button
                onClick={() => { setShowUnsavedModal(false); pendingNavRef.current = null; }}
                className="w-full rounded-2xl border-2 border-gray-200 py-3 font-bold text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
