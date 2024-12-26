import { Assets, Container, Sprite } from 'pixi.js';

import { App, eventEmitter } from '@/main.ts';
import { Coordinates } from '@/types/common.ts';

const tileSize = 500;
export type LevelMap = Array<Array<number>>;

export class World {
  private levelContainer: Container;
  private levelMap: LevelMap;

  constructor(levelMap: LevelMap) {
    this.levelMap = levelMap;
    this.init();
  }

  async init() {
    eventEmitter.on('checkHeroPosition', this.checkCollision.bind(this));

    this.levelContainer = new Container();

    this.createLevel();

    App.stage.addChildAt(this.levelContainer, 0);
  }

  async createLevel() {
    for (let i = 0; i <= this.levelMap.length - 1; i++) {
      for (let j = 0; j <= this.levelMap[i].length - 1; j++) {
        const tile = this.levelMap[i][j];
        const texture = tile
          ? await Assets.load('grass')
          : await Assets.load('grass2');
        const sprite = new Sprite(texture);
        sprite.position.set(j * tileSize, i * tileSize);
        this.levelContainer.addChild(sprite);
      }
    }
  }

  checkCollision(
    oldPosition: Coordinates,
    newPosition: Coordinates,
    force = false
  ) {
    if (force) {
      this.changeWorldPosition(newPosition);
      return;
    }

    let positionResult = { ...newPosition };

    if (newPosition.x < 0 || newPosition.x > this.levelMap[0].length * tileSize)
      positionResult.x = oldPosition.x;
    if (newPosition.y < 0 || newPosition.y > this.levelMap.length * tileSize)
      positionResult.y = oldPosition.y;
    if (!this.checkPosition(oldPosition.x, newPosition.y))
      positionResult.y = oldPosition.y;
    if (!this.checkPosition(newPosition.x, oldPosition.y))
      positionResult.x = oldPosition.x;

    this.changeWorldPosition(positionResult);
  }

  checkPosition(x: number, y: number) {
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);

    return this.levelMap[tileY][tileX];
  }

  changeWorldPosition(position: Coordinates) {
    if (!this.levelContainer) return;
    eventEmitter.emit('changeHeroPosition', position);
    this.levelContainer.x = -position.x + App.screen.width / 2;
    this.levelContainer.y = -position.y + App.screen.height / 2;
  }
}
