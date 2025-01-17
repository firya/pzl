import { Coordinates } from '@/types/common.ts';
import {
  DEFAULT_ANIMATION_SPEED,
  DEFAULT_SPEED,
  SPRINT_SPEED,
} from '@/stores/hero/hero.constants.ts';
import { Direction, HeroState } from '@/stores/hero/hero.type.ts';

import { batched, map } from 'nanostores';

export const $hero = map<HeroState>({
  baseSpeed: DEFAULT_SPEED,
  speed: { x: 0, y: 0 },
  startPosition: null,
  position: { x: 0, y: 0 },
  isUncontrolled: false,
});

export const $normalizedSpeed = batched(
  [$hero],
  ({ isUncontrolled, speed, baseSpeed }): Coordinates => {
    if (isUncontrolled) return speed;

    const magnitude = Math.sqrt(speed.x * speed.x + speed.y * speed.y);

    const realSpeed = {
      x: speed.x * baseSpeed,
      y: speed.y * baseSpeed,
    };

    if (magnitude > 1) {
      return {
        x: realSpeed.x / magnitude,
        y: realSpeed.y / magnitude,
      };
    }
    return realSpeed;
  }
);

let previousDirection: Direction = 'Right';

export const $heroDirection = batched([$hero], ({ speed }): Direction => {
  if (speed.y < 0) {
    previousDirection = 'Up';
    return 'Up';
  }
  if (speed.y > 0) {
    previousDirection = 'Down';
    return 'Down';
  }
  if (speed.x > 0) {
    previousDirection = 'Right';
    return 'Right';
  }
  if (speed.x < 0) {
    previousDirection = 'Left';
    return 'Left';
  }
  return previousDirection;
});

export const $heroAnimation = batched(
  [$normalizedSpeed, $heroDirection],
  (speed, direction) => {
    if (speed.x !== 0 || speed.y !== 0) {
      return `walk${direction}`;
    }

    return `idle${direction}`;
  }
);

export const $heroAnimationsSpeed = batched([$hero], ({ baseSpeed }) => {
  return (DEFAULT_ANIMATION_SPEED * baseSpeed) / DEFAULT_SPEED;
});

export const heroSetSpeed = (value: Coordinates) => {
  $hero.setKey('speed', value);
};

export const heroSetSprint = () => {
  $hero.setKey('baseSpeed', SPRINT_SPEED);
};

export const heroResetSpeed = () => {
  $hero.setKey('baseSpeed', DEFAULT_SPEED);
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
