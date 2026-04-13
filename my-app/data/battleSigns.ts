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
  // Level 1 — Deixis (pointing pronouns, same index-finger handshape)
  { id: 'me',         name: 'ME',           videoUrl: '/asl_videos/daily_life/me.mp4',          group: 'pointing' },
  { id: 'you',        name: 'YOU',          videoUrl: '/asl_videos/pronouns/you.mp4',           group: 'pointing' },
  { id: 'index',      name: 'HE / SHE',     videoUrl: '/asl_videos/pronouns/index.mp4',         group: 'pointing' },
  { id: 'they',       name: 'THEY',         videoUrl: '/asl_videos/pronouns/they.mp4',          group: 'pointing' },

  // Level 2 — Greetings: Initial Contact
  { id: 'hello',      name: 'HELLO',        videoUrl: '/asl_videos/greetings/hello.mp4',        group: 'greeting' },
  { id: 'name',       name: 'NAME',         videoUrl: '/asl_videos/daily_life/name.mp4',        group: 'greeting' },
  { id: 'nice',       name: 'NICE',         videoUrl: '/asl_videos/adjectives/nice.mp4',        group: 'greeting' },
  { id: 'meet',       name: 'MEET',         videoUrl: '/asl_videos/verbs/meet.mp4',             group: 'greeting' },

  // Level 2 — Greetings: Manners (chin/chest contact signs)
  { id: 'thankyou',   name: 'THANK YOU',    videoUrl: '/asl_videos/greetings/thank_you.mp4',    group: 'manners' },
  { id: 'please',     name: 'PLEASE',       videoUrl: '/asl_videos/greetings/please.mp4',       group: 'manners' },
  { id: 'sorry',      name: 'SORRY',        videoUrl: '/asl_videos/greetings/sorry.mp4',        group: 'manners' },
  { id: 'welcome',    name: "YOU'RE WELCOME", videoUrl: '/asl_videos/greetings/welcome.mp4',    group: 'manners' },
  { id: 'fine',       name: 'FINE',         videoUrl: '/asl_videos/adjectives/fine.mp4',        group: 'manners' },
  { id: 'good',       name: 'GOOD',         videoUrl: '/asl_videos/adjectives/good.mp4',        group: 'manners' },

  // Level 2 — Greetings: Survival Signs
  { id: 'help',       name: 'HELP',         videoUrl: '/asl_videos/daily_life/help.mp4',        group: 'survival' },
  { id: 'again',      name: 'AGAIN',        videoUrl: '/asl_videos/adjectives/again.mp4',       group: 'survival' },
  { id: 'slow',       name: 'SLOW',         videoUrl: '/asl_videos/adjectives/slow.mp4',        group: 'survival' },
  { id: 'understand', name: 'UNDERSTAND',   videoUrl: '/asl_videos/verbs/understand.mp4',       group: 'survival' },
  { id: 'know',       name: 'KNOW',         videoUrl: '/asl_videos/verbs/know.mp4',             group: 'survival' },
  { id: 'forget',     name: 'FORGET',       videoUrl: '/asl_videos/verbs/forget.mp4',           group: 'survival' },
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
