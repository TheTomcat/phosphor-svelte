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

| Field             | Type                                            | Required | Notes                                                                |
| ----------------- | ----------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `name`            | string                                          | ✅       | Display name.                                                        |
| `speed`           | number                                          | ✅       | Default typing speed (ms/char).                                      |
| `footer`          | string                                          | ❌       | Footer text. If `undefined` then no footer will be shown             |
| `minWidth`        | number                                          | ✅       | Minimum layout width (in characters).                                |
| `maxWidth`        | number                                          | ❌       | Maximum layout width (in characters).                                |
| `renderScanlines` | boolean                                         | ❌       | Display (or not) the tracklines that old CRT monitors sometimes had. |
| `screenFlicker`   | boolean                                         | ❌       | Enable an annoying screen flicker                                    |
| `theme`           | `'amber' \| 'white'  \| 'green' \| 'whiteblue'` | ❌       | Set the theme.                                                       |

---

## Variables

Declare global variables that actions/conditions can use. In addition to these variables,
all `JsonToggle` get a numeric variable corresponding to the index of the currently-activated
state. NOTE that altering this is NOT REACTIVE. Consider this a read only variable (at least, for the moment).

### `PhosphorJsonVariable`

| Field     | Type                                | Required | Notes          |
| --------- | ----------------------------------- | -------- | -------------- |
| `id`      | string                              | ✅       | Variable name. |
| `type`    | `"number" \| "boolean" \| "string"` | ✅       | Runtime type.  |
| `default` | `number \| boolean \| string`       | ✅       | Initial value. |

> Runtime variable actions: **`set`**, **`toggle`**, **`increment`**, **`decrement`**, **`concatenate`**.

---

## Dialogs

### `PhosphorJsonDialog`

| Field     | Type                               | Required | Notes                                            |
| --------- | ---------------------------------- | -------- | ------------------------------------------------ |
| `id`      | string                             | ✅       | Dialog identifier.                               |
| `type`    | `"alert" \| "dialog" \| "confirm"` | ✅       | Presentation kind. Currently this has no effect. |
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
- `VoidData` — `{ "type": "void", ... }` placeholder for quickly commenting out content.

Common optional fields (on object forms): `id`, `className`, `loadState`, `onLoad`, `textOpts`.

#### `TextOptions`

| Field             | Type                            | Notes                                                           |
| ----------------- | ------------------------------- | --------------------------------------------------------------- |
| `speed`           | number                          | Override typing speed.                                          |
| `isPassword`      | boolean                         | Render as `*`.                                                  |
| `playSound`       | boolean                         | Enable/disable teletype SFX.                                    |
| `preserveSpacing` | boolean                         | Use `&nbsp;` for spaces (disables word wrap).                   |
| `bigFont`         | string                          | ASCII-art font id. Currently support `slant` and `big money-se` |
| `fillWidth`       | boolean                         | Repeat text to fill width.                                      |
| `align`           | `"left" \| "center" \| "right"` | Alignment.                                                      |

---

### Content variants (examples)

#### `JsonText`

```jsonc
{
	"type": "text",
	"text": "Welcome to YPSILON-14.",
	"className": "muted",
	"textOpts": { "align": "center" }
}
```

#### `JsonBitmap`

```jsonc
{
	"type": "bitmap",
	"src": "https://example.com/map.png",
	"alt": "Station Map",
	"className": "lighten"
}
```

#### `JsonToggle`

```jsonc
{
	"type": "toggle",
	"states": [
		{ "text": "> AIRLOCK :: LOCKED", "active": true },
		{ "text": "> AIRLOCK :: UNLOCKED", "active": false }
	]
}
```

`JsonToggleState` fields: `text` (string, ✅), `active` (boolean, ✅), `delayMs?` (number), `delayText?` (string).

If delayMs and delayText is provided (both need to be provided to be valid), then an interim `loading state` will be displayed for `displayMs` after activation of the toggle. If `%` is included, then render a progress bar. (Todo: Configuration options)

#### `JsonPrompt`

A Prompt provides the user a place to type arbitrary commands. When a command is entered, the prompt
goes through each of the provided prompt options and activates the first command matching the inputted text.
Regex is supported via the `allowRegex` tag. If no prompt matches, a short error is shown (TODO: provide option to disable this.)
As a workaround, you can disable by including an empty command at the end with the command: `.+` (Regex matching any characters)

Note that you should only have one prompt per screen, due to how these are implemented.

Additionally, the last command typed into a prompt is stored in the `_lastCommand` variable.

| Field               | Required | Type                             | Notes                                                          |
| ------------------- | -------- | -------------------------------- | -------------------------------------------------------------- |
| `type`              | ✅       | `"prompt"`                       |                                                                |
| `prompt`            | ✅       | `string`                         | The text prompting the user for information                    |
| `commands`          | ✅       | `JsonCommand` \| `JsonCommand[]` | Single or multiple JsonCommands (see below)                    |
| `className`         | ❌       | `string`                         | Optional `className` for formatting.                           |
| `id`                | ❌       | `string`                         | ID of this prompt. Will be set automatically if none provided. |
| `allowMetaCommands` | ❌       | `boolean` (default `false`)      | Allow this prompt to use metacommands.                         |

Metacommands are commands that modify the behaviour of the terminal. They are minimally supported at present. To allow them, you must enable `allowMetaCommands` in the prompt object. If you have a global regex capture, then it will consume the command. For now, you can do:

- `set theme=THEME` (where THEME is a valid theme)
- To follow: `set renderScanlines=true/false` and `set screenFlicker=true/false` (not yet implemented)

Example Metacommand

```jsonc
{
	"type": "prompt",
	"commands": [
		{
			"command": "simplecommand",
			"action": {
				"type": "link",
				"target": "incidents"
			}
		}
		// This command, if present, would consume the metacommand! Don't include it!!
		// {
		// 	"command": ".+",
		// 	"action": [],
		// 	"allowRegex": true
		// }
	],
	"allowMetaCommands": true
}
```

```jsonc
{
	"type": "prompt",
	"prompt": "TYPE 'OK' TO CONTINUE: ",
	"commands": [{ "command": "ok", "action": { "type": "link", "target": "menu" } }],
	"className": "alert cursor"
}
```

##### `JsonCommand`

| Field        | Required | Type                           | Notes                                                           |
| ------------ | -------- | ------------------------------ | --------------------------------------------------------------- |
| `command`    | ✅       | `string` \| `string[]`         | A single string or list of strings to match. May contain regex. |
| `action`     | ✅       | `JsonAction` \| `JsonAction[]` | A single or list of actions to be performed                     |
| `allowRegex` | ❌       | `boolean` (default `false`)    | Allow regex in this prompt                                      |

An indepth explanation of JsonAction is at the bottom of this file.

#### `JsonLink`

A link does exactly what it sounds like. Links can be clicked to perform actions.

```jsonc
{ "type": "link", "text": "> CONTROLS", "target": "controls" }
```

Advanced (separate actions for base/shift):

```jsonc
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

```jsonc
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

| Type               | Shape                                                                                                                                                                    | Purpose                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `dialog` / `alert` | `{ "type": "dialog" \| "alert", "target": "dialogId" }`                                                                                                                  | Open a dialog. The runner should **await** close before continuing. |
| `link`             | `{ "type": "link", "target": "screenId" }`                                                                                                                               | Navigate to a screen.                                               |
| `toggle`           | `{ "type": "toggle", "target": "toggleContentId" }`                                                                                                                      | Flip a toggle on the current screen.                                |
| `variable`         | `{ "type": "variable", "target": "<varId>", "context": { "action": "set" \| "toggle"           \| "increment" \| "decrement", "value"?: number \| boolean \| string } }` | Mutate a variable.                                                  |
| `condition`        | See below.                                                                                                                                                               | Branch on variable values.                                          |

---

## Conditional actions

```jsonc
{
	"type": "condition",
	"condition": {
		// This condition checks score >= 100
		"op": ">=",
		"left": { "type": "variable", "target": "score" },
		"right": { "type": "value", "value": 100 }
	},
	"true": { "type": "link", "target": "victory" }, // Navigate to victory screen if true
	"false": { "type": "dialog", "target": "tryAgain" } // Display tryAgain dialog if false
}
```

Note: `true`/`false` accept a `JsonAction` or `JsonAction[]`.

### Condition model

**Simple** comparison:

| Field             | Type         | Required | Notes                      |
| ----------------- | ------------ | -------- | -------------------------- |
| `op`              | `Comparator` | ✅       | See below.                 |
| `left`            | `Operand`    | ✅       | Variable or literal value. |
| `right`           | `Operand`    | ✅       | Variable or literal value. |
| `caseInsensitive` | `boolean`    | ❌       | For string comparisons.    |

**Comparators**: `=`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `not contains`, `startswith`, `endswith`.

**Operand**:

- Variable reference: `{ "type": "variable", "target": "varName" }` will resolve to the value of the variable
- Literal value: `{ "type": "value", "value": number|boolean|string }` will resolve to the literal value specified.

**Logical** composition:

- `{"and": [Condition, ...]}`
- `{"or":  [Condition, ...]}`
- `{"not": Condition}`

## Example: Minimal pack

```jsonc
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

# `JsonAction`

A `JsonAction` describes **what happens** when a command fires. It’s one of:

- `JsonCommandDialog` – open a dialog (wait until user closes dialog to continue)
- `JsonCommandLink` – navigate to a screen
- `JsonCommandToggle` – flip a toggle element by id (wait until toggle is finished any delays to continue)
- `JsonCommandVariable` – change a variable
- `JsonCommandConditional` – branch and run other action(s) based on a condition

`JsonAction` can always be a single action object or an array of actions.

## `JsonCommandDialog`

```jsonc
{ "type": "dialog", "target": "lockedDialog" }
```

- **type**: `"alert"` or `"dialog"`
- **target**: dialog id to show

**Behavior:** Show the dialog. Wait for the dialog to close before allowing the sequence to progress.

## `JsonCommandLink`

```jsonc
{ "type": "link", "target": "controls" }
```

- **type**: `"link"`
- **target**: destination screen id

**Behavior:** Change the active screen. Note that this should be the last item in the array.

## `JsonCommandToggle`

```jsonc
{ "type": "toggle", "target": "airlockToggle1" }
```

- **type**: `"toggle"`
- **target**: the content id of a toggle on the current screen

**Behavior:** Switch to the next state in that toggle’s `states[]` (wrap-around).

## `JsonCommandVariable`

```jsonc
{
	"type": "variable",
	"target": "score",
	"context": { "action": "increment", "value": 10 }
}
```

- **type**: `"variable"`
- **target**: variable id
- **context**:
  - **action**: `"set" | "toggle" | "increment" | "decrement" | "concatenate"`
  - **value**: optional number/boolean/string used by the action
  - **rule**: rule is used for two purposes only (see below)

**Behavior:** Mutates a declared variable.
Examples:

- `set` with `value`
- `toggle` for booleans (true↔false)
- `increment`/`decrement` (uses `value` as step, default 1)

1. If rule is given in a `concatenate` action, the valid options are `pre` and `post`. These will determine whether the text is prepended or appended.
2. If rule is given in a `set` action, then provide a template to generate random stuff. The rules are below:

### `Rule` from within a `set` context.

Generate a value (number, boolean, or string) from a compact **rule string**.

Depending on the syntax of `rule`, the function returns:

- a **number** randomly chosen from an integer range,
- a **boolean** produced by a probability,
- or a **string** generated from a simple pattern alphabet.

#### Syntax summary

1. Integer range

- Examples: `[1,5]`, `[3,9)`, `(2,10]`
- Returns an integer uniformly sampled from the range.
- Brackets control inclusivity:
  - `[` / `]` = inclusive
  - `(` / `)` = exclusive
- **Details:** The function parses `start` and `end` as floats, then converts to an **integer range** by:
  - `min = inclusiveStart ? start : start + 1`
  - `max = inclusiveEnd   ? end   : end - 1`
  - Note: Because of the `+1`/`-1` adjustment, non-integer bounds like `(1.2, 3.8)` are effectively treated as integers `(2,3)`. If `min > max` after adjustment, an error is thrown.

2. Probability — plain number string `p` where `0 <= p <= 1`

- Example: `"0.3"`, `"1"`, `"0"`
- Returns a `boolean` that is `true` with probability `p`.
- Validation: string must round-trip via `parseFloat(rule).toString() === rule`.

3. Pattern string — any other characters

- Returns a `string` by expanding symbolic placeholders; any non-symbol chars are copied as-is. Escaping the placeholders will (eventually) be supported.

| Symbol | Alphabet used                          | Notes                                   |
| -----: | -------------------------------------- | --------------------------------------- |
|    `0` | `0123456789`                           | digits                                  |
|    `A` | `ABCDEFGHIJKLMNOPQRSTUVWXYZ`           | uppercase letters                       |
|    `a` | `abcdefghijklmnopqrstuvwxyz`           | lowercase letters                       |
|    `X` | `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789` | upper alnum                             |
|    `h` | `0123456789abcdef`                     | hexadecimal lowercase                   |
|    `E` | `ABCDEFGHKMNPQRSTUVWXYZ23456789`       | easy set (no confusing chars)           |
|    `c` | `IO01lio`                              | confusing chars only (because, why not) |

**Example:**
Rule: `"AA-0000"` → could yield `"QZ-4831"`

## `JsonCommandConditional`

```jsonc
{
	"type": "condition",
	"condition": {
		"op": ">=",
		"left": { "type": "variable", "target": "score" },
		"right": { "type": "value", "value": 100 }
	},
	"true": { "type": "link", "target": "victory" },
	"false": [
		{ "type": "dialog", "target": "tryAgain" },
		{ "type": "link", "target": "menu" }
	]
}
```

<!--
- **type**: `"condition"`
- **condition**: compares operands or composes them logically (see `Condition`, `Comparator`, `Operand`)
- **true** / **false**: action or list of actions to run depending on the result

**Behavior:** Evaluate, then run the matching branch. Each branch can be a single action or a sequence.

- **Sequencing:** When an action list is used, they are run **in order**.
- **Conditions:**
  - **Comparators:** `=`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `not contains`, `startswith`, `endswith`
  - **Operands:** variable (`{type:'variable', target:'name'}`) or literal value (`{type:'value', value:...}`)
  - **Logic:** `{"and":[...]}`, `{"or":[...]}`, `{"not": ...}` -->
