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
        yourEnglish: "I'm fine, thank you!",
        yourSigns: [S.ME, S.FINE, S.THANK_YOU],
        options: [
          { id: "a", signs: [S.ME, S.FINE, S.THANK_YOU], correct: true },
          { id: "b", signs: [S.HELLO, S.SORRY], correct: false },
          { id: "c", signs: [S.ME, S.WANT, S.HELP], correct: false },
        ],
      },
      {
        id: "mg-2",
        partnerSigns: [S.WHAT, S.YOU, S.NAME],
        partnerEnglish: "What is your name?",
        yourEnglish: "My name is... (spell out your name)",
        yourSigns: [S.ME, S.NAME],
        options: [
          { id: "a", signs: [S.ME, S.NAME], correct: true },
          { id: "b", signs: [S.YOU, S.NAME], correct: false },
          { id: "c", signs: [S.WHO, S.NAME], correct: false },
        ],
      },
      {
        id: "mg-3",
        partnerSigns: [S.NICE, S.MEET, S.YOU],
        partnerEnglish: "Nice to meet you!",
        yourEnglish: "Nice to meet you too!",
        yourSigns: [S.NICE, S.MEET, S.YOU],
        options: [
          { id: "a", signs: [S.NICE, S.MEET, S.YOU], correct: true },
          { id: "b", signs: [S.SORRY, S.MEET, S.YOU], correct: false },
          { id: "c", signs: [S.THANK_YOU, S.HELLO], correct: false },
        ],
      },
      {
        id: "mg-4",
        partnerSigns: [S.YOU, S.GO, S.SCHOOL, S.NOW],
        partnerEnglish: "Are you heading to school now?",
        yourEnglish: "Yes, I go to school now.",
        yourSigns: [S.ME, S.GO, S.SCHOOL, S.NOW],
        options: [
          { id: "a", signs: [S.ME, S.GO, S.SCHOOL, S.NOW], correct: true },
          { id: "b", signs: [S.ME, S.GO, S.HOME, S.NOW], correct: false },
          { id: "c", signs: [S.YOU, S.SCHOOL, S.TODAY], correct: false },
        ],
      },
      {
        id: "mg-5",
        partnerSigns: [S.YOU, S.LATER, S.TOMORROW],
        partnerEnglish: "See you tomorrow!",
        yourEnglish: "Thank you, see you later!",
        yourSigns: [S.THANK_YOU, S.YOU, S.LATER],
        options: [
          { id: "a", signs: [S.THANK_YOU, S.YOU, S.LATER], correct: true },
          { id: "b", signs: [S.SORRY, S.WELCOME], correct: false },
          { id: "c", signs: [S.GOOD, S.TOMORROW], correct: false },
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
        yourEnglish: "No, I'm going to work now.",
        yourSigns: [S.ME, S.GO, S.WORK, S.NOW],
        options: [
          { id: "a", signs: [S.ME, S.GO, S.WORK, S.NOW], correct: true },
          { id: "b", signs: [S.ME, S.GO, S.SCHOOL, S.NOW], correct: false },
          { id: "c", signs: [S.ME, S.GO, S.HOME, S.TOMORROW], correct: false },
        ],
      },
      {
        id: "asp-2",
        partnerSigns: [S.WHEN, S.YOU, S.GO, S.HOME],
        partnerEnglish: "When are you going home?",
        yourEnglish: "I'm going home later.",
        yourSigns: [S.ME, S.GO, S.HOME, S.LATER],
        options: [
          { id: "a", signs: [S.ME, S.GO, S.HOME, S.LATER], correct: true },
          { id: "b", signs: [S.ME, S.GO, S.HOME, S.YESTERDAY], correct: false },
          { id: "c", signs: [S.ME, S.COME, S.HOME, S.NOW], correct: false },
        ],
      },
      {
        id: "asp-3",
        partnerSigns: [S.WHO, S.COME, S.HOME, S.YOU],
        partnerEnglish: "Who is coming home with you?",
        yourEnglish: "My brother and sister are coming home.",
        yourSigns: [S.BROTHER, S.SISTER, S.COME, S.HOME],
        options: [
          { id: "a", signs: [S.BROTHER, S.SISTER, S.COME, S.HOME], correct: true },
          { id: "b", signs: [S.MOTHER, S.FATHER, S.COME, S.HOME], correct: false },
          { id: "c", signs: [S.THEY, S.GO, S.SCHOOL, S.NOW], correct: false },
        ],
      },
      {
        id: "asp-4",
        partnerSigns: [S.YOU, S.WANT, S.HELP],
        partnerEnglish: "Do you want some help?",
        yourEnglish: "Yes please, help me again!",
        yourSigns: [S.PLEASE, S.HELP, S.ME, S.AGAIN],
        options: [
          { id: "a", signs: [S.PLEASE, S.HELP, S.ME, S.AGAIN], correct: true },
          { id: "b", signs: [S.THANK_YOU, S.HELP], correct: false },
          { id: "c", signs: [S.ME, S.HELP, S.YOU, S.NOW], correct: false },
        ],
      },
      {
        id: "asp-5",
        partnerSigns: [S.WHERE, S.YOU, S.GO, S.TOMORROW],
        partnerEnglish: "Where are you going tomorrow?",
        yourEnglish: "Tomorrow I'm coming home.",
        yourSigns: [S.TOMORROW, S.ME, S.COME, S.HOME],
        options: [
          { id: "a", signs: [S.TOMORROW, S.ME, S.COME, S.HOME], correct: true },
          { id: "b", signs: [S.TODAY, S.ME, S.GO, S.WORK], correct: false },
          { id: "c", signs: [S.YESTERDAY, S.ME, S.HOME], correct: false },
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
        yourEnglish: "Sorry, I don't understand.",
        yourSigns: [S.SORRY, S.ME, S.FORGET],
        options: [
          { id: "a", signs: [S.SORRY, S.ME, S.FORGET], correct: true },
          { id: "b", signs: [S.ME, S.UNDERSTAND, S.NOW], correct: false },
          { id: "c", signs: [S.FINE, S.THANK_YOU], correct: false },
        ],
      },
      {
        id: "afh-2",
        partnerSigns: [S.YOU, S.WANT, S.HELP],
        partnerEnglish: "Do you want help?",
        yourEnglish: "Help me please!",
        yourSigns: [S.HELP, S.ME, S.PLEASE],
        options: [
          { id: "a", signs: [S.HELP, S.ME, S.PLEASE], correct: true },
          { id: "b", signs: [S.ME, S.FINE, S.THANK_YOU], correct: false },
          { id: "c", signs: [S.ME, S.KNOW], correct: false },
        ],
      },
      {
        id: "afh-3",
        partnerSigns: [S.SLOW, S.AGAIN, S.PLEASE],
        partnerEnglish: "Should I slow down and repeat?",
        yourEnglish: "Yes please, slow again.",
        yourSigns: [S.PLEASE, S.SLOW, S.AGAIN],
        options: [
          { id: "a", signs: [S.PLEASE, S.SLOW, S.AGAIN], correct: true },
          { id: "b", signs: [S.ME, S.UNDERSTAND, S.NOW], correct: false },
          { id: "c", signs: [S.GO, S.HOME, S.PLEASE], correct: false },
        ],
      },
      {
        id: "afh-4",
        partnerSigns: [S.YOU, S.KNOW, S.WHAT],
        partnerEnglish: "Do you know what this sign is?",
        yourEnglish: "No, show me again please.",
        yourSigns: [S.HELP, S.ME, S.AGAIN, S.PLEASE],
        options: [
          { id: "a", signs: [S.HELP, S.ME, S.AGAIN, S.PLEASE], correct: true },
          { id: "b", signs: [S.ME, S.KNOW, S.NOW], correct: false },
          { id: "c", signs: [S.GO, S.HOME, S.LATER], correct: false },
        ],
      },
      {
        id: "afh-5",
        partnerSigns: [S.YOU, S.UNDERSTAND, S.NOW],
        partnerEnglish: "Do you understand now?",
        yourEnglish: "Yes! Thank you, I understand now.",
        yourSigns: [S.THANK_YOU, S.ME, S.UNDERSTAND, S.NOW],
        options: [
          { id: "a", signs: [S.THANK_YOU, S.ME, S.UNDERSTAND, S.NOW], correct: true },
          { id: "b", signs: [S.SORRY, S.FORGET], correct: false },
          { id: "c", signs: [S.HELP, S.PLEASE, S.AGAIN], correct: false },
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
        yourEnglish: "Tomorrow I'm going home!",
        yourSigns: [S.TOMORROW, S.ME, S.GO, S.HOME],
        options: [
          { id: "a", signs: [S.TOMORROW, S.ME, S.GO, S.HOME], correct: true },
          { id: "b", signs: [S.TODAY, S.ME, S.SCHOOL], correct: false },
          { id: "c", signs: [S.ME, S.COME, S.WORK, S.NOW], correct: false },
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
          { id: "c", signs: [S.MOTHER, S.FATHER, S.WORK], correct: false },
        ],
      },
      {
        id: "fw-3",
        partnerSigns: [S.BROTHER, S.SISTER, S.GO, S.SCHOOL],
        partnerEnglish: "Do your brother and sister go to school?",
        yourEnglish: "Yes, my brother and sister go to school now.",
        yourSigns: [S.BROTHER, S.SISTER, S.SCHOOL, S.NOW],
        options: [
          { id: "a", signs: [S.BROTHER, S.SISTER, S.SCHOOL, S.NOW], correct: true },
          { id: "b", signs: [S.MOTHER, S.FATHER, S.HOME, S.NOW], correct: false },
          { id: "c", signs: [S.ME, S.GO, S.SCHOOL, S.TOMORROW], correct: false },
        ],
      },
      {
        id: "fw-4",
        partnerSigns: [S.WHEN, S.YOU, S.FATHER, S.COME, S.HOME],
        partnerEnglish: "When did your father come home?",
        yourEnglish: "My father came home yesterday.",
        yourSigns: [S.FATHER, S.COME, S.HOME, S.YESTERDAY],
        options: [
          { id: "a", signs: [S.FATHER, S.COME, S.HOME, S.YESTERDAY], correct: true },
          { id: "b", signs: [S.MOTHER, S.GO, S.WORK, S.TODAY], correct: false },
          { id: "c", signs: [S.BROTHER, S.COME, S.HOME, S.NOW], correct: false },
        ],
      },
      {
        id: "fw-5",
        partnerSigns: [S.WHAT, S.YOU, S.WANT, S.TODAY],
        partnerEnglish: "What do you want to do today?",
        yourEnglish: "Today I want to go home.",
        yourSigns: [S.TODAY, S.ME, S.GO, S.HOME],
        options: [
          { id: "a", signs: [S.TODAY, S.ME, S.GO, S.HOME], correct: true },
          { id: "b", signs: [S.ME, S.WORK, S.TOMORROW], correct: false },
          { id: "c", signs: [S.THEY, S.SCHOOL, S.NOW], correct: false },
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
          { id: "a", signs: [S.TODAY, S.ME, S.GO, S.SCHOOL], correct: true },
          { id: "b", signs: [S.ME, S.GO, S.WORK, S.NOW], correct: false },
          { id: "c", signs: [S.ME, S.UNDERSTAND, S.THANK_YOU], correct: false },
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
          { id: "c", signs: [S.ME, S.WANT, S.SCHOOL], correct: false },
        ],
      },
      {
        id: "dr-3",
        partnerSigns: [S.COME, S.HOME, S.WHEN, S.YOU],
        partnerEnglish: "When are you coming home?",
        yourEnglish: "I'm coming home later.",
        yourSigns: [S.ME, S.COME, S.HOME, S.LATER],
        options: [
          { id: "a", signs: [S.ME, S.COME, S.HOME, S.LATER], correct: true },
          { id: "b", signs: [S.YESTERDAY, S.ME, S.HOME], correct: false },
          { id: "c", signs: [S.TOMORROW, S.SCHOOL], correct: false },
        ],
      },
      {
        id: "dr-4",
        partnerSigns: [S.WHERE, S.YOU, S.YESTERDAY],
        partnerEnglish: "Where were you yesterday?",
        yourEnglish: "Yesterday I was at work.",
        yourSigns: [S.YESTERDAY, S.ME, S.WORK],
        options: [
          { id: "a", signs: [S.YESTERDAY, S.ME, S.WORK], correct: true },
          { id: "b", signs: [S.TODAY, S.ME, S.SCHOOL], correct: false },
          { id: "c", signs: [S.TOMORROW, S.ME, S.HOME], correct: false },
        ],
      },
      {
        id: "dr-5",
        partnerSigns: [S.YOU, S.WANT, S.COME, S.HOME, S.TOMORROW],
        partnerEnglish: "Do you want to come home tomorrow?",
        yourEnglish: "Yes, I'm coming home tomorrow.",
        yourSigns: [S.ME, S.COME, S.HOME, S.TOMORROW],
        options: [
          { id: "a", signs: [S.ME, S.COME, S.HOME, S.TOMORROW], correct: true },
          { id: "b", signs: [S.ME, S.GO, S.WORK, S.NOW], correct: false },
          { id: "c", signs: [S.ME, S.FORGET, S.TOMORROW], correct: false },
        ],
      },
    ],
  },
];
