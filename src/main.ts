import './style.css';
import { Application } from 'pixi.js';
import * as beginning from './levels/beginning/beginning.ts';
import { Hero } from './hero/hero.ts';

export const App = new Application();

(async () => {
  await App.init({ background: '#1099bb', resizeTo: window });
  document.body.appendChild(App.canvas);

  beginning.init();
  new Hero({
    x: (App.screen.width - 42) / 2,
    y: (App.screen.height - 64) / 2,
  });
})();
