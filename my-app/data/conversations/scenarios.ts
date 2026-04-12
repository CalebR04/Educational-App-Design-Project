import { lessonConfigs } from "../lessons/lessonConfigs";

export type ConvSign = {
  src: string;
  mediaType: "image" | "video";
  label: string;
};

export type ResponseOption = {
  id: string;
  text: string;         // English label shown to player
  signs: ConvSign[];    // The ASL signs this response uses
  correct: boolean;
  /** Optional reaction video played when this wrong answer is chosen (e.g. confused partner) */
  reactionVideoUrl?: string;
};

export type ConversationTurn = {
  id: string;
  partnerSigns: ConvSign[];
  // Hint 1 — what the partner is signing
  partnerEnglish: string;
  // Hint 2 — what you should say back
  yourEnglish: string;
  // Hint 3 — the signs that make up your correct response
  yourSigns: ConvSign[];
  options: ResponseOption[];
  // ASL grammar / cultural fact shown after answering correctly
  aslNote?: { title: string; body: string };
  /**
   * When true, the partner's question requires furrowed brows (WH-question).
   * If the player misses a wrong-answer on a quiz tied to this turn,
   * the grammar hint about eyebrows-down is surfaced.
   */
  requiresEyebrowsDown?: boolean;
};

export type ConversationScenario = {
  id: string;
  title: string;
  description: string;
  setting: string;
  partnerName: string;
  partnerEmoji: string;
  level: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;         // Tailwind gradient class
  accentColor: string;   // e.g. "blue"
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
    description: "You run into Jordan at school. Practice a natural morning greeting exchange.",
    setting: "At school — Monday morning ☀️",
    partnerName: "Jordan",
    partnerEmoji: "👋",
    level: 2,
    difficulty: "Beginner",
    color: "from-blue-500 to-cyan-500",
    accentColor: "blue",
    turns: [
      {
        id: "mg-1",
        partnerSigns: [S.GOOD_MORNING, S.HOW, S.YOU],
        partnerEnglish: "Good morning! How are you?",
        yourEnglish: "Good, thank you!",
        yourSigns: [S.GOOD, S.THANK_YOU],
        options: [
          { id: "a", text: "Good, thank you!", signs: [S.GOOD, S.THANK_YOU], correct: true },
          { id: "b", text: "Help me please!", signs: [S.HELP, S.ME, S.PLEASE], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "c", text: "Sorry, I forgot.", signs: [S.SORRY, S.ME, S.FORGET], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "d", text: "I'm going home.", signs: [S.ME, S.GO, S.HOME], correct: false },
        ],
        aslNote: {
          title: "Facial Expressions Are Grammar",
          body: "In ASL, the question HOW ARE YOU? uses raised eyebrows — a grammatical feature, not just emotion. Furrow your brows for WH-questions (who, what, when, where, why) and raise them for yes/no questions.",
        },
      },
      {
        id: "mg-2",
        partnerSigns: [S.NAME, S.YOU, S.WHAT],
        partnerEnglish: "What is your name?",
        yourEnglish: "My name! (Introduce yourself)",
        yourSigns: [S.ME, S.NAME],
        requiresEyebrowsDown: true,
        options: [
          { id: "a", text: "Nice to meet you!", signs: [S.NICE, S.MEET, S.YOU], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "b", text: "My name!", signs: [S.ME, S.NAME], correct: true },
          { id: "c", text: "I go to school.", signs: [S.ME, S.GO, S.SCHOOL], correct: false },
          { id: "d", text: "I don't know.", signs: [S.ME, S.FORGET], correct: false },
        ],
        aslNote: {
          title: "WH-Questions Come Last",
          body: "Notice how WHAT came at the END: NAME YOU WHAT. In ASL, WH-question words (who, what, when, where, why) typically appear at the end of a sentence — the opposite of English word order!",
        },
      },
      {
        id: "mg-3",
        partnerSigns: [S.NICE, S.MEET, S.YOU],
        partnerEnglish: "Nice to meet you!",
        yourEnglish: "Nice to meet you too! Thank you.",
        yourSigns: [S.NICE, S.MEET, S.YOU, S.THANK_YOU],
        options: [
          { id: "a", text: "Thank you!", signs: [S.THANK_YOU], correct: false },
          { id: "b", text: "Nice to meet you too! Thank you.", signs: [S.NICE, S.MEET, S.YOU, S.THANK_YOU], correct: true },
          { id: "c", text: "Sorry!", signs: [S.SORRY], correct: false },
          { id: "d", text: "I'm fine.", signs: [S.ME, S.FINE], correct: false },
        ],
        aslNote: {
          title: "ASL Uses Context, Not 'Too'",
          body: "English uses the word 'too' to mean 'also'. In ASL, repeating or mirroring the same sign (NICE MEET YOU) back to the speaker naturally conveys the meaning of 'too'. The context makes it clear!",
        },
      },
    ],
  },

  // ── Scenario 2: Asking for Help ───────────────────────────────────────────
  {
    id: "asking-for-help",
    title: "Asking for Help",
    description: "You're in class and struggling. Practice asking for help and survival phrases.",
    setting: "In class — you didn't catch something 📚",
    partnerName: "Alex",
    partnerEmoji: "🎒",
    level: 2,
    difficulty: "Beginner",
    color: "from-orange-500 to-amber-500",
    accentColor: "orange",
    turns: [
      {
        id: "afh-1",
        partnerSigns: [S.YOU, S.UNDERSTAND],
        partnerEnglish: "Do you understand?",
        yourEnglish: "Sorry, I forgot / I don't understand.",
        yourSigns: [S.SORRY, S.ME, S.FORGET],
        options: [
          { id: "a", text: "Yes, I understand!", signs: [S.ME, S.UNDERSTAND], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/surprised.mp4" },
          { id: "b", text: "Good morning!", signs: [S.GOOD_MORNING], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "c", text: "Sorry, I forgot.", signs: [S.SORRY, S.ME, S.FORGET], correct: true },
          { id: "d", text: "Nice to meet you.", signs: [S.NICE, S.MEET, S.YOU], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
        ],
        aslNote: {
          title: "Yes/No Questions: Raise Your Eyebrows",
          body: "YOU UNDERSTAND? is a yes/no question. In ASL, raise your eyebrows and slightly tilt your head forward for yes/no questions — this is grammatically required, not optional!",
        },
      },
      {
        id: "afh-2",
        partnerSigns: [S.HELP, S.YOU, S.WANT],
        partnerEnglish: "Do you want help?",
        yourEnglish: "Help me please!",
        yourSigns: [S.HELP, S.ME, S.PLEASE],
        options: [
          { id: "a", text: "I'm fine, thanks!", signs: [S.ME, S.FINE, S.THANK_YOU], correct: false },
          { id: "b", text: "I know, I know.", signs: [S.ME, S.KNOW], correct: false },
          { id: "c", text: "Go slow please.", signs: [S.SLOW, S.PLEASE], correct: false },
          { id: "d", text: "Help me please!", signs: [S.HELP, S.ME, S.PLEASE], correct: true },
        ],
        aslNote: {
          title: "HELP Changes Shape",
          body: "The sign HELP is directional — the movement shows WHO is helping WHOM. Pushing from yourself toward someone else means 'I help you'. Pulling toward yourself means 'You/they help me'. This spatial grammar is a powerful ASL feature!",
        },
      },
      {
        id: "afh-3",
        partnerSigns: [S.SLOW, S.AGAIN, S.PLEASE],
        partnerEnglish: "Want me to go slow and repeat?",
        yourEnglish: "Yes please, thank you!",
        yourSigns: [S.PLEASE, S.THANK_YOU],
        options: [
          { id: "a", text: "Please, thank you!", signs: [S.PLEASE, S.THANK_YOU], correct: true },
          { id: "b", text: "I understand now.", signs: [S.ME, S.UNDERSTAND, S.NOW], correct: false },
          { id: "c", text: "I forgot again.", signs: [S.ME, S.FORGET, S.AGAIN], correct: false },
          { id: "d", text: "Go home please.", signs: [S.GO, S.HOME, S.PLEASE], correct: false },
        ],
        aslNote: {
          title: "PLEASE is Polite Power",
          body: "The sign PLEASE (flat hand rubbing in a circle on the chest) can transform any request. Mastering polite signs like PLEASE and THANK YOU is often the first thing that makes Deaf people smile when interacting with new signers!",
        },
      },
    ],
  },

  // ── Scenario 3: Family Weekend ────────────────────────────────────────────
  {
    id: "family-weekend",
    title: "Family Weekend",
    description: "Sam asks about your weekend and family. Practice talking about who you're seeing.",
    setting: "Chat between friends — Friday afternoon 🏠",
    partnerName: "Sam",
    partnerEmoji: "🏡",
    level: 3,
    difficulty: "Intermediate",
    color: "from-green-500 to-emerald-500",
    accentColor: "green",
    turns: [
      {
        id: "fw-1",
        partnerSigns: [S.TOMORROW, S.YOU, S.WHERE, S.GO],
        partnerEnglish: "Where are you going tomorrow?",
        yourEnglish: "Tomorrow I go home!",
        yourSigns: [S.TOMORROW, S.ME, S.GO, S.HOME],
        requiresEyebrowsDown: true,
        options: [
          { id: "a", text: "Yesterday I was at school.", signs: [S.YESTERDAY, S.ME, S.SCHOOL], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "b", text: "Tomorrow I go home!", signs: [S.TOMORROW, S.ME, S.GO, S.HOME], correct: true },
          { id: "c", text: "I understand now.", signs: [S.ME, S.UNDERSTAND, S.NOW], correct: false },
          { id: "d", text: "Thank you, nice!", signs: [S.THANK_YOU, S.NICE], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
        ],
        aslNote: {
          title: "Time Signs Set the Stage",
          body: "Notice TOMORROW came first: TOMORROW YOU WHERE GO? In ASL, time markers are placed at the BEGINNING of a sentence to set context — like a stage before the actors appear. This is the opposite of how English often structures time.",
        },
      },
      {
        id: "fw-2",
        partnerSigns: [S.MOTHER, S.FATHER, S.YOU, S.WHERE],
        partnerEnglish: "Where are your mother and father?",
        yourEnglish: "My mother and father are home.",
        yourSigns: [S.MOTHER, S.FATHER, S.HOME],
        requiresEyebrowsDown: true,
        options: [
          { id: "a", text: "My mother and father are home.", signs: [S.MOTHER, S.FATHER, S.HOME], correct: true },
          { id: "b", text: "My brother and sister go to school.", signs: [S.BROTHER, S.SISTER, S.SCHOOL], correct: false },
          { id: "c", text: "Yesterday, work.", signs: [S.YESTERDAY, S.WORK], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "d", text: "I meet them tomorrow.", signs: [S.MEET, S.TOMORROW], correct: false },
        ],
        aslNote: {
          title: "Masculine vs. Feminine Zones",
          body: "In ASL, family signs use a powerful pattern: signs for MALE relatives (FATHER, BROTHER, GRANDFATHER) are made in the FOREHEAD area. Signs for FEMALE relatives (MOTHER, SISTER, GRANDMOTHER) are made near the CHIN. One rule covers dozens of signs!",
        },
      },
      {
        id: "fw-3",
        partnerSigns: [S.BROTHER, S.SISTER, S.SCHOOL, S.GO],
        partnerEnglish: "Do your brother and sister go to school?",
        yourEnglish: "My brother and sister go to school now.",
        yourSigns: [S.BROTHER, S.SISTER, S.SCHOOL, S.NOW],
        options: [
          { id: "a", text: "My parents are home.", signs: [S.MOTHER, S.FATHER, S.HOME], correct: false },
          { id: "b", text: "I go to work tomorrow.", signs: [S.ME, S.GO, S.WORK, S.TOMORROW], correct: false },
          { id: "c", text: "My brother and sister go to school now.", signs: [S.BROTHER, S.SISTER, S.SCHOOL, S.NOW], correct: true },
          { id: "d", text: "I forget.", signs: [S.ME, S.FORGET], correct: false },
        ],
        aslNote: {
          title: "Listing Things in ASL",
          body: "When listing multiple people or items, ASL signers often 'assign' each to a location in space. After signing BROTHER (left) and SISTER (right), you can reference each with a point — like a coordinate system in the air. This is called 'spatial grammar'!",
        },
      },
    ],
  },

  // ── Scenario 4: Daily Routine ─────────────────────────────────────────────
  {
    id: "daily-routine",
    title: "Daily Routine",
    description: "Riley asks about your plans. Practice discussing work, school, and time.",
    setting: "After class — a quick catch-up ⏰",
    partnerName: "Riley",
    partnerEmoji: "⏰",
    level: 4,
    difficulty: "Intermediate",
    color: "from-purple-500 to-violet-500",
    accentColor: "purple",
    turns: [
      {
        id: "dr-1",
        partnerSigns: [S.TODAY, S.YOU, S.WORK, S.GO],
        partnerEnglish: "Are you going to work today?",
        yourEnglish: "No, today I go to school.",
        yourSigns: [S.TODAY, S.ME, S.GO, S.SCHOOL],
        options: [
          { id: "a", text: "Yes, I go to work!", signs: [S.ME, S.GO, S.WORK], correct: false },
          { id: "b", text: "I understand.", signs: [S.ME, S.UNDERSTAND], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "c", text: "No, today I go to school.", signs: [S.TODAY, S.ME, S.GO, S.SCHOOL], correct: true },
          { id: "d", text: "Thank you, good!", signs: [S.THANK_YOU, S.GOOD], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
        ],
        aslNote: {
          title: "ASL Has No 'No' Word Like English",
          body: "Instead of a separate 'no' word, ASL signers often use head-shaking simultaneously with the sign to negate it. You can also use signs like NONE, NOT, or DON'T depending on context. The head shake is a grammatical particle — not just body language!",
        },
      },
      {
        id: "dr-2",
        partnerSigns: [S.NOW, S.YOU, S.WHAT],
        partnerEnglish: "What are you doing right now?",
        yourEnglish: "I'm going home now.",
        yourSigns: [S.ME, S.GO, S.HOME, S.NOW],
        requiresEyebrowsDown: true,
        options: [
          { id: "a", text: "I'm going home now!", signs: [S.ME, S.GO, S.HOME, S.NOW], correct: true },
          { id: "b", text: "Yesterday, work.", signs: [S.YESTERDAY, S.WORK], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "c", text: "I understand.", signs: [S.ME, S.UNDERSTAND], correct: false },
          { id: "d", text: "Thank you, good.", signs: [S.THANK_YOU, S.GOOD], correct: false },
        ],
        aslNote: {
          title: "NOW = Present Tense",
          body: "ASL doesn't change verb forms for tense like English (go → went → going). Instead, time signs like NOW, TODAY, YESTERDAY, and TOMORROW do that work. Once you set the timeframe, verbs stay in their base form for the rest of the topic.",
        },
      },
      {
        id: "dr-3",
        partnerSigns: [S.COME, S.HOME, S.WHEN, S.YOU],
        partnerEnglish: "When are you coming home?",
        yourEnglish: "I'm coming home later.",
        yourSigns: [S.ME, S.COME, S.HOME, S.LATER],
        requiresEyebrowsDown: true,
        options: [
          { id: "a", text: "I was home yesterday.", signs: [S.YESTERDAY, S.ME, S.HOME], correct: false },
          { id: "b", text: "Tomorrow I go to school.", signs: [S.TOMORROW, S.SCHOOL], correct: false },
          { id: "c", text: "I forgot when.", signs: [S.ME, S.FORGET], correct: false,
            reactionVideoUrl: "/asl_videos/reactions/confused.mp4" },
          { id: "d", text: "I'm coming home later.", signs: [S.ME, S.COME, S.HOME, S.LATER], correct: true },
        ],
        aslNote: {
          title: "WHEN Question = End of Sentence",
          body: "COME HOME WHEN YOU — the WH-question word WHEN sits at the end! This is consistent across all WH-questions in ASL. It takes time to unlearn the English habit of putting question words first, but it's one of the most important ASL grammar rules to internalize.",
        },
      },
    ],
  },
];
