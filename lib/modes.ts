export type Mode = "easy" | "medium" | "hard";

export const ROUNDS = 5;

export const MODES: Record<Mode, { label: string; desc: string; seconds: number; mult: number }> = {
  easy: { label: "Explorer", desc: "Free look, no timer", seconds: 0, mult: 1 },
  medium: { label: "Navigator", desc: "Free look, 90 seconds", seconds: 90, mult: 1.25 },
  hard: { label: "Vagabond", desc: "Spinning sphere, locked zoom, no steering, 45 seconds", seconds: 45, mult: 1.5 },
};
