import { Coordinates } from '@/types/common.ts';

export type Direction = 'Left' | 'Right' | 'Up' | 'Down';

export type HeroState = {
  speed: number;
  startPosition: Coordinates | null;
  position: Coordinates;
  isUncontrolled: boolean;
};
