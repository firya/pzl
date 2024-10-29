import { Assets, Container, Sprite } from 'pixi.js';

import manifest from './manifest.json';
import { App, eventEmitter } from '@/main.ts';
import { Position } from '@/hero/hero.ts';

const levelMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
const tileSize = 500;

export class Beginning {
  private levelContainer: Container;

  constructor() {
    this.init();
  }

  async init() {
    eventEmitter.on('checkHeroPosition', this.checkCollision.bind(this));

    this.levelContainer = new Container();

    Assets.init({ manifest });
    Assets.backgroundLoadBundle(['begin_screen']);

    this.createLevel();

    App.stage.addChildAt(this.levelContainer, 0);
  }

  async createLevel() {
    for (let i = 0; i <= levelMap.length - 1; i++) {
      for (let j = 0; j <= levelMap[i].length - 1; j++) {
        const tile = levelMap[i][j];
        const texture = tile
          ? await Assets.load('grass')
          : await Assets.load('grass2');
        const sprite = new Sprite(texture);
        sprite.position.set(j * tileSize, i * tileSize);
        this.levelContainer.addChild(sprite);
      }
    }
  }

  checkCollision(oldPosition: Position, newPosition: Position, force = false) {
    if (force) {
      this.changeWorldPosition(newPosition);
      return;
    }

    let positionResult = { ...newPosition };
    const oldTileX = Math.floor(oldPosition.x / tileSize);
    const newtileX = Math.floor(newPosition.x / tileSize);
    const oldTileY = Math.floor(oldPosition.y / tileSize);
    const newtileY = Math.floor(newPosition.y / tileSize);
    if (newPosition.x < 0 || newPosition.x > levelMap[0].length * tileSize)
      return;
    if (newPosition.y < 0 || newPosition.y > levelMap.length * tileSize) return;
    if (!levelMap[newtileY][oldTileX]) positionResult.y = oldPosition.y;
    if (!levelMap[oldTileY][newtileX]) positionResult.x = oldPosition.x;

    this.changeWorldPosition(positionResult);
  }

  changeWorldPosition(position: Position) {
    if (!this.levelContainer) return;
    eventEmitter.emit('changeHeroPosition', position);
    this.levelContainer.x = -position.x + App.screen.width / 2;
    this.levelContainer.y = -position.y + App.screen.height / 2;
  }
}
