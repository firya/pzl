import {
  Application,
  Spritesheet,
  Texture,
  AnimatedSprite,
  Assets,
} from 'pixi.js';
import heroAnimation from './hero.json';

export async function init(app: Application) {
  await Assets.load(heroAnimation.meta.image);

  // Create the SpriteSheet from data and image
  const spritesheet = new Spritesheet(
    Texture.from(heroAnimation.meta.image),
    heroAnimation
  );

  // Generate all the Textures asynchronously
  await spritesheet.parse();

  // spritesheet is ready to use!
  const anim = new AnimatedSprite(spritesheet.animations.idle);

  // set the animation speed
  anim.animationSpeed = 0.1666;
  // play the animation on a loop
  anim.play();

  anim.x = (app.screen.width - 42) / 2;
  anim.y = (app.screen.height - 64) / 2;

  // add it to the stage to render
  app.stage.addChildAt(anim, 0);

  setupControls(app, anim, spritesheet);
}
// TODO: Fix all of it!!!
function setupControls(
  app: Application,
  hero: AnimatedSprite,
  spritesheet: Spritesheet
): void {
  const speed = 2;
  const keys: { [key: string]: boolean } = {};

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    keys[e.key] = true;
    updateAnimation(hero, keys, spritesheet);
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    updateAnimation(hero, keys, spritesheet);
  });

  app.ticker.add(() => {
    if (!hero) return;

    if (keys['ArrowUp']) {
      hero.y -= speed;
    } else if (keys['ArrowDown']) {
      hero.y += speed;
    } else if (keys['ArrowLeft']) {
      hero.x -= speed;
    } else if (keys['ArrowRight']) {
      hero.x += speed;
    } else {
    }
  });
}

function updateAnimation(
  hero: AnimatedSprite,
  keys: { [key: string]: boolean },
  spritesheet: Spritesheet
) {
  if (keys['ArrowUp']) {
    hero.textures = spritesheet.animations.walkTop;
    hero.play();
  } else if (keys['ArrowDown']) {
    hero.textures = spritesheet.animations.walkBottom;
    hero.play();
  } else if (keys['ArrowLeft']) {
    hero.textures = spritesheet.animations.walkLeft;
    hero.play();
  } else if (keys['ArrowRight']) {
    hero.textures = spritesheet.animations.walkRight;
    hero.play();
  } else {
    hero.textures = spritesheet.animations.idle;
    hero.play();
  }
}
