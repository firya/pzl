import { atom, map } from 'nanostores';
import {
  ControllerInput,
  ControllerReturnType,
  ControllerSubscriberHandler,
  ControllerSubscriberItem,
  InputAnalogAction,
  InputAnalogStore,
  InputBufferAction,
  InputBufferStoreItem,
} from '@/controller/controller.type.ts';
import { Ticker } from 'pixi.js';
import { createKeyboardController } from '@/controller/keyboardController.ts';

export const DEFAULT_INPUT_BUFFER_FRAMES = 8;

export const createController = (): ControllerReturnType => {
  const buffer = atom<InputBufferStoreItem[]>([]);
  const actions = map<InputAnalogStore>();

  let currentFrame = 0;
  let subscribers: ControllerSubscriberItem[] = [];

  // TODO: Add gamepad controller
  const destroyKeyboardController = createKeyboardController();

  const addBuffer = (
    action: InputBufferAction,
    duration = DEFAULT_INPUT_BUFFER_FRAMES
  ) => {
    buffer.set([
      ...buffer.get(),
      {
        lastFrame: currentFrame + duration,
        action,
      },
    ]);
  };

  const addAction = (action: InputAnalogAction, value: number) => {
    actions.setKey(action, value);
  };

  const removeAction = (action: InputAnalogAction) => {
    actions.setKey(action, 0);
  };

  const notify: ControllerSubscriberHandler = (inputs) => {
    subscribers.forEach(({ actions, handler }) => {
      const inputActionsSet = new Set(Object.keys(inputs));

      if (actions.every((action) => !inputActionsSet.has(action))) return;

      handler(inputs);
    });
  };

  const update = (): void => {
    const inputBuffer = buffer.get();

    if (inputBuffer.length > 0) {
      const remainingInputs = inputBuffer.filter(
        ({ lastFrame }) => lastFrame > currentFrame
      );

      if (remainingInputs.length !== inputBuffer.length) {
        buffer.set(remainingInputs);
      }

      if (!remainingInputs.length) return;
      notify(
        remainingInputs.reduce<ControllerInput>(
          (acc, { action }) => ({
            ...acc,
            [action]: 1,
          }),
          {}
        )
      );
    }

    const inputAction = actions.get();
    if (Object.keys(inputAction).length > 0) {
      notify(
        Object.entries(inputAction).reduce<ControllerInput>(
          (acc, [action, value]) => ({
            ...acc,
            [action]: value,
          }),
          {}
        )
      );
    }

    currentFrame++;
  };

  return {
    buffer,
    actions,
    addTicker: (ticker: Ticker) => {
      ticker.add(update);
      return () => ticker.remove(update);
    },
    subscribe: (actions, handler) => {
      subscribers.push({ actions, handler });
      return () => {
        subscribers = subscribers.filter(({ handler: h }) => h !== handler);
      };
    },
    addBuffer,
    addAction,
    removeAction,
    destroy: () => {
      destroyKeyboardController();
      subscribers = [];
    },
  };
};

export const controller = createController();
