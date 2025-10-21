# Phosphor JSON Format

This document describes the **Phosphor JSON** structure, centered on the top-level `PhosphorJsonData` object. Use it to author data packs/screens, dialogs, variables, and actions (including sequential and conditional flows).

---

## Top-level: `PhosphorJsonData`

```jsonc
{
  "metadata": { ... },
  "config":   { ... },
  "screens":  [ ... ],
  "dialogs":  [ ... ],
  "variables":[ ... ]
}
```

| Field       | Type                     | Required | Description                      |
| ----------- | ------------------------ | -------- | -------------------------------- |
| `metadata`  | object                   | ✅       | Authoring info.                  |
| `config`    | object                   | ✅       | Global app config.               |
| `screens`   | `PhosphorJsonScreen[]`   | ✅       | Ordered list of screens.         |
| `dialogs`   | `PhosphorJsonDialog[]`   | ✅       | Reusable dialogs.                |
| `variables` | `PhosphorJsonVariable[]` | ✅       | Declared variables and defaults. |

### `metadata`

The metadata helps to identify the json file currently loaded. It has no mechanistic effect.

| Field     | Type   | Required | Notes                       |
| --------- | ------ | -------- | --------------------------- |
| `title`   | string | ✅       | Human-readable description. |
| `author`  | string | ✅       | Credit string.              |
| `comment` | string | ✅       | Freeform notes.             |
| `version` | string | ✅       | Version                     |

### `config`

| Field      | Type   | Required | Notes                                                    |
| ---------- | ------ | -------- | -------------------------------------------------------- |
| `name`     | string | ✅       | Display name.                                            |
| `speed`    | number | ✅       | Default typing speed (ms/char).                          |
| `footer`   | string | ❌       | Footer text. If `undefined` then no footer will be shown |
| `minWidth` | number | ✅       | Minimum layout width (in characters).                    |
| `maxWidth` | number | ❌       | Maximum layout width (in characters).                    |

---

## Variables

Declare global variables that actions/conditions can use. In addition to these variables,
all `toggle` objects get a numeric variable corresponding to the index of the currently-activated
state. NOTE that altering this is NOT REACTIVE. Consider this a read only variable, for the moment.
Additionally, the last command typed into a prompt is stored in the `_lastCommand` variable.

### `PhosphorJsonVariable`

| Field     | Type                                | Required | Notes          |
| --------- | ----------------------------------- | -------- | -------------- | --- | -------------- |
| `id`      | string                              | ✅       | Variable name. |
| `type`    | `"number" \| "boolean" \| "string"` | ✅       | Runtime type.  |
| `default` | number                              | boolean  | string         | ✅  | Initial value. |

> Runtime variable actions: **`set`**, **`toggle`**, **`increment`**, **`decrement`**.

---

## Dialogs

### `PhosphorJsonDialog`

| Field     | Type                               | Required | Notes                                            |
| --------- | ---------------------------------- | -------- | ------------------------------------------------ |
| `id`      | string                             | ✅       | Dialog identifier.                               |
| `type`    | `"alert" \| "dialog" \| "confirm"` | ✅       | Presentation kind. Currently this had no effect. |
| `content` | `string[]`                         | ✅       | Lines shown in the dialog.                       |

---

## Screens

### `PhosphorJsonScreen`

| Field     | Type                          | Required | Notes                                        |
| --------- | ----------------------------- | -------- | -------------------------------------------- |
| `id`      | string                        | ✅       | Recommended; required if you navigate by id. |
| `type`    | `"screen" \| "static"`        | ✅       | Interactive vs static page.                  |
| `content` | `PhosphorScreenJsonContent[]` | ❌       | Ordered list of text/controls.               |

### `PhosphorScreenJsonContent` (union)

A content item is one of:

- `string` — literal line of text.
- `JsonText` — text block with options.
- `JsonLink` — interactive link (navigation / actions).
- `JsonBitmap` — image.
- `JsonPrompt` — typed command prompt.
- `JsonToggle` — on/off (or multi) state indicator.
- `JsonCountdown` — countdown prompt.
- `VoidData` — `{ "type": "void", ... }` placeholder for extensions.

Common optional fields (on object forms): `id`, `className`, `loadState`, `onLoad`, `textOpts`.

#### `TextOptions`

| Field             | Type                            | Notes                                         |
| ----------------- | ------------------------------- | --------------------------------------------- |
| `speed`           | number                          | Override typing speed.                        |
| `isPassword`      | boolean                         | Render as `*`.                                |
| `playSound`       | boolean                         | Enable/disable teletype SFX.                  |
| `preserveSpacing` | boolean                         | Use `&nbsp;` for spaces (disables word wrap). |
| `bigFont`         | string                          | ASCII-art font id.                            |
| `fillWidth`       | boolean                         | Repeat text to fill width.                    |
| `align`           | `"left" \| "center" \| "right"` | Alignment.                                    |

---

### Content variants (examples)

#### `JsonText`

```json
{
	"type": "text",
	"text": "Welcome to YPSILON-14.",
	"className": "muted",
	"textOpts": { "align": "center" }
}
```

#### `JsonBitmap`

```json
{
	"type": "bitmap",
	"src": "https://example.com/map.png",
	"alt": "Station Map",
	"className": "lighten"
}
```

#### `JsonToggle`

```json
{
	"type": "toggle",
	"states": [
		{ "text": "> AIRLOCK :: LOCKED", "active": true },
		{ "text": "> AIRLOCK :: UNLOCKED", "active": false }
	]
}
```

`JsonToggleState` fields: `text` (string, ✅), `active` (boolean, ✅), `delayMs?` (number), `delayText?` (string).

#### `JsonPrompt`

A Prompt provides the user a place to type arbitrary commands. When a command is entered, the prompt
goes through each of the provided prompt options and activates the first command matching the inputted text.
Regex is supported. If no prompt matches, a short error is shown (TODO: provide option to disable this.)
As a workaround, you can disable by including an empty command at the end with the command: `.+` (Regex matching any characters)

Note that you should only have one prompt per screen, due to how these are implemented.

```json
{
	"type": "prompt",
	"prompt": "TYPE 'OK' TO CONTINUE: ",
	"commands": [{ "command": "ok", "action": { "type": "link", "target": "menu" } }],
	"className": "alert cursor"
}
```

#### `JsonLink`

A link does exactly what it sounds like. Links can be clicked to perform actions.

```json
{ "type": "link", "text": "> CONTROLS", "target": "controls" }
```

Advanced (separate actions for base/shift):

```json
{
	"type": "link",
	"text": "> AIRLOCKS [A]",
	"actions": {
		"base": { "type": "link", "target": "airlocks" },
		"shiftKey": { "type": "dialog", "target": "lockedDialog" }
	}
}
```

#### `JsonCountdown`

```json
{ "type": "countdown", "prompt": "SELF-DESTRUCT IN: ", "duration": 600, "className": "alert" }
```

---

## Actions

An action may be a **single object** or an **array** to run sequentially.

```jsonc
// Single
{ "type": "link", "target": "map" }

// Sequential
[
  { "type": "dialog", "target": "lockedDialog" },
  { "type": "link",   "target": "controls" }
]
```

Supported action variants:

| Type               | Shape                                                                    | Purpose                                                             |             |                               |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------- | ----------------------------- | ------- | ----------- | ------------------ |
| `dialog` / `alert` | `{ "type": "dialog" \| "alert", "target": "dialogId" }`                  | Open a dialog. The runner should **await** close before continuing. |             |                               |
| `link`             | `{ "type": "link", "target": "screenId" }`                               | Navigate to a screen.                                               |             |                               |
| `toggle`           | `{ "type": "toggle", "target": "toggleContentId" }`                      | Flip a toggle on the current screen.                                |             |                               |
| `variable`         | `{ "type": "variable", "target": "<varId>", "context": { "action": "set" | "toggle"                                                            | "increment" | "decrement", "value"?: number | boolean | string } }` | Mutate a variable. |
| `condition`        | See below.                                                               | Branch on variable values.                                          |             |                               |

---

## Conditional actions

```json
{
	"type": "condition",
	"condition": {
		"op": ">=",
		"left": { "type": "variable", "target": "score" },
		"right": { "type": "value", "value": 100 }
	},
	"true": { "type": "link", "target": "victory" },
	"false": { "type": "dialog", "target": "tryAgain" }
}
```

- Branches `true`/`false` accept a single action or an array (sequence).

### Condition model

**Simple** comparison:

| Field             | Type       | Required | Notes                      |
| ----------------- | ---------- | -------- | -------------------------- |
| `op`              | Comparator | ✅       | See below.                 |
| `left`            | Operand    | ✅       | Variable or literal value. |
| `right`           | Operand    | ✅       | Variable or literal value. |
| `caseInsensitive` | boolean    | ❌       | For string comparisons.    |

**Comparators**: `=`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `not contains`, `startswith`, `endswith`.

**Operand**:

- Variable reference: `{ "type": "variable", "target": "varName" }`
- Literal value: `{ "type": "value", "value": number|boolean|string }`

**Logical** composition:

- `{"and": [Condition, ...]}`
- `{"or":  [Condition, ...]}`
- `{"not": Condition}`

---

## Example: Minimal pack

```json
{
	"metadata": { "description": "Demo", "author": "You", "comment": "Sample" },
	"config": { "name": "My App", "speed": 5, "minWidth": 60 },
	"variables": [
		{ "id": "debug", "type": "boolean", "default": false },
		{ "id": "score", "type": "number", "default": 0 }
	],
	"dialogs": [{ "id": "lockedDialog", "type": "alert", "content": ["Authorization required."] }],
	"screens": [
		{
			"id": "menu",
			"type": "screen",
			"content": ["Main Menu", { "type": "link", "text": "> PLAY", "target": "game" }]
		},
		{
			"id": "game",
			"type": "screen",
			"content": [
				{ "type": "text", "text": "Good luck!" },
				{
					"type": "prompt",
					"prompt": "TYPE 'OK': ",
					"commands": [
						{
							"command": "ok",
							"action": [
								{ "type": "dialog", "target": "lockedDialog" },
								{ "type": "link", "target": "menu" }
							]
						}
					]
				}
			]
		}
	]
}
```
