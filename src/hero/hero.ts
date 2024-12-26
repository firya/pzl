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
import { Coordinates } from '@/types/common.ts';
import {
  heroResetSpeed,
  heroResetSpeedVector,
  heroSetDirection,
  heroSetPosition,
  heroSetSpeedVector,
  heroSetSprint,
  heroStore,
} from '@/stores/hero/hero.ts';

const ANIMATION_SPEED = 0.16;
const FOOTSTEP_HEIGHT = 16;

export class Hero {
  private heroContainer: Container;
  private spriteSheet: Spritesheet;
  private animatedSprite: AnimatedSprite;
  private shadow: Graphics;
  private keys: { [key: string]: boolean } = {};

  constructor(position: Coordinates) {
    heroSetPosition(position);
    this.init();
  }

  get direction() {
    return heroStore.get().direction;
  }

  get startPosition() {
    return heroStore.get().startPosition;
  }

  get position() {
    return heroStore.get().position;
  }

  get speed() {
    return heroStore.get().speed;
  }

  get speedVector() {
    return heroStore.get().speedVector;
  }

  get isUncontrolled() {
    return heroStore.get().isUncontrolled;
  }

  private async init() {
    eventEmitter.on('changeHeroPosition', heroSetPosition);
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
    oldPosition: Coordinates | null,
    newPosition: Coordinates | null,
    force = false
  ) {
    eventEmitter.emit('checkHeroPosition', oldPosition, newPosition, force);
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
    heroResetSpeedVector();

    if (this.keys['up'] && !this.isUncontrolled)
      this.speedVector.y -= this.speed;
    if (this.keys['down'] && !this.isUncontrolled)
      this.speedVector.y += this.speed;
    if (this.keys['left'] && !this.isUncontrolled)
      this.speedVector.x -= this.speed;
    if (this.keys['right'] && !this.isUncontrolled)
      this.speedVector.x += this.speed;

    this.fixDiagonalSpeed();

    if (!this.speedVector.x && !this.speedVector.y) return;

    this.setDirection();

    this.checkNewPosition(this.position, {
      x: this.position.x + this.speedVector.x,
      y: this.position.y + this.speedVector.y,
    });
  }

  fixDiagonalSpeed() {
    if (this.speedVector.x !== 0 && this.speedVector.y !== 0) {
      heroSetSpeedVector({
        x: this.speedVector.x / Math.sqrt(2),
        y: this.speedVector.y / Math.sqrt(2),
      });
    }
  }

  setDirection() {
    if (this.speedVector.y < 0) heroSetDirection('Up');
    if (this.speedVector.y > 0) heroSetDirection('Down');
    if (this.speedVector.x > 0) heroSetDirection('Right');
    if (this.speedVector.x < 0) heroSetDirection('Left');
  }

  keyPress() {
    if (this.keys['r']) {
      this.resetPosition();
    }
    if (this.isUncontrolled) return;

    this.keys['shift'] ? heroSetSprint() : heroResetSpeed();
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
