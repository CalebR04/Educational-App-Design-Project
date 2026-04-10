import { alphabetLessons } from "./alphabet";
import { lessonConfigs } from "./lessonConfigs";
import type { Lesson } from "./alphabet";
import type { LessonConfig } from "./lessonConfigs";

// Pre-built static lessons (alphabet with synthesize steps)
export const staticLessons: Record<string, Lesson> = alphabetLessons;

// Dynamic lessons built from vocab configs at runtime
export const dynamicLessonConfigs: Record<string, LessonConfig> = lessonConfigs;

export type LessonMeta = {
  id: string;
  title: string;
  level: number;
  levelTitle: string;
  duration: string;
  tags: string[];
  href: string;
  tip?: string;
};

export const allLessonMeta: LessonMeta[] = [
  // Level 1
  { id: "alphabet-1",  title: "Alphabet A – M",        level: 1, levelTitle: "The Basics",              duration: "10 min", tags: ["A-M", "Fingerspelling", "Handshapes"], href: "/lessons/alphabet-1" },
  { id: "alphabet-2",  title: "Alphabet N – Z",        level: 1, levelTitle: "The Basics",              duration: "12 min", tags: ["N-Z", "Motion Signs", "Review"],      href: "/lessons/alphabet-2" },
  { id: "numbers-1",   title: "Numbers 0 – 9",         level: 1, levelTitle: "The Basics",              duration: "8 min",  tags: ["Numbers", "Counting"],                href: "/lessons/numbers-1" },
  { id: "deixis-1",    title: "Deixis – Pointing",     level: 1, levelTitle: "The Basics",              duration: "8 min",  tags: ["Pronouns", "Pointing", "Deixis"],     href: "/lessons/deixis-1" },
  // Level 2
  { id: "greetings-contact",  title: "Initial Contact", level: 2, levelTitle: "Basic Greetings & Social", duration: "10 min", tags: ["Hello", "Introductions"],       href: "/lessons/greetings-contact" },
  { id: "greetings-manners",  title: "Manners",         level: 2, levelTitle: "Basic Greetings & Social", duration: "10 min", tags: ["Thank You", "Please", "Polite"], href: "/lessons/greetings-manners" },
  { id: "greetings-survival", title: "Survival Signs",  level: 2, levelTitle: "Basic Greetings & Social", duration: "10 min", tags: ["Help", "Understand"],           href: "/lessons/greetings-survival" },
  // Level 3
  { id: "vocab-family",  title: "Family",   level: 3, levelTitle: "Everyday Vocab", duration: "12 min", tags: ["Family", "Relationships"],        href: "/lessons/vocab-family",  tip: "Signs above the nose are masculine; signs near the chin are feminine." },
  { id: "vocab-food",    title: "Food",     level: 3, levelTitle: "Everyday Vocab", duration: "10 min", tags: ["Food", "Eating"],                  href: "/lessons/vocab-food" },
  { id: "vocab-drinks",  title: "Drinks",   level: 3, levelTitle: "Everyday Vocab", duration: "10 min", tags: ["Drinks", "Beverages"],             href: "/lessons/vocab-drinks" },
  { id: "vocab-colors",  title: "Colors",   level: 3, levelTitle: "Everyday Vocab", duration: "12 min", tags: ["Colors", "Descriptive"],           href: "/lessons/vocab-colors" },
  // Level 4
  { id: "conv-questions",   title: "Question Words",       level: 4, levelTitle: "Conversational ASL", duration: "12 min", tags: ["WH-Questions", "Conversation"], href: "/lessons/conv-questions",   tip: "In ASL, question words often go at the END of the sentence. Furrow your brows for all WH-questions." },
  { id: "conv-time",        title: "Time",                 level: 4, levelTitle: "Conversational ASL", duration: "10 min", tags: ["Time", "Tense"],                href: "/lessons/conv-time" },
  { id: "conv-directions",  title: "Directions & Location",level: 4, levelTitle: "Conversational ASL", duration: "10 min", tags: ["Places", "Movement"],           href: "/lessons/conv-directions" },
];
