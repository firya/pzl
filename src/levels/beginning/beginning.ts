import { Assets } from 'pixi.js';

import manifest from './manifest.json';
import { LevelMap, World } from '@/world/world.ts';

const levelMap: LevelMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export class Beginning {
  private world: World;

  constructor() {
    Assets.init({ manifest });
    Assets.backgroundLoadBundle(['begin_screen']);
    this.world = new World(levelMap);
  }
}
