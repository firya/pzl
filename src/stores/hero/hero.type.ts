import { Coordinates } from '@/types/common.ts';

export type Direction = 'Left' | 'Right' | 'Up' | 'Down';

export type HeroState = {
  baseSpeed: number;
  speed: Coordinates;
  startPosition: Coordinates | null;
  position: Coordinates;
  isUncontrolled: boolean;
};
