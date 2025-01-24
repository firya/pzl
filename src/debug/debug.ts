import { Container, Graphics } from 'pixi.js';
import { App, eventEmitter } from '@/main.ts';
import { Coordinates } from '@/types/common.ts';

const HERO_DEBUG_MULTIPLIER = 15;
const HERO_CONE_ANGLE = Math.PI / 3; // 60 degrees

export class Debug {
  private wrapper: Container;
  private heroMovePath: Graphics;
  private boundUpdateHeroDebug: (
    oldPosition: Coordinates,
    newPosition: Coordinates
  ) => void;

  constructor() {}

  init() {
    this.boundUpdateHeroDebug = this.updateHeroDebug.bind(this);
    eventEmitter.on('checkHeroPosition', this.boundUpdateHeroDebug);

    this.wrapper = new Container();
    this.wrapper.zIndex = 1000;
    App.stage.addChild(this.wrapper);

    this.drawHeroDebug();
  }

  get screenCenter() {
    return {
      x: App.screen.width / 2,
      y: App.screen.height / 2,
    };
  }

  drawHeroDebug() {
    this.heroMovePath = new Graphics();
    this.wrapper.addChild(this.heroMovePath);
  }

  drawSector(point: Coordinates, angle: number, radius: number) {
    this.heroMovePath.clear();

    const startAngle = angle - HERO_CONE_ANGLE / 2;
    const endAngle = angle + HERO_CONE_ANGLE / 2;

    this.heroMovePath.moveTo(point.x, point.y);

    this.heroMovePath.lineTo(
      this.screenCenter.x + radius * Math.cos(startAngle),
      this.screenCenter.y + radius * Math.sin(startAngle)
    );

    this.heroMovePath.arc(
      this.screenCenter.x,
      this.screenCenter.y,
      radius,
      startAngle,
      endAngle
    );

    this.heroMovePath.lineTo(this.screenCenter.x, this.screenCenter.y);

    this.heroMovePath.stroke({ color: 0xff0000, pixelLine: true });
  }

  updateHeroDebug(oldPosition: Coordinates, newPosition: Coordinates) {
    if (!this.heroMovePath) return;

    const deltaX = (newPosition.x - oldPosition.x) * HERO_DEBUG_MULTIPLIER;
    const deltaY = (newPosition.y - oldPosition.y) * HERO_DEBUG_MULTIPLIER;

    const directionAngle = Math.atan2(deltaY, deltaX);

    const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.drawSector(
      {
        x: this.screenCenter.x,
        y: this.screenCenter.y,
      },
      directionAngle,
      radius
    );
  }

  destroy() {
    this.wrapper.destroy();
    eventEmitter.removeListener('checkHeroPosition', this.boundUpdateHeroDebug);
  }
}
