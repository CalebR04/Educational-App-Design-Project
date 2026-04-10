"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, LogIn, UserPlus, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NavbarProps = {
  active: string;
};

export default function Navbar({ active }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
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

  const tabs = [
    { name: "Home",       href: "/" },
    { name: "Lessons",    href: "/lessons" },
    { name: "Dictionary", href: "/dictionary" },
    { name: "Games",      href: "/games" },
    { name: "Translate",  href: "/translator" },
    { name: "Profile",    href: "/profile" },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-auto">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
            SQ
          </div>
          <span className="text-2xl font-bold text-[#0f172a]">SignQuest</span>
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
                    : "text-[#334155] hover:bg-gray-50 hover:text-[#0f172a]"
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
                    {userEmail ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900 truncate">{userEmail}</p>
                        <p className="text-xs text-gray-500">Signed in</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-900">Guest</p>
                        <p className="text-xs text-gray-500">Progress saved locally only</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="py-1">
                {userEmail ? (
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { router.push("/auth"); setOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      Log In
                    </button>
                    <button
                      onClick={() => { router.push("/auth"); setOpen(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
