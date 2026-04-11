"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, UserPlus, User, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NavbarProps = {
  active: string;
};

export default function Navbar({ active }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestLogoutModal, setShowGuestLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setDisplayName(null);
      setIsGuest(false);
      return;
    }
    // Treat as guest if anonymous flag set, no email, or no linked identities
    const isAnon =
      user.is_anonymous === true ||
      !user.email ||
      (user.identities ?? []).length === 0;
    if (isAnon) {
      setDisplayName(null);
      setIsGuest(true);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    setDisplayName(profile?.full_name || "Account");
    setIsGuest(false);
  }

  useEffect(() => {
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/auth");
    router.refresh();
  };

  const handleGuestLogout = async () => {
    // Wipe all local lesson progress before signing out
    Object.keys(localStorage)
      .filter(k => k.startsWith("sign_quest_progress_"))
      .forEach(k => localStorage.removeItem(k));
    await supabase.auth.signOut();
    setShowGuestLogoutModal(false);
    setOpen(false);
    router.push("/auth");
    router.refresh();
  };

  const tabs = [
    { name: "Home",       href: "/" },
    { name: "Lessons",    href: "/lessons" },
    { name: "Dictionary", href: "/dictionary" },
    { name: "Games",      href: "/games" },
    { name: "Translate",  href: "/translator" },
    { name: "Profile",    href: "/profile" },
  ];

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-auto">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
              SQ
            </div>
            <span className="text-2xl font-bold text-gray-900">SignQuest</span>
          </div>

          {/* Nav tabs */}
          <nav className="flex flex-1 justify-center gap-3">
            {tabs.map((tab) => {
              const isActive = tab.name === active;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`rounded-xl px-4 py-3 text-lg font-semibold transition ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>

          {/* Settings icon + dropdown */}
          <div className="relative ml-4" ref={dropdownRef}>
            <button
              onClick={() => setOpen(prev => !prev)}
              className={`flex items-center justify-center h-10 w-10 rounded-xl transition ${
                open ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
                {/* Account info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      {displayName ? (
                        <>
                          <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                          <p className="text-xs text-gray-500">Signed in</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-gray-900">Guest</p>
                          <p className="text-xs text-gray-500">Progress is not being saved</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="py-1">
                  {displayName ? (
                    <>
                      <button
                        onClick={() => { router.push("/profile/settings"); setOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { router.push("/auth?tab=signup"); setOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </button>
                      <button
                        onClick={() => { setShowGuestLogoutModal(true); setOpen(false); }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Exit App
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Guest logout confirmation modal */}
      {showGuestLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Lose Your Progress?</h2>
            <p className="text-gray-500 text-sm mb-6">
              If you log out as a guest your progress will be permanently lost. Create a free account first to save everything.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowGuestLogoutModal(false); router.push("/auth?tab=signup"); }}
                className="w-full rounded-2xl bg-linear-to-r from-blue-500 to-purple-600 py-3 font-bold text-white hover:opacity-95 transition"
              >
                Create Account
              </button>
              <button
                onClick={handleGuestLogout}
                className="w-full rounded-2xl border-2 border-red-200 py-3 font-bold text-red-600 hover:bg-red-50 transition"
              >
                Log Out Anyway
              </button>
              <button
                onClick={() => setShowGuestLogoutModal(false)}
                className="w-full rounded-2xl border-2 border-gray-200 py-3 font-bold text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
