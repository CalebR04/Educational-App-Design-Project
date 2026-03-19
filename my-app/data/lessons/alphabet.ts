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
        imageUrl: "/asl_images/letters/a.svg",
      },
      {
        id: "teach-b", type: "teach", prompt: "This is the letter B",
        description: "Keep your four fingers straight up and together. Tuck your thumb across your palm.",
        imageUrl: "/asl_images/letters/b.svg",
      },
      {
        id: "teach-c", type: "teach", prompt: "This is the letter C",
        description: "Curve your entire hand to form the shape of a C, like holding a cup.",
        imageUrl: "/asl_images/letters/c.svg",
      },
      {
        id: "quiz-a", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/a.svg",
        options: [{ id: "A", label: "A" }, { id: "B", label: "B" }, { id: "C", label: "C" }],
        correctAnswer: "A",
      },
      {
        id: "match-c", type: "match", prompt: "What is the correct sign for C?",
        options: [
          { id: "A", imageUrl: "/asl_images/letters/a.svg" },
          { id: "B", imageUrl: "/asl_images/letters/b.svg" },
          { id: "C", imageUrl: "/asl_images/letters/c.svg" },
          { id: "Fake", imageUrl: "/asl_images/letters/b.svg" }, // Temp fallback 
        ],
        correctAnswer: "C",
      },
      {
        id: "quiz-b", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/b.svg",
        options: [{ id: "A", label: "A" }, { id: "B", label: "B" }, { id: "C", label: "C" }],
        correctAnswer: "B",
      },
      {
        id: "synthesize-cab", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/c.svg", "/asl_images/letters/a.svg", "/asl_images/letters/b.svg"],
        correctAnswer: "CAB",
      },

      // ----------------------------------------
      // CHUNK 2: D, E, F (Mixing with A, B, C)
      // ----------------------------------------
      {
        id: "teach-d", type: "teach", prompt: "This is the letter D",
        description: "Point your index finger up. Touch your thumb to your other three fingers to form a circle.",
        imageUrl: "/asl_images/letters/d.svg",
      },
      {
        id: "teach-e", type: "teach", prompt: "This is the letter E",
        description: "Curl your four fingers tightly down so their tips rest on your thumb, which is tucked in.",
        imageUrl: "/asl_images/letters/e.svg",
      },
      {
        id: "quiz-e", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/e.svg",
        options: [{ id: "C", label: "C" }, { id: "E", label: "E" }, { id: "A", label: "A" }], // Distractors from Chunk 1!
        correctAnswer: "E",
      },
      {
        id: "teach-f", type: "teach", prompt: "This is the letter F",
        description: "Touch the tips of your index finger and thumb together to make a circle. Splay your other three fingers up.",
        imageUrl: "/asl_images/letters/f.svg",
      },
      {
        id: "match-d", type: "match", prompt: "What is the correct sign for D?",
        options: [
          { id: "B", imageUrl: "/asl_images/letters/b.svg" },
          { id: "D", imageUrl: "/asl_images/letters/d.svg" },
          { id: "E", imageUrl: "/asl_images/letters/e.svg" },
          { id: "F", imageUrl: "/asl_images/letters/f.svg" },
        ],
        correctAnswer: "D",
      },
      {
        id: "synthesize-bad", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/b.svg", "/asl_images/letters/a.svg", "/asl_images/letters/d.svg"],
        correctAnswer: "BAD",
      },
      {
        id: "synthesize-fed", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/f.svg", "/asl_images/letters/e.svg", "/asl_images/letters/d.svg"],
        correctAnswer: "FED",
      },
      {
        id: "synthesize-cafe", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/c.svg", "/asl_images/letters/a.svg", "/asl_images/letters/f.svg", "/asl_images/letters/e.svg"],
        correctAnswer: "CAFE",
      },
      {
        id: "synthesize-deaf", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/d.svg", "/asl_images/letters/e.svg", "/asl_images/letters/a.svg", "/asl_images/letters/f.svg"],
        correctAnswer: "DEAF",
      },

      // ----------------------------------------
      // CHUNK 3: G, H, I (Mixing with A-F)
      // ----------------------------------------
      {
        id: "teach-g", type: "teach", prompt: "This is the letter G",
        description: "Point your index finger and thumb sideways, parallel to each other, like you are pinching something.",
        imageUrl: "/asl_images/letters/g.svg",
      },
      {
        id: "teach-h", type: "teach", prompt: "This is the letter H",
        description: "Similar to G, but point both your index and middle fingers sideways together.",
        imageUrl: "/asl_images/letters/h.svg",
      },
      {
        id: "match-g", type: "match", prompt: "What is the correct sign for G?",
        options: [
          { id: "C", imageUrl: "/asl_images/letters/c.svg" }, // Good distractor for G
          { id: "F", imageUrl: "/asl_images/letters/f.svg" },
          { id: "G", imageUrl: "/asl_images/letters/g.svg" },
          { id: "H", imageUrl: "/asl_images/letters/h.svg" },
        ],
        correctAnswer: "G",
      },
      {
        id: "teach-i", type: "teach", prompt: "This is the letter I",
        description: "Make a fist, but extend your pinky finger straight up.",
        imageUrl: "/asl_images/letters/i.svg",
      },
      {
        id: "quiz-h", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/h.svg",
        options: [{ id: "H", label: "H" }, { id: "E", label: "E" }, { id: "G", label: "G" }],
        correctAnswer: "H",
      },
      {
        id: "quiz-i", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/i.svg",
        options: [{ id: "A", label: "A" }, { id: "D", label: "D" }, { id: "I", label: "I" }],
        correctAnswer: "I",
      },
      {
        id: "synthesize-dig", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/d.svg", "/asl_images/letters/i.svg", "/asl_images/letters/g.svg"],
        correctAnswer: "DIG",
      },
      {
        id: "synthesize-hide", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/h.svg", "/asl_images/letters/i.svg", "/asl_images/letters/d.svg", "/asl_images/letters/e.svg"],
        correctAnswer: "HIDE",
      },
      {
        id: "synthesize-chef", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/c.svg", "/asl_images/letters/h.svg", "/asl_images/letters/e.svg", "/asl_images/letters/f.svg"],
        correctAnswer: "CHEF",
      },

      // ----------------------------------------
      // CHUNK 4: J, K, L, M (The Final Boss)
      // ----------------------------------------
      {
        id: "teach-j", type: "teach", prompt: "This is the letter J",
        description: "Start with the 'I' handshape, then use your pinky to draw a 'J' shape in the air, swooping down and inward.",
        imageUrl: "/asl_images/letters/j.svg",
      },
      {
        id: "teach-k", type: "teach", prompt: "This is the letter K",
        description: "Point your index and middle fingers up like a peace sign, and place your thumb directly between them.",
        imageUrl: "/asl_images/letters/k.svg",
      },
      {
        id: "teach-l", type: "teach", prompt: "This is the letter L",
        description: "Point your index finger up and your thumb straight out to form an 'L' shape.",
        imageUrl: "/asl_images/letters/l.svg",
      },
      {
        id: "teach-m", type: "teach", prompt: "This is the letter M",
        description: "Make a fist, but tuck your thumb underneath your first three fingers (index, middle, ring).",
        imageUrl: "/asl_images/letters/m.svg",
      },
      {
        id: "quiz-m", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/m.svg",
        options: [{ id: "A", label: "A" }, { id: "E", label: "E" }, { id: "M", label: "M" }], // A, E, and M are all fists!
        correctAnswer: "M",
      },
      {
        id: "match-l", type: "match", prompt: "What is the correct sign for L?",
        options: [
          { id: "D", imageUrl: "/asl_images/letters/d.svg" }, // Pointing up
          { id: "I", imageUrl: "/asl_images/letters/i.svg" }, // Pointing up
          { id: "K", imageUrl: "/asl_images/letters/k.svg" },
          { id: "L", imageUrl: "/asl_images/letters/l.svg" },
        ],
        correctAnswer: "L",
      },
      {
        id: "quiz-k", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/k.svg",
        options: [{ id: "H", label: "H" }, { id: "K", label: "K" }, { id: "F", label: "F" }],
        correctAnswer: "K",
      },
      {
        id: "synthesize-jam", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/j.svg", "/asl_images/letters/a.svg", "/asl_images/letters/m.svg"],
        correctAnswer: "JAM",
      },
      {
        id: "synthesize-hike", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/h.svg", "/asl_images/letters/i.svg", "/asl_images/letters/k.svg", "/asl_images/letters/e.svg"],
        correctAnswer: "HIKE",
      },
      {
        id: "synthesize-milk", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/m.svg", "/asl_images/letters/i.svg", "/asl_images/letters/l.svg", "/asl_images/letters/k.svg"],
        correctAnswer: "MILK",
      },
      {
        id: "synthesize-climb", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/c.svg", "/asl_images/letters/l.svg", "/asl_images/letters/i.svg", "/asl_images/letters/m.svg", "/asl_images/letters/b.svg"],
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
        imageUrl: "/asl_images/letters/n.svg",
      },
      {
        id: "teach-o", type: "teach", prompt: "This is the letter O",
        description: "Curve all your fingers and touch their tips to your thumb, forming an 'O' shape.",
        imageUrl: "/asl_images/letters/o.svg",
      },
      {
        id: "teach-p", type: "teach", prompt: "This is the letter P",
        description: "Make a peace sign with your thumb in the middle (the letter K), but drop your wrist so your fingers point down.",
        imageUrl: "/asl_images/letters/p.svg",
      },
      {
        id: "quiz-n", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/n.svg",
        options: [{ id: "M", label: "M" }, { id: "N", label: "N" }, { id: "A", label: "A" }], // M and A from Lesson 1!
        correctAnswer: "N",
      },
      {
        id: "match-p", type: "match", prompt: "What is the correct sign for P?",
        options: [
          { id: "K", imageUrl: "/asl_images/letters/k.svg" }, // K points up
          { id: "P", imageUrl: "/asl_images/letters/p.svg" }, // P points down
          { id: "D", imageUrl: "/asl_images/letters/d.svg" }, 
          { id: "O", imageUrl: "/asl_images/letters/o.svg" },
        ],
        correctAnswer: "P",
      },
      {
        id: "synthesize-pan", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/p.svg", "/asl_images/letters/a.svg", "/asl_images/letters/n.svg"], // Uses A from Lesson 1
        correctAnswer: "PAN",
      },
      {
        id: "synthesize-cop", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/c.svg", "/asl_images/letters/o.svg", "/asl_images/letters/p.svg"], // Uses C from Lesson 1
        correctAnswer: "COP",
      },
      {
        id: "synthesize-pen", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/p.svg", "/asl_images/letters/e.svg", "/asl_images/letters/n.svg"], // Uses E from Lesson 1
        correctAnswer: "PEN",
      },

      // ----------------------------------------
      // CHUNK 2: Q, R, S (Fists and Crosses)
      // ----------------------------------------
      {
        id: "teach-q", type: "teach", prompt: "This is the letter Q",
        description: "Pinch your index and thumb together (like the letter G), but drop your wrist so they point straight down.",
        imageUrl: "/asl_images/letters/q.svg",
      },
      {
        id: "teach-r", type: "teach", prompt: "This is the letter R",
        description: "Cross your middle finger tightly over the back of your index finger. Tuck the rest.",
        imageUrl: "/asl_images/letters/r.svg",
      },
      {
        id: "teach-s", type: "teach", prompt: "This is the letter S",
        description: "Make a tight fist and wrap your thumb completely OVER the front of your fingers.",
        imageUrl: "/asl_images/letters/s.svg",
      },
      {
        id: "quiz-s", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/s.svg",
        options: [{ id: "A", label: "A" }, { id: "E", label: "E" }, { id: "S", label: "S" }], // All 3 are fists!
        correctAnswer: "S",
      },
      {
        id: "match-r", type: "match", prompt: "What is the correct sign for R?",
        options: [
          { id: "U", imageUrl: "/asl_images/letters/u.svg" }, 
          { id: "V", imageUrl: "/asl_images/letters/v.svg" }, 
          { id: "R", imageUrl: "/asl_images/letters/r.svg" },
          { id: "K", imageUrl: "/asl_images/letters/k.svg" },
        ],
        correctAnswer: "R",
      },
      {
        id: "synthesize-red", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/r.svg", "/asl_images/letters/e.svg", "/asl_images/letters/d.svg"], // Uses E, D
        correctAnswer: "RED",
      },
      {
        id: "synthesize-car", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/c.svg", "/asl_images/letters/a.svg", "/asl_images/letters/r.svg"], // Uses C, A
        correctAnswer: "CAR",
      },
      {
        id: "synthesize-rose", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/r.svg", "/asl_images/letters/o.svg", "/asl_images/letters/s.svg", "/asl_images/letters/e.svg"],
        correctAnswer: "ROSE",
      },

      // ----------------------------------------
      // CHUNK 3: T, U, V (Fingers Up)
      // ----------------------------------------
      {
        id: "teach-t", type: "teach", prompt: "This is the letter T",
        description: "Make a fist, but tuck your thumb directly underneath your index finger ONLY.",
        imageUrl: "/asl_images/letters/t.svg",
      },
      {
        id: "teach-u", type: "teach", prompt: "This is the letter U",
        description: "Point your index and middle fingers straight up, keeping them tightly glued together.",
        imageUrl: "/asl_images/letters/u.svg",
      },
      {
        id: "teach-v", type: "teach", prompt: "This is the letter V",
        description: "Make a peace sign. It's just like 'U', but your index and middle fingers are separated.",
        imageUrl: "/asl_images/letters/v.svg",
      },
      {
        id: "quiz-t", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/t.svg",
        options: [{ id: "M", label: "M" }, { id: "N", label: "N" }, { id: "T", label: "T" }], // M(3), N(2), T(1)
        correctAnswer: "T",
      },
      {
        id: "match-u", type: "match", prompt: "What is the correct sign for U?",
        options: [
          { id: "V", imageUrl: "/asl_images/letters/v.svg" }, 
          { id: "R", imageUrl: "/asl_images/letters/r.svg" }, 
          { id: "H", imageUrl: "/asl_images/letters/h.svg" },
          { id: "U", imageUrl: "/asl_images/letters/u.svg" },
        ],
        correctAnswer: "U",
      },
      {
        id: "quiz-v", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/v.svg",
        options: [{ id: "U", label: "U" }, { id: "V", label: "V" }, { id: "K", label: "K" }], 
        correctAnswer: "V",
      },
      {
        id: "synthesize-nut", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/n.svg", "/asl_images/letters/u.svg", "/asl_images/letters/t.svg"],
        correctAnswer: "NUT",
      },
      {
        id: "synthesize-vet", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/v.svg", "/asl_images/letters/e.svg", "/asl_images/letters/t.svg"], // Uses E
        correctAnswer: "VET",
      },
      {
        id: "synthesize-true", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/t.svg", "/asl_images/letters/r.svg", "/asl_images/letters/u.svg", "/asl_images/letters/e.svg"],
        correctAnswer: "TRUE",
      },

      // ----------------------------------------
      // CHUNK 4: W, X, Y, Z (The Final Letters)
      // ----------------------------------------
      {
        id: "teach-w", type: "teach", prompt: "This is the letter W",
        description: "Extend your index, middle, and ring fingers up. Use your thumb to hold down your pinky.",
        imageUrl: "/asl_images/letters/w.svg",
      },
      {
        id: "teach-x", type: "teach", prompt: "This is the letter X",
        description: "Make a fist, but raise your index finger and bend it in half like a pirate hook.",
        imageUrl: "/asl_images/letters/x.svg",
      },
      {
        id: "teach-y", type: "teach", prompt: "This is the letter Y",
        description: "Extend your thumb and pinky finger outward, while keeping your middle three fingers tucked in (hang loose).",
        imageUrl: "/asl_images/letters/y.svg",
      },
      {
        id: "teach-z", type: "teach", prompt: "This is the letter Z",
        description: "Point your index finger and draw the letter 'Z' in the air in front of you.",
        imageUrl: "/asl_images/letters/z.svg",
      },
      {
        id: "quiz-w", type: "quiz", prompt: "What is this sign?",
        imageUrl: "/asl_images/letters/w.svg",
        options: [{ id: "F", label: "F" }, { id: "W", label: "W" }, { id: "V", label: "V" }], // F is a great distractor for W!
        correctAnswer: "W",
      },
      {
        id: "match-y", type: "match", prompt: "What is the correct sign for Y?",
        options: [
          { id: "I", imageUrl: "/asl_images/letters/i.svg" }, // Pinky up
          { id: "J", imageUrl: "/asl_images/letters/j.svg" }, 
          { id: "Y", imageUrl: "/asl_images/letters/y.svg" },
          { id: "X", imageUrl: "/asl_images/letters/x.svg" },
        ],
        correctAnswer: "Y",
      },
      {
        id: "synthesize-cow", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/c.svg", "/asl_images/letters/o.svg", "/asl_images/letters/w.svg"], // Uses C
        correctAnswer: "COW",
      },
      {
        id: "synthesize-fox", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/f.svg", "/asl_images/letters/o.svg", "/asl_images/letters/x.svg"], // Uses F
        correctAnswer: "FOX",
      },
      {
        id: "synthesize-you", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/y.svg", "/asl_images/letters/o.svg", "/asl_images/letters/u.svg"],
        correctAnswer: "YOU",
      },
      {
        id: "synthesize-zero", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/z.svg", "/asl_images/letters/e.svg", "/asl_images/letters/r.svg", "/asl_images/letters/o.svg"],
        correctAnswer: "ZERO",
      },
      {
        id: "synthesize-lazy", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/l.svg", "/asl_images/letters/a.svg", "/asl_images/letters/z.svg", "/asl_images/letters/y.svg"],
        correctAnswer: "LAZY",
      },
      {
        id: "synthesize-quick", type: "synthesize", prompt: "What does this spell?",
        imageUrl: ["/asl_images/letters/q.svg", "/asl_images/letters/u.svg", "/asl_images/letters/i.svg", "/asl_images/letters/c.svg", "/asl_images/letters/k.svg"],
        correctAnswer: "QUICK",
      },
    ],
  },
};