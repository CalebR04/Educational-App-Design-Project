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

  const logout = () => {
    router.push("/auth");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 relative">
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
            SQ
          </div>
          <span className="text-xl font-bold">SignQuest</span>
        </div>

        <nav className="flex items-center gap-6">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
                active === tab.name
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="text-xl hover:text-gray-600"
          >
            ⚙
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-56 rounded-xl border bg-white shadow-lg">
              <div className="p-3 font-semibold border-b">Settings</div>

              <div className="flex flex-col text-sm">
                <button className="px-4 py-3 text-left hover:bg-gray-100">
                  ✓ Notifications
                </button>

                <button className="px-4 py-3 text-left hover:bg-gray-100">
                  ✓ Sound Effects
                </button>

                <button className="px-4 py-3 text-left hover:bg-gray-100">
                  Profile Settings
                </button>

                <button className="px-4 py-3 text-left hover:bg-gray-100">
                  Appearance
                </button>

                <button className="px-4 py-3 text-left hover:bg-gray-100">
                  Help & Support
                </button>

                <button
                  onClick={logout}
                  className="px-4 py-3 text-left text-red-500 hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}