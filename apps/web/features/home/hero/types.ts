import type { MutableRefObject } from 'react';

export type SceneQuality = 'mobile' | 'tablet' | 'desktop';

/** Mutable input avoids React renders on pointer, scroll, and animation frames. */
export interface HeroMotionInput {
  pointerX: number;
  pointerY: number;
  scroll: number;
}

export interface CoffeeSceneProps {
  motionInput: MutableRefObject<HeroMotionInput>;
  quality: SceneQuality;
  animate: boolean;
  active: boolean;
  onReady: () => void;
  onUnavailable: () => void;
}
