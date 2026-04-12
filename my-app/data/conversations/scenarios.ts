import { lessonConfigs } from "../lessons/lessonConfigs";

export type ConvSign = {
  src: string;
  mediaType: "image" | "video";
  label: string;
};

export type ResponseOption = {
  id: string;
  signs: ConvSign[];
  correct: boolean;
};

export type ConversationTurn = {
  id: string;
  partnerSigns: ConvSign[];
  partnerEnglish: string;
  yourEnglish: string;
  yourSigns: ConvSign[];
  options: ResponseOption[];
};

export type ConversationScenario = {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
  turns: ConversationTurn[];
};

// ── Single Source of Truth ────────────────────────────────────────────────────
// All sign data (video URLs, labels, mediaType) is sourced from lessonConfigs.
// Never hardcode video paths here — add new signs to lessonConfigs first.

function buildVocabLookup() {
  const map: Record<string, { src: string; mediaType: "image" | "video"; label: string }> = {};
  for (const config of Object.values(lessonConfigs)) {
    for (const item of config.vocab) {
      map[item.key] = { src: item.mediaSrc, mediaType: item.mediaType, label: item.label };
    }
  }
  return function sign(key: string): ConvSign {
    const v = map[key];
    if (!v) throw new Error(`[scenarios] Sign key "${key}" not found in lessonConfigs. Add it there first.`);
    return v;
  };
}

const sign = buildVocabLookup();

// Shorthand aliases — add new entries by adding the VocabItem to lessonConfigs, then alias here
const S = {
  ME:           sign("sign_me"),
  YOU:          sign("sign_you"),
  THEY:         sign("sign_they"),
  HELLO:        sign("sign_hello"),
  GOOD_MORNING: sign("sign_morning"),
  HOW:          sign("sign_how"),
  GOOD:         sign("sign_good"),
  THANK_YOU:    sign("sign_thankyou"),
  PLEASE:       sign("sign_please"),
  SORRY:        sign("sign_sorry"),
  FINE:         sign("sign_fine"),
  NICE:         sign("sign_nice"),
  MEET:         sign("sign_meet"),
  NAME:         sign("sign_name"),
  HELP:         sign("sign_help"),
  AGAIN:        sign("sign_again"),
  SLOW:         sign("sign_slow"),
  UNDERSTAND:   sign("sign_understand"),
  KNOW:         sign("sign_know"),
  FORGET:       sign("sign_forget"),
  WELCOME:      sign("sign_welcome"),
  HOME:         sign("sign_home"),
  WORK:         sign("sign_work"),
  SCHOOL:       sign("sign_school"),
  GO:           sign("sign_go"),
  COME:         sign("sign_come"),
  WANT:         sign("sign_want"),
  MOTHER:       sign("sign_mother"),
  FATHER:       sign("sign_father"),
  BROTHER:      sign("sign_brother"),
  SISTER:       sign("sign_sister"),
  NOW:          sign("sign_now"),
  LATER:        sign("sign_later"),
  TODAY:        sign("sign_today"),
  TOMORROW:     sign("sign_tomorrow"),
  YESTERDAY:    sign("sign_yesterday"),
  WHERE:        sign("sign_where"),
  WHAT:         sign("sign_what"),
  WHEN:         sign("sign_when"),
  WHO:          sign("sign_who"),
  WHY:          sign("sign_why"),
};

// ── Scenarios ─────────────────────────────────────────────────────────────────

export const conversationScenarios: ConversationScenario[] = [
  // ── Scenario 1: Morning Greetings ─────────────────────────────────────────
  {
    id: "morning-greetings",
    title: "Morning Greetings",
    description: "You run into a friend at school. Practice a full greeting exchange.",
    difficulty: "Beginner",
    color: "from-blue-500 to-cyan-500",
    turns: [
      {
        id: "mg-1",
        partnerSigns: [S.GOOD_MORNING, S.HOW, S.YOU],
        partnerEnglish: "Good morning! How are you?",
        yourEnglish: "I am fine, thank you!",
        yourSigns: [S.ME, S.FINE, S.THANK_YOU],
        options: [
          { id: "a", signs: [S.ME, S.FINE, S.THANK_YOU], correct: true },
          { id: "b", signs: [S.HELLO, S.THANK_YOU], correct: false },
          { id: "c", signs: [S.ME, S.SORRY], correct: false },
          { id: "d", signs: [S.GOOD_MORNING, S.HELP], correct: false },
        ],
      },
      {
        id: "mg-2",
        partnerSigns: [S.WHAT, S.YOU, S.NAME],
        partnerEnglish: "What is your name?",
        yourEnglish: "My name is... (Identify yourself)",
        yourSigns: [S.ME, S.NAME],
        options: [
          { id: "a", signs: [S.ME, S.NAME], correct: true },
          { id: "b", signs: [S.YOU, S.NAME], correct: false },
          { id: "c", signs: [S.NICE, S.NAME], correct: false },
          { id: "d", signs: [S.WHO, S.NAME], correct: false },
        ],
      },
      {
        id: "mg-3",
        partnerSigns: [S.NICE, S.MEET, S.YOU],
        partnerEnglish: "Nice to meet you!",
        yourEnglish: "Nice to meet you too! Thank you.",
        yourSigns: [S.NICE, S.MEET, S.YOU, S.THANK_YOU],
        options: [
          { id: "a", signs: [S.NICE, S.MEET, S.YOU, S.THANK_YOU], correct: true },
          { id: "b", signs: [S.THANK_YOU, S.HELLO], correct: false },
          { id: "c", signs: [S.FINE, S.MEET, S.YOU], correct: false },
          { id: "d", signs: [S.PLEASE, S.MEET, S.YOU], correct: false },
        ],
      },
    ],
  },

  // ── Scenario 2: After School Plans ───────────────────────────────────────
  {
    id: "after-school-plans",
    title: "After School Plans",
    description: "Discuss what you and your family are doing after class.",
    difficulty: "Intermediate",
    color: "from-orange-500 to-red-500",
    turns: [
      {
        id: "asp-1",
        partnerSigns: [S.YOU, S.GO, S.HOME, S.NOW],
        partnerEnglish: "Are you going home now?",
        yourEnglish: "No, I go to work now.",
        yourSigns: [S.ME, S.GO, S.WORK, S.NOW],
        options: [
          { id: "a", signs: [S.ME, S.GO, S.WORK, S.NOW], correct: true },
          { id: "b", signs: [S.ME, S.GO, S.SCHOOL, S.NOW], correct: false },
          { id: "c", signs: [S.ME, S.GO, S.HOME, S.TOMORROW], correct: false },
          { id: "d", signs: [S.YOU, S.GO, S.WORK, S.NOW], correct: false },
        ],
      },
      {
        id: "asp-2",
        partnerSigns: [S.WHEN, S.YOU, S.GO, S.HOME],
        partnerEnglish: "When are you going home?",
        yourEnglish: "I go home later tomorrow.",
        yourSigns: [S.ME, S.GO, S.HOME, S.LATER, S.TOMORROW],
        options: [
          { id: "a", signs: [S.ME, S.GO, S.HOME, S.LATER, S.TOMORROW], correct: true },
          { id: "b", signs: [S.ME, S.GO, S.HOME, S.YESTERDAY], correct: false },
          { id: "c", signs: [S.ME, S.COME, S.HOME, S.LATER], correct: false },
          { id: "d", signs: [S.TODAY, S.ME, S.GO, S.HOME], correct: false },
        ],
      },
      {
        id: "asp-3",
        partnerSigns: [S.WHO, S.COME, S.HOME, S.YOU],
        partnerEnglish: "Who is coming home with you?",
        yourEnglish: "My brother and sister come home.",
        yourSigns: [S.ME, S.BROTHER, S.SISTER, S.COME, S.HOME],
        options: [
          { id: "a", signs: [S.ME, S.BROTHER, S.SISTER, S.COME, S.HOME], correct: true },
          { id: "b", signs: [S.ME, S.MOTHER, S.FATHER, S.COME, S.HOME], correct: false },
          { id: "c", signs: [S.THEY, S.COME, S.HOME, S.NOW], correct: false },
          { id: "d", signs: [S.WHO, S.COME, S.HOME, S.TOMORROW], correct: false },
        ],
      },
      {
        id: "asp-4",
        partnerSigns: [S.YOU, S.WANT, S.HELP],
        partnerEnglish: "Do you want help?",
        yourEnglish: "Yes, please help me again.",
        yourSigns: [S.PLEASE, S.HELP, S.ME, S.AGAIN],
        options: [
          { id: "a", signs: [S.PLEASE, S.HELP, S.ME, S.AGAIN], correct: true },
          { id: "b", signs: [S.PLEASE, S.HELP, S.ME, S.LATER], correct: false },
          { id: "c", signs: [S.THANK_YOU, S.HELP], correct: false },
          { id: "d", signs: [S.ME, S.HELP, S.YOU, S.NOW], correct: false },
        ],
      },
    ],
  },

  // ── Scenario 3: Asking for Help ───────────────────────────────────────────
  {
    id: "asking-for-help",
    title: "Asking for Help",
    description: "You're in class and struggling. Practice asking for help and survival phrases.",
    difficulty: "Beginner",
    color: "from-orange-500 to-amber-500",
    turns: [
      {
        id: "afh-1",
        partnerSigns: [S.YOU, S.UNDERSTAND],
        partnerEnglish: "Do you understand?",
        yourEnglish: "Sorry, I forgot / I don't understand.",
        yourSigns: [S.SORRY, S.ME, S.FORGET],
        options: [
          { id: "a", signs: [S.ME, S.UNDERSTAND], correct: false },
          { id: "b", signs: [S.GOOD_MORNING], correct: false },
          { id: "c", signs: [S.SORRY, S.ME, S.FORGET], correct: true },
          { id: "d", signs: [S.NICE, S.MEET, S.YOU], correct: false },
        ],
      },
      {
        id: "afh-2",
        partnerSigns: [S.YOU, S.WANT, S.HELP],
        partnerEnglish: "Do you want help?",
        yourEnglish: "Help me please!",
        yourSigns: [S.HELP, S.ME, S.PLEASE],
        options: [
          { id: "a", signs: [S.ME, S.FINE, S.THANK_YOU], correct: false },
          { id: "b", signs: [S.ME, S.KNOW], correct: false },
          { id: "c", signs: [S.SLOW, S.PLEASE], correct: false },
          { id: "d", signs: [S.HELP, S.ME, S.PLEASE], correct: true },
        ],
      },
      {
        id: "afh-3",
        partnerSigns: [S.SLOW, S.AGAIN, S.PLEASE],
        partnerEnglish: "Want me to go slow and repeat?",
        yourEnglish: "Yes please, thank you!",
        yourSigns: [S.PLEASE, S.THANK_YOU],
        options: [
          { id: "a", signs: [S.PLEASE, S.THANK_YOU], correct: true },
          { id: "b", signs: [S.ME, S.UNDERSTAND, S.NOW], correct: false },
          { id: "c", signs: [S.ME, S.FORGET, S.AGAIN], correct: false },
          { id: "d", signs: [S.GO, S.HOME, S.PLEASE], correct: false },
        ],
      },
    ],
  },

  // ── Scenario 4: Family Weekend ────────────────────────────────────────────
  {
    id: "family-weekend",
    title: "Family Weekend",
    description: "A friend asks about your weekend and family. Practice talking about who you're seeing.",
    difficulty: "Intermediate",
    color: "from-green-500 to-emerald-500",
    turns: [
      {
        id: "fw-1",
        partnerSigns: [S.WHERE, S.YOU, S.GO, S.TOMORROW],
        partnerEnglish: "Where are you going tomorrow?",
        yourEnglish: "Tomorrow I go home!",
        yourSigns: [S.TOMORROW, S.ME, S.GO, S.HOME],
        options: [
          { id: "a", signs: [S.YESTERDAY, S.ME, S.SCHOOL], correct: false },
          { id: "b", signs: [S.TOMORROW, S.ME, S.GO, S.HOME], correct: true },
          { id: "c", signs: [S.ME, S.UNDERSTAND, S.NOW], correct: false },
          { id: "d", signs: [S.THANK_YOU, S.NICE], correct: false },
        ],
      },
      {
        id: "fw-2",
        partnerSigns: [S.WHERE, S.YOU, S.MOTHER, S.FATHER],
        partnerEnglish: "Where are your mother and father?",
        yourEnglish: "My mother and father are home.",
        yourSigns: [S.MOTHER, S.FATHER, S.HOME],
        options: [
          { id: "a", signs: [S.MOTHER, S.FATHER, S.HOME], correct: true },
          { id: "b", signs: [S.BROTHER, S.SISTER, S.SCHOOL], correct: false },
          { id: "c", signs: [S.YESTERDAY, S.WORK], correct: false },
          { id: "d", signs: [S.MEET, S.TOMORROW], correct: false },
        ],
      },
      {
        id: "fw-3",
        partnerSigns: [S.BROTHER, S.SISTER, S.GO, S.SCHOOL],
        partnerEnglish: "Do your brother and sister go to school?",
        yourEnglish: "My brother and sister go to school now.",
        yourSigns: [S.BROTHER, S.SISTER, S.SCHOOL, S.NOW],
        options: [
          { id: "a", signs: [S.MOTHER, S.FATHER, S.HOME], correct: false },
          { id: "b", signs: [S.ME, S.GO, S.WORK, S.TOMORROW], correct: false },
          { id: "c", signs: [S.BROTHER, S.SISTER, S.SCHOOL, S.NOW], correct: true },
          { id: "d", signs: [S.ME, S.FORGET], correct: false },
        ],
      },
    ],
  },

  // ── Scenario 5: Daily Routine ─────────────────────────────────────────────
  {
    id: "daily-routine",
    title: "Daily Routine",
    description: "Someone asks about your plans. Practice discussing work, school, and time.",
    difficulty: "Intermediate",
    color: "from-purple-500 to-violet-500",
    turns: [
      {
        id: "dr-1",
        partnerSigns: [S.YOU, S.GO, S.WORK, S.TODAY],
        partnerEnglish: "Are you going to work today?",
        yourEnglish: "No, today I go to school.",
        yourSigns: [S.TODAY, S.ME, S.GO, S.SCHOOL],
        options: [
          { id: "a", signs: [S.ME, S.GO, S.WORK], correct: false },
          { id: "b", signs: [S.ME, S.UNDERSTAND], correct: false },
          { id: "c", signs: [S.TODAY, S.ME, S.GO, S.SCHOOL], correct: true },
          { id: "d", signs: [S.THANK_YOU, S.GOOD], correct: false },
        ],
      },
      {
        id: "dr-2",
        partnerSigns: [S.WHAT, S.YOU, S.NOW],
        partnerEnglish: "What are you doing right now?",
        yourEnglish: "I'm going home now.",
        yourSigns: [S.ME, S.GO, S.HOME, S.NOW],
        options: [
          { id: "a", signs: [S.ME, S.GO, S.HOME, S.NOW], correct: true },
          { id: "b", signs: [S.YESTERDAY, S.WORK], correct: false },
          { id: "c", signs: [S.ME, S.UNDERSTAND], correct: false },
          { id: "d", signs: [S.THANK_YOU, S.GOOD], correct: false },
        ],
      },
      {
        id: "dr-3",
        partnerSigns: [S.COME, S.HOME, S.WHEN, S.YOU],
        partnerEnglish: "When are you coming home?",
        yourEnglish: "I'm coming home later.",
        yourSigns: [S.ME, S.COME, S.HOME, S.LATER],
        options: [
          { id: "a", signs: [S.YESTERDAY, S.ME, S.HOME], correct: false },
          { id: "b", signs: [S.TOMORROW, S.SCHOOL], correct: false },
          { id: "c", signs: [S.ME, S.FORGET], correct: false },
          { id: "d", signs: [S.ME, S.COME, S.HOME, S.LATER], correct: true },
        ],
      },
    ],
  },
];
