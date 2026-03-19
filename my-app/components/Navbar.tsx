"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type NavbarProps = {
  active: string;
};

export default function Navbar({ active }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const tabs = [
    { name: "Home", href: "/" },
    { name: "Lessons", href: "/lessons" },
    { name: "Dictionary", href: "/dictionary" },
    { name: "Games", href: "/games" },
    { name: "Translate", href: "/translator" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
        {/* Logo / App Name */}
        <div className="flex items-center gap-3 mr-auto">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
            SQ
          </div>
          <span className="text-2xl font-bold text-[#0f172a]">SignQuest</span>
        </div>

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

        {/*
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="text-2xl text-[#334155] transition hover:text-[#0f172a]"
          >
            ⚙
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-60 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
              <div className="border-b border-gray-200 px-4 py-3 text-lg font-semibold text-[#0f172a]">
                Settings
              </div>

              <div className="py-2">
                <button className="block w-full px-4 py-3 text-left text-base text-[#334155] hover:bg-gray-50">
                  ✓ Notifications
                </button>
                <button className="block w-full px-4 py-3 text-left text-base text-[#334155] hover:bg-gray-50">
                  ✓ Sound Effects
                </button>
                <button className="block w-full px-4 py-3 text-left text-base text-[#334155] hover:bg-gray-50">
                  Profile Settings
                </button>
                <button className="block w-full px-4 py-3 text-left text-base text-[#334155] hover:bg-gray-50">
                  Appearance
                </button>
                <button className="block w-full px-4 py-3 text-left text-base text-[#334155] hover:bg-gray-50">
                  Help & Support
                </button>
                <button
                  onClick={() => router.push("/auth")}
                  className="block w-full px-4 py-3 text-left text-base text-red-500 hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
        */}
      </div>
    </header>
  );
}