export enum ScreenDataState {
	Unloaded = 0,
	Ready,
	Active,
	Done
}

export type PhosphorDialogType = 'alert' | 'dialog' | 'confirm';
export type PhosphorScreenType = 'screen' | 'static';
export type PhosphorVariableType = number | boolean | string;
export type PhosphorVariableAction = 'set' | 'toggle' | 'increment' | 'decrement';

export type TextOptions = {
	speed?: number; // the delay between characters appearing
	isPassword?: boolean; // replaces rendered characters with asterisks
	playSound?: boolean; // whether to play or disable the teletext sound
	preserveSpacing?: boolean; // renders spaces as &nbsp; to preserve formatting. This disables word-wrapping.
	bigFont?: string; // use an ascii-art font size for this text block.
	fillWidth?: boolean; // repeat this text to fill the width of the screen
	align?: 'left' | 'center' | 'right'; // text alignment
};
/////////////////////////// JSON DATA TYPES ///////////////////////////////

export type PhosphorJsonData = {
	metadata: {
		title: string;
		author: string;
		comment: string;
		version: string;
	};
	config: {
		name: string;
		speed: number;
		footer?: string;
		minWidth: number;
		maxWidth?: number;
	};
	screens: PhosphorJsonScreen[];
	dialogs: PhosphorJsonDialog[];
	variables: PhosphorJsonVariable[];
};

export type PhosphorJsonVariable = {
	id: string;
	type: 'number' | 'boolean' | 'string';
	default: PhosphorVariableType;
};

export type PhosphorJsonDialog = {
	id: string;
	type: PhosphorDialogType;
	content: string[];
};

export type PhosphorJsonScreen = {
	id: string;
	content?: PhosphorScreenJsonContent[];
	type: PhosphorScreenType;
};

export type PhosphorScreenJsonContent =
	| string
	| VoidData
	| JsonLink
	| JsonBitmap
	| JsonToggle
	| JsonPrompt
	| JsonText
	| JsonCountdown;

type VoidData = {
	type: 'void';
	[key: string]: any;
};

type JsonBitmap = {
	type: 'bitmap';
	src: string;
	alt?: string;
	className?: string;
	id?: string;
	loadState?: ScreenDataState;
	onLoad?: boolean;
};

type JsonToggle = {
	type: 'toggle';
	states: JsonToggleState[];
	className?: string;
	id?: string;
	loadState?: ScreenDataState;
	onLoad?: boolean;
	textOpts?: TextOptions;
};

export type JsonToggleState = {
	text: string;
	active: boolean;
	delayMs?: number;
	delayText?: string;
};

type JsonPrompt = {
	type: 'prompt';
	prompt?: string;
	className?: string;
	commands: JsonCommand[];
	id?: string;
	loadState?: ScreenDataState;
	onLoad?: boolean;
	textOpts?: TextOptions;
};

type JsonLink = {
	type: 'link';
	text?: string;
	className?: string;
	target?: string | LinkTarget[];
	actions?: JsonLinkAction; //JsonAction | { base: JsonAction; shiftKey: JsonAction };
	id?: string;
	loadState?: ScreenDataState;
	onLoad?: boolean;
	textOpts?: TextOptions;
};
type JsonLinkAction = { base: JsonAction; shiftKey?: JsonAction };
export type JsonCommand = {
	command: string | string[];
	action: JsonAction;
};

type JsonAction = _JsonAction | _JsonAction[];

type _JsonAction =
	| JsonCommandDialog
	| JsonCommandLink
	| JsonCommandToggle
	| JsonCommandVariable
	| JsonCommandConditional;

type JsonCommandDialog = {
	type: 'alert' | 'dialog';
	target: string;
};
type JsonCommandLink = {
	type: 'link';
	target: string;
};
type JsonCommandToggle = {
	type: 'toggle';
	target: string;
};
export type JsonCommandVariable = {
	type: 'variable';
	target: string;
	context: {
		action: PhosphorVariableAction;
		value?: PhosphorVariableType;
	};
};

type JsonCommandConditional = {
	type: 'condition';
	condition: Condition; // How to implement?
	true: JsonAction;
	false: JsonAction;
};

export type Comparator =
	| '='
	| '!='
	| '>'
	| '<'
	| '>='
	| '<='
	| 'contains'
	| 'not contains'
	| 'startswith'
	| 'endswith';

export type SimpleCondition = {
	op: Comparator;
	left: Operand;
	right: Operand;
	caseInsensitive?: boolean;
};
export type LogicalCondition = { or: Condition[] } | { and: Condition[] } | { not: Condition };

export type Condition = SimpleCondition | LogicalCondition;

export type Operand =
	| {
			type: 'variable';
			target: string;
	  }
	| {
			type: 'value';
			value: PhosphorVariableType;
	  };

type JsonText = {
	type: 'text';
	text: string;
	id?: string;
	loadState?: ScreenDataState;
	onLoad?: boolean;
	className?: string;
	textOpts?: TextOptions;
};

type JsonCountdown = {
	type: 'countdown';
	prompt: string;
	duration: number;
	className?: string;
	id?: string;
	textOpts?: TextOptions;
};

/////////////////////////// PARSED DATA TYPES ///////////////////////////////

export type PhosphorData = {
	config: {
		name: string;
		author: string;
		comment: string;
	};
	screens: PhosphorScreen[];
	dialogs: PhosphorDialog[];
};

export type PhosphorDialog = {
	id: string;
	type: PhosphorDialogType;
	content: string[];
};

export type PhosphorScreen = BasePhosphorScreen | PhosphorStaticScreen;

type BasePhosphorScreen = {
	id: string;
	type: 'screen';
	content: PhosphorScreenContent[];
};

type PhosphorStaticScreen = {
	id: string;
	type: 'static';
	content: PhosphorScreenContent[];
};

export type PhosphorScreenContent =
	| Link
	| PhosphorBitmap
	| PhosphorToggle
	| PhosphorPrompt
	| PhosphorText
	| PhosphorCountdown;

export type PhosphorBitmap = {
	type: 'bitmap';
	src: string;
	alt?: string;
	className?: string;
	id: string;
	loadState: ScreenDataState;
	onLoad?: boolean;
};

export type PhosphorToggle = {
	type: 'toggle';
	states: {
		text: string;
		active: boolean;
	}[];
	className?: string;
	id: string;
	loadState: ScreenDataState;
	onLoad?: boolean;
	// speed: number;
	textOpts?: TextOptions;
};

export type Command = {
	command: string;
	action: Action;
};

export type Action = SingleAction | SingleAction[];

export type SingleAction =
	| CommandLink
	| CommandDialog
	| CommandToggle
	| CommandVariable
	| CommandCondition;

type CommandDialog = {
	type: 'alert' | 'dialog';
	target: string;
};
type CommandLink = {
	type: 'link';
	target: string;
	shiftKey?: boolean;
};

type CommandToggle = {
	type: 'toggle';
	target: string;
};

type CommandVariable = {
	type: 'variable';
	target: string;
	context: {
		action: PhosphorVariableAction;
		value?: PhosphorVariableType;
	};
};
type CommandCondition = {
	type: 'condition';
	condition: Condition;
	true: Action;
	false: Action;
};

export type PhosphorPrompt = {
	type: 'prompt';
	prompt: string;
	className: string;
	commands: Command[];
	id: string;
	loadState: ScreenDataState;
	onLoad?: boolean;
	textOpts?: TextOptions;
};

export type Link = {
	type: 'link';
	text?: string;
	className?: string;
	// target: string | LinkTarget[];
	actions: LinkAction; //{ base: Action; shiftKey: Action };
	id: string;
	loadState: ScreenDataState;
	onLoad?: boolean;
	textOpts?: TextOptions;
};

export type LinkAction = { base: Action; shiftKey: Action };

export type LinkTarget = { target: string; type: string; shiftKey: boolean };

export type Dialog = {
	type: 'alert' | 'dialog';
	id: string;
	content: string[];
};

export type PhosphorText = {
	type: 'text';
	text: string;
	id: string;
	loadState: ScreenDataState;
	onLoad?: boolean;
	className?: string;
	textOpts?: TextOptions;
};

export type PhosphorCountdown = {
	type: 'countdown';
	id: string;
	prompt: string;
	loadState: ScreenDataState;
	onLoad?: boolean;
	duration: number;
	className?: string;
	textOpts?: TextOptions;
};

// let d: PhosphorJsonData
