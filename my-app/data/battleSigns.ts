export type BattleSign = {
  id: string;
  name: string;
  videoUrl: string;
  /** Signs in the same group have similar handshapes → used as distractors */
  group: string;
};

export type BattleRound = {
  roundIndex: number;
  signId: string;
  signName: string;
  videoUrl: string;
  /** 4 answer choices, shuffled, includes correct answer */
  options: string[];
};

export const BATTLE_SIGNS: BattleSign[] = [
  // Pointing (index finger — same handshape, different direction)
  { id: 'me',        name: 'ME',         videoUrl: '/asl_videos/daily_life/me.mp4',       group: 'pointing' },
  { id: 'you',       name: 'YOU',        videoUrl: '/asl_videos/pronouns/you.mp4',         group: 'pointing' },
  { id: 'index',     name: 'HE / SHE',   videoUrl: '/asl_videos/pronouns/index.mp4',       group: 'pointing' },
  { id: 'they',      name: 'THEY',       videoUrl: '/asl_videos/pronouns/they.mp4',        group: 'pointing' },

  // Movement verbs (hands move outward/forward)
  { id: 'go',        name: 'GO',         videoUrl: '/asl_videos/verbs/go.mp4',             group: 'move_verb' },
  { id: 'want',      name: 'WANT',       videoUrl: '/asl_videos/verbs/want.mp4',           group: 'move_verb' },
  { id: 'see',       name: 'SEE',        videoUrl: '/asl_videos/verbs/see.mp4',            group: 'move_verb' },
  { id: 'like',      name: 'LIKE',       videoUrl: '/asl_videos/verbs/like.mp4',           group: 'move_verb' },

  // Body-contact verbs
  { id: 'eat',       name: 'EAT',        videoUrl: '/asl_videos/verbs/eat.mp4',            group: 'body_verb' },
  { id: 'work',      name: 'WORK',       videoUrl: '/asl_videos/daily_life/work.mp4',      group: 'body_verb' },
  { id: 'sleep',     name: 'SLEEP',      videoUrl: '/asl_videos/verbs/sleep.mp4',          group: 'body_verb' },
  { id: 'learn',     name: 'LEARN',      videoUrl: '/asl_videos/verbs/learn.mp4',          group: 'body_verb' },

  // Time signs (temporal movement)
  { id: 'now',       name: 'NOW',        videoUrl: '/asl_videos/time/now.mp4',             group: 'time' },
  { id: 'tomorrow',  name: 'TOMORROW',   videoUrl: '/asl_videos/time/tomorrow.mp4',        group: 'time' },
  { id: 'yesterday', name: 'YESTERDAY',  videoUrl: '/asl_videos/time/yesterday.mp4',       group: 'time' },
  { id: 'night',     name: 'NIGHT',      videoUrl: '/asl_videos/time/night.mp4',           group: 'time' },

  // Place signs (location-based)
  { id: 'home',        name: 'HOME',       videoUrl: '/asl_videos/daily_life/home.mp4',       group: 'place' },
  { id: 'school',      name: 'SCHOOL',     videoUrl: '/asl_videos/daily_life/school.mp4',     group: 'place' },
  { id: 'restaurant',  name: 'RESTAURANT', videoUrl: '/asl_videos/daily_life/restaurant.mp4', group: 'place' },
  { id: 'gym',         name: 'GYM',        videoUrl: '/asl_videos/daily_life/gym.mp4',         group: 'place' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateRounds(count: number): BattleRound[] {
  const selected = shuffle(BATTLE_SIGNS).slice(0, Math.min(count, BATTLE_SIGNS.length));

  return selected.map((sign, i) => {
    // Same-group distractors look visually similar → harder
    const sameGroup  = BATTLE_SIGNS.filter(s => s.group === sign.group && s.id !== sign.id);
    const otherGroup = BATTLE_SIGNS.filter(s => s.group !== sign.group);
    const pool = [...shuffle(sameGroup), ...shuffle(otherGroup)];
    const distractors = pool.slice(0, 3).map(s => s.name);

    return {
      roundIndex: i,
      signId:     sign.id,
      signName:   sign.name,
      videoUrl:   sign.videoUrl,
      options:    shuffle([...distractors, sign.name]),
    };
  });
}
