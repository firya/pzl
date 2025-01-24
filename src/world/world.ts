import { Assets, Sprite } from 'pixi.js';

import { App, eventEmitter } from '@/main.ts';
import { Coordinates } from '@/types/common.ts';
import { $main } from '@/stores/main/main.ts';

export class World {
  private layers: Sprite[] = [];
  private pixelData: Uint8ClampedArray;
  private worldSize: Coordinates = {
    x: 0,
    y: 0,
  };
  initialized = false;

  // TODO pass all layers and objects
  //  Place objects on level and move it zIndex when character Y is more than
  //  Maybe give object it's own go zone map and merge?
  constructor() {
    this.init();
  }

  get isDebug() {
    return $main.get().debug;
  }

  async init() {
    eventEmitter.on('checkHeroPosition', this.checkCollision.bind(this));
    this.createLevel();
  }

  async createLevel() {
    Promise.allSettled([
      this.createLayer('background', 0),
      this.createLayer('foreground', 100),
    ]);
    await this.createGoZonesMap();

    this.initialized = true;
  }

  async createLayer(textureName: string, zIndex = 0) {
    const texture = await Assets.load(textureName);
    const sprite = new Sprite(texture);
    sprite.position.set(0, 0);
    sprite.zIndex = zIndex;
    this.layers.push(sprite);
    App.stage.addChild(sprite);
  }

  async createGoZonesMap() {
    const texture = await Assets.load('go_zones');
    const sprite = new Sprite(texture);
    this.worldSize = {
      x: sprite.width,
      y: sprite.height,
    };
    const extract = App.renderer.extract;
    this.pixelData = extract.pixels(sprite).pixels;
  }

  checkCollision(
    oldPosition: Coordinates,
    newPosition: Coordinates,
    force = false
  ) {
    if (!this.initialized) return;
    if (force) {
      this.changeWorldPosition(newPosition);
    }

    const validPosition = this.getLastValidPosition(oldPosition, newPosition);
    if (
      validPosition.x !== oldPosition.x ||
      validPosition.y !== oldPosition.y
    ) {
      this.changeWorldPosition(validPosition);
    } else {
      const alternative = this.findAlternativePath(oldPosition, newPosition);
      if (alternative) {
        this.changeWorldPosition(alternative);
      }
    }
  }

  getLastValidPosition(oldPosition: Coordinates, newPosition: Coordinates) {
    const path = this.getLinePath(oldPosition, newPosition);
    let lastValidPosition = oldPosition;

    for (const point of path) {
      if (!this.isPositionValid(point)) {
        break;
      }
      lastValidPosition = point;
    }

    return lastValidPosition;
  }

  // Digital Differential Analyzer
  getLinePath(start: Coordinates, end: Coordinates): Coordinates[] {
    const points: Coordinates[] = [];

    let { x: x0, y: y0 } = start;
    const { x: x1, y: y1 } = end;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    for (let i = 0; i <= steps; i++) {
      points.push({ x: Math.round(x0), y: Math.round(y0) });
      x0 += xIncrement;
      y0 += yIncrement;
    }

    return points;
  }

  isPositionValid(position: Coordinates): boolean {
    const { x, y } = position;
    if (x < 0 || y < 0 || x >= this.worldSize.x || y >= this.worldSize.y) {
      return false;
    }
    const index = (y * this.worldSize.x + x) * 4;
    return (
      this.pixelData[index] === 255 &&
      this.pixelData[index + 1] === 255 &&
      this.pixelData[index + 2] === 255
    );
  }

  findAlternativePath(oldPosition: Coordinates, newPosition: Coordinates) {
    const directions = [
      Math.PI / 6, // 30 degrees
      -Math.PI / 6, // -30 degrees
    ];

    const deltaX = newPosition.x - oldPosition.x;
    const deltaY = newPosition.y - oldPosition.y;

    const originalAngle = Math.atan2(deltaY, deltaX);

    for (const angle of directions) {
      // Calculate the new angle by adding/subtracting 30 degrees
      const newAngle = originalAngle + angle;

      // Calculate the rotated vector using the new angle
      const rotatedX =
        Math.cos(newAngle) * Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const rotatedY =
        Math.sin(newAngle) * Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Calculate the alternative position
      const alternativePosition = this.getLastValidPosition(oldPosition, {
        x: oldPosition.x + rotatedX,
        y: oldPosition.y + rotatedY,
      });

      if (
        alternativePosition.x !== oldPosition.x ||
        alternativePosition.y !== oldPosition.y
      ) {
        return alternativePosition;
      }
    }

    return null; // No alternative path found
  }

  changeWorldPosition(position: Coordinates) {
    if (!this.layers.length) return;
    eventEmitter.emit('changeHeroPosition', position);
    for (const layer of this.layers) {
      layer.x = -position.x + App.screen.width / 2;
      layer.y = -position.y + App.screen.height / 2;
    }
  }
}
