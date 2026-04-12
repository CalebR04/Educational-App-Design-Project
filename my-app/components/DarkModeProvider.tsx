"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DarkModeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
}

const supabase = createClient();

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function loadFromSupabase(): Promise<boolean | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase
    .from("profiles")
    .select("dark_mode")
    .eq("id", userId)
    .single();
  return data?.dark_mode ?? null;
}

async function saveToSupabase(value: boolean) {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from("profiles").upsert({ id: userId, dark_mode: value });
}

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply localStorage value immediately (fast, prevents flash)
    const local = localStorage.getItem("sq_dark_mode") === "true";
    setDarkMode(local);
    if (local) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Then sync from Supabase (authoritative)
    loadFromSupabase().then(remote => {
      if (remote === null) return; // not logged in or no preference set
      if (remote !== local) {
        // Supabase wins — update local state and localStorage
        localStorage.setItem("sq_dark_mode", String(remote));
        setDarkMode(remote);
        if (remote) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    });
  }, []);

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev;
      // Write to localStorage immediately (fast)
      localStorage.setItem("sq_dark_mode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      // Write to Supabase async
      saveToSupabase(next);
      return next;
    });
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}
