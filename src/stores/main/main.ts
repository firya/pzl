import { map } from 'nanostores';

import { MainState } from '@/stores/main/main.type.ts';

export const $main = map<MainState>({
  debug: true,
});
