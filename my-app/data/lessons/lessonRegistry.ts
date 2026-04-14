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
  description: string;
  level: number;
  levelTitle: string;
  duration: string;
  tags: string[];
  outcomes: string[];
  href: string;
  tip?: string;
};

export const allLessonMeta: LessonMeta[] = [
  // Level 1
  { id: "alphabet-1",  title: "Alphabet A – M",        description: "Learn to fingerspell the first half of the ASL alphabet, from A to M, building the foundation for spelling any word.",           level: 1, levelTitle: "The Basics",              duration: "10 min", tags: ["A-M", "Fingerspelling", "Handshapes"], outcomes: ["Recognize and sign letters A through M", "Understand basic handshape formations", "Begin fingerspelling short words"],                         href: "/lessons/alphabet-1" },
  { id: "alphabet-2",  title: "Alphabet N – Z",        description: "Complete the ASL alphabet by learning letters N through Z.",                       level: 1, levelTitle: "The Basics",              duration: "10 min", tags: ["N-Z", "Motion Signs", "Review"],      outcomes: ["Recognize and understand all letters in the ASL alphabet", "Sign motion-based letters", "Fingerspell any word"],                                         href: "/lessons/alphabet-2" },
  { id: "numbers-1",   title: "Numbers 0 – 9",         description: "Sign numbers zero through nine and practice counting.",                               level: 1, levelTitle: "The Basics",              duration: "7 min",  tags: ["Numbers", "Counting"],                outcomes: ["Recognize and understand numbers 0 through 9", "Count to 9 using ASL"],                                   href: "/lessons/numbers-1" },
  { id: "deixis-1",    title: "Deixis – Pointing",     description: "Learn how pointing replaces pronouns in ASL.",                level: 1, levelTitle: "The Basics",              duration: "4 min",  tags: ["Pronouns", "Pointing", "Deixis"],     outcomes: ["Use pointing to refer to people and objects", "Sign pronouns like I, you, and they"],               href: "/lessons/deixis-1" },
  // Level 2
  { id: "greetings-contact",  title: "Initial Contact", description: "Learn the essential greeting signs to start and end any ASL conversation.",               level: 2, levelTitle: "Basic Greetings & Social", duration: "5 min", tags: ["Hello", "Introductions"],       outcomes: ["Greet someone and say goodbye in ASL", "Introduce yourself in ASL", "Ask and answer 'How are you?'"],                           href: "/lessons/greetings-contact" },
  { id: "greetings-manners",  title: "Manners",         description: "Practice polite expressions for respectful everyday communication in ASL.",                  level: 2, levelTitle: "Basic Greetings & Social", duration: "5 min", tags: ["Thank You", "Please", "Polite"], outcomes: ["Sign please, thank you, and sorry", "Use polite expressions in context", "Respond appropriately to common courtesies"],                  href: "/lessons/greetings-manners" },
  { id: "greetings-survival", title: "Survival Signs",  description: "Pick up the most important signs for when communication breaks down.",           level: 2, levelTitle: "Basic Greetings & Social", duration: "5 min", tags: ["Help", "Understand"],           outcomes: ["Ask for help or repetition", "Sign understand and don't understand", "Handle common communication breakdowns"],                         href: "/lessons/greetings-survival" },
  // Level 3
  { id: "vocab-family",  title: "Family",   description: "Sign family members and learn to use ASL's distinctive masculine and feminine sign positions.",                        level: 3, levelTitle: "Everyday Vocab", duration: "5 min", tags: ["Family", "Relationships"],        outcomes: ["Sign immediate and extended family members", "Understand the masculine/feminine sign pattern", "Describe family relationships"],                href: "/lessons/vocab-family",  tip: "Signs above the nose are masculine; signs near the chin are feminine." },
  { id: "vocab-food",    title: "Food",     description: "Learn signs for common foods and meals.",                       level: 3, levelTitle: "Everyday Vocab", duration: "5 min", tags: ["Food", "Eating"],                  outcomes: ["Sign common foods and meals", "Ask about food preferences", "Use food signs in everyday conversation"],                                                href: "/lessons/vocab-food" },
  { id: "vocab-drinks",  title: "Drinks",   description: "Sign popular beverages so you can order, offer, and discuss drinks naturally in any ASL conversation.",                                    level: 3, levelTitle: "Everyday Vocab", duration: "5 min", tags: ["Drinks", "Beverages"],             outcomes: ["Sign common drinks and beverages", "Order or offer a drink in ASL", "Distinguish similar drink handshapes"],                                             href: "/lessons/vocab-drinks" },
  { id: "vocab-colors",  title: "Colors",   description: "Learn the core ASL color signs and practice using them to describe objects and surroundings around you.",                                   level: 3, levelTitle: "Everyday Vocab", duration: "6 min", tags: ["Colors", "Descriptive"],           outcomes: ["Sign the main colors in ASL", "Describe objects using color", "Combine color signs with nouns in context"],                                            href: "/lessons/vocab-colors" },
  { id: "vocab-routines",  title: "Daily Activities", description: "Learn action verbs for everyday activities like sleeping, learning, and more so you can describe your daily routine in ASL.",                    level: 3, levelTitle: "Everyday Vocab", duration: "5 min", tags: ["Actions", "Verbs", "Daily Life"],  outcomes: ["Sign common daily action verbs", "Express likes and wants in ASL", "Build simple sentences about your routine"],                                              href: "/lessons/vocab-routines" },
  { id: "vocab-places",    title: "Places",           description: "Sign common places like restaurant, gym, school, and home, and use time-of-day signs to talk about where you go throughout the day.",            level: 3, levelTitle: "Everyday Vocab", duration: "5 min", tags: ["Places", "Locations", "Daily Life"], outcomes: ["Sign common locations like restaurant, gym, and school", "Use morning and night with location signs", "Describe where you go during the day in ASL"],    href: "/lessons/vocab-places" },
  // Level 4
  { id: "conv-questions",   title: "Question Words",        description: "Learn how to ask questions in ASL.",          level: 4, levelTitle: "Conversational ASL", duration: "7 min", tags: ["WH-Questions", "Conversation"], outcomes: ["Sign who, what, where, when, why, and how", "Use WH-question facial grammar correctly", "Form simple questions in ASL word order"], href: "/lessons/conv-questions",   tip: "In ASL, question words often go at the END of the sentence. Furrow your brows for all WH-questions." },
  { id: "conv-time",        title: "Time",                  description: "Learn signs for times of day, days of the week, and tense markers to talk about when things happen.",                     level: 4, levelTitle: "Conversational ASL", duration: "5 min", tags: ["Time", "Tense"],                outcomes: ["Sign times of day and days of the week", "Express past, present, and future tense", "Discuss schedules and routines in ASL"],          href: "/lessons/conv-time" },
  { id: "conv-directions",  title: "Directions & Location", description: "Sign left, right, and common location words so you can give and follow basic directions in ASL.",                         level: 4, levelTitle: "Conversational ASL", duration: "5 min", tags: ["Places", "Movement"],           outcomes: ["Sign directional words like left, right, and straight", "Describe locations and places", "Give and follow basic directions in ASL"], href: "/lessons/conv-directions" },
];
