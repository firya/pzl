import { Assets, TilingSprite } from 'pixi.js';

import manifest from './manifest.json';
import { App } from '@/main.ts';

// TODO: Make tiling sprite https://pixijs.com/8.x/examples/sprite/tiling-sprite
export async function init() {
  Assets.init({ manifest });
  Assets.backgroundLoadBundle(['begin_screen']);

  const grass = await Assets.load('grass');

  const tilingSprite = new TilingSprite({
    texture: grass,
    width: App.screen.width,
    height: App.screen.height,
  });
  console.log(tilingSprite);
  tilingSprite.position.set(0, 0);
  App.stage.addChildAt(tilingSprite, 0);
}
