// --- TYPES ---
export type StepType = "teach" | "quiz" | "match" | "synthesize" | "type" | "sentence" | "parameter_quiz";

/** Which linguistic parameter is being tested in a parameter_quiz step */
export type ParameterField = "handshape" | "location" | "movement";

export interface LessonStep {
  id: string;
  type: StepType;
  prompt: string;
  description?: string;
  imageUrl?: string | string[];
  videoUrl?: string;
  mediaType?: "image" | "video";
  options?: { id: string; label?: string; imageUrl?: string; videoUrl?: string; mediaType?: "image" | "video" }[];
  correctAnswer?: string;
  acceptedAnswers?: string[];
  wordKey?: string;
  sentenceMedia?: Array<{ src: string; mediaType: "image" | "video"; label: string }>;
  /** Set on parameter_quiz steps — identifies which ASL parameter is being tested */
  parameterField?: ParameterField;
}

export interface Lesson {
  id: string;
  title: string;
  steps: LessonStep[];
}

// --- DATA ---
// Alphabet lessons are now generated dynamically from lessonConfigs (alphabet-1, alphabet-2).
// Kept as empty object for backward-compat imports.
export const alphabetLessons: Record<string, Lesson> = {};
