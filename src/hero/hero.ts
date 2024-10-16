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
import { App } from '@/main.ts';

export type Position = { x: number; y: number };
type Direction = 'Left' | 'Right' | 'Up' | 'Down';

const DEFAULT_SPEED = 3;
const SPRINT_SPEED = 5;
const ANIMATION_SPEED = 0.16;

export class Hero {
  private heroContainer: Container;
  private spriteSheet: Spritesheet;
  private animatedSprite: AnimatedSprite;
  private shadow: Graphics;
  private keys: { [key: string]: boolean } = {};
  public speed: number = DEFAULT_SPEED;
  public position: Position = { x: 0, y: 0 };
  public direction: Direction = 'Left';

  constructor(position: Position) {
    this.init();
    this.position = position;
  }

  private async init() {
    await Assets.load(heroAnimation.meta.image);

    this.spriteSheet = new Spritesheet(
      Texture.from(heroAnimation.meta.image),
      heroAnimation
    );

    await this.spriteSheet.parse();

    this.animatedSprite = new AnimatedSprite(
      this.spriteSheet.animations[`idle${this.direction}`]
    );

    this.setAnimatedSprite(
      this.spriteSheet.animations[`idle${this.direction}`],
      ANIMATION_SPEED
    );

    this.heroContainer = new Container();
    this.shadow = new Graphics().ellipse(21, 57, 18, 8).fill([0, 0, 0, 0.3]);
    this.heroContainer.addChild(this.shadow);
    this.heroContainer.addChild(this.animatedSprite);

    App.stage.addChildAt(this.heroContainer, 0);

    this.setupControls();
    this.setPosition();
  }

  setAnimatedSprite(
    animation: Texture<TextureSource<any>>[],
    animationSpeed?: number
  ) {
    this.animatedSprite.textures = animation;
    if (animationSpeed) this.animatedSprite.animationSpeed = animationSpeed;
    this.animatedSprite.play();
  }

  setDirection(direction: Direction) {
    this.direction = direction;
  }

  setPosition(position?: Position) {
    this.heroContainer.x = position?.x || this.position.x;
    this.heroContainer.y = position?.y || this.position.y;
  }

  setSpeed(value: number) {
    this.speed = value;
  }

  resetPosition() {
    this.setPosition();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys[keycode(e)] = true;
      this.updateAnimation();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[keycode(e)] = false;
      this.updateAnimation();
    });

    App.ticker.add(() => {
      if (!this.heroContainer) return;

      let xSpeed = 0;
      let ySpeed = 0;

      if (this.keys['up']) {
        ySpeed -= this.speed;
      }
      if (this.keys['down']) {
        ySpeed += this.speed;
      }
      if (this.keys['left']) {
        xSpeed -= this.speed;
      }
      if (this.keys['right']) {
        xSpeed += this.speed;
      }

      if (xSpeed !== 0 && ySpeed !== 0) {
        xSpeed = xSpeed / Math.sqrt(2);
        ySpeed = ySpeed / Math.sqrt(2);
      }

      this.heroContainer.x += xSpeed;
      this.heroContainer.y += ySpeed;
    });
  }

  updateAnimation() {
    if (this.keys['r']) {
      this.resetPosition();
    }

    const animationSpeed = this.keys['shift']
      ? ANIMATION_SPEED * 2
      : ANIMATION_SPEED;

    this.setSpeed(this.keys['shift'] ? SPRINT_SPEED : DEFAULT_SPEED);

    if (this.keys['up']) {
      this.setDirection('Up');
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkUp,
        animationSpeed
      );
    } else if (this.keys['down']) {
      this.setDirection('Down');
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkDown,
        animationSpeed
      );
    } else if (this.keys['left']) {
      this.setDirection('Left');
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkLeft,
        animationSpeed
      );
    } else if (this.keys['right']) {
      this.setDirection('Right');
      this.setAnimatedSprite(
        this.spriteSheet.animations.walkRight,
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
