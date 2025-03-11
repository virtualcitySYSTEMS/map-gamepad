import { getLogger } from '@vcsuite/logger';
import { VcsUiApp } from '@vcmap/ui';
import { name } from '../package.json';
import type { NavigatorPlugin } from './index.js';
import GamepadController from './controller/gamepadController.js';

function connectDevices(app: VcsUiApp, plugin: NavigatorPlugin): void {
  if (navigator.getGamepads) {
    const gamepads = navigator.getGamepads();
    getLogger(name).debug('detected gamepads', gamepads);
    // freezes on the last entry
    let i = 0;
    while (i < gamepads.length - 1) {
      const gp = gamepads[i];
      if (gp && gp.id && gp.connected) {
        const type = gp.id.toLowerCase().includes('gamepad')
          ? 'GamepadController'
          : 'SpaceMouseController';
        getLogger('DeviceManager').info(`connecting ${gp.id} as ${type}`);
        const controller = app.maps.navigation.getController(gp.id);
        if (controller && controller instanceof GamepadController) {
          controller.device = i;
          controller.connected = gp.connected;
        } else {
          plugin.addController({
            type,
            id: gp.id,
            device: i,
            connected: gp.connected,
          });
        }
      }
      i += 1;
    }
  }
}

export default function setupConnectionListener(
  app: VcsUiApp,
  plugin: NavigatorPlugin,
): () => void {
  const gamepadConnected = (e: GamepadEvent): void => {
    getLogger(name).info(
      'Gamepad connected at index %d: %s. %d buttons, %d axes.',
      e.gamepad.index,
      e.gamepad.id,
      e.gamepad.buttons.length,
      e.gamepad.axes.length,
    );
    connectDevices(app, plugin);
  };

  const gamepadDisconnected = (e: GamepadEvent): void => {
    getLogger('DeviceManager').info(
      'Gamepad disconnected from index %d: %s',
      e.gamepad.index,
      e.gamepad.id,
    );
    const controller = app.maps.navigation.getController(e.gamepad.id);
    if (controller) {
      app.maps.navigation.removeController(controller.id);
    }
  };

  window.addEventListener('gamepadconnected', gamepadConnected);
  window.addEventListener('gamepaddisconnected', gamepadDisconnected);

  const gamepadConnectionListener = [
    (): void =>
      window.removeEventListener('gamepadconnected', gamepadConnected),
    (): void =>
      window.removeEventListener('gamepaddisconnected', gamepadDisconnected),
  ];

  connectDevices(app, plugin);

  return (): void => {
    gamepadConnectionListener.forEach((cb) => cb());
  };
}
