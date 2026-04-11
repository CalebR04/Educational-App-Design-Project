"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useDarkMode } from "@/components/DarkModeProvider";
import { Camera, Check, X, Moon, Sun, ChevronLeft } from "lucide-react";

const supabase = createClient();

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        setFullName(profile.full_name ?? "");
        setUsername(profile.username ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
      }
    }
    load();
  }, [router]);

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

  async function handleSave() {
    if (!userId) return;
    if (usernameStatus === "taken") { setSaveMessage({ type: "error", text: "That display name is already taken." }); return; }
    setSaving(true);
    setSaveMessage(null);

    let newAvatarUrl = avatarUrl;

    // Upload avatar if changed
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

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName.trim(),
      username: username.trim(),
      avatar_url: newAvatarUrl,
    });

    if (error) {
      setSaveMessage({ type: "error", text: error.message });
    } else {
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setSaveMessage({ type: "success", text: "Settings saved!" });
    }
    setSaving(false);
  }

  const avatarSrc = avatarPreview ?? avatarUrl;

  return (
    <div className="min-h-screen bg-white">
      <Navbar active="Profile" />

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6 transition-colors text-sm font-semibold"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

        {/* ── Profile section ── */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-400">👤</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow transition"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{fullName || "Your Name"}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-500 hover:underline mt-0.5"
              >
                Change picture
              </button>
            </div>
          </div>

          {/* Full name */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your real name"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Display name / username */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Display Name <span className="text-xs font-normal text-gray-400">(shown on leaderboards)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Unique display name"
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
        </div>

        {/* ── Accessibility section ── */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Accessibility</h2>

          <div className="flex items-center justify-between">
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
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        {/* Save button */}
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
      </main>
    </div>
  );
}
