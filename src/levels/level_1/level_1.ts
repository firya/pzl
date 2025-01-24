import { Assets } from 'pixi.js';

import manifest from './manifest.json';
import { World } from '@/world/world.ts';

export class Level_1 {
  private world: World;

  constructor() {
    Assets.init({ manifest });
    Assets.backgroundLoadBundle(['begin_screen']);
    this.world = new World();
  }
}
