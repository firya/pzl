import { Application, Assets, Sprite } from 'pixi.js';

import manifest from './manifest.json';

// TODO: Make tiling sprite https://pixijs.com/8.x/examples/sprite/tiling-sprite
export async function init(app: Application) {
  Assets.init({ manifest });
  Assets.backgroundLoadBundle(['begin_screen']);

  const grass = await Assets.load('grass');

  const columns = Math.ceil(app.screen.width / grass.frame.width);
  const rows = Math.ceil(app.screen.height / grass.frame.height);

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const grassSprite = new Sprite(grass);

      grassSprite.x = i * grass.frame.width;
      grassSprite.y = j * grass.frame.height;

      app.stage.addChildAt(grassSprite, 0);
    }
  }
}
