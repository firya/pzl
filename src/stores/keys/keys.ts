import { map } from 'nanostores';
import { KeysState } from '@/stores/keys/keys.type.ts';

export const $keys = map<KeysState>({
  up: false,
  down: false,
  left: false,
  right: false,
  r: false,
  shift: false,
});
