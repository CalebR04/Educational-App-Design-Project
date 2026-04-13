"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
