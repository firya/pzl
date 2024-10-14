import './style.css';
import { Application } from 'pixi.js';
import * as beginning from './levels/beginning/beginning.ts';
import * as hero from './hero/hero.ts';

(async () => {
  const app = new Application();

  await app.init({ background: '#1099bb', resizeTo: window });
  document.body.appendChild(app.canvas);

  beginning.init(app);
  hero.init(app);
})();
