import { Coordinates } from '@/types/common.ts';
import {
  DEFAULT_ANIMATION_SPEED,
  DEFAULT_SPEED,
  defaultSpeedVector,
  SPRINT_SPEED,
} from '@/stores/hero/hero.constants.ts';
import { Direction, HeroState } from '@/stores/hero/hero.type.ts';

import { batched, map } from 'nanostores';
import { $keys } from '@/stores/keys/keys.ts';

export const $hero = map<HeroState>({
  speed: 0,
  startPosition: null,
  position: { x: 0, y: 0 },
  isUncontrolled: false,
});

export const $heroSpeedVector = batched(
  [$keys, $hero],
  (keys, { isUncontrolled, speed }): Coordinates => {
    const result = defaultSpeedVector();

    if (isUncontrolled) return result;

    if (keys.up) result.y -= speed;
    if (keys.down) result.y += speed;
    if (keys.left) result.x -= speed;
    if (keys.right) result.x += speed;

    if (result.x !== 0 && result.y !== 0) {
      result.x = result.x / Math.sqrt(2);
      result.y = result.y / Math.sqrt(2);
    }

    return result;
  }
);

let previousDirection: Direction = 'Right';

export const $heroDirection = batched([$keys], (keys): Direction => {
  if (keys.up) {
    previousDirection = 'Up';
    return 'Up';
  }
  if (keys.down) {
    previousDirection = 'Down';
    return 'Down';
  }
  if (keys.right) {
    previousDirection = 'Right';
    return 'Right';
  }
  if (keys.left) {
    previousDirection = 'Left';
    return 'Left';
  }
  return previousDirection;
});

export const $heroAnimation = batched(
  [$keys, $heroDirection],
  (keys, direction) => {
    if (keys.up || keys.down || keys.left || keys.right) {
      return `walk${direction}`;
    }

    return `idle${direction}`;
  }
);

export const $heroAnimationsSpeed = batched([$keys], (keys) => {
  if (keys.shift) {
    return DEFAULT_ANIMATION_SPEED * 2;
  }

  return DEFAULT_ANIMATION_SPEED;
});

export const heroSetSpeed = (value: number) => {
  $hero.setKey('speed', value);
};

export const heroSetSprint = () => {
  $hero.setKey('speed', SPRINT_SPEED);
};

export const heroResetSpeed = () => {
  $hero.setKey('speed', DEFAULT_SPEED);
};

export const heroSetPosition = (value: Coordinates) => {
  $hero.setKey('position', value);

  if (!$hero.get().startPosition) {
    heroSetStartPosition(value);
  }
};

export const heroSetStartPosition = (value: Coordinates) => {
  $hero.setKey('startPosition', value);
};

export const heroSetUncontrolled = (value = true) => {
  $hero.setKey('isUncontrolled', value);
};
