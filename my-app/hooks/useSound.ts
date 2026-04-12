import { useCallback, useEffect, useRef } from "react";

export type SoundName = "correct" | "incorrect" | "level_complete" | "game_over" | "combo" | "flip";

const SOUND_PATHS: Record<SoundName, string> = {
  correct:        "/sounds/correct.mp3",
  incorrect:      "/sounds/incorrect.mp3",
  level_complete: "/sounds/level_complete.mp3",
  game_over:      "/sounds/game_over.mp3",
  combo:          "/sounds/combo.mp3",
  flip:           "/sounds/flip.mp3",
};

function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sq_muted") === "true";
}

export function useSound() {
  const cache   = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});
  const buffers = useRef<Partial<Record<SoundName, AudioBuffer>>>({});
  const actxRef = useRef<AudioContext | null>(null);

  // Pre-load HTMLAudio elements (for forward play)
  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const [name, path] of Object.entries(SOUND_PATHS)) {
      const audio = new Audio(path);
      audio.preload = "auto";
      cache.current[name as SoundName] = audio;
    }
  }, []);

  // Lazily decode an AudioBuffer for reverse playback
  async function getBuffer(name: SoundName): Promise<AudioBuffer | null> {
    if (buffers.current[name]) return buffers.current[name]!;
    try {
      if (!actxRef.current) actxRef.current = new AudioContext();
      const res = await fetch(SOUND_PATHS[name]);
      const arr = await res.arrayBuffer();
      const buf = await actxRef.current.decodeAudioData(arr);
      buffers.current[name] = buf;
      return buf;
    } catch {
      return null;
    }
  }

  const play = useCallback((name: SoundName) => {
    if (isMuted()) return;
    const audio = cache.current[name];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const playReverse = useCallback(async (name: SoundName) => {
    if (isMuted()) return;
    const buf = await getBuffer(name);
    if (!buf || !actxRef.current) return;

    // Copy and reverse each channel
    const reversed = actxRef.current.createBuffer(
      buf.numberOfChannels,
      buf.length,
      buf.sampleRate,
    );
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const src  = buf.getChannelData(ch);
      const dst  = reversed.getChannelData(ch);
      for (let i = 0; i < src.length; i++) {
        dst[i] = src[src.length - 1 - i];
      }
    }

    const source = actxRef.current.createBufferSource();
    source.buffer = reversed;
    source.connect(actxRef.current.destination);
    source.start();
  }, []);

  return { play, playReverse };
}

export function getSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("sq_muted") === "true";
}

export function setSoundMuted(muted: boolean): void {
  localStorage.setItem("sq_muted", muted ? "true" : "false");
}
