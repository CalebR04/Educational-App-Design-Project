export type SmartHintType = "comparative" | "conceptual" | "rule";

export interface SmartHint {
  type: SmartHintType;
  text: string;
}

export const SMART_HINTS: Record<string, SmartHint> = {

  // ── PRONOUNS ──────────────────────────────────────────────────────────────

  sign_me:    { type: "conceptual",  text: "Point your index finger directly at your own chest." },
  sign_you:   { type: "conceptual",  text: "Point your index finger straight at the person you're talking to." },
  sign_us:    { type: "conceptual",  text: "Point at yourself, then sweep your finger outward to include others." },
  sign_they:  { type: "conceptual",  text: "Point to the side of the space — indicating people not present." },
  sign_heshe: { type: "comparative", text: "Same as pointing at someone, but directed to the side where they'd stand." },
  sign_that:  { type: "comparative", text: "Same pointing gesture as for a person, but aimed at an object or place." },

  // ── GREETINGS / CONTACT ───────────────────────────────────────────────────

  sign_hello:   { type: "conceptual",  text: "Flat open hand at the temple — sweep it outward like a relaxed salute." },
  sign_morning: { type: "conceptual",  text: "Dominant hand rests on the forearm, then rises upward — like the sun rising." },
  sign_name:    { type: "conceptual",  text: "Two H-hands cross and tap like an X — picture the lines of a name tag." },
  sign_nice:    { type: "conceptual",  text: "Flat palm slides forward across the other palm — like polishing a surface." },
  sign_meet:    { type: "conceptual",  text: "Two index fingers face each other and come together — two people approaching." },

  // ── GREETINGS / SURVIVAL ──────────────────────────────────────────────────

  sign_thankyou: { type: "conceptual",  text: "Flat hand at the chin, arc it forward toward the other person — offering gratitude." },
  sign_please:   { type: "comparative", text: "Both rub the chest — this one uses an open flat palm, not a closed fist." },
  sign_sorry:    { type: "comparative", text: "Both rub the chest — this one uses a closed fist, not an open palm." },
  sign_welcome:  { type: "conceptual",  text: "Flat hand near the chin sweeps outward and down — the natural reply motion." },
  sign_fine:     { type: "conceptual",  text: "Spread fingers, thumb touches the chest — a single proud tap." },
  sign_good:     { type: "conceptual",  text: "Fingertips touch the chin, then lower into the other open palm." },

  // ── GREETINGS / SURVIVAL 2 ────────────────────────────────────────────────

  sign_help:       { type: "conceptual",  text: "Thumbs-up sitting on a flat palm — both hands rise together, lifting someone up." },
  sign_again:      { type: "conceptual",  text: "Curved hand arcs down and taps the open palm — like a boomerang returning." },
  sign_slow:       { type: "conceptual",  text: "Drag the dominant hand slowly up the back of the other — the motion is the meaning." },
  sign_understand: { type: "conceptual",  text: "Bent index finger at the temple flicks upright — like a lightbulb switching on." },
  sign_know:       { type: "comparative", text: "Flat hand taps the side of the temple — information already stored, no flick." },
  sign_forget:     { type: "conceptual",  text: "Open hand sweeps across the forehead and closes into a fist — wiping thoughts away." },

  // ── FAMILY ────────────────────────────────────────────────────────────────

  sign_mother:      { type: "rule",        text: "Gender Zone: female family signs are at the chin — open hand, thumb taps the chin." },
  sign_father:      { type: "rule",        text: "Gender Zone: male family signs are at the forehead — open hand, thumb taps the forehead." },
  sign_brother:     { type: "rule",        text: "Compound sign — start at the male zone (forehead), then bring both index fingers together." },
  sign_sister:      { type: "rule",        text: "Compound sign — start at the female zone (cheek), then bring both index fingers together." },
  sign_grandmother: { type: "comparative", text: "Like the female parent sign at the chin, but the hand bounces forward twice." },
  sign_grandfather: { type: "comparative", text: "Like the male parent sign at the forehead, but the hand bounces forward twice." },

  // ── FOOD ──────────────────────────────────────────────────────────────────

  sign_eat:    { type: "conceptual", text: "Bunched fingertips tap the mouth — miming placing food in." },
  sign_apple:  { type: "conceptual", text: "Bent X-finger twists at the cheek — like twisting a stem off a piece of fruit." },
  sign_bread:  { type: "conceptual", text: "Curved hand slices down the back of the other — like cutting a loaf." },
  sign_cheese: { type: "conceptual", text: "Heels of both hands press together and twist — like pressing a round block." },
  sign_egg:    { type: "conceptual", text: "Two H-hands come together and crack apart downward — miming cracking a shell." },
  sign_fruit:  { type: "conceptual", text: "F-hand twists at the cheek — like twisting a small piece off the vine." },

  // ── DRINKS ────────────────────────────────────────────────────────────────

  sign_drink:  { type: "conceptual", text: "C-shaped hand tips toward the mouth — miming lifting and drinking from a cup." },
  sign_water:  { type: "conceptual", text: "W-hand (three fingers up) taps the lips — the W handshape meets the mouth." },
  sign_milk:   { type: "conceptual", text: "C-hand squeezes open and shut repeatedly — miming milking a cow." },
  sign_coffee: { type: "conceptual", text: "One fist grinds over the other in a circle — like grinding beans by hand." },
  sign_tea:    { type: "conceptual", text: "Pinched fingers dip into an O-shaped hand — like dunking a bag into a cup." },
  sign_juice:  { type: "conceptual", text: "Pinky traces a J shape near the mouth — the letter for this drink drawn at the lips." },

  // ── COLORS ────────────────────────────────────────────────────────────────

  sign_color:  { type: "conceptual", text: "Five fingers wiggle in front of the face — like mixing a full paint palette." },
  sign_red:    { type: "conceptual", text: "Index finger strokes down across the lips — the lips themselves are the clue." },
  sign_blue:   { type: "rule",       text: "Many colors use the letter handshape shaken side to side — letter + shake = color." },
  sign_green:  { type: "rule",       text: "Same pattern as the other letter-based colors — G-hand shakes side to side." },
  sign_yellow: { type: "rule",       text: "Y-hand (thumb and pinky out) shakes side to side — same pattern as the other letter colors." },
  sign_orange: { type: "conceptual", text: "C-hand squeezes open and shut in front of the face — like squeezing a round fruit." },
  sign_black:  { type: "conceptual", text: "Index finger slides across the forehead from side to side — like a dark streak." },
  sign_white:  { type: "conceptual", text: "Open hand on the chest pulls away while fingers close — like pulling fabric from a shirt." },

  // ── QUESTIONS ─────────────────────────────────────────────────────────────

  sign_who:   { type: "conceptual", text: "Index finger circles around the lips — like the mouth searching for an identity." },
  sign_what:  { type: "conceptual", text: "Index fingers shake back and forth — the confused motion of not knowing." },
  sign_when:  { type: "conceptual", text: "One index finger circles around the other — like the hands of a clock." },
  sign_where: { type: "conceptual", text: "Index finger shakes side to side — pointing in every direction at once." },
  sign_why:   { type: "conceptual", text: "Touch the forehead, then pull out to a Y-shape — reasoning turned into a question." },
  sign_which: { type: "conceptual", text: "Both fists rock up and down alternately — like a balance scale weighing options." },
  sign_how:   { type: "conceptual", text: "Both bent hands knuckles-together, then rotate outward — like opening two doors." },
  sign_how2:  { type: "conceptual", text: "Both bent hands knuckles-together, then rotate outward — like opening two doors." },

  // ── TIME ──────────────────────────────────────────────────────────────────

  sign_time:      { type: "conceptual", text: "Index finger taps the wrist — pointing to where a watch would be." },
  sign_now:       { type: "conceptual", text: "Both hands drop straight down — grounded in the present, no forward or backward." },
  sign_later:     { type: "conceptual", text: "L-hand with thumb up, wrist rotates forward — the pointer tilts toward the future." },
  sign_today:     { type: "comparative", text: "Performed like the present-moment sign, but done twice in a row." },
  sign_tomorrow:  { type: "rule",        text: "In ASL, the future is in front of you — thumb on cheek arcs forward." },
  sign_yesterday: { type: "rule",        text: "In ASL, the past is behind you — thumb on cheek arcs backward." },

  // ── DIRECTIONS / DAILY LIFE ───────────────────────────────────────────────

  sign_home:   { type: "conceptual",  text: "Bunched fingers touch the cheek twice — two spots for the two things done there: eat and sleep." },
  sign_work:   { type: "conceptual",  text: "Both fists stack and tap — like two tools striking together on the job." },
  sign_school: { type: "conceptual",  text: "Both flat hands clap together — a teacher clapping to get the class's attention." },
  sign_go:     { type: "comparative", text: "Both index fingers circle away from you — direction of movement is the meaning." },
  sign_come:   { type: "comparative", text: "Both index fingers circle toward you — the movement pulls inward to you." },
  sign_want:   { type: "conceptual",  text: "Claw-shaped hands pull inward — physically grabbing something you desire." },
};
