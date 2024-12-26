import { Coordinates } from '@/types/common.ts';
import {
  DEFAULT_SPEED,
  defaultSpeedVector,
  SPRINT_SPEED,
} from '@/stores/hero/hero.constants.ts';
import { Direction, HeroState } from '@/stores/hero/hero.type.ts';

import { map } from 'nanostores';

export const heroStore = map<HeroState>({
  speed: 0,
  speedVector: defaultSpeedVector(),
  startPosition: null,
  position: { x: 0, y: 0 },
  direction: 'Right',
  isUncontrolled: false,
});

export const heroSetSpeed = (value: number) => {
  heroStore.setKey('speed', value);
};

export const heroSetSprint = () => {
  heroStore.setKey('speed', SPRINT_SPEED);
};

export const heroResetSpeed = () => {
  heroStore.setKey('speed', DEFAULT_SPEED);
};

export const heroSetSpeedVector = (value: Coordinates) => {
  heroStore.setKey('speedVector', { ...value });
};

export const heroResetSpeedVector = () => {
  heroStore.setKey('speedVector', defaultSpeedVector());
};

export const heroSetPosition = (value: Coordinates) => {
  heroStore.setKey('position', value);

  if (!heroStore.get().startPosition) {
    heroSetStartPosition(value);
  }
};

export const heroSetStartPosition = (value: Coordinates) => {
  heroStore.setKey('startPosition', value);
};

export const heroSetUncontrolled = (value = true) => {
  heroStore.setKey('isUncontrolled', value);
};

export const heroSetDirection = (value: Direction) => {
  heroStore.setKey('direction', value);
};
