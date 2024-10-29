import {
  Spritesheet,
  Texture,
  AnimatedSprite,
  Assets,
  TextureSource,
  Container,
  Graphics,
} from 'pixi.js';
import keycode from 'keycode';
import heroAnimation from './hero.json';
import { App, eventEmitter } from '@/main.ts';

export type Position = { x: number; y: number };
export type Speed = { x: number; y: number };
type Direction = 'Left' | 'Right' | 'Up' | 'Down';

const DEFAULT_SPEED = 3;
const SPRINT_SPEED = 5;
const DASH_SPEED = 10;
const DASH_TIME = 300;
const ANIMATION_SPEED = 0.16;
const FOOTSTEP_HEIGHT = 16;

export class Hero {
  private heroContainer: Container;
  private spriteSheet: Spritesheet;
  private animatedSprite: AnimatedSprite;
  private shadow: Graphics;
  private keys: { [key: string]: boolean } = {};
  public currentSpeed: Speed = { x: 0, y: 0 };
  public speed: number = DEFAULT_SPEED;
  public startPosition: Position;
  public position: Position = { x: 0, y: 0 };
  public direction: Direction = 'Left';
  public isUncontrolled: boolean = false;

  constructor(position: Position) {
    this.init();
    this.startPosition = position;
  }

  private async init() {
    eventEmitter.on('changeHeroPosition', this.setPosition.bind(this));
    await Assets.load(heroAnimation.meta.image);

    this.spriteSheet = new Spritesheet(
      Texture.from(heroAnimation.meta.image),
      heroAnimation
    );

    await this.spriteSheet.parse();

    this.animatedSprite = new AnimatedSprite(
      this.spriteSheet.animations[`idle${this.direction}`]
    );

    this.animatedSprite.pivot.x = this.animatedSprite.width / 2;
    this.animatedSprite.pivot.y = this.animatedSprite.height / 2;
    this.animatedSprite.position.x = this.animatedSprite.width / 2;
    this.animatedSprite.position.y = this.animatedSprite.height / 2;

    this.setAnimatedSprite(
      this.spriteSheet.animations[`idle${this.direction}`],
      ANIMATION_SPEED
    );

    this.heroContainer = new Container();
    this.shadow = new Graphics()
      .ellipse(21, 57, 18, FOOTSTEP_HEIGHT / 2)
      .fill([0, 0, 0, 0.3]);
    this.heroContainer.addChild(this.shadow);
    this.heroContainer.addChild(this.animatedSprite);

    this.heroContainer.x = (App.screen.width - this.heroContainer.width) / 2;
    this.heroContainer.y =
      App.screen.height / 2 - this.heroContainer.height + FOOTSTEP_HEIGHT / 2;

    App.stage.addChildAt(this.heroContainer, 1);

    this.checkNewPosition(this.startPosition, this.startPosition, true);

    this.setupControls();
  }

  setAnimatedSprite(
    animation: Texture<TextureSource<any>>[],
    animationSpeed?: number
  ) {
    this.animatedSprite.textures = animation;
    if (animationSpeed) this.animatedSprite.animationSpeed = animationSpeed;
    this.animatedSprite.play();
  }

  checkNewPosition(
    oldPosition: Position,
    newPosition: Position,
    force = false
  ) {
    eventEmitter.emit('checkHeroPosition', oldPosition, newPosition, force);
  }

  public setPosition(position: Position) {
    this.position = { ...position };
  }

  setSpeed(value: number) {
    this.speed = value;
  }

  resetPosition() {
    this.checkNewPosition(this.startPosition, this.startPosition);
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys[keycode(e)] = true;
      this.updateAnimation();
      this.keyPress();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[keycode(e)] = false;
      this.updateAnimation();
    });

    App.ticker.add(() => {
      if (!this.heroContainer) return;

      this.updatePosition();
    });
  }

  private updatePosition() {
    this.resetCurrentSpeed();

    if (this.keys['up'] && !this.isUncontrolled)
      this.currentSpeed.y -= this.speed;
    if (this.keys['down'] && !this.isUncontrolled)
      this.currentSpeed.y += this.speed;
    if (this.keys['left'] && !this.isUncontrolled)
      this.currentSpeed.x -= this.speed;
    if (this.keys['right'] && !this.isUncontrolled)
      this.currentSpeed.x += this.speed;

    this.fixDiagonalSpeed();

    if (!this.currentSpeed.x && !this.currentSpeed.y) return;

    this.setDirection();

    this.checkNewPosition(this.position, {
      x: this.position.x + this.currentSpeed.x,
      y: this.position.y + this.currentSpeed.y,
    });
  }

  resetCurrentSpeed() {
    this.currentSpeed = {
      x: 0,
      y: 0,
    };
  }

  fixDiagonalSpeed() {
    if (this.currentSpeed.x !== 0 && this.currentSpeed.y !== 0) {
      this.currentSpeed.x = this.currentSpeed.x / Math.sqrt(2);
      this.currentSpeed.y = this.currentSpeed.y / Math.sqrt(2);
    }
  }

  startDash() {
    const previousSpeed = this.speed;
    this.isUncontrolled = true;

    const dashDirection = {
      x:
        this.currentSpeed.x === 0
          ? this.direction === 'Left'
            ? -1
            : this.direction === 'Right'
              ? 1
              : 0
          : Math.sign(this.currentSpeed.x),
      y:
        this.currentSpeed.y === 0
          ? this.direction === 'Up'
            ? -1
            : this.direction === 'Down'
              ? 1
              : 0
          : Math.sign(this.currentSpeed.y),
    };

    this.setSpeed(DASH_SPEED);

    const dashStartTime = Date.now();
    const startRotation = this.animatedSprite.rotation;
    const rotationDirection =
      dashDirection.x < 0 ? -1 : dashDirection.x > 0 ? 1 : 0;
    const targetRotation = startRotation + Math.PI * 2 * rotationDirection;

    const dashTicker = () => {
      const elapsedTime = Date.now() - dashStartTime;
      if (elapsedTime >= DASH_TIME) {
        endDash();
        return;
      }

      const progress = Math.min(elapsedTime / DASH_TIME, 1);

      this.animatedSprite.rotation =
        startRotation + (targetRotation - startRotation) * progress;

      let moveX = dashDirection.x * this.speed;
      let moveY = dashDirection.y * this.speed;

      if (moveX !== 0 && moveY !== 0) {
        moveX = moveX / Math.sqrt(2);
        moveY = moveY / Math.sqrt(2);
      }

      this.checkNewPosition(this.position, {
        x: this.position.x + moveX,
        y: this.position.y + moveY,
      });
    };

    const endDash = () => {
      App.ticker.remove(dashTicker);
      this.setSpeed(previousSpeed);
      this.isUncontrolled = false;
      this.animatedSprite.rotation = targetRotation % (Math.PI * 2);
    };

    App.ticker.add(dashTicker);
  }

  setDirection() {
    if (this.currentSpeed.y < 0) this.direction = 'Up';
    if (this.currentSpeed.y > 0) this.direction = 'Down';
    if (this.currentSpeed.x > 0) this.direction = 'Right';
    if (this.currentSpeed.x < 0) this.direction = 'Left';
  }

  keyPress() {
    if (this.keys['r']) {
      this.resetPosition();
    }
    if (this.keys['space'] && !this.isUncontrolled) {
      this.startDash();
      return;
    }
    if (this.isUncontrolled) return;

    this.setSpeed(this.keys['shift'] ? SPRINT_SPEED : DEFAULT_SPEED);
  }

  updateAnimation() {
    const animationSpeed = this.keys['shift']
      ? ANIMATION_SPEED * 2
      : ANIMATION_SPEED;

    if (this.keys['right']) {
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkRight,
        animationSpeed
      );
    } else if (this.keys['left']) {
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkLeft,
        animationSpeed
      );
    } else if (this.keys['up']) {
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkUp,
        animationSpeed
      );
    } else if (this.keys['down']) {
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkDown,
        animationSpeed
      );
    } else {
      this.setAnimatedSprite(
        this.spriteSheet.animations[`idle${this.direction}`],
        animationSpeed
      );
    }
  }
}
