import {
  Spritesheet,
  Texture,
  AnimatedSprite,
  Assets,
  TextureSource,
  Container,
  Graphics,
} from 'pixi.js';
import heroAnimation from './hero.json';
import { App, eventEmitter } from '@/main.ts';
import { Coordinates } from '@/types/common.ts';
import {
  $hero,
  $heroAnimation,
  $heroAnimationsSpeed,
  $normalizedSpeed,
  heroResetSpeed,
  heroSetPosition,
  heroSetSpeed,
  heroSetSprint,
} from '@/stores/hero/hero.ts';
import { controller } from '@/controller/controller.ts';

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
    $heroAnimation.listen((value) => this.updateAnimation(value));
    $normalizedSpeed.listen((value) => this.updatePosition(value));
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
    controller.subscribe(['up', 'down', 'left', 'right'], (inputs) => {
      let speedX = 0;
      let speedY = 0;

      if (inputs['up']) speedY = -inputs['up'];
      if (inputs['down']) speedY = inputs['down'];
      if (inputs['left']) speedX = -inputs['left'];
      if (inputs['right']) speedX = inputs['right'];

      heroSetSpeed({
        x: speedX,
        y: speedY,
      });
    });
    controller.subscribe(['sprint'], (inputs) => {
      if (inputs['sprint']) {
        heroSetSprint();
      } else {
        heroResetSpeed();
      }
    });
  }

  private updatePosition(speed: Coordinates) {
    if (!speed.x && !speed.y) return;

    this.checkNewPosition(this.position, {
      x: this.position.x + speed.x,
      y: this.position.y + speed.y,
    });
  }

  updateAnimation(animation: string) {
    this.setAnimatedSprite(
      this.spriteSheet.animations[animation],
      $heroAnimationsSpeed.get()
    );
  }
}
