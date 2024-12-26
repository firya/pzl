import { Coordinates } from '@/types/common.ts';

export type Direction = 'Left' | 'Right' | 'Up' | 'Down';

export type HeroState = {
  speed: number;
  speedVector: Coordinates;
  startPosition: Coordinates | null;
  position: Coordinates;
  direction: Direction;
  isUncontrolled: boolean;
};
