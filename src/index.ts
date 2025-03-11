import { VcsPlugin, VcsUiApp, PluginConfigEditor } from '@vcmap/ui';
import { name, version, mapVersion } from '../package.json';
import setupConnectionListener from './connectionHelper.js';
import SpaceMouseController from './controller/spaceMouseController.js';
import GamepadController, {
  GamepadOptions,
} from './controller/gamepadController.js';

export type GamepadConfig = GamepadOptions & { type: string };

export type PluginConfig = {
  controllers?: GamepadConfig[];
};
type PluginState = Record<never, never>;

export type NavigatorPlugin = VcsPlugin<PluginConfig, PluginState> & {
  addController(options: GamepadConfig): void;
};

export default function plugin(config: PluginConfig): NavigatorPlugin {
  let app: VcsUiApp | undefined;
  let connectionListener: () => void = () => {};

  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    addController(options: GamepadConfig): void {
      if (app) {
        const { navigation } = app.maps;
        const configuredOptions =
          config.controllers?.find((c) => c.id === options.id) ||
          config.controllers?.find((c) => c.type === options.type) ||
          {};
        Object.assign(options, configuredOptions);
        if (options.type === SpaceMouseController.className) {
          navigation.addController(new SpaceMouseController(options));
        } else {
          navigation.addController(new GamepadController(options));
        }
      }
    },
    initialize(this: NavigatorPlugin, vcsUiApp: VcsUiApp): void {
      app = vcsUiApp;
      connectionListener = setupConnectionListener(app, this);
    },
    /**
     * should return all default values of the configuration
     */
    getDefaultOptions(): PluginConfig {
      return {};
    },
    /**
     * should return the plugin's serialization excluding all default values
     */
    toJSON(): PluginConfig {
      return structuredClone(config);
    },
    /**
     * components for configuring the plugin and/ or custom items defined by the plugin
     */
    getConfigEditors(): PluginConfigEditor<object>[] {
      return [];
    },
    destroy(): void {
      connectionListener();
    },
  };
}
