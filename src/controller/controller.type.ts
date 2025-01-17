import { Ticker } from 'pixi.js';
import { PreinitializedMapStore, PreinitializedWritableAtom } from 'nanostores';

export type InputAnalogAction = 'up' | 'down' | 'left' | 'right' | 'sprint';
export type InputAnalogStore = Record<InputAnalogAction, number | undefined>;

export type InputBufferAction = 'takeObject';
export type AllInputActions = InputAnalogAction | InputBufferAction;

export type ControllerInput = Partial<Record<AllInputActions, number>>;

export type InputBufferStoreItem = {
  lastFrame: number;
  action: InputBufferAction;
};
export type ControllerReturnType = {
  buffer: PreinitializedWritableAtom<InputBufferStoreItem[]>;
  actions: PreinitializedMapStore<InputAnalogStore>;
  addTicker: (ticker: Ticker) => () => void;
  subscribe: (
    actions: AllInputActions[],
    handler: ControllerSubscriberHandler
  ) => () => void;
  addBuffer: (action: InputBufferAction, duration?: number) => void;
  addAction: (action: InputAnalogAction, value: number) => void;
  removeAction: (action: InputAnalogAction) => void;
  destroy: () => void;
};
export type ControllerSubscriberHandler = (inputs: ControllerInput) => void;

export type ControllerSubscriberItem = {
  actions: AllInputActions[];
  handler: ControllerSubscriberHandler;
};
