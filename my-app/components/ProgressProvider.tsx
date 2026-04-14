"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchAllLessonProgress } from "@/lib/supabase/lessonProgress";

export type UnlockState = {
  level1Complete: boolean;
  level2Complete: boolean;
  level3Complete: boolean;
  loaded: boolean;
};

const LEVEL_1_IDS = ["alphabet-1", "alphabet-2", "numbers-1", "deixis-1"];
const LEVEL_2_IDS = ["greetings-contact", "greetings-manners", "greetings-survival"];
const LEVEL_3_IDS = ["vocab-family", "vocab-food", "vocab-drinks", "vocab-colors", "vocab-routines", "vocab-places"];

const ProgressContext = createContext<UnlockState>({
  level1Complete: false,
  level2Complete: false,
  level3Complete: false,
  loaded: false,
});

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UnlockState>({
    level1Complete: false,
    level2Complete: false,
    level3Complete: false,
    loaded: false,
  });

  // ── Guest session: init + tab-close cleanup ────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.is_anonymous) return; // Real user — nothing to do.

      // No real user: ensure an anonymous guest session exists for this tab.
      const { ensureGuestSession } = await import("@/lib/supabase/guestClient");
      await ensureGuestSession();
    }

    init();

    // On tab/browser close, delete the guest's rows from the database.
    async function handlePageHide() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.is_anonymous) return; // Real user keeps their data.

      const { getGuestUserId, getGuestAccessToken } = await import("@/lib/supabase/guestClient");
      const [userId, accessToken] = await Promise.all([getGuestUserId(), getGuestAccessToken()]);
      if (!userId || !accessToken) return;

      // sendBeacon works even as the page unloads.
      navigator.sendBeacon(
        "/api/cleanup-guest",
        new Blob([JSON.stringify({ userId, accessToken })], { type: "application/json" })
      );
    }

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  // ── Unlock state ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllLessonProgress().then(data => {
      const completed = (ids: string[]) => ids.every(id => data[id]?.ever_completed === true);
      const level1Complete = completed(LEVEL_1_IDS);
      const level2Complete = level1Complete && completed(LEVEL_2_IDS);
      const level3Complete = level2Complete && completed(LEVEL_3_IDS);
      setState({ level1Complete, level2Complete, level3Complete, loaded: true });
    });
  }, []);

  return <ProgressContext.Provider value={state}>{children}</ProgressContext.Provider>;
}

export const useProgress = () => useContext(ProgressContext);
