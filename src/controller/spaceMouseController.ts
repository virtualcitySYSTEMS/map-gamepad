import GamepadController, { GamepadOptions } from './gamepadController.js';

class SpaceMouseController extends GamepadController {
  static get className(): string {
    return 'SpaceMouseController';
  }

  static getDefaultOptions(): GamepadOptions {
    return {
      id: '',
      scales: {
        forward: -1.2,
        right: 1.2,
        up: -1.2,
        tiltDown: -0.3,
        rollRight: 0.5,
        turnRight: 1,
      },
      mapping: {
        forward: 1,
        right: 0,
        up: 2,
        tiltDown: 3,
        rollRight: 4,
        turnRight: 5,
      },
    };
  }

  constructor(options: GamepadOptions) {
    const defaultOptions = SpaceMouseController.getDefaultOptions();
    super({ ...defaultOptions, ...options });
  }
}

export default SpaceMouseController;
