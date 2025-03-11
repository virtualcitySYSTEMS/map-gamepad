# @vcmap/gamepad

> Part of the [VC Map Project](https://github.com/virtualcitySYSTEMS/map-ui)

This is a plugin extending the VC Map Core Navigation API by two new Controller types:

- [GamepadController](./src/controller/gamepadController.ts) designed to allow navigation using gamepads
- [SpaceMouseController](./src/controller/spaceMouseController.ts) designed to allow navigation using a space mouse

The plugin uses the [GamepadAPI](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) to track controllers being connected or disconnected.

## Configuration

You can optionally configure gain control (`scales` & `axesThreshold`) and map keys to navigation axes (`mapping`).

> To apply controller configuration you have to provide an id, which corresponds to the gamepads id
> The plugin should log to your browser console, when a controller is connected or disconnected
> Use those logs or your browser navigator API `navigator.getGamepads()` to find out the gamepads id

> If no configuration is found for your gamepad, the plugin will try to apply a configuration of the same controller type, if any available.

### Gain control

| property      | type            | default | description                                                                                |
| ------------- | --------------- | ------- | ------------------------------------------------------------------------------------------ |
| scales        | ControllerInput |         | A scale applied to the corresponding input axis. Can also be used to change the direction. |
| axesThreshold | number          | 0.1     | Threshold for inputs to be applied. Smaller inputs are ignored.                            |

> You may want to change the axesThreshold, if you experience unexpected movements without corresponding inputs

### Key mapping

To configure a key mapping provide an array with indices of your gamepads axes or buttons.
If you want to use buttons, you can provide an object with `+` for forward direction and `-` for backward direction.
For an axes, just provide the index.

> To inverse the direction of an axes you can change the sign of your corresponding `scales` configuration.

### Example configuration

- template (please replace all values with valid configuration)

```json
{
  "type": "GamepadController or SpaceMouseController",
  "id": "Name of your gamepad as displayed in the browser console",
  "scales": {
    "forward": "change scale or direction",
    "right": "change scale or direction",
    "up": "change scale or direction",
    "tiltDown": "change scale or direction",
    "rollRight": "change scale or direction",
    "turnRight": "change scale or direction"
  },
  "mapping": {
    "forward": "axes or button index",
    "right": "axes or button index",
    "up": "axes or button index",
    "tiltDown": "axes or button index",
    "rollRight": "axes or button index",
    "turnRight": "axes or button index"
  }
}
```

- PlayStation Controller example mapping:

```json
{
  "type": "GamepadController",
  "id": "PS(R) Gamepad",
  "scales": [1, -1, 1, -0.5, 1, 1],
  "mapping": [
    0,
    1,
    {
      "+": 4,
      "-": 5
    },
    5,
    {
      "+": 6,
      "-": 7
    },
    2
  ]
}
```

- Xbox Controller example mapping:

```json
{
  "type": "GamepadController",
  "id": "Xbox 360 Controller (XInput STANDARD GAMEPAD)",
  "scales": {
    "forward": 1,
    "right": -1,
    "up": -1,
    "tiltDown": 0.5,
    "rollRight": 1,
    "turnRight": 1
  },
  "mapping": {
    "forward": 1,
    "right": 0,
    "up": {
      "+": 0,
      "-": 1
    },
    "tiltDown": 3,
    "rollRight": {
      "+": 2,
      "-": 3
    },
    "turnRight": 2
  }
}
```
