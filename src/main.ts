import './style.css';
import { Application, EventEmitter } from 'pixi.js';
import { Hero } from './hero/hero.ts';
import { Level_1 } from '@/levels/level_1/level_1.ts';
import { controller } from '@/controller/controller.ts';
import { Debug } from '@/debug/debug.ts';
import { $main } from '@/stores/main/main.ts';
import keycode from 'keycode';

export const App = new Application();
export const eventEmitter = new EventEmitter();

(async () => {
  await App.init({ background: '#1099bb', resizeTo: window });
  document.body.appendChild(App.canvas);

  controller.addTicker(App.ticker);

  new Level_1();
  new Hero({
    x: 750,
    y: 750,
  });

  const debug = new Debug();
  $main.subscribe((value) => {
    if (value.debug) {
      debug.init();
    } else {
      debug.destroy();
    }
  });
  window.addEventListener('keypress', (e) => {
    if (keycode(e) === 'numpad 0') {
      $main.setKey('debug', !$main.get().debug);
    }
  });
})();
