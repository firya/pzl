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
  heroSetPosition,
  heroSetSprint,
  $hero,
  $heroSpeedVector,
  $heroAnimation,
  $heroAnimationsSpeed,
} from '@/stores/hero/hero.ts';
import { $keys } from '@/stores/keys/keys.ts';
import { KeysState } from '@/stores/keys/keys.type.ts';

const FOOTSTEP_HEIGHT = 16;

export class Hero {
  private heroContainer: Container;
  private spriteSheet: Spritesheet;
  private animatedSprite: AnimatedSprite;
  private shadow: Graphics;

  constructor(position: Coordinates) {
    heroSetPosition(position);
    this.init();
  }

  get startPosition() {
    return $hero.get().startPosition;
  }

  get position() {
    return $hero.get().position;
  }

  get isUncontrolled() {
    return $hero.get().isUncontrolled;
  }

  private async init() {
    eventEmitter.on('changeHeroPosition', heroSetPosition);
    await Assets.load(heroAnimation.meta.image);

    this.spriteSheet = new Spritesheet(
      Texture.from(heroAnimation.meta.image),
      heroAnimation
    );

    await this.spriteSheet.parse();

    const animation = $heroAnimation.get();
    this.animatedSprite = new AnimatedSprite(
      this.spriteSheet.animations[animation]
    );

    this.animatedSprite.pivot.x = this.animatedSprite.width / 2;
    this.animatedSprite.pivot.y = this.animatedSprite.height / 2;
    this.animatedSprite.position.x = this.animatedSprite.width / 2;
    this.animatedSprite.position.y = this.animatedSprite.height / 2;

    this.setAnimatedSprite(
      this.spriteSheet.animations[animation],
      $heroAnimationsSpeed.get()
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

      const pressedKey = keycode(e) as keyof KeysState;
      if ($keys.get()[pressedKey] === undefined) return;

      $keys.setKey(pressedKey, true);
      this.updateAnimation();
      this.keyPress();
    });

    window.addEventListener('keyup', (e) => {
      const pressedKey = keycode(e) as keyof KeysState;
      if ($keys.get()[pressedKey] === undefined) return;

      $keys.setKey(pressedKey, false);
      this.updateAnimation();
    });

    App.ticker.add(() => {
      if (!this.heroContainer) return;

      this.updatePosition();
    });
  }

  private updatePosition() {
    const speedVector = $heroSpeedVector.get();

    if (!speedVector.x && !speedVector.y) return;

    this.checkNewPosition(this.position, {
      x: this.position.x + speedVector.x,
      y: this.position.y + speedVector.y,
    });
  }

  keyPress() {
    if ($keys.get().r) {
      this.resetPosition();
    }
    if (this.isUncontrolled) return;

    $keys.get().shift ? heroSetSprint() : heroResetSpeed();
  }

  updateAnimation() {
    this.setAnimatedSprite(
      this.spriteSheet.animations[$heroAnimation.get()],
      $heroAnimationsSpeed.get()
    );
  }
}
