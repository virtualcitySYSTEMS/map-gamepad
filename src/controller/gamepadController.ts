import { parseBoolean } from '@vcsuite/parsers';
import {
  Controller,
  ControllerOptions,
  ControllerInput,
  getZeroInput,
  clearInput,
  fromArray,
} from '@vcmap/core';

export type GamepadOptions = ControllerOptions & {
  device?: number;
  connected?: boolean;
  mapping?: ControllerMapping;
  axesThreshold?: number;
};

type AXIS = number;
type BUTTON = { '+': number; '-': number };

/**
 * An array of axes buttons defining the 6 navigation axes,
 * e.g. { forward: 0, right: 1, up: 2, tiltDown: 4, rollRight: { "+": 6, "-": 7 }, turnRight: { "+": 11, "-": 12 } }
 * The number is the index of the input
 */
export type ControllerMapping = {
  forward: AXIS | BUTTON;
  right: AXIS | BUTTON;
  up: AXIS | BUTTON;
  tiltDown: AXIS | BUTTON;
  rollRight: AXIS | BUTTON;
  turnRight: AXIS | BUTTON;
};

function insideBounds(value: number, length: number): boolean {
  return value >= 0 && value < length;
}

function applyDeadZone(input: number, threshold: number): number {
  let percentage = (Math.abs(input) - threshold) / (1 - threshold);
  if (percentage < 0) {
    percentage = 0;
  }
  return percentage * Math.sign(input);
}

function applyDeadZones(
  input: ControllerInput,
  threshold: number,
  result: ControllerInput,
): ControllerInput {
  result.forward = applyDeadZone(input.forward, threshold);
  result.right = applyDeadZone(input.right, threshold);
  result.up = applyDeadZone(input.up, threshold);
  result.tiltDown = applyDeadZone(input.tiltDown, threshold);
  result.rollRight = applyDeadZone(input.rollRight, threshold);
  result.turnRight = applyDeadZone(input.turnRight, threshold);
  return result;
}

function getMappedValue(gp: Gamepad, key: AXIS | BUTTON): number {
  if (typeof key === 'number') {
    return insideBounds(key, gp.axes.length) ? gp.axes[key] : 0;
  } else if (typeof key?.['+'] === 'number' && typeof key?.['-'] === 'number') {
    const positive = insideBounds(key['+'], gp.buttons.length)
      ? gp.buttons[key['+']].value
      : 0;
    const negative = insideBounds(key['-'], gp.buttons.length)
      ? gp.buttons[key['-']].value
      : 0;
    return positive > negative ? positive : negative * -1;
  }
  return 0;
}

class GamepadController extends Controller {
  static get className(): string {
    return 'GamepadController';
  }

  static getDefaultOptions(): GamepadOptions {
    return {
      id: '',
      device: 0,
      connected: false,
      mapping: undefined,
    };
  }

  /**
   * device number in gamepad api array
   */
  device: number;

  connected: boolean;

  /**
   * Mapping gamepad axes and buttons to NavigationAxes
   */
  mapping?: ControllerMapping;

  private _input: ControllerInput = getZeroInput();

  constructor(options: GamepadOptions) {
    const defaultOptions = GamepadController.getDefaultOptions();
    super({ ...defaultOptions, ...options });

    this.device = options.device || defaultOptions.device!;
    this.connected = parseBoolean(options.connected, defaultOptions.connected);
    this.mapping = options.mapping || defaultOptions.mapping;
  }

  getGamepad(): Gamepad | null {
    return navigator?.getGamepads()[this.device] || null;
  }

  getControllerInput(): ControllerInput | null {
    const gp = this.getGamepad();
    if (gp) {
      clearInput(this._input);
      if (this.mapping) {
        this._input.forward = getMappedValue(gp, this.mapping.forward);
        this._input.right = getMappedValue(gp, this.mapping.right);
        this._input.up = getMappedValue(gp, this.mapping.up);
        this._input.tiltDown = getMappedValue(gp, this.mapping.tiltDown);
        this._input.rollRight = getMappedValue(gp, this.mapping.rollRight);
        this._input.turnRight = getMappedValue(gp, this.mapping.turnRight);
      } else {
        const unmapped = [
          ...gp.axes,
          ...gp.buttons.map((b) => b.value),
          ...new Array(6).fill(0),
        ] as [number, number, number, number, number, number];
        fromArray(unmapped, this._input);
      }

      return applyDeadZones(this._input, this.inputThreshold, this._input);
    }
    return null;
  }

  toJSON(): GamepadOptions {
    const defaultOptions = GamepadController.getDefaultOptions();
    const config: GamepadOptions = super.toJSON();
    if (this.device !== defaultOptions.device) {
      config.device = this.device;
    }
    if (this.connected !== defaultOptions.connected) {
      config.connected = this.connected;
    }
    if (this.mapping !== defaultOptions.mapping) {
      config.mapping = this.mapping;
    }
    return config;
  }
}

export default GamepadController;
