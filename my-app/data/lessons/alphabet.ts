// --- TYPES ---
export type StepType = "teach" | "quiz" | "match" | "synthesize";

export interface LessonStep {
  id: string;
  type: StepType;
  prompt: string;
  description?: string;
  imageUrl?: string | string[];
  options?: { id: string; label?: string; imageUrl?: string }[];
  correctAnswer?: string;
}

export interface Lesson {
  id: string;
  title: string;
  steps: LessonStep[];
}

// --- DATA ---
export const alphabetLessons: Record<string, Lesson> = {
  // ==========================================
  // LESSON 1: A - M (Heavy Practice & Games)
  // ==========================================
  "alphabet-1": {
    id: "alphabet-1",
    title: "ASL Alphabet: A - M",
    steps: [
      // ----------------------------------------
      // CHUNK 1: A, B, C (The Warm Up)
      // ----------------------------------------
      {
        id: "teach-a", type: "teach", prompt: "This is the letter A",
        description: "Make a fist and rest your thumb straight against the side of your index finger.",
        imageUrl: "/asl_images/a.png",
      },
      {
        id: "teach-b", type: "teach", prompt: "This is the letter B",
        description: "Keep your four fingers straight up and together. Tuck your thumb across your palm.",
        imageUrl: "/asl_images/b.png",
      },
      {
        id: "teach-c", type: "teach", prompt: "This is the letter C",
        description: "Curve your entire hand to form the shape of a C, like holding a cup.",
        imageUrl: "/asl_images/c.png",
      },
      {
        id: "quiz-a", type: "quiz", prompt: "Let's test it! Which letter is this?",
        imageUrl: "/asl_images/a.png",
        options: [{ id: "A", label: "A" }, { id: "B", label: "B" }, { id: "C", label: "C" }],
        correctAnswer: "A",
      },
      {
        id: "match-c", type: "match", prompt: "Visual check: Select the image for C",
        options: [
          { id: "A", imageUrl: "/asl_images/a.png" },
          { id: "B", imageUrl: "/asl_images/b.png" },
          { id: "C", imageUrl: "/asl_images/c.png" },
          { id: "Fake", imageUrl: "/asl_images/b.png" }, // Temp fallback 
        ],
        correctAnswer: "C",
      },
      {
        id: "quiz-b", type: "quiz", prompt: "Don't forget this one. What letter is this?",
        imageUrl: "/asl_images/b.png",
        options: [{ id: "A", label: "A" }, { id: "B", label: "B" }, { id: "C", label: "C" }],
        correctAnswer: "B",
      },
      {
        id: "synthesize-cab", type: "synthesize", prompt: "Spelling Mini-Game: What word does this spell?",
        imageUrl: ["/asl_images/c.png", "/asl_images/a.png", "/asl_images/b.png"],
        correctAnswer: "CAB",
      },

      // ----------------------------------------
      // CHUNK 2: D, E, F (Mixing with A, B, C)
      // ----------------------------------------
      {
        id: "teach-d", type: "teach", prompt: "This is the letter D",
        description: "Point your index finger up. Touch your thumb to your other three fingers to form a circle.",
        imageUrl: "/asl_images/d.png",
      },
      {
        id: "teach-e", type: "teach", prompt: "This is the letter E",
        description: "Curl your four fingers tightly down so their tips rest on your thumb, which is tucked in.",
        imageUrl: "/asl_images/e.png",
      },
      {
        id: "quiz-e", type: "quiz", prompt: "Which letter is this?",
        imageUrl: "/asl_images/e.png",
        options: [{ id: "C", label: "C" }, { id: "E", label: "E" }, { id: "A", label: "A" }], // Distractors from Chunk 1!
        correctAnswer: "E",
      },
      {
        id: "teach-f", type: "teach", prompt: "This is the letter F",
        description: "Touch the tips of your index finger and thumb together to make a circle. Splay your other three fingers up.",
        imageUrl: "/asl_images/f.png",
      },
      {
        id: "match-d", type: "match", prompt: "Careful! D and F look similar. Which one is D?",
        options: [
          { id: "B", imageUrl: "/asl_images/b.png" },
          { id: "D", imageUrl: "/asl_images/d.png" },
          { id: "E", imageUrl: "/asl_images/e.png" },
          { id: "F", imageUrl: "/asl_images/f.png" },
        ],
        correctAnswer: "D",
      },
      {
        id: "synthesize-bad", type: "synthesize", prompt: "Game Time! What does this spell?",
        imageUrl: ["/asl_images/b.png", "/asl_images/a.png", "/asl_images/d.png"],
        correctAnswer: "BAD",
      },
      {
        id: "synthesize-fed", type: "synthesize", prompt: "Keep going. Translate this:",
        imageUrl: ["/asl_images/f.png", "/asl_images/e.png", "/asl_images/d.png"],
        correctAnswer: "FED",
      },
      {
        id: "synthesize-cafe", type: "synthesize", prompt: "Hard Mode! Spell this 4-letter word:",
        imageUrl: ["/asl_images/c.png", "/asl_images/a.png", "/asl_images/f.png", "/asl_images/e.png"],
        correctAnswer: "CAFE",
      },
      {
        id: "synthesize-deaf", type: "synthesize", prompt: "Bonus Word! What is this?",
        imageUrl: ["/asl_images/d.png", "/asl_images/e.png", "/asl_images/a.png", "/asl_images/f.png"],
        correctAnswer: "DEAF",
      },

      // ----------------------------------------
      // CHUNK 3: G, H, I (Mixing with A-F)
      // ----------------------------------------
      {
        id: "teach-g", type: "teach", prompt: "This is the letter G",
        description: "Point your index finger and thumb sideways, parallel to each other, like you are pinching something.",
        imageUrl: "/asl_images/g.png",
      },
      {
        id: "teach-h", type: "teach", prompt: "This is the letter H",
        description: "Similar to G, but point both your index and middle fingers sideways together.",
        imageUrl: "/asl_images/h.png",
      },
      {
        id: "match-g", type: "match", prompt: "Find the letter G",
        options: [
          { id: "C", imageUrl: "/asl_images/c.png" }, // Good distractor for G
          { id: "F", imageUrl: "/asl_images/f.png" },
          { id: "G", imageUrl: "/asl_images/g.png" },
          { id: "H", imageUrl: "/asl_images/h.png" },
        ],
        correctAnswer: "G",
      },
      {
        id: "teach-i", type: "teach", prompt: "This is the letter I",
        description: "Make a fist, but extend your pinky finger straight up.",
        imageUrl: "/asl_images/i.png",
      },
      {
        id: "quiz-h", type: "quiz", prompt: "Do you remember this one?",
        imageUrl: "/asl_images/h.png",
        options: [{ id: "H", label: "H" }, { id: "E", label: "E" }, { id: "G", label: "G" }],
        correctAnswer: "H",
      },
      {
        id: "quiz-i", type: "quiz", prompt: "Which letter is this?",
        imageUrl: "/asl_images/i.png",
        options: [{ id: "A", label: "A" }, { id: "D", label: "D" }, { id: "I", label: "I" }],
        correctAnswer: "I",
      },
      {
        id: "synthesize-dig", type: "synthesize", prompt: "Game Time! What does this spell?",
        imageUrl: ["/asl_images/d.png", "/asl_images/i.png", "/asl_images/g.png"],
        correctAnswer: "DIG",
      },
      {
        id: "synthesize-hide", type: "synthesize", prompt: "Translate this word:",
        imageUrl: ["/asl_images/h.png", "/asl_images/i.png", "/asl_images/d.png", "/asl_images/e.png"],
        correctAnswer: "HIDE",
      },
      {
        id: "synthesize-chef", type: "synthesize", prompt: "Master Challenge! Spell this out:",
        imageUrl: ["/asl_images/c.png", "/asl_images/h.png", "/asl_images/e.png", "/asl_images/f.png"],
        correctAnswer: "CHEF",
      },

      // ----------------------------------------
      // CHUNK 4: J, K, L, M (The Final Boss)
      // ----------------------------------------
      {
        id: "teach-j", type: "teach", prompt: "This is the letter J",
        description: "Start with the 'I' handshape, then use your pinky to draw a 'J' shape in the air, swooping down and inward.",
        imageUrl: "/asl_images/j.png",
      },
      {
        id: "teach-k", type: "teach", prompt: "This is the letter K",
        description: "Point your index and middle fingers up like a peace sign, and place your thumb directly between them.",
        imageUrl: "/asl_images/k.png",
      },
      {
        id: "teach-l", type: "teach", prompt: "This is the letter L",
        description: "Point your index finger up and your thumb straight out to form an 'L' shape.",
        imageUrl: "/asl_images/l.png",
      },
      {
        id: "teach-m", type: "teach", prompt: "This is the letter M",
        description: "Make a fist, but tuck your thumb underneath your first three fingers (index, middle, ring).",
        imageUrl: "/asl_images/m.png",
      },
      {
        id: "quiz-m", type: "quiz", prompt: "Fist check! Which letter is this?",
        imageUrl: "/asl_images/m.png",
        options: [{ id: "A", label: "A" }, { id: "E", label: "E" }, { id: "M", label: "M" }], // A, E, and M are all fists!
        correctAnswer: "M",
      },
      {
        id: "match-l", type: "match", prompt: "Select the image for L",
        options: [
          { id: "D", imageUrl: "/asl_images/d.png" }, // Pointing up
          { id: "I", imageUrl: "/asl_images/i.png" }, // Pointing up
          { id: "K", imageUrl: "/asl_images/k.png" },
          { id: "L", imageUrl: "/asl_images/l.png" },
        ],
        correctAnswer: "L",
      },
      {
        id: "quiz-k", type: "quiz", prompt: "Which letter is this?",
        imageUrl: "/asl_images/k.png",
        options: [{ id: "H", label: "H" }, { id: "K", label: "K" }, { id: "F", label: "F" }],
        correctAnswer: "K",
      },
      {
        id: "synthesize-jam", type: "synthesize", prompt: "Final Spelling Bee! What is this word?",
        imageUrl: ["/asl_images/j.png", "/asl_images/a.png", "/asl_images/m.png"],
        correctAnswer: "JAM",
      },
      {
        id: "synthesize-hike", type: "synthesize", prompt: "Translate this:",
        imageUrl: ["/asl_images/h.png", "/asl_images/i.png", "/asl_images/k.png", "/asl_images/e.png"],
        correctAnswer: "HIKE",
      },
      {
        id: "synthesize-milk", type: "synthesize", prompt: "Almost done! What does this spell?",
        imageUrl: ["/asl_images/m.png", "/asl_images/i.png", "/asl_images/l.png", "/asl_images/k.png"],
        correctAnswer: "MILK",
      },
      {
        id: "synthesize-climb", type: "synthesize", prompt: "The Final Boss Word! (5 letters)",
        imageUrl: ["/asl_images/c.png", "/asl_images/l.png", "/asl_images/i.png", "/asl_images/m.png", "/asl_images/b.png"],
        correctAnswer: "CLIMB",
      },
    ],
  },
  
  // Lesson 2 Stub remains here for later...
  "alphabet-2": {
    id: "alphabet-2",
    title: "ASL Alphabet: N - Z",
    steps: [
      // ----------------------------------------
      // CHUNK 1: N, O, P (Mixing with Lesson 1)
      // ----------------------------------------
      {
        id: "teach-n", type: "teach", prompt: "This is the letter N",
        description: "Make a fist, but tuck your thumb underneath only your first two fingers (index and middle).",
        imageUrl: "/asl_images/n.png",
      },
      {
        id: "teach-o", type: "teach", prompt: "This is the letter O",
        description: "Curve all your fingers and touch their tips to your thumb, forming an 'O' shape.",
        imageUrl: "/asl_images/o.png",
      },
      {
        id: "teach-p", type: "teach", prompt: "This is the letter P",
        description: "Make a peace sign with your thumb in the middle (the letter K), but drop your wrist so your fingers point down.",
        imageUrl: "/asl_images/p.png",
      },
      {
        id: "quiz-n", type: "quiz", prompt: "Fist Check! Which one is N?",
        imageUrl: "/asl_images/n.png",
        options: [{ id: "M", label: "M" }, { id: "N", label: "N" }, { id: "A", label: "A" }], // M and A from Lesson 1!
        correctAnswer: "N",
      },
      {
        id: "match-p", type: "match", prompt: "Careful! Which letter is pointing down (P)?",
        options: [
          { id: "K", imageUrl: "/asl_images/k.png" }, // K points up
          { id: "P", imageUrl: "/asl_images/p.png" }, // P points down
          { id: "D", imageUrl: "/asl_images/d.png" }, 
          { id: "O", imageUrl: "/asl_images/o.png" },
        ],
        correctAnswer: "P",
      },
      {
        id: "synthesize-pan", type: "synthesize", prompt: "Spelling Mini-Game: What does this spell?",
        imageUrl: ["/asl_images/p.png", "/asl_images/a.png", "/asl_images/n.png"], // Uses A from Lesson 1
        correctAnswer: "PAN",
      },
      {
        id: "synthesize-cop", type: "synthesize", prompt: "Keep going! Translate this:",
        imageUrl: ["/asl_images/c.png", "/asl_images/o.png", "/asl_images/p.png"], // Uses C from Lesson 1
        correctAnswer: "COP",
      },
      {
        id: "synthesize-pen", type: "synthesize", prompt: "What word is this?",
        imageUrl: ["/asl_images/p.png", "/asl_images/e.png", "/asl_images/n.png"], // Uses E from Lesson 1
        correctAnswer: "PEN",
      },

      // ----------------------------------------
      // CHUNK 2: Q, R, S (Fists and Crosses)
      // ----------------------------------------
      {
        id: "teach-q", type: "teach", prompt: "This is the letter Q",
        description: "Pinch your index and thumb together (like the letter G), but drop your wrist so they point straight down.",
        imageUrl: "/asl_images/q.png",
      },
      {
        id: "teach-r", type: "teach", prompt: "This is the letter R",
        description: "Cross your middle finger tightly over the back of your index finger. Tuck the rest.",
        imageUrl: "/asl_images/r.png",
      },
      {
        id: "teach-s", type: "teach", prompt: "This is the letter S",
        description: "Make a tight fist and wrap your thumb completely OVER the front of your fingers.",
        imageUrl: "/asl_images/s.png",
      },
      {
        id: "quiz-s", type: "quiz", prompt: "Which letter is this?",
        imageUrl: "/asl_images/s.png",
        options: [{ id: "A", label: "A" }, { id: "E", label: "E" }, { id: "S", label: "S" }], // All 3 are fists!
        correctAnswer: "S",
      },
      {
        id: "match-r", type: "match", prompt: "Find the crossed fingers (R):",
        options: [
          { id: "U", imageUrl: "/asl_images/u.png" }, 
          { id: "V", imageUrl: "/asl_images/v.png" }, 
          { id: "R", imageUrl: "/asl_images/r.png" },
          { id: "K", imageUrl: "/asl_images/k.png" },
        ],
        correctAnswer: "R",
      },
      {
        id: "synthesize-red", type: "synthesize", prompt: "Game Time! What does this spell?",
        imageUrl: ["/asl_images/r.png", "/asl_images/e.png", "/asl_images/d.png"], // Uses E, D
        correctAnswer: "RED",
      },
      {
        id: "synthesize-car", type: "synthesize", prompt: "Translate this:",
        imageUrl: ["/asl_images/c.png", "/asl_images/a.png", "/asl_images/r.png"], // Uses C, A
        correctAnswer: "CAR",
      },
      {
        id: "synthesize-rose", type: "synthesize", prompt: "Hard Mode! Spell this 4-letter word:",
        imageUrl: ["/asl_images/r.png", "/asl_images/o.png", "/asl_images/s.png", "/asl_images/e.png"],
        correctAnswer: "ROSE",
      },

      // ----------------------------------------
      // CHUNK 3: T, U, V (Fingers Up)
      // ----------------------------------------
      {
        id: "teach-t", type: "teach", prompt: "This is the letter T",
        description: "Make a fist, but tuck your thumb directly underneath your index finger ONLY.",
        imageUrl: "/asl_images/t.png",
      },
      {
        id: "teach-u", type: "teach", prompt: "This is the letter U",
        description: "Point your index and middle fingers straight up, keeping them tightly glued together.",
        imageUrl: "/asl_images/u.png",
      },
      {
        id: "teach-v", type: "teach", prompt: "This is the letter V",
        description: "Make a peace sign. It's just like 'U', but your index and middle fingers are separated.",
        imageUrl: "/asl_images/v.png",
      },
      {
        id: "quiz-t", type: "quiz", prompt: "Don't get tricked! Where is the thumb?",
        imageUrl: "/asl_images/t.png",
        options: [{ id: "M", label: "M" }, { id: "N", label: "N" }, { id: "T", label: "T" }], // M(3), N(2), T(1)
        correctAnswer: "T",
      },
      {
        id: "match-u", type: "match", prompt: "Which one is U (fingers glued together)?",
        options: [
          { id: "V", imageUrl: "/asl_images/v.png" }, 
          { id: "R", imageUrl: "/asl_images/r.png" }, 
          { id: "H", imageUrl: "/asl_images/h.png" },
          { id: "U", imageUrl: "/asl_images/u.png" },
        ],
        correctAnswer: "U",
      },
      {
        id: "quiz-v", type: "quiz", prompt: "What letter is this?",
        imageUrl: "/asl_images/v.png",
        options: [{ id: "U", label: "U" }, { id: "V", label: "V" }, { id: "K", label: "K" }], 
        correctAnswer: "V",
      },
      {
        id: "synthesize-nut", type: "synthesize", prompt: "Spelling Challenge! What is this word?",
        imageUrl: ["/asl_images/n.png", "/asl_images/u.png", "/asl_images/t.png"],
        correctAnswer: "NUT",
      },
      {
        id: "synthesize-vet", type: "synthesize", prompt: "Translate this word:",
        imageUrl: ["/asl_images/v.png", "/asl_images/e.png", "/asl_images/t.png"], // Uses E
        correctAnswer: "VET",
      },
      {
        id: "synthesize-true", type: "synthesize", prompt: "Combine what you know! (4 letters)",
        imageUrl: ["/asl_images/t.png", "/asl_images/r.png", "/asl_images/u.png", "/asl_images/e.png"],
        correctAnswer: "TRUE",
      },

      // ----------------------------------------
      // CHUNK 4: W, X, Y, Z (The Final Letters)
      // ----------------------------------------
      {
        id: "teach-w", type: "teach", prompt: "This is the letter W",
        description: "Extend your index, middle, and ring fingers up. Use your thumb to hold down your pinky.",
        imageUrl: "/asl_images/w.png",
      },
      {
        id: "teach-x", type: "teach", prompt: "This is the letter X",
        description: "Make a fist, but raise your index finger and bend it in half like a pirate hook.",
        imageUrl: "/asl_images/x.png",
      },
      {
        id: "teach-y", type: "teach", prompt: "This is the letter Y",
        description: "Extend your thumb and pinky finger outward, while keeping your middle three fingers tucked in (hang loose).",
        imageUrl: "/asl_images/y.png",
      },
      {
        id: "teach-z", type: "teach", prompt: "This is the letter Z",
        description: "Point your index finger and draw the letter 'Z' in the air in front of you.",
        imageUrl: "/asl_images/z.png",
      },
      {
        id: "quiz-w", type: "quiz", prompt: "Which letter is this?",
        imageUrl: "/asl_images/w.png",
        options: [{ id: "F", label: "F" }, { id: "W", label: "W" }, { id: "V", label: "V" }], // F is a great distractor for W!
        correctAnswer: "W",
      },
      {
        id: "match-y", type: "match", prompt: "Select the image for Y",
        options: [
          { id: "I", imageUrl: "/asl_images/i.png" }, // Pinky up
          { id: "J", imageUrl: "/asl_images/j.png" }, 
          { id: "Y", imageUrl: "/asl_images/y.png" },
          { id: "X", imageUrl: "/asl_images/x.png" },
        ],
        correctAnswer: "Y",
      },
      {
        id: "synthesize-cow", type: "synthesize", prompt: "Final Spelling Bee! What does this spell?",
        imageUrl: ["/asl_images/c.png", "/asl_images/o.png", "/asl_images/w.png"], // Uses C
        correctAnswer: "COW",
      },
      {
        id: "synthesize-fox", type: "synthesize", prompt: "Translate this:",
        imageUrl: ["/asl_images/f.png", "/asl_images/o.png", "/asl_images/x.png"], // Uses F
        correctAnswer: "FOX",
      },
      {
        id: "synthesize-you", type: "synthesize", prompt: "Almost done! What is this word?",
        imageUrl: ["/asl_images/y.png", "/asl_images/o.png", "/asl_images/u.png"],
        correctAnswer: "YOU",
      },
      {
        id: "synthesize-zero", type: "synthesize", prompt: "Master Challenge (4 letters):",
        imageUrl: ["/asl_images/z.png", "/asl_images/e.png", "/asl_images/r.png", "/asl_images/o.png"],
        correctAnswer: "ZERO",
      },
      {
        id: "synthesize-lazy", type: "synthesize", prompt: "Use your whole alphabet:",
        imageUrl: ["/asl_images/l.png", "/asl_images/a.png", "/asl_images/z.png", "/asl_images/y.png"],
        correctAnswer: "LAZY",
      },
      {
        id: "synthesize-quick", type: "synthesize", prompt: "The Final Boss Word! (5 letters)",
        imageUrl: ["/asl_images/q.png", "/asl_images/u.png", "/asl_images/i.png", "/asl_images/c.png", "/asl_images/k.png"],
        correctAnswer: "QUICK",
      },
    ],
  },
};