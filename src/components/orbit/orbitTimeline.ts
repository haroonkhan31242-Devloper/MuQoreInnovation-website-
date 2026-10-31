/**
 * Scroll timeline for the service orbit. One progress value (0..1, from the
 * page's scroll position through the orbit track) drives every stage, so the
 * WebGL scene and the HTML overlays always agree on what is in focus.
 *
 *   0.00 – 0.10  intro      logo + orbit settle into place
 *   0.10 – 0.90  services   eight equal segments, one per service
 *   0.90 – 1.00  outro      scene pulls back and hands over to the page
 */
export const SERVICE_COUNT = 8;
export const INTRO_END = 0.1;
export const SEGMENT = (0.9 - INTRO_END) / SERVICE_COUNT;
export const OUTRO_START = INTRO_END + SEGMENT * SERVICE_COUNT;

/** Share of each segment where the focused service rests before moving on. */
const HOLD = 0.68;

export type OrbitStage = 'intro' | 'services' | 'outro';

export interface TimelineState {
  stage: OrbitStage;
  /** 0..1 progress through the intro. */
  intro: number;
  /** 0..1 progress through the outro. */
  outro: number;
  /** Continuous focus position across the services (0..7), eased between segments. */
  focus: number;
  /** Service currently in focus, or -1 outside the services stage. */
  active: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

export function readTimeline(p: number): TimelineState {
  const intro = clamp(p / INTRO_END, 0, 1);
  const outro = clamp((p - OUTRO_START) / (1 - OUTRO_START), 0, 1);
  const f = (p - INTRO_END) / SEGMENT;
  const seg = Math.floor(clamp(f, 0, SERVICE_COUNT - 1e-4));
  const frac = clamp(f - seg, 0, 1);
  const move = seg >= SERVICE_COUNT - 1 ? 0 : smooth(clamp((frac - HOLD) / (1 - HOLD), 0, 1));
  const focus = f <= 0 ? 0 : seg + move;
  const stage: OrbitStage = p < INTRO_END ? 'intro' : p >= OUTRO_START ? 'outro' : 'services';
  return { stage, intro, outro, focus, active: stage === 'services' ? Math.round(focus) : -1 };
}

/** Progress value that puts service `i` at rest in focus (used by the rail buttons). */
export const progressForService = (i: number) => INTRO_END + SEGMENT * (i + 0.3);
