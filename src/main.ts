import './style.css';
import { Application, EventEmitter } from 'pixi.js';
import { Hero } from './hero/hero.ts';
import { Beginning } from './levels/beginning/beginning.ts';
import { controller } from '@/controller/controller.ts';

export const App = new Application();
export const eventEmitter = new EventEmitter();

(async () => {
  await App.init({ background: '#1099bb', resizeTo: window });
  document.body.appendChild(App.canvas);

  controller.addTicker(App.ticker);

  new Beginning();
  new Hero({
    x: 750,
    y: 750,
  });
})();
