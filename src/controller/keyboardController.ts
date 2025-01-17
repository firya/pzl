import {
  InputAnalogAction,
  InputBufferAction,
} from '@/controller/controller.type.ts';
import keycode from 'keycode';
import { controller } from '@/controller/controller.ts';

const keyboardActionsMap: Partial<Record<string, InputAnalogAction>> = {
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  shift: 'sprint',
};
const keyboardBufferMap: Partial<Record<string, InputBufferAction>> = {
  e: 'takeObject',
};

export const createKeyboardController = () => {
  const keydownHandler = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const action = keyboardActionsMap[keycode(e)];
    if (action) {
      controller.addAction(action, 1);
    }
    const buffer = keyboardBufferMap[keycode(e)];
    if (buffer) {
      controller.addBuffer(buffer);
    }
  };

  const keyupHandler = (e: KeyboardEvent) => {
    const action = keyboardActionsMap[keycode(e)];
    if (action) {
      controller.removeAction(action);
    }
  };

  window.addEventListener('keydown', keydownHandler);
  window.addEventListener('keyup', keyupHandler);

  return () => {
    window.removeEventListener('keydown', keydownHandler);
    window.removeEventListener('keyup', keyupHandler);
  };
};
