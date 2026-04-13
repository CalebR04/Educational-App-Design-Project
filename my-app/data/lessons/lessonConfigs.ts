export interface VocabItem {
  key: string;
  label: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  description: string;
  /** Linguistic parameters — teaches the science of ASL beyond word matching */
  parameters?: {
    handshape: string;  // e.g. "Open-B", "Fist-A", "1-hand"
    location: string;   // e.g. "Forehead", "Chin", "Neutral Space", "Chest"
    movement: string;   // e.g. "Circular", "Twist", "Tap", "Sweep", "Arc"
  };
}

export interface SentenceSign {
  src: string;
  mediaType: "image" | "video";
  label: string;
}

export interface SentenceItem {
  id: string;
  signs: SentenceSign[];
  answer: string;
  prompt?: string;
}

export interface LessonConfig {
  id: string;
  title: string;
  level: number;
  levelTitle: string;
  duration: string;
  tags: string[];
  tip?: string;
  vocab: VocabItem[];
  sentences?: SentenceItem[];
}

export const lessonConfigs: Record<string, LessonConfig> = {

  // ── ALPHABET (LEVEL 1) ───────────────────────────────────────────────────

  "alphabet-1": {
    id: "alphabet-1",
    title: "Alphabet A – M",
    level: 1,
    levelTitle: "The Basics",
    duration: "10 min",
    tags: ["A-M", "Fingerspelling", "Handshapes"],
    vocab: [
      { key: "letter_a", label: "A", mediaType: "image", mediaSrc: "/asl_images/letters/a.svg", description: "Make a fist and rest your thumb straight against the side of your index finger." },
      { key: "letter_b", label: "B", mediaType: "image", mediaSrc: "/asl_images/letters/b.svg", description: "Keep your four fingers straight up and together. Tuck your thumb across your palm." },
      { key: "letter_c", label: "C", mediaType: "image", mediaSrc: "/asl_images/letters/c.svg", description: "Curve your entire hand to form the shape of a C, like holding a cup." },
      { key: "letter_d", label: "D", mediaType: "image", mediaSrc: "/asl_images/letters/d.svg", description: "Point your index finger up. Touch your thumb to your other three fingers to form a circle." },
      { key: "letter_e", label: "E", mediaType: "image", mediaSrc: "/asl_images/letters/e.svg", description: "Curl your four fingers tightly down so their tips rest on your thumb, which is tucked in." },
      { key: "letter_f", label: "F", mediaType: "image", mediaSrc: "/asl_images/letters/f.svg", description: "Touch the tips of your index finger and thumb together to make a circle. Splay your other three fingers up." },
      { key: "letter_g", label: "G", mediaType: "image", mediaSrc: "/asl_images/letters/g.svg", description: "Point your index finger and thumb sideways, parallel to each other, like pinching." },
      { key: "letter_h", label: "H", mediaType: "image", mediaSrc: "/asl_images/letters/h.svg", description: "Like G, but point both your index and middle fingers sideways together." },
      { key: "letter_i", label: "I", mediaType: "image", mediaSrc: "/asl_images/letters/i.svg", description: "Make a fist, but extend your pinky finger straight up." },
      { key: "letter_j", label: "J", mediaType: "image", mediaSrc: "/asl_images/letters/j.svg", description: "Start with the I handshape, then draw a J in the air with your pinky, swooping down and inward." },
      { key: "letter_k", label: "K", mediaType: "image", mediaSrc: "/asl_images/letters/k.svg", description: "Point your index and middle fingers up like a peace sign, and place your thumb directly between them." },
      { key: "letter_l", label: "L", mediaType: "image", mediaSrc: "/asl_images/letters/l.svg", description: "Point your index finger up and your thumb straight out to form an L shape." },
      { key: "letter_m", label: "M", mediaType: "image", mediaSrc: "/asl_images/letters/m.svg", description: "Make a fist, but tuck your thumb underneath your first three fingers (index, middle, ring)." },
    ],
  },

  "alphabet-2": {
    id: "alphabet-2",
    title: "Alphabet N – Z",
    level: 1,
    levelTitle: "The Basics",
    duration: "12 min",
    tags: ["N-Z", "Motion Signs", "Review"],
    vocab: [
      { key: "letter_n", label: "N", mediaType: "image", mediaSrc: "/asl_images/letters/n.svg", description: "Make a fist, but tuck your thumb underneath only your first two fingers (index and middle)." },
      { key: "letter_o", label: "O", mediaType: "image", mediaSrc: "/asl_images/letters/o.svg", description: "Curve all your fingers and touch their tips to your thumb, forming an O shape." },
      { key: "letter_p", label: "P", mediaType: "image", mediaSrc: "/asl_images/letters/p.svg", description: "Make the K handshape but drop your wrist so your fingers point straight down." },
      { key: "letter_q", label: "Q", mediaType: "image", mediaSrc: "/asl_images/letters/q.svg", description: "Pinch your index and thumb together (like G), but drop your wrist so they point straight down." },
      { key: "letter_r", label: "R", mediaType: "image", mediaSrc: "/asl_images/letters/r.svg", description: "Cross your middle finger tightly over the back of your index finger. Tuck the rest." },
      { key: "letter_s", label: "S", mediaType: "image", mediaSrc: "/asl_images/letters/s.svg", description: "Make a tight fist and wrap your thumb completely over the front of your fingers." },
      { key: "letter_t", label: "T", mediaType: "image", mediaSrc: "/asl_images/letters/t.svg", description: "Make a fist, but tuck your thumb directly underneath your index finger only." },
      { key: "letter_u", label: "U", mediaType: "image", mediaSrc: "/asl_images/letters/u.svg", description: "Point your index and middle fingers straight up, keeping them tightly glued together." },
      { key: "letter_v", label: "V", mediaType: "image", mediaSrc: "/asl_images/letters/v.svg", description: "Make a peace sign. Like U, but your index and middle fingers are spread apart." },
      { key: "letter_w", label: "W", mediaType: "image", mediaSrc: "/asl_images/letters/w.svg", description: "Extend your index, middle, and ring fingers up spread apart. Thumb holds down pinky." },
      { key: "letter_x", label: "X", mediaType: "image", mediaSrc: "/asl_images/letters/x.svg", description: "Make a fist, raise your index finger and bend it in half like a hook." },
      { key: "letter_y", label: "Y", mediaType: "image", mediaSrc: "/asl_images/letters/y.svg", description: "Extend your thumb and pinky finger outward, middle three fingers tucked in — hang loose." },
      { key: "letter_z", label: "Z", mediaType: "image", mediaSrc: "/asl_images/letters/z.svg", description: "Point your index finger and draw the letter Z in the air in front of you." },
    ],
  },

  // ── LEVEL 1 ──────────────────────────────────────────────────────────────

  "numbers-1": {
    id: "numbers-1",
    title: "Numbers 0 – 9",
    level: 1,
    levelTitle: "The Basics",
    duration: "8 min",
    tags: ["Numbers", "Counting", "Handshapes"],
    vocab: [
      { key: "num_0", label: "0", mediaType: "image", mediaSrc: "/asl_images/numbers/0.svg", description: "Curve all fingers and thumb to form a circle, like the letter O." },
      { key: "num_1", label: "1", mediaType: "image", mediaSrc: "/asl_images/numbers/1.svg", description: "Hold up only your index finger, keep all others tucked in." },
      { key: "num_2", label: "2", mediaType: "image", mediaSrc: "/asl_images/numbers/2.svg", description: "Hold up your index and middle fingers, keep others tucked." },
      { key: "num_3", label: "3", mediaType: "image", mediaSrc: "/asl_images/numbers/3.svg", description: "Hold up your thumb, index, and middle fingers." },
      { key: "num_4", label: "4", mediaType: "image", mediaSrc: "/asl_images/numbers/4.svg", description: "Hold up all four fingers, thumb tucked across the palm." },
      { key: "num_5", label: "5", mediaType: "image", mediaSrc: "/asl_images/numbers/5.svg", description: "Open palm, all five fingers and thumb spread wide." },
      { key: "num_6", label: "6", mediaType: "image", mediaSrc: "/asl_images/numbers/6.svg", description: "Touch your thumb to your pinky finger, other three fingers up." },
      { key: "num_7", label: "7", mediaType: "image", mediaSrc: "/asl_images/numbers/7.svg", description: "Touch your thumb to your ring finger, other fingers up." },
      { key: "num_8", label: "8", mediaType: "image", mediaSrc: "/asl_images/numbers/8.svg", description: "Touch your thumb to your middle finger, index and pinky up." },
      { key: "num_9", label: "9", mediaType: "image", mediaSrc: "/asl_images/numbers/9.svg", description: "Touch your thumb to your index finger, forming a circle — other fingers up." },
    ],
  },

  "deixis-1": {
    id: "deixis-1",
    title: "Deixis – Pointing Signs",
    level: 1,
    levelTitle: "The Basics",
    duration: "8 min",
    tags: ["Pronouns", "Pointing", "Deixis"],
    vocab: [
      { key: "sign_me",   label: "ME",      mediaType: "video", mediaSrc: "/asl_videos/daily_life/me.mp4",      description: "Point your index finger directly at your own chest." },
      { key: "sign_you",  label: "YOU",     mediaType: "video", mediaSrc: "/asl_videos/pronouns/you.mp4",      description: "Point your index finger straight toward the person you are talking to." },
      { key: "sign_us",   label: "US / WE", mediaType: "video", mediaSrc: "/asl_videos/pronouns/us.mp4",       description: "Point at yourself, then sweep your index finger outward to include others." },
      { key: "sign_they", label: "THEY",    mediaType: "video", mediaSrc: "/asl_videos/pronouns/they.mp4",     description: "Point your index finger outward to the side, indicating a group not present." },
      { key: "sign_heshe",label: "HIM / HER",mediaType: "video", mediaSrc: "/asl_videos/pronouns/index.mp4",  description: "Point your index finger to the side where that person is (or would be) located." },
      { key: "sign_that", label: "THAT",    mediaType: "video", mediaSrc: "/asl_videos/pronouns/that.mp4",     description: "Point toward a specific person or object with your index finger." },
    ],
  },

  // ── LEVEL 2 ──────────────────────────────────────────────────────────────

  "greetings-contact": {
    id: "greetings-contact",
    title: "Initial Contact",
    level: 2,
    levelTitle: "Basic Greetings & Social",
    duration: "10 min",
    tags: ["Hello", "Introductions", "Greetings"],
    vocab: [
      { key: "sign_hello",   label: "HELLO",        mediaType: "video", mediaSrc: "/asl_videos/greetings/hello.mp4",   description: "Open your dominant hand at your temple and sweep it outward, like a relaxed salute.", parameters: { handshape: "Open-B", location: "Temple", movement: "Outward sweep" } },
      { key: "sign_morning", label: "GOOD MORNING", mediaType: "video", mediaSrc: "/asl_videos/greetings/morning.mp4", description: "Flat dominant hand rests in the crook of the non-dominant arm, then rises upward like the sun.", parameters: { handshape: "Flat-B", location: "Non-dominant forearm", movement: "Arc upward" } },
      { key: "sign_how",     label: "HOW",          mediaType: "video", mediaSrc: "/asl_videos/questions/how.mp4",     description: "Place both bent hands together (knuckles touching), then rotate them forward and outward." },
      { key: "sign_name",    label: "NAME",         mediaType: "video", mediaSrc: "/asl_videos/daily_life/name.mp4",   description: "Form H-hands (index and middle fingers extended) and tap them together twice in an X pattern.", parameters: { handshape: "H-hand", location: "Neutral space", movement: "Cross-tap" } },
      { key: "sign_nice",    label: "NICE",         mediaType: "video", mediaSrc: "/asl_videos/adjectives/nice.mp4",   description: "Slide the flat palm of your dominant hand across the upturned flat palm of your other hand.", parameters: { handshape: "Flat-B", location: "Non-dominant palm", movement: "Forward slide" } },
      { key: "sign_meet",    label: "MEET",         mediaType: "video", mediaSrc: "/asl_videos/verbs/meet.mp4",        description: "Both index fingers point upward and face each other, then bring them together to meet in the middle.", parameters: { handshape: "1-hand (both)", location: "Neutral space", movement: "Hands come together" } },
    ],
    sentences: [
      {
        id: "s-contact-1",
        signs: [
          { src: "/asl_videos/greetings/hello.mp4",    mediaType: "video", label: "HELLO" },
          { src: "/asl_videos/adjectives/nice.mp4",    mediaType: "video", label: "NICE" },
          { src: "/asl_videos/verbs/meet.mp4",         mediaType: "video", label: "MEET" },
          { src: "/asl_videos/pronouns/you.mp4",       mediaType: "video", label: "YOU" },
        ],
        answer: "Hello, nice to meet you!",
        prompt: "What does this greeting say?",
      },
      {
        id: "s-contact-2",
        signs: [
          { src: "/asl_videos/questions/how.mp4",      mediaType: "video", label: "HOW" },
          { src: "/asl_videos/daily_life/name.mp4",    mediaType: "video", label: "NAME" },
          { src: "/asl_videos/pronouns/you.mp4",       mediaType: "video", label: "YOU" },
        ],
        answer: "What is your name?",
        prompt: "What question is being asked?",
      },
      {
        id: "s-contact-3",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
          { src: "/asl_videos/daily_life/name.mp4",    mediaType: "video", label: "NAME" },
          { src: "/asl_videos/adjectives/nice.mp4",    mediaType: "video", label: "NICE" },
          { src: "/asl_videos/verbs/meet.mp4",         mediaType: "video", label: "MEET" },
        ],
        answer: "My name, nice to meet you!",
        prompt: "Translate this sentence:",
      },
    ],
  },

  "greetings-manners": {
    id: "greetings-manners",
    title: "Manners",
    level: 2,
    levelTitle: "Basic Greetings & Social",
    duration: "10 min",
    tags: ["Thank You", "Please", "Polite"],
    vocab: [
      { key: "sign_thankyou", label: "THANK YOU",      mediaType: "video", mediaSrc: "/asl_videos/greetings/thank_you.mp4", description: "Touch the fingertips of your flat hand to your chin, then move your hand forward and slightly down." },
      { key: "sign_please",   label: "PLEASE",         mediaType: "video", mediaSrc: "/asl_videos/greetings/please.mp4",   description: "Place your flat hand on your chest and rub it in a circle." },
      { key: "sign_sorry",    label: "SORRY",          mediaType: "video", mediaSrc: "/asl_videos/greetings/sorry.mp4",    description: "Make a fist and rub it in a circle on your chest — like rubbing an ache away." },
      { key: "sign_welcome",  label: "YOU'RE WELCOME", mediaType: "video", mediaSrc: "/asl_videos/greetings/welcome.mp4", description: "Flat hand near the chin, sweep it outward and slightly down (similar motion to THANK-YOU)." },
      { key: "sign_fine",     label: "FINE",           mediaType: "video", mediaSrc: "/asl_videos/adjectives/fine.mp4",   description: "Spread your fingers with your thumb touching your chest, then tap it once." },
      { key: "sign_good",     label: "GOOD",           mediaType: "video", mediaSrc: "/asl_videos/adjectives/good.mp4",   description: "Touch the fingertips to your chin, then lower your flat hand down into the palm of the other." },
    ],
    sentences: [
      {
        id: "s-manners-1",
        signs: [
          { src: "/asl_videos/greetings/thank_you.mp4", mediaType: "video", label: "THANK YOU" },
          { src: "/asl_videos/greetings/please.mp4",    mediaType: "video", label: "PLEASE" },
        ],
        answer: "Thank you, please!",
        prompt: "What polite phrase is this?",
      },
      {
        id: "s-manners-2",
        signs: [
          { src: "/asl_videos/greetings/sorry.mp4",     mediaType: "video", label: "SORRY" },
          { src: "/asl_videos/adjectives/good.mp4",     mediaType: "video", label: "GOOD" },
          { src: "/asl_videos/greetings/please.mp4",    mediaType: "video", label: "PLEASE" },
        ],
        answer: "I'm sorry, please.",
        prompt: "Translate this sentence:",
      },
      {
        id: "s-manners-3",
        signs: [
          { src: "/asl_videos/adjectives/good.mp4",     mediaType: "video", label: "GOOD" },
          { src: "/asl_videos/adjectives/fine.mp4",     mediaType: "video", label: "FINE" },
          { src: "/asl_videos/greetings/thank_you.mp4", mediaType: "video", label: "THANK YOU" },
        ],
        answer: "I'm good and fine, thank you!",
        prompt: "What does this say?",
      },
    ],
  },

  "greetings-survival": {
    id: "greetings-survival",
    title: "Survival Signs",
    level: 2,
    levelTitle: "Basic Greetings & Social",
    duration: "10 min",
    tags: ["Help", "Understand", "Essential"],
    vocab: [
      { key: "sign_help",       label: "HELP",       mediaType: "video", mediaSrc: "/asl_videos/daily_life/help.mp4",     description: "Make a thumbs-up with your dominant hand and rest it on your flat non-dominant palm, then lift both hands upward together.", parameters: { handshape: "A-hand (thumb-up)", location: "Non-dominant palm", movement: "Upward lift" } },
      { key: "sign_again",      label: "AGAIN",      mediaType: "video", mediaSrc: "/asl_videos/adjectives/again.mp4",    description: "Curve your dominant hand and arc it down to tap the flat palm of your non-dominant hand.", parameters: { handshape: "Bent-B", location: "Non-dominant palm", movement: "Arc-and-tap" } },
      { key: "sign_slow",       label: "SLOW",       mediaType: "video", mediaSrc: "/asl_videos/adjectives/slow.mp4",     description: "Slowly drag the dominant hand up the back of the non-dominant hand from fingertips to wrist.", parameters: { handshape: "Open-5", location: "Back of non-dominant hand", movement: "Slow upward drag" } },
      { key: "sign_understand", label: "UNDERSTAND", mediaType: "video", mediaSrc: "/asl_videos/verbs/understand.mp4",   description: "Hold a bent index finger at your temple, then flick it upright — like a light-bulb moment.", parameters: { handshape: "Bent-1", location: "Temple", movement: "Flick upright" } },
      { key: "sign_know",       label: "KNOW",       mediaType: "video", mediaSrc: "/asl_videos/verbs/know.mp4",         description: "Tap the fingertips of your flat hand to the side of your temple.", parameters: { handshape: "Flat-B", location: "Temple", movement: "Tap" } },
      { key: "sign_forget",     label: "FORGET",     mediaType: "video", mediaSrc: "/asl_videos/verbs/forget.mp4",       description: "Drag an open hand across your forehead from one side to the other, closing into a fist as it leaves.", parameters: { handshape: "Open-5 → Fist-A", location: "Forehead", movement: "Drag and close" } },
    ],
    sentences: [
      {
        id: "s-survival-1",
        signs: [
          { src: "/asl_videos/daily_life/help.mp4",    mediaType: "video", label: "HELP" },
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
          { src: "/asl_videos/greetings/please.mp4",   mediaType: "video", label: "PLEASE" },
        ],
        answer: "Help me, please!",
        prompt: "What is this person asking for?",
      },
      {
        id: "s-survival-2",
        signs: [
          { src: "/asl_videos/adjectives/slow.mp4",    mediaType: "video", label: "SLOW" },
          { src: "/asl_videos/greetings/please.mp4",   mediaType: "video", label: "PLEASE" },
          { src: "/asl_videos/adjectives/again.mp4",   mediaType: "video", label: "AGAIN" },
        ],
        answer: "Please slow down and sign again.",
        prompt: "What are they asking you to do?",
      },
      {
        id: "s-survival-3",
        signs: [
          { src: "/asl_videos/pronouns/you.mp4",       mediaType: "video", label: "YOU" },
          { src: "/asl_videos/verbs/understand.mp4",   mediaType: "video", label: "UNDERSTAND" },
        ],
        answer: "Do you understand?",
        prompt: "What question is being asked?",
      },
    ],
  },

  // ── LEVEL 3 ──────────────────────────────────────────────────────────────

  "vocab-family": {
    id: "vocab-family",
    title: "Family",
    level: 3,
    levelTitle: "Everyday Vocab",
    duration: "12 min",
    tags: ["Family", "Relationships"],
    tip: "Signs above the nose are typically masculine; signs near or below the chin are typically feminine.",
    vocab: [
      { key: "sign_mother",      label: "MOTHER",      mediaType: "video", mediaSrc: "/asl_videos/relationships/mother.mp4",      description: "Open hand, thumb touches your chin and fans out — chin area is the feminine zone.", parameters: { handshape: "Open-5", location: "Chin", movement: "Thumb tap with fan" } },
      { key: "sign_father",      label: "FATHER",      mediaType: "video", mediaSrc: "/asl_videos/relationships/father.mp4",      description: "Open hand, thumb touches your forehead and fans out — forehead is the masculine zone.", parameters: { handshape: "Open-5", location: "Forehead", movement: "Thumb tap with fan" } },
      { key: "sign_brother",     label: "BROTHER",     mediaType: "video", mediaSrc: "/asl_videos/relationships/brother.mp4",     description: "Sign BOY (flat hand near forehead), then bring both index fingers together horizontally.", parameters: { handshape: "L-hand → 1-hand (both)", location: "Forehead → Neutral space", movement: "Lower and bring together" } },
      { key: "sign_sister",      label: "SISTER",      mediaType: "video", mediaSrc: "/asl_videos/relationships/sister.mp4",      description: "Sign GIRL (thumb on cheek), then bring both index fingers together horizontally.", parameters: { handshape: "A-hand → 1-hand (both)", location: "Cheek → Neutral space", movement: "Slide down and bring together" } },
      { key: "sign_grandmother", label: "GRANDMOTHER", mediaType: "video", mediaSrc: "/asl_videos/relationships/grandmother.mp4", description: "Sign MOTHER, but arc the hand outward in two bouncing steps (one generation back)." },
      { key: "sign_grandfather", label: "GRANDFATHER", mediaType: "video", mediaSrc: "/asl_videos/relationships/grandfather.mp4", description: "Sign FATHER, but arc the hand outward in two bouncing steps (one generation back)." },
    ],
    sentences: [
      {
        id: "s-family-1",
        signs: [
          { src: "/asl_videos/relationships/mother.mp4",  mediaType: "video", label: "MOTHER" },
          { src: "/asl_videos/relationships/father.mp4",  mediaType: "video", label: "FATHER" },
          { src: "/asl_videos/daily_life/home.mp4",       mediaType: "video", label: "HOME" },
        ],
        answer: "Mother and father are home.",
        prompt: "What does this sentence say?",
      },
      {
        id: "s-family-2",
        signs: [
          { src: "/asl_videos/relationships/brother.mp4", mediaType: "video", label: "BROTHER" },
          { src: "/asl_videos/relationships/sister.mp4",  mediaType: "video", label: "SISTER" },
          { src: "/asl_videos/daily_life/school.mp4",     mediaType: "video", label: "SCHOOL" },
        ],
        answer: "Brother and sister are at school.",
        prompt: "Translate this sentence:",
      },
      {
        id: "s-family-3",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",              mediaType: "video", label: "ME" },
          { src: "/asl_videos/relationships/grandmother.mp4",  mediaType: "video", label: "GRANDMOTHER" },
          { src: "/asl_videos/relationships/grandfather.mp4",  mediaType: "video", label: "GRANDFATHER" },
          { src: "/asl_videos/verbs/meet.mp4",                 mediaType: "video", label: "MEET" },
        ],
        answer: "I am meeting my grandmother and grandfather.",
        prompt: "What is happening in this sentence?",
      },
    ],
  },

  "vocab-food": {
    id: "vocab-food",
    title: "Food",
    level: 3,
    levelTitle: "Everyday Vocab",
    duration: "10 min",
    tags: ["Food", "Eating", "Vocab"],
    vocab: [
      { key: "sign_eat",    label: "EAT / FOOD", mediaType: "video", mediaSrc: "/asl_videos/verbs/eat.mp4",          description: "Bring bunched fingers to your mouth, like placing food in." },
      { key: "sign_apple",  label: "APPLE",      mediaType: "video", mediaSrc: "/asl_videos/daily_life/apple.mp4",   description: "Bent index finger (X-shape) twists at your cheek, like twisting an apple stem." },
      { key: "sign_bread",  label: "BREAD",      mediaType: "video", mediaSrc: "/asl_videos/daily_life/bread.mp4",   description: "Curved dominant hand slices downward along the back of the non-dominant hand repeatedly." },
      { key: "sign_cheese", label: "CHEESE",     mediaType: "video", mediaSrc: "/asl_videos/daily_life/cheese.mp4",  description: "Press the heels of both hands together and twist, like pressing cheese." },
      { key: "sign_egg",    label: "EGG",        mediaType: "video", mediaSrc: "/asl_videos/daily_life/egg.mp4",     description: "Both H-hands (two fingers out) come together and crack apart downward." },
      { key: "sign_fruit",  label: "FRUIT",      mediaType: "video", mediaSrc: "/asl_videos/daily_life/fruit.mp4",   description: "F-hand (pinched OK) at the cheek, twist the wrist forward and back." },
    ],
    sentences: [
      {
        id: "s-food-1",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",        mediaType: "video", label: "ME" },
          { src: "/asl_videos/verbs/eat.mp4",            mediaType: "video", label: "EAT" },
          { src: "/asl_videos/daily_life/apple.mp4",     mediaType: "video", label: "APPLE" },
        ],
        answer: "I eat an apple.",
        prompt: "What are they eating?",
      },
      {
        id: "s-food-2",
        signs: [
          { src: "/asl_videos/verbs/eat.mp4",            mediaType: "video", label: "EAT" },
          { src: "/asl_videos/daily_life/bread.mp4",     mediaType: "video", label: "BREAD" },
          { src: "/asl_videos/daily_life/cheese.mp4",    mediaType: "video", label: "CHEESE" },
        ],
        answer: "I eat bread and cheese.",
        prompt: "What food is being described?",
      },
      {
        id: "s-food-3",
        signs: [
          { src: "/asl_videos/pronouns/you.mp4",         mediaType: "video", label: "YOU" },
          { src: "/asl_videos/verbs/eat.mp4",            mediaType: "video", label: "EAT" },
          { src: "/asl_videos/daily_life/fruit.mp4",     mediaType: "video", label: "FRUIT" },
        ],
        answer: "Do you eat fruit?",
        prompt: "What question is being asked?",
      },
    ],
  },

  "vocab-drinks": {
    id: "vocab-drinks",
    title: "Drinks",
    level: 3,
    levelTitle: "Everyday Vocab",
    duration: "10 min",
    tags: ["Drinks", "Beverages", "Vocab"],
    vocab: [
      { key: "sign_drink",  label: "DRINK",  mediaType: "video", mediaSrc: "/asl_videos/verbs/drink.mp4",          description: "Mime drinking from a cup — C-hand tips toward mouth." },
      { key: "sign_water",  label: "WATER",  mediaType: "video", mediaSrc: "/asl_videos/daily_life/water.mp4",     description: "W-hand (three fingers up) taps your lips or chin twice." },
      { key: "sign_milk",   label: "MILK",   mediaType: "video", mediaSrc: "/asl_videos/daily_life/milk.mp4",      description: "C-hand squeezes open and shut twice, like milking a cow." },
      { key: "sign_coffee", label: "COFFEE", mediaType: "video", mediaSrc: "/asl_videos/daily_life/coffee.mp4",    description: "Stack both fists and crank the top fist in a circle, like grinding coffee beans." },
      { key: "sign_tea",    label: "TEA",    mediaType: "video", mediaSrc: "/asl_videos/daily_life/tea.mp4",       description: "Pinch your dominant fingers together and dip them into the O-shape of your non-dominant hand, like a tea bag." },
      { key: "sign_juice",  label: "JUICE",  mediaType: "video", mediaSrc: "/asl_videos/daily_life/juice.mp4",     description: "Sign the letter J with a pinky finger near the side of the mouth." },
    ],
    sentences: [
      {
        id: "s-drinks-1",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",       mediaType: "video", label: "ME" },
          { src: "/asl_videos/verbs/drink.mp4",         mediaType: "video", label: "DRINK" },
          { src: "/asl_videos/daily_life/water.mp4",    mediaType: "video", label: "WATER" },
          { src: "/asl_videos/greetings/please.mp4",    mediaType: "video", label: "PLEASE" },
        ],
        answer: "I drink water, please.",
        prompt: "What is being requested?",
      },
      {
        id: "s-drinks-2",
        signs: [
          { src: "/asl_videos/pronouns/you.mp4",        mediaType: "video", label: "YOU" },
          { src: "/asl_videos/verbs/drink.mp4",         mediaType: "video", label: "DRINK" },
          { src: "/asl_videos/daily_life/coffee.mp4",   mediaType: "video", label: "COFFEE" },
        ],
        answer: "Do you drink coffee?",
        prompt: "What question is being asked?",
      },
      {
        id: "s-drinks-3",
        signs: [
          { src: "/asl_videos/daily_life/milk.mp4",     mediaType: "video", label: "MILK" },
          { src: "/asl_videos/daily_life/tea.mp4",      mediaType: "video", label: "TEA" },
          { src: "/asl_videos/daily_life/juice.mp4",    mediaType: "video", label: "JUICE" },
        ],
        answer: "Milk, tea, and juice.",
        prompt: "Name these three drinks:",
      },
    ],
  },

  "vocab-colors": {
    id: "vocab-colors",
    title: "Colors",
    level: 3,
    levelTitle: "Everyday Vocab",
    duration: "12 min",
    tags: ["Colors", "Descriptive", "Vocab"],
    vocab: [
      { key: "sign_color",  label: "COLOR",  mediaType: "video", mediaSrc: "/asl_videos/colors/color.mp4",  description: "Hold a 5-hand in front of your face and wiggle the fingers, like mixing paint." },
      { key: "sign_red",    label: "RED",    mediaType: "video", mediaSrc: "/asl_videos/colors/red.mp4",    description: "Draw your index finger downward across your lips — the color of your lips." },
      { key: "sign_blue",   label: "BLUE",   mediaType: "video", mediaSrc: "/asl_videos/colors/blue.mp4",   description: "B-hand (four fingers up) shakes side to side at the side of your body." },
      { key: "sign_green",  label: "GREEN",  mediaType: "video", mediaSrc: "/asl_videos/colors/green.mp4",  description: "G-hand (index and thumb out) shakes side to side." },
      { key: "sign_yellow", label: "YELLOW", mediaType: "video", mediaSrc: "/asl_videos/colors/yellow.mp4", description: "Y-hand (thumb and pinky out) shakes side to side." },
      { key: "sign_orange", label: "ORANGE", mediaType: "video", mediaSrc: "/asl_videos/colors/orange.mp4", description: "C-hand in front of the face squeezes open and shut, like squeezing an orange." },
      { key: "sign_black",  label: "BLACK",  mediaType: "video", mediaSrc: "/asl_videos/colors/black.mp4",  description: "Index finger slides across your forehead from one side to the other." },
      { key: "sign_white",  label: "WHITE",  mediaType: "video", mediaSrc: "/asl_videos/colors/white.mp4",  description: "5-hand on chest pulls away, fingers closing into a flat O." },
    ],
  },

  "vocab-routines": {
    id: "vocab-routines",
    title: "Daily Activities",
    level: 3,
    levelTitle: "Everyday Vocab",
    duration: "10 min",
    tags: ["Actions", "Verbs", "Daily Life"],
    vocab: [
      { key: "sign_sleep", label: "SLEEP",  mediaType: "video", mediaSrc: "/asl_videos/verbs/sleep.mp4", description: "Both hands together at the side of your face, tilt your head toward them like resting on a pillow.", parameters: { handshape: "Flat-O (both)", location: "Cheek/Temple", movement: "Tilt head toward hands as fingers close" } },
      { key: "sign_learn", label: "LEARN",  mediaType: "video", mediaSrc: "/asl_videos/verbs/learn.mp4", description: "Dominant hand scoops upward from the non-dominant palm and brings it to the forehead, as if picking up knowledge.", parameters: { handshape: "Flat-O → Flat hand", location: "Non-dominant palm → Forehead", movement: "Scoop up to forehead" } },
      { key: "sign_see",   label: "SEE",    mediaType: "video", mediaSrc: "/asl_videos/verbs/see.mp4",   description: "V-hand (two fingers) points from your eyes outward in the direction you're looking.", parameters: { handshape: "V-hand", location: "Eyes", movement: "Extend outward from eyes" } },
      { key: "sign_like",  label: "LIKE",   mediaType: "video", mediaSrc: "/asl_videos/verbs/like.mp4",  description: "Place your middle finger and thumb on your chest, then pull them away — as if pulling affection from your heart.", parameters: { handshape: "Open-5 → 8-hand", location: "Chest", movement: "Pull away closing to pinch" } },
      { key: "sign_want",  label: "WANT",   mediaType: "video", mediaSrc: "/asl_videos/verbs/want.mp4",  description: "Both claw hands face up in front of you, then draw them inward toward your body, as if pulling something you desire.", parameters: { handshape: "Claw-5 (both hands)", location: "Neutral space", movement: "Draw toward body" } },
      { key: "sign_come",  label: "COME",   mediaType: "video", mediaSrc: "/asl_videos/verbs/come.mp4",  description: "Both index fingers point up, then arc inward toward your body, as if beckoning someone to come toward you.", parameters: { handshape: "1-hand (both)", location: "Neutral space", movement: "Arc inward toward body" } },
    ],
    sentences: [
      {
        id: "s-routines-1",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",    mediaType: "video", label: "ME" },
          { src: "/asl_videos/verbs/like.mp4",        mediaType: "video", label: "LIKE" },
          { src: "/asl_videos/verbs/sleep.mp4",       mediaType: "video", label: "SLEEP" },
        ],
        answer: "I like to sleep.",
        prompt: "Translate this sentence:",
      },
      {
        id: "s-routines-2",
        signs: [
          { src: "/asl_videos/pronouns/you.mp4",     mediaType: "video", label: "YOU" },
          { src: "/asl_videos/verbs/come.mp4",        mediaType: "video", label: "COME" },
          { src: "/asl_videos/verbs/see.mp4",         mediaType: "video", label: "SEE" },
          { src: "/asl_videos/daily_life/me.mp4",    mediaType: "video", label: "ME" },
        ],
        answer: "Come and see me.",
        prompt: "What are they saying?",
      },
      {
        id: "s-routines-3",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",    mediaType: "video", label: "ME" },
          { src: "/asl_videos/verbs/want.mp4",        mediaType: "video", label: "WANT" },
          { src: "/asl_videos/verbs/learn.mp4",       mediaType: "video", label: "LEARN" },
        ],
        answer: "I want to learn.",
        prompt: "What does this person want?",
      },
    ],
  },

  "vocab-places": {
    id: "vocab-places",
    title: "Places",
    level: 3,
    levelTitle: "Everyday Vocab",
    duration: "10 min",
    tags: ["Places", "Locations", "Daily Life"],
    vocab: [
      { key: "sign_restaurant", label: "RESTAURANT", mediaType: "video", mediaSrc: "/asl_videos/daily_life/restaurant.mp4", description: "R-hand (index and middle fingers crossed) taps both corners of your mouth in sequence.", parameters: { handshape: "R-hand", location: "Mouth corners", movement: "Tap left and right corners" } },
      { key: "sign_gym",        label: "GYM",         mediaType: "video", mediaSrc: "/asl_videos/daily_life/gym.mp4",        description: "Both fists pump up and down alternately, like lifting weights.", parameters: { handshape: "S-hand (fists)", location: "Neutral space", movement: "Alternating upward pump" } },
      { key: "sign_home",       label: "HOME",        mediaType: "video", mediaSrc: "/asl_videos/daily_life/home.mp4",       description: "Flat-O hand taps your cheek near the mouth (eating), then taps your cheek near the ear (sleeping) — home is where you eat and sleep.", parameters: { handshape: "Flat-O", location: "Cheek (mouth) → Cheek (ear)", movement: "Double tap" } },
      { key: "sign_school",     label: "SCHOOL",      mediaType: "video", mediaSrc: "/asl_videos/daily_life/school.mp4",     description: "Clap your non-dominant open palm twice with your dominant open hand, like a teacher getting the class's attention.", parameters: { handshape: "Open-B (both)", location: "Neutral space", movement: "Double clap to palm" } },
      { key: "sign_morning",    label: "MORNING",     mediaType: "video", mediaSrc: "/asl_videos/greetings/morning.mp4",     description: "Non-dominant arm is held horizontal (the horizon). Dominant open hand rises up from the elbow, like the sun rising.", parameters: { handshape: "Open-B", location: "Crook of non-dominant elbow", movement: "Rise upward" } },
      { key: "sign_night",      label: "NIGHT",       mediaType: "video", mediaSrc: "/asl_videos/time/night.mp4",            description: "Non-dominant arm is horizontal (the horizon). Dominant bent hand arcs over it and downward, like the sun setting below the horizon.", parameters: { handshape: "Bent-B", location: "Over non-dominant arm", movement: "Arc downward over arm" } },
    ],
    sentences: [
      {
        id: "s-places-1",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",          mediaType: "video", label: "ME" },
          { src: "/asl_videos/greetings/morning.mp4",       mediaType: "video", label: "MORNING" },
          { src: "/asl_videos/daily_life/school.mp4",       mediaType: "video", label: "SCHOOL" },
          { src: "/asl_videos/verbs/go.mp4",                mediaType: "video", label: "GO" },
        ],
        answer: "I go to school in the morning.",
        prompt: "What is this person's morning routine?",
      },
      {
        id: "s-places-2",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",          mediaType: "video", label: "ME" },
          { src: "/asl_videos/time/night.mp4",              mediaType: "video", label: "NIGHT" },
          { src: "/asl_videos/daily_life/restaurant.mp4",  mediaType: "video", label: "RESTAURANT" },
          { src: "/asl_videos/verbs/go.mp4",                mediaType: "video", label: "GO" },
        ],
        answer: "I go to the restaurant at night.",
        prompt: "Where are they going?",
      },
      {
        id: "s-places-3",
        signs: [
          { src: "/asl_videos/pronouns/you.mp4",           mediaType: "video", label: "YOU" },
          { src: "/asl_videos/daily_life/gym.mp4",          mediaType: "video", label: "GYM" },
          { src: "/asl_videos/verbs/go.mp4",                mediaType: "video", label: "GO" },
        ],
        answer: "Do you go to the gym?",
        prompt: "What question is being asked?",
      },
    ],
  },

  // ── LEVEL 4 ──────────────────────────────────────────────────────────────

  "conv-questions": {
    id: "conv-questions",
    title: "Question Words",
    level: 4,
    levelTitle: "Conversational ASL",
    duration: "12 min",
    tags: ["WH-Questions", "Conversation"],
    tip: "In ASL, question words often go at the END of the sentence. Furrow your brows for all WH-questions.",
    vocab: [
      { key: "sign_who",   label: "WHO",   mediaType: "video", mediaSrc: "/asl_videos/questions/who.mp4",   description: "Circle your index finger around your lips in a small loop." },
      { key: "sign_what",  label: "WHAT",  mediaType: "video", mediaSrc: "/asl_videos/questions/what.mp4",  description: "Shake both index fingers (or one) back and forth." },
      { key: "sign_when",  label: "WHEN",  mediaType: "video", mediaSrc: "/asl_videos/questions/when.mp4",  description: "Circle your dominant index finger around an upright non-dominant index finger." },
      { key: "sign_where", label: "WHERE", mediaType: "video", mediaSrc: "/asl_videos/questions/where.mp4", description: "Shake your index finger side to side rapidly." },
      { key: "sign_why",   label: "WHY",   mediaType: "video", mediaSrc: "/asl_videos/questions/why.mp4",   description: "Touch your middle finger to your forehead, then bring the hand out forming a Y-hand." },
      { key: "sign_which", label: "WHICH", mediaType: "video", mediaSrc: "/asl_videos/questions/which.mp4", description: "Both A-hands (fists with thumbs up) alternately rock up and down, like weighing options." },
      { key: "sign_how2",  label: "HOW",   mediaType: "video", mediaSrc: "/asl_videos/questions/how.mp4",   description: "Place both bent hands together (knuckles touching), then rotate them outward." },
    ],
    sentences: [
      {
        id: "s-questions-1",
        signs: [
          { src: "/asl_videos/daily_life/home.mp4",    mediaType: "video", label: "HOME" },
          { src: "/asl_videos/pronouns/you.mp4",       mediaType: "video", label: "YOU" },
          { src: "/asl_videos/questions/where.mp4",    mediaType: "video", label: "WHERE" },
        ],
        answer: "Where is your home?",
        prompt: "What question are they asking?",
      },
      {
        id: "s-questions-2",
        signs: [
          { src: "/asl_videos/daily_life/name.mp4",    mediaType: "video", label: "NAME" },
          { src: "/asl_videos/pronouns/you.mp4",       mediaType: "video", label: "YOU" },
          { src: "/asl_videos/questions/what.mp4",     mediaType: "video", label: "WHAT" },
        ],
        answer: "What is your name?",
        prompt: "Translate this question:",
      },
      {
        id: "s-questions-3",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
          { src: "/asl_videos/daily_life/home.mp4",    mediaType: "video", label: "HOME" },
          { src: "/asl_videos/questions/when.mp4",     mediaType: "video", label: "WHEN" },
        ],
        answer: "When am I going home?",
        prompt: "What is this person asking?",
      },
    ],
  },

  "conv-time": {
    id: "conv-time",
    title: "Time",
    level: 4,
    levelTitle: "Conversational ASL",
    duration: "10 min",
    tags: ["Time", "Tense", "Conversation"],
    vocab: [
      { key: "sign_time",      label: "TIME",      mediaType: "video", mediaSrc: "/asl_videos/time/time.mp4",      description: "Tap your index finger to your wrist where a watch would be." },
      { key: "sign_now",       label: "NOW",       mediaType: "video", mediaSrc: "/asl_videos/time/now.mp4",       description: "Both Y-hands (or bent hands) drop straight down in front of you." },
      { key: "sign_later",     label: "LATER",     mediaType: "video", mediaSrc: "/asl_videos/time/later.mp4",     description: "L-hand with thumb pointing up, rotate wrist forward until hand is horizontal." },
      { key: "sign_today",     label: "TODAY",     mediaType: "video", mediaSrc: "/asl_videos/time/today.mp4",     description: "Sign NOW twice — both Y-hands drop, pause, drop again." },
      { key: "sign_tomorrow",  label: "TOMORROW",  mediaType: "video", mediaSrc: "/asl_videos/time/tomorrow.mp4",  description: "A-hand with thumb on cheek, arc forward away from the face." },
      { key: "sign_yesterday", label: "YESTERDAY", mediaType: "video", mediaSrc: "/asl_videos/time/yesterday.mp4", description: "A-hand with thumb on cheek, arc backward toward the back of your head." },
    ],
    sentences: [
      {
        id: "s-time-1",
        signs: [
          { src: "/asl_videos/time/today.mp4",         mediaType: "video", label: "TODAY" },
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
          { src: "/asl_videos/daily_life/school.mp4",  mediaType: "video", label: "SCHOOL" },
          { src: "/asl_videos/verbs/go.mp4",           mediaType: "video", label: "GO" },
        ],
        answer: "Today I go to school.",
        prompt: "Translate this sentence:",
      },
      {
        id: "s-time-2",
        signs: [
          { src: "/asl_videos/time/tomorrow.mp4",      mediaType: "video", label: "TOMORROW" },
          { src: "/asl_videos/daily_life/work.mp4",    mediaType: "video", label: "WORK" },
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
        ],
        answer: "Tomorrow I work.",
        prompt: "What is the plan?",
      },
      {
        id: "s-time-3",
        signs: [
          { src: "/asl_videos/time/yesterday.mp4",     mediaType: "video", label: "YESTERDAY" },
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
          { src: "/asl_videos/daily_life/home.mp4",    mediaType: "video", label: "HOME" },
        ],
        answer: "Yesterday I was home.",
        prompt: "What happened yesterday?",
      },
    ],
  },

  "conv-directions": {
    id: "conv-directions",
    title: "Directions & Location",
    level: 4,
    levelTitle: "Conversational ASL",
    duration: "10 min",
    tags: ["Places", "Movement", "Location"],
    vocab: [
      { key: "sign_home",   label: "HOME",   mediaType: "video", mediaSrc: "/asl_videos/daily_life/home.mp4",   description: "Flat O-hand (bunched fingers) touches the cheek, then moves up to touch the cheek again slightly higher." },
      { key: "sign_work",   label: "WORK",   mediaType: "video", mediaSrc: "/asl_videos/daily_life/work.mp4",   description: "Both S-hands (fists) stack and tap the top wrist against the bottom wrist twice." },
      { key: "sign_school", label: "SCHOOL", mediaType: "video", mediaSrc: "/asl_videos/daily_life/school.mp4", description: "Clap both flat hands together twice." },
      { key: "sign_go",     label: "GO",     mediaType: "video", mediaSrc: "/asl_videos/verbs/go.mp4",          description: "Both index fingers circle forward and away from you." },
      { key: "sign_come",   label: "COME",   mediaType: "video", mediaSrc: "/asl_videos/verbs/come.mp4",        description: "Both index fingers circle toward you and inward." },
      { key: "sign_want",   label: "WANT",   mediaType: "video", mediaSrc: "/asl_videos/verbs/want.mp4",        description: "Both bent 5-hands (claw-shape) pull toward your body as if grabbing something you desire." },
    ],
    sentences: [
      {
        id: "s-dir-1",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
          { src: "/asl_videos/verbs/go.mp4",           mediaType: "video", label: "GO" },
          { src: "/asl_videos/daily_life/home.mp4",    mediaType: "video", label: "HOME" },
        ],
        answer: "I go home.",
        prompt: "Where is this person going?",
      },
      {
        id: "s-dir-2",
        signs: [
          { src: "/asl_videos/pronouns/you.mp4",       mediaType: "video", label: "YOU" },
          { src: "/asl_videos/verbs/come.mp4",         mediaType: "video", label: "COME" },
          { src: "/asl_videos/daily_life/school.mp4",  mediaType: "video", label: "SCHOOL" },
        ],
        answer: "You come to school.",
        prompt: "Translate this sentence:",
      },
      {
        id: "s-dir-3",
        signs: [
          { src: "/asl_videos/daily_life/me.mp4",      mediaType: "video", label: "ME" },
          { src: "/asl_videos/verbs/go.mp4",           mediaType: "video", label: "GO" },
          { src: "/asl_videos/daily_life/work.mp4",    mediaType: "video", label: "WORK" },
          { src: "/asl_videos/time/now.mp4",           mediaType: "video", label: "NOW" },
        ],
        answer: "I go to work now.",
        prompt: "What are they doing right now?",
      },
    ],
  },
};
