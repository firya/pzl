import { Assets, Container, Sprite } from 'pixi.js';

import manifest from './manifest.json';
import { App, eventEmitter } from '@/main.ts';

const levelMap = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
const tileSize = 500;

type Position = { x: number; y: number };

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

  checkCollision(position: Position, force = false) {
    if (force) {
      this.changeWorldPosition(position);
      return;
    }
    const xTile = Math.floor(position.x / tileSize);
    const yTile = Math.floor(position.y / tileSize);
    if (position.x < 0 || position.x > levelMap[0].length * tileSize) return;
    if (position.y < 0 || position.y > levelMap.length * tileSize) return;
    if (!levelMap[yTile][xTile]) return;

    this.changeWorldPosition(position);
  }

  changeWorldPosition(position: Position) {
    if (!this.levelContainer) return;
    eventEmitter.emit('changeHeroPosition', position);
    this.levelContainer.x = -position.x + App.screen.width / 2;
    this.levelContainer.y = -position.y + App.screen.height / 2;
  }
}
