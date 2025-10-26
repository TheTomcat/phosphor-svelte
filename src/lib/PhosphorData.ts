export enum ScreenDataState {
	Unloaded = 0,
	Ready,
	Active,
	Done
}

export type PhosphorDialogType = 'alert' | 'dialog' | 'confirm';
export type PhosphorScreenType = 'screen' | 'static';
export type PhosphorVariableType = number | boolean | string;
export type PhosphorVariableAction = 'set' | 'toggle' | 'increment' | 'decrement' | 'concatenate';

export type TextOptions = {
	speed?: number; // the delay between characters appearing
	isPassword?: boolean; // replaces rendered characters with asterisks
	playSound?: boolean; // whether to play or disable the teletext sound
	preserveSpacing?: boolean; // renders spaces as &nbsp; to preserve formatting. This disables word-wrapping.
	bigFont?: string; // use an ascii-art font size for this text block.
	fillWidth?: boolean; // repeat this text to fill the width of the screen
	align?: 'left' | 'center' | 'right'; // text alignment
	padChar?: string; // character to use for padding when aligning text
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
	| JsonCountdown
	| JsonVariable;

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
	allowMetaCommands?: boolean;
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
	allowRegex?: boolean;
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
		rule?: string;
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

type JsonVariable = {
	type: 'variable';
	target: string;
	context: {
		action: PhosphorVariableAction;
		value?: PhosphorVariableType;
		rule?: string;
	};
	onLoad?: boolean;
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
	| PhosphorCountdown
	| PhosphorVariable;

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
	allowRegex: boolean;
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
	allowMetaCommands?: boolean;
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

export type PhosphorVariable = {
	type: 'variable';
	id: string;
	target: string;
	context: {
		action: PhosphorVariableAction;
		value?: PhosphorVariableType;
		rule?: string;
	};
	loadState: ScreenDataState;
	onLoad?: boolean;
};

let d: PhosphorJsonData = {
	metadata: {
		title: 'The Haunting of Ypsilon-14',
		author: '@redhg, @tom',
		comment:
			"Phosphor content file for the 'Haunting of Ypsilon-14' module for the Mothership tabletop roleplaying game. Visit https://redhg.com/ypsilon14/ to see the compiled application.",
		version: '0.6.0'
	},
	config: {
		name: 'YPSILON-14',
		speed: 1,
		footer: '(c) 2154 ISHIYAMA Heavy Industries Ltd. All rights reserved.',
		minWidth: 60,
		maxWidth: 80
	},
	variables: [
		{
			id: 'counter',
			type: 'number',
			default: 0
		},
		{
			id: 'username',
			type: 'string',
			default: ''
		},
		{
			id: 'password',
			type: 'string',
			default: ''
		},
		{
			id: 'ship',
			type: 'string',
			default: 'LFC 2FAST2FURIOUS'
		},
		{
			id: 'airlocksrepaired',
			type: 'boolean',
			default: false
		},
		{
			id: 'incidentreport',
			type: 'string',
			default: ''
		}
	],
	screens: [
		{
			id: 'home',
			type: 'screen',
			content: [
				{
					type: 'text',
					text: ' Low-power mode ',
					textOpts: { align: 'center', padChar: '=' }
				},
				'',
				'Type ON to power-on terminal',
				'',
				{
					type: 'link',
					text: '> ON',
					target: 'eula'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: ['on', 'start', 'power on', 'poweron'],
							action: {
								type: 'link',
								target: 'eula'
							}
						},
						{
							command: 'k',
							action: {
								type: 'link',
								target: 'incidents'
							}
						}
					]
				},
				'',
				{
					type: 'text',
					text: ' Low-power mode ',
					textOpts: { align: 'center', padChar: '=' }
				}
			]
		},
		{
			id: 'eula',
			type: 'screen',
			content: [
				{
					type: 'text',
					textOpts: { fillWidth: true },
					text: '=~'
				},
				{
					type: 'text',
					text: 'ISHIYAMA',
					textOpts: { bigFont: 'slant', preserveSpacing: true, align: 'center' }
				},
				{
					type: 'text',
					textOpts: { fillWidth: true },
					text: '=~'
				},
				'',
				' ISHIYAMA DYNAMICS LTD (R) 2176',
				' HEURISTICALLY ENCRYPTED REAL-TIME OPERATING SYSTEM (R)',
				'',
				{ type: 'text', text: '-', textOpts: { fillWidth: true } },
				'',
				' H.E.R.O.S. TERMINAL v4.22.7',
				' YOU ARE CONNECTED TO < SERVER 26 > < YPSILON-14 STATION >',
				' SYSTEM ADMINISTRATOR INTEGRATED MESSAGE SYSTEM: [ ACTIVE ]',
				' SYSTEM ADMINISTRATOR (SYSADM): YUTA NAKAMURA',
				'',
				{ type: 'text', text: '-', textOpts: { fillWidth: true } },
				'',
				' (C) 2154 ISHIYAMA DYNAMICS LTD. ALL RIGHTS RESERVED.',
				'',
				{
					text: '> Type ACCEPT to agree with EULA & log in',
					type: 'link',
					target: 'menu'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: ['accept', 'login'],
							action: [
								{
									type: 'variable',
									target: 'username',
									context: {
										action: 'set',
										value: ''
									}
								},
								{
									type: 'link',
									target: 'menu'
								}
							]
						},
						{
							command: ['back', 'logout', 'exit', 'quit', 'off', 'power off'],
							action: {
								type: 'link',
								target: 'home'
							}
						}
					]
				}
			]
		},
		{
			id: 'menu',
			type: 'screen',
			content: [
				{ type: 'text', textOpts: { fillWidth: true }, text: '=' },
				'',
				{
					type: 'text',
					textOpts: { align: 'center' },
					text: 'YPSILON-14 Control Terminal'
				},
				{ type: 'text', textOpts: { align: 'center' }, text: 'Main Menu' },
				'',
				{ type: 'text', textOpts: { fillWidth: true }, text: '=' },
				'',
				'Please make a selection from the following options',
				'',
				{
					text: '> [ STATION MAP ]',
					type: 'link',
					target: 'map'
				},
				{
					text: '> [ DIAGNOSTICS ]',
					type: 'link',
					target: 'diagnostics'
				},
				{
					text: '> [ DOCKING BAY LOG ]',
					type: 'link',
					target: 'schedule'
				},
				{
					text: '> [ PERSONNELE ]',
					type: 'link',
					target: 'roster'
				},
				{
					text: '> [ COMMS ]',
					type: 'link',
					target: 'comms'
				},
				{
					text: '> [ INCIDENT REPORTING ]',
					type: 'link',
					target: 'incidents'
				},
				{
					text: '> [ CONTROLS ]',
					type: 'link',
					actions: {
						base: {
							type: 'condition',
							condition: {
								op: '=',
								left: { type: 'variable', target: 'username' },
								right: { type: 'value', value: 'sonya' },
								caseInsensitive: true
							},
							true: {
								type: 'link',
								target: 'controlsadmin'
							},
							false: {
								type: 'link',
								target: 'controls'
							}
						},
						shiftKey: {
							type: 'variable',
							target: 'username',
							context: {
								action: 'set',
								value: 'sonya'
							}
						}
					}
				},
				'',
				{
					text: '< QUIT',
					type: 'link',
					target: 'eula'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: ['map', 'station map'],
							action: {
								type: 'link',
								target: 'map'
							}
						},
						{
							command: ['diagnostics'],
							action: {
								type: 'link',
								target: 'diagnostics'
							}
						},
						{
							command: ['schedule', 'docking bay log', 'docking log', 'docking'],
							action: {
								type: 'link',
								target: 'schedule'
							},
							allowRegex: true
						},
						{
							command: ['roster', 'personnele'],
							action: {
								type: 'link',
								target: 'roster'
							}
						},
						{
							command: 'comms',
							action: {
								type: 'link',
								target: 'comms'
							}
						},
						{
							command: 'controls',
							action: {
								type: 'condition',
								condition: {
									op: '=',
									left: { type: 'variable', target: 'username' },
									right: { type: 'value', value: 'sonya' },
									caseInsensitive: true
								},
								true: {
									type: 'link',
									target: 'controlsadmin'
								},
								false: {
									type: 'link',
									target: 'controls'
								}
							}
						},
						{
							command: ['incident', 'incidents', 'incident reporting'],
							action: {
								type: 'link',
								target: 'incidents'
							}
						},
						{
							command: ['quit', 'exit', 'logout', 'back'],
							action: {
								type: 'link',
								target: 'eula'
							}
						}
					]
				}
			]
		},
		{
			id: 'map',
			type: 'screen',
			content: [
				'Station Map',
				'===========',
				'',
				{
					type: 'bitmap',
					src: 'https://i.imgur.com/htHuumj.png',
					className: 'lighten'
				},
				'',
				{
					text: '> [ SAVE ]',
					type: 'link',
					target: [
						{
							target: 'saveimage',
							type: 'dialog',
							shiftKey: true
						}
					]
				},
				'',
				{
					text: '< BACK',
					type: 'link',
					target: 'menu'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						},
						{
							command: 'save',
							action: {
								type: 'dialog',
								target: 'saveimage'
							}
						}
					]
				}
			]
		},
		{
			id: 'diagnostics',
			type: 'screen',
			content: [
				{
					type: 'text',
					text: 'Diagnostics',
					onLoad: false
				},
				'===========',
				'',
				'Checking life support:',
				{
					type: 'text',
					text: '................',
					textOpts: { speed: 100 }
				},
				{
					text: '[OK]',
					className: 'ok',
					type: 'text'
				},
				'',
				'Checking main systems:',
				{
					type: 'text',
					text: '................',
					textOpts: { speed: 100 }
				},
				{
					text: '[OK]',
					className: 'ok',
					type: 'text'
				},
				'',
				{
					text: 'WARNING: Airflow 82.4%. Check crew quarters vents for blockage.',
					className: 'alert',
					type: 'text'
				},
				{
					text: 'WARNING: Shower #5 non-functional as of 1 day(s).',
					className: 'alert',
					type: 'text'
				},
				'',
				{
					text: 'NOTICE: Air filters replaced 455 day(s) ago.',
					className: 'warn',
					type: 'text'
				},
				{
					text: 'NOTICE: Mineshaft lift maintained 455 day(s) ago.',
					className: 'warn',
					type: 'text'
				},

				'',
				'===========',
				'',
				'SUMMARY:',
				'All systems operating within acceptable parameters.',
				'',
				'===========',
				'',
				{
					text: '< BACK',
					type: 'link',
					target: 'menu'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						}
					]
				}
			]
		},
		{
			id: 'schedule',
			type: 'screen',
			content: [
				'DOCKING BAY LOG',
				'===============',
				'',
				'Docking bay activity (past 6 months):',
				'',
				'    TIMESTAMP         Bay     Action    Ship',
				' 1: 2366-06-12.0633 - Bay 2 : Arrive :: {{ship}} (DOCKED)',
				' 2: 2366-04-29.0834 - Bay 1 : Arrive :: RSV Heracles (DOCKED)',
				' 3: 2366-02-22.1223 - Bay 2 : Depart :: CTV HORN OV PLENTY',
				' 4: 2366-02-20.1604 - Bay 2 : Arrive :: CTV HORN OV PLENTY',
				' 5: 2366-02-01.0633 - Bay 2 : Depart :: MV VASQUEZ XV',
				' 6: 2366-01-30.0834 - Bay 2 : Arrive :: MV VASQUEZ XV',
				' 7: 2365-12-22.1223 - Bay 2 : Depart :: CTV HORN OV PLENTY',
				' 8: 2365-12-20.1604 - Bay 2 : Arrive :: CTV HORN OV PLENTY',
				' 9: 2365-11-11.1223 - Bay 2 : Depart :: MV VASQUEZ XV',
				'10: 2365-11-10.1604 - Bay 2 : Arrive :: MV VASQUEZ XV',
				'',
				'> [ MORE ]',
				'< BACK',
				'',
				'======',
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						},
						{
							command: 'more',
							action: {
								type: 'dialog',
								target: 'nomorerecords'
							}
						}
					]
				}
			]
		},
		{
			id: 'roster',
			type: 'screen',
			content: [
				'PERSONNELE',
				'==========',
				'',
				'01. VERHOEVEN, Sonya     :: Admin',
				'02. SINGH, Ashraf        :: Breaker',
				'03. DE BEERS, Dana       :: Lead drill',
				'04. CHATZKEL, Jerome     :: Asst. drill',
				'05. TOBIN, Rosa          :: Engineer',
				'06. RADIMIR, Mikhail     :: Lead Engineer',
				'07. KANTARO, Kenji       :: Loader',
				'08. BOWE, Morgan         :: Loader',
				'09. NEKTARIOS, Ri        :: Loader',
				'10. n/a',
				'',
				'======',
				'',
				{
					type: 'link',
					text: '< BACK',
					target: 'menu'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						},
						{
							command: ['verhoeven', 'sonya', 'personnel 1', 'person 1', '1', '01'],
							action: {
								type: 'link',
								target: 'person1'
							}
						},
						{
							command: ['ashraf', 'singh', 'personnel 2', 'person 2', '2', '02'],
							action: [
								{
									type: 'variable',
									target: 'personname',
									context: { action: 'set', value: 'Ashraf Singh' }
								},
								{
									type: 'variable',
									target: 'personrole',
									context: { action: 'set', value: 'Breaker' }
								},
								{
									type: 'variable',
									target: 'personage',
									context: { action: 'set', value: '29' }
								},
								{
									type: 'variable',
									target: 'personspec',
									context: { action: 'set', value: 'Explosives Specialist' }
								},
								{
									type: 'variable',
									target: 'persondate',
									context: { action: 'set', value: '2364-05-16' }
								},
								{
									type: 'variable',
									target: 'personnotes1',
									context: { action: 'set', value: 'Expert in controlled demolitions.' }
								},
								{
									type: 'variable',
									target: 'personnotes2',
									context: { action: 'set', value: 'Short stature. Somewhat naive.' }
								},
								{
									type: 'link',
									target: 'persondetail'
								}
							]
						},
						{
							command: [
								'personnel (3|4|5|6|7|8|9|10)',
								'person (3|4|5|6|7|8|9|10)',
								'[3-9]|10|03|04|05|06|07|08|09'
							],
							action: {
								type: 'dialog',
								target: 'corruptrecords'
							},
							allowRegex: true
						}
					]
				}
			]
		},
		{
			id: 'person1',
			type: 'screen',
			content: [
				'PERSONNEL DETAIL',
				'================',
				'',
				'NAME:           Sonya Verhoeven',
				'ROLE:           Administrator',
				'AGE:            34',
				'SPECIALISATION: Station Management',
				'EMPLOYED SINCE: 2362-11-04',
				'NOTES:          Experienced in station logistics and personnel management.',
				'                Known to be strict but fair.',
				'',
				'======',
				{
					type: 'void',
					src: 'https://i.imgur.com/ltd9v7C.png',
					className: 'lighten'
				},
				{
					type: 'link',
					text: '< BACK',
					target: 'roster'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'roster'
							}
						}
					]
				}
			]
		},
		{
			id: 'persondetail',
			type: 'screen',
			content: [
				'PERSONNEL DETAIL',
				'================',
				'',
				'NAME:           {{personname}}',
				'ROLE:           {{personrole}}',
				'AGE:            {{personage}}',
				'SPECIALISATION: {{personspec}}',
				'EMPLOYED SINCE: {{persondate}}',
				'NOTES:          {{personnotes1}}',
				'                {{personnotes2}}',
				'',
				'======',
				{
					type: 'void',
					src: 'https://i.imgur.com/ltd9v7C.png',
					className: 'lighten'
				},
				{
					type: 'link',
					text: '< BACK',
					target: 'roster'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'roster'
							}
						}
					]
				}
			]
		},
		{
			id: 'comms',
			type: 'screen',
			content: [
				'COMMS',
				'=====',
				'',
				'Initialising long-range scanners',
				{
					type: 'text',
					text: '...........',
					textOpts: { speed: 100 }
				},
				'Scanning for nearby vessels:',
				{
					type: 'text',
					text: '...........',
					textOpts: { speed: 100 }
				},
				'2 vessels detected in proximity.',
				'',
				{
					text: '> HAIL {{ship}}',
					target: 'hailtempest',
					type: 'link'
				},
				{
					text: '> HAIL HERECLES',
					target: 'hailherecles',
					type: 'link'
				},
				'',
				'======',
				'',
				{
					type: 'link',
					text: '< BACK',
					target: 'menu'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						},
						{
							command: ['hail lfc 2fast2furious', 'hail 2fast2furious'],
							action: {
								type: 'link',
								target: 'hailtempest'
							}
						},
						{
							command: ['hail herecles', 'herecles'],
							action: {
								type: 'link',
								target: 'hailherecles'
							}
						}
					]
				}
			]
		},
		{
			id: 'hailtempest',
			type: 'screen',
			content: [
				'Transmitting',
				'============',
				'',
				{
					type: 'text',
					text: '..........................................',
					textOpts: { speed: 100 }
				},
				{
					type: 'text',
					text: '..........................................',
					textOpts: { speed: 100 }
				},
				'',
				{
					type: 'text',
					text: 'COMMUNICATION CHANNEL OPENED',
					className: 'ok blink'
				},

				'',
				'============',
				'',
				{
					text: '< CLOSE CHANNEL',
					target: 'comms',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'send .+',
							action: {
								type: 'dialog',
								target: 'messengeSent'
							}
						},
						{
							command: ['close', 'close channel', 'back'],
							action: {
								type: 'link',
								target: 'comms'
							}
						}
					]
				}
			]
		},
		{
			id: 'hailherecles',
			type: 'screen',
			content: [
				'Transmitting',
				'============',
				'',
				{
					type: 'text',
					text: '..........................................',
					textOpts: { speed: 100 }
				},
				{
					type: 'text',
					text: '..........................................',
					textOpts: { speed: 100 }
				},
				'',
				{
					type: 'text',
					className: 'alert blink',
					text: 'NO RESPONSE'
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					target: 'comms',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: ['close', 'close channel', 'back'],
							action: {
								type: 'link',
								target: 'comms'
							}
						}
					]
				}
			]
		},
		{
			id: 'incidents',
			type: 'screen',
			content: [
				'INCIDENT REPORTING',
				'==================',
				'',
				'LOG:',
				{
					type: 'text',
					text: '{{incidentreport}}',
					textOpts: { preserveSpacing: false }
				},
				'2366-06-10: REPORT #4572 :: Crew member Mikhail Radimir reported a malfunctioning airlock in the hydroponics lab. Maintenance scheduled.',
				'2366-05-22: REPORT #4531 :: Unauthorized access attempt detected in docking bay 2. Security footage reviewed; no further action required.',
				'2366-05-15: REPORT #4510 :: Minor fire in crew quarters kitchen extinguished. No injuries reported. Fire safety protocols reviewed with staff.',
				'2366-04-30: REPORT #4487 :: Supply shipment delayed due to meteor shower. Estimated arrival time updated.',
				'',
				{
					text: '< [ NEW REPORT ]',
					type: 'link',
					actions: {
						base: {
							type: 'condition',
							condition: {
								op: '=',
								left: { type: 'variable', target: 'incidentreport' },
								right: { type: 'value', value: '' },
								caseInsensitive: true
							},
							true: {
								type: 'link',
								target: 'newincident'
							},
							false: {
								type: 'dialog',
								target: 'reportAlreadyLogged'
							}
						}
					}
				},
				'',
				{
					text: '< BACK',
					target: 'menu',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						}
					]
				}
			]
		},
		{
			id: 'newincident',
			type: 'screen',
			content: [
				'NEW INCIDENT REPORT',
				'===================',
				'',
				'Please describe the incident you wish to report below.',
				'',
				{
					type: 'prompt',
					prompt: '2366-06-12: REPORT #4603 :: ',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'incidents'
							}
						},
						{
							command: '.+',
							allowRegex: true,
							action: [
								{
									type: 'variable',
									target: 'incidentreport',
									context: {
										action: 'set'
									}
								},
								{
									type: 'variable',
									target: 'incidentreport',
									context: {
										action: 'concatenate',
										value: '2366-06-12: REPORT #4603 :: ',
										rule: 'pre'
									}
								},
								{
									type: 'dialog',
									target: 'incidentlogged'
								},
								{
									type: 'link',
									target: 'incidents'
								}
							]
						}
					]
				},
				'',
				'===================',
				'',
				{
					text: '< BACK',
					target: 'incidents',
					type: 'link'
				}
			]
		},
		{
			id: 'controls',
			type: 'screen',
			content: [
				'Controls',
				'========',
				'',
				'[A] :: Administrator access only',
				'Any unauthorised access will be logged and reported.',
				'',
				{
					text: '    > [ SHOWERS ]',
					target: 'showers',
					type: 'link'
				},
				{
					text: '    > [ HYDROPONICS LAB ]',
					target: 'greenhouse',
					type: 'link'
				},
				{
					text: '[A] > [ AIRLOCKS ]',
					type: 'link',
					target: [
						{
							target: 'lockedDialog',
							type: 'dialog',
							shiftKey: false
						},
						{
							target: 'airlocks',
							type: 'link',
							shiftKey: true
						}
					]
				},
				{
					text: '[A] > [ SYSTEM ]',
					type: 'link',
					target: [
						{
							target: 'lockedDialog',
							type: 'dialog',
							shiftKey: false
						},
						{
							target: 'system',
							type: 'link',
							shiftKey: true
						}
					]
				},
				'',
				{
					text: '[A] > [ LOGIN ]',
					type: 'link',
					target: 'loginscreen'
				},
				'',
				{
					text: '< BACK',
					target: 'menu',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						},
						{
							command: 'showers',
							action: {
								type: 'link',
								target: 'showers'
							}
						},
						{
							command: ['hydroponics lab', 'lab', 'hydroponics'],
							action: {
								type: 'link',
								target: 'greenhouse'
							}
						},
						{
							command: ['airlocks', 'airlock'],
							action: {
								type: 'dialog',
								target: 'lockedDialog'
							}
						},
						{
							command: ['system'],
							action: {
								type: 'dialog',
								target: 'lockedDialog'
							}
						},
						{
							command: ['login'],
							action: {
								type: 'link',
								target: 'loginscreen'
							}
						}
					]
				}
			]
		},
		{
			id: 'loginscreen',
			type: 'screen',
			content: [
				'Admin Login',
				'===========',
				'',
				'Enter username below, or BACK to return.',
				'',
				{
					text: '< BACK',
					target: 'controls',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					prompt: 'USERNAME: ',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'controls'
							}
						},
						{
							command: '[^\\s]+',
							allowRegex: true,
							action: [
								{
									type: 'variable',
									target: 'username',
									context: {
										action: 'set'
									}
								},
								{
									type: 'link',
									target: 'passwordscreen'
								}
							]
						}
					]
				}
			]
		},
		{
			id: 'passwordscreen',
			type: 'screen',
			content: [
				'Admin Login',
				'===========',
				'',
				'Enter password below, or BACK to return.',
				'',
				'USERNAME: {{username}}',
				'',
				{
					type: 'prompt',
					prompt: 'PASSWORD: ',
					textOpts: { isPassword: true },
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'controls'
							}
						},
						{
							command: '.+',
							allowRegex: true,
							action: [
								{
									type: 'variable',
									target: 'password',
									context: {
										action: 'set'
									}
								},
								{
									type: 'condition',
									condition: {
										and: [
											{
												op: '=',
												left: { type: 'variable', target: 'username' },
												right: { type: 'value', value: 'sonya' },
												caseInsensitive: true
											},
											{
												op: '=',
												left: { type: 'variable', target: 'password' },
												right: { type: 'value', value: 'password' },
												caseInsensitive: false
											}
										]
									},
									true: [
										{
											type: 'dialog',
											target: 'correctPassword'
										},
										{
											type: 'link',
											target: 'controlsadmin'
										}
									],
									false: [
										{
											type: 'dialog',
											target: 'invalidPassword'
										},
										{
											type: 'link',
											target: 'controls'
										}
									]
								}
							]
						}
					]
				}
			]
		},
		{
			id: 'controlsadmin',
			type: 'screen',
			content: [
				'Controls',
				'========',
				'',
				'Welome, {{username}}',
				'',
				{
					text: '    > [ SHOWERS ]',
					target: 'showers',
					type: 'link'
				},
				{
					text: '    > [ HYDROPONICS LAB ]',
					target: 'greenhouse',
					type: 'link'
				},
				{
					text: '[A] > [ AIRLOCKS ]',
					type: 'link',
					actions: {
						base: {
							type: 'condition',
							condition: {
								op: '=',
								left: { type: 'variable', target: 'airlocksrepaired' },
								right: { type: 'value', value: true }
							},
							true: {
								type: 'link',
								target: 'airlocksrepaired'
							},
							false: {
								type: 'link',
								target: 'airlocks'
							}
						}
					}
				},
				{
					text: '[A] > [ SYSTEM ]',
					type: 'link',
					target: 'system'
				},
				'',
				{
					text: '< BACK',
					target: 'menu',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'menu'
							}
						},
						{
							command: 'showers',
							action: {
								type: 'link',
								target: 'showers'
							}
						},
						{
							command: ['hydroponics lab', 'lab', 'hydroponics'],
							action: {
								type: 'link',
								target: 'greenhouse'
							}
						},
						{
							command: ['airlocks', 'airlock'],
							action: {
								type: 'condition',
								condition: {
									op: '=',
									left: { type: 'variable', target: 'airlocksrepaired' },
									right: { type: 'value', value: true }
								},
								true: {
									type: 'link',
									target: 'airlocksrepaired'
								},
								false: {
									type: 'link',
									target: 'airlocks'
								}
							}
						},
						{
							command: ['system'],
							action: {
								type: 'link',
								target: 'system'
							}
						},
						{
							command: ['logout'],
							action: [
								{
									type: 'variable',
									target: 'username',
									context: {
										action: 'set',
										value: ''
									}
								},
								{
									type: 'link',
									target: 'menu'
								}
							]
						},
						{
							command: ['***'],
							action: {
								type: 'variable',
								target: 'airlocksrepaired',
								context: {
									action: 'set',
									value: true
								}
							},
							allowRegex: false
						}
					],
					allowMetaCommands: true
				}
			]
		},
		{
			id: 'airlocks',
			type: 'screen',
			content: [
				'Airlocks',
				'========',
				'',
				{
					type: 'link',
					text: '> DOCKING BAY 1 :: LOCKED — ERROR',
					className: 'alert',
					target: [
						{
							target: 'airlockError',
							type: 'dialog',
							shiftKey: false
						}
					]
				},
				{
					type: 'toggle',
					id: 'airlock2',
					states: [
						{
							text: '> DOCKING BAY 2 :: UNLOCKED',
							active: true,
							delayMs: 5000,
							delayText: '> LOCKING DOCKING BAY 2 AIRLOCK %'
						},
						{
							text: '> DOCKING BAY 2 :: LOCKED',
							active: false,
							delayMs: 5000,
							delayText: '> UNLOCKING DOCKING BAY 2 AIRLOCK %'
						}
					]
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					target: 'controlsadmin',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'controlsadmin'
							}
						},
						{
							command: [
								'dockingbay1',
								'docking bay 1',
								'lock docking bay 1',
								'unlock docking bay 1',
								'airlock1',
								'airlock 1',
								'lock airlock 1',
								'unlock airlock 1'
							],
							action: {
								type: 'dialog',
								target: 'airlockError'
							}
						},
						{
							command: [
								'dockingbay2',
								'docking bay 2',
								'lock docking bay 2',
								'unlock docking bay 2',
								'airlock2',
								'airlock 2',
								'lock airlock 2',
								'unlock airlock 2'
							],
							action: {
								type: 'toggle',
								target: 'airlock2'
							}
						}
					]
				}
			]
		},
		{
			id: 'airlocksrepaired',
			type: 'screen',
			content: [
				'Airlocks',
				'========',
				'',
				{
					type: 'toggle',
					id: 'airlock1',
					states: [
						{
							text: '> DOCKING BAY 1 :: UNLOCKED',
							active: false,
							delayMs: 5000,
							delayText: '> LOCKING DOCKING BAY 1 AIRLOCK %'
						},
						{
							text: '> DOCKING BAY 1 :: LOCKED',
							active: true,
							delayMs: 5000,
							delayText: '> UNLOCKING DOCKING BAY 1 AIRLOCK %'
						}
					]
				},
				{
					type: 'toggle',
					id: 'airlock2',
					states: [
						{
							text: '> DOCKING BAY 2 :: UNLOCKED',
							active: true,
							delayMs: 5000,
							delayText: '> LOCKING DOCKING BAY 2 AIRLOCK %'
						},
						{
							text: '> DOCKING BAY 2 :: LOCKED',
							active: false,
							delayMs: 5000,
							delayText: '> UNLOCKING DOCKING BAY 2 AIRLOCK %'
						}
					]
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					target: 'controlsadmin',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'controlsadmin'
							}
						},
						{
							command: [
								'dockingbay1',
								'docking bay 1',
								'lock docking bay 1',
								'unlock docking bay 1',
								'airlock1',
								'airlock 1',
								'lock airlock 1',
								'unlock airlock 1'
							],
							action: {
								type: 'toggle',
								target: 'airlock1'
							}
						},
						{
							command: [
								'dockingbay2',
								'docking bay 2',
								'lock docking bay 2',
								'unlock docking bay 2',
								'airlock2',
								'airlock 2',
								'lock airlock 2',
								'unlock airlock 2'
							],
							action: {
								type: 'toggle',
								target: 'airlock2'
							}
						}
					]
				}
			]
		},
		{
			id: 'showers',
			type: 'screen',
			content: [
				'Showers',
				'=======',
				'',
				{
					id: 'shower1',
					type: 'toggle',
					states: [
						{
							text: '> SHOWER 1 :: OFF',
							active: true
						},
						{
							text: '> SHOWER 1 :: ON',
							active: false
						}
					]
				},
				{
					id: 'shower2',
					type: 'toggle',
					states: [
						{
							text: '> SHOWER 2 :: OFF',
							active: true
						},
						{
							text: '> SHOWER 2 :: ON',
							active: false
						}
					]
				},
				{
					id: 'shower3',
					type: 'toggle',
					states: [
						{
							text: '> SHOWER 3 :: OFF',
							active: true
						},
						{
							text: '> SHOWER 3 :: ON',
							active: false
						}
					]
				},
				{
					id: 'shower4',
					type: 'toggle',
					states: [
						{
							text: '> SHOWER 4 :: OFF',
							active: true
						},
						{
							text: '> SHOWER 4 :: ON',
							active: false
						}
					]
				},
				{
					type: 'text',
					className: 'alert',
					text: '> SHOWER 5 :: MALFUNCTIONING'
				},
				{
					id: 'shower6',
					type: 'toggle',
					states: [
						{
							text: '> SHOWER 6 :: OFF',
							active: true
						},
						{
							text: '> SHOWER 6 :: ON',
							active: false
						}
					]
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					type: 'link',
					actions: {
						base: {
							type: 'condition',
							condition: {
								op: '=',
								left: { type: 'variable', target: 'username' },
								right: { type: 'value', value: 'sonya' },
								caseInsensitive: true
							},
							true: {
								target: 'controlsadmin',
								type: 'link'
							},
							false: {
								target: 'controls',
								type: 'link'
							}
						}
					}
				},
				'',
				'======',
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'condition',
								condition: {
									op: '=',
									left: { type: 'variable', target: 'username' },
									right: { type: 'value', value: 'sonya' },
									caseInsensitive: true
								},
								true: {
									target: 'controlsadmin',
									type: 'link'
								},
								false: {
									target: 'controls',
									type: 'link'
								}
							}
						},
						{
							command: ['shower 1'],
							action: {
								type: 'toggle',
								target: 'shower1'
							}
						},
						{
							command: ['shower 2'],
							action: {
								type: 'toggle',
								target: 'shower2'
							}
						},
						{
							command: ['shower 3'],
							action: {
								type: 'toggle',
								target: 'shower3'
							}
						},
						{
							command: ['shower 4'],
							action: {
								type: 'toggle',
								target: 'shower4'
							}
						},
						{
							command: ['shower 6'],
							action: {
								type: 'toggle',
								target: 'shower6'
							}
						}
					]
				}
			]
		},
		{
			id: 'greenhouse',
			type: 'screen',
			content: [
				'Hydroponics Lab',
				'===============',
				'',
				{
					type: 'toggle',
					id: 'mist',
					states: [
						{
							text: '> MIST HYDRATION SYSTEM :: OFF',
							active: true,
							delayMs: 2000,
							delayText: '> TURNING ON MIST HYDRATION SYSTEM %'
						},
						{
							text: '> MIST HYDRATION SYSTEM :: ON',
							active: false,
							delayMs: 2000,
							delayText: '> TURNING OFF MIST HYDRATION SYSTEM %'
						}
					]
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					type: 'link',
					actions: {
						base: {
							type: 'condition',
							condition: {
								op: '=',
								left: { type: 'variable', target: 'username' },
								right: { type: 'value', value: 'sonya' },
								caseInsensitive: true
							},
							true: {
								target: 'controlsadmin',
								type: 'link'
							},
							false: {
								target: 'controls',
								type: 'link'
							}
						}
					}
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'condition',
								condition: {
									op: '=',
									left: { type: 'variable', target: 'username' },
									right: { type: 'value', value: 'sonya' },
									caseInsensitive: true
								},
								true: {
									target: 'controlsadmin',
									type: 'link'
								},
								false: {
									target: 'controls',
									type: 'link'
								}
							}
						},
						{
							command: ['mist hydration system', 'mist'],
							action: {
								type: 'toggle',
								target: 'mist'
							}
						}
					]
				}
			]
		},
		{
			id: 'system',
			type: 'screen',
			content: [
				'System',
				'======',
				'',
				{
					text: '> LIFE SUPPORT',
					target: 'lifesupport',
					type: 'link'
				},
				{
					text: '> SELF-DESTRUCT',
					target: 'selfdestruct',
					type: 'link'
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					target: 'controlsadmin',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'controlsadmin'
							}
						},
						{
							command: ['lifesupport', 'life support'],
							action: {
								type: 'link',
								target: 'lifesupport'
							}
						},
						{
							command: ['selfdestruct', 'self destruct'],
							action: {
								type: 'link',
								target: 'selfdestruct'
							}
						}
					]
				}
			]
		},
		{
			id: 'lifesupport',
			type: 'screen',
			content: [
				'Life Support',
				'============',
				'',
				{ text: '=', type: 'text', textOpts: { fillWidth: true }, className: 'alert' },
				{
					type: 'text',
					className: 'alert',
					text: ' WARNING ',
					textOpts: { align: 'center', padChar: '=' }
				},
				{ text: '=', type: 'text', textOpts: { fillWidth: true }, className: 'alert' },
				'',
				{
					type: 'text',
					className: 'alert',
					text: 'Disabling life support without the proper authorisation or without following the appropriate safety protocols is in direct violation of company policy #2778-A.'
				},
				{
					type: 'void',
					className: 'alert',
					text: 'following the appropriate safety protocols is in direct violation '
				},
				{
					type: 'void',
					className: 'alert',
					text: 'of company policy #2778-A.'
				},
				'',
				{
					type: 'text',
					className: 'alert',
					text: 'ISHIYAMA HEAVY INDUSTRIES assumes no responsibilities or liabilities resulting from the improper use of this feature.'
				},
				{
					type: 'void',
					className: 'alert',
					text: 'from the improper use of this feature.'
				},
				'',
				{
					type: 'toggle',
					id: 'lifesupport',
					states: [
						{
							text: '> LIFE SUPPORT :: ENABLED',
							active: true,
							delayMs: 5000,
							delayText: '> DISABLING LIFE SUPPORT SYSTEMS %'
						},
						{
							text: '> LIFE SUPPORT :: DISABLED',
							active: false,
							delayMs: 5000,
							delayText: '> ENABLING LIFE SUPPORT SYSTEMS %'
						}
					]
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					target: 'system',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'system'
							}
						},
						{
							command: ['toggle life support', 'life support', 'toggle lifesupport', 'lifesupport'],
							action: {
								type: 'toggle',
								target: 'lifesupport'
							}
						}
					]
				}
			]
		},
		{
			id: 'selfdestruct',
			type: 'screen',
			content: [
				'Self-Destruct',
				'=============',
				'',
				{ text: '=', type: 'text', textOpts: { fillWidth: true }, className: 'alert' },
				{
					type: 'text',
					className: 'alert',
					text: ' WARNING ',
					textOpts: { align: 'center', padChar: '=' }
				},
				{ text: '=', type: 'text', textOpts: { fillWidth: true }, className: 'alert' },
				'',
				{
					type: 'text',
					className: 'alert',
					text: 'Destruction of corporate property is a violation of company policy #2778-A. ISHIYAMA DYNAMICS assumes no responsibilities or liabilities resulting from the improper use of this feature'
				},
				{
					type: 'void',
					className: 'alert',
					text: ''
				},
				{
					type: 'void',
					className: 'alert',
					text: 'from the improper use of this feature.'
				},
				'',
				{
					text: '> ACTIVATE SELF-DESTRUCT',
					target: 'activateselfdestruct',
					type: 'link'
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					target: 'system',
					type: 'link'
				},
				'',
				{
					type: 'prompt',
					commands: [
						{
							command: 'back',
							action: {
								type: 'link',
								target: 'system'
							}
						},
						{
							command: [
								'activate self destruct',
								'self destruct',
								'activate',
								'activate self-destruct'
							],
							action: {
								type: 'link',
								target: 'activateselfdestruct'
							}
						}
					]
				}
			]
		},
		{
			id: 'activateselfdestruct',
			type: 'screen',
			content: [
				'Activate Self-Destruct',
				'======================',
				'',
				{
					type: 'text',
					className: 'alert',
					text: 'THIS WILL INITIATE A 10-MINUTE STATION SELF-DESTRUCT SEQUENCE.'
				},
				'',
				{
					type: 'text',
					className: 'alert',
					text: 'THIS CANNOT BE UNDONE.'
				},
				'',
				{
					type: 'text',
					className: 'alert',
					text: 'FOR SECURITY REASONS, A PASSPHRASE HAS BEEN GENERATED. PLEASE ENTER THE FOLLOWING PASSPHRASE TO CONTINUE.'
				},
				{
					type: 'variable',
					target: 'passphrase',
					context: {
						action: 'set',
						rule: 'EEEE-EEEE-EEEE-EEEE'
					}
				},
				'',
				{
					type: 'text',
					className: 'alert',
					text: '{{passphrase}}',
					textOpts: { align: 'center' }
				},
				'',
				{
					type: 'prompt',
					prompt: 'TYPE PASSPHRASE TO BEGIN COUNTDOWN: ',
					className: 'alert cursor',
					commands: [
						{
							command: 'ok',
							action: {
								type: 'link',
								target: 'evacuate'
							}
						},
						{
							command: '.+',
							allowRegex: true,
							action: {
								type: 'condition',
								condition: {
									op: '=',
									left: { type: 'variable', target: 'passphrase' },
									right: { type: 'variable', target: '_lastCommand' },
									caseInsensitive: true
								},
								true: {
									type: 'link',
									target: 'evacuate'
								},
								false: [
									{
										type: 'dialog',
										target: 'invalidPassword'
									},
									{
										type: 'link',
										target: 'system'
									}
								]
							}
						}
					]
				},
				'',
				'======',
				'',
				{
					text: '< BACK',
					target: 'selfdestruct',
					type: 'link'
				}
			]
		},
		{
			id: 'evacuate',
			type: 'screen',
			content: [
				{
					type: 'text',
					className: 'alert',
					text: 'SELF-DESTRUCT SEQUENCE INITIATED.'
				},
				{
					type: 'text',
					className: 'alert',
					text: 'PLEASE EVACUATE AS SOON AS POSSIBLE.'
				},
				'',
				{
					type: 'countdown',
					className: 'alert',
					prompt: 'T-MINUS ',
					duration: 600,
					textOpts: { align: 'center' }
				}
			]
		}
	],
	dialogs: [
		{
			id: 'lockedDialog',
			type: 'alert',
			content: ['Error! Authorization required.']
		},
		{
			id: 'airlockError',
			type: 'alert',
			content: [
				'ERROR! Lock override in effect.',
				'',
				'Cannot unlock remotely. Manual intervention required.'
			]
		},
		{
			id: 'saveimage',
			type: 'alert',
			content: [
				'ACTION: Success',
				'',
				'A copy of the station map is available via the data tablet.'
			]
		},
		{
			id: 'messengeSent',
			type: 'alert',
			content: ['ACTION: Success', '', 'Messege sent successfully.']
		},
		{
			id: 'nomorerecords',
			type: 'alert',
			content: ['WARNING', '', 'Additional records archived, unavailable.']
		},
		{
			id: 'corruptrecords',
			type: 'alert',
			content: ['NOTICE', '', 'Personnel records unavailable, data corrupted.']
		},
		{
			id: 'invalidPassword',
			type: 'alert',
			content: ['ERROR', '', 'Invalid password. Access denied.']
		},
		{
			id: 'correctPassword',
			type: 'alert',
			content: ['ACCESS GRANTED', '', 'Welcome, Administrator.']
		},
		{
			id: 'incidentlogged',
			type: 'alert',
			content: [
				'ACTION: Success',
				'',
				'Incident reporting in progress. Please wait 2-4 standard hours for transmission and processing.'
			]
		},
		{
			id: 'reportAlreadyLogged',
			type: 'alert',
			content: ['ERROR', '', 'Incident reporting unavailable, incident transmission in progress.']
		}
	]
};
