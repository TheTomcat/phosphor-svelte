<script lang="ts">
	import { nanoid } from 'nanoid';
	import {
		bigFont,
		debounce,
		extractConfiguration,
		formatText,
		measureMonospaceGrid
	} from '$lib/utils';

	import Prompt from './Prompt.svelte';
	import Scanlines from './Scanlines.svelte';
	import Static from './Static.svelte';
	import Text from './Text.svelte';
	import Teletype from './Teletype.svelte';
	import Bitmap from './Bitmap.svelte';

	import type {
		Action,
		Command,
		DisplayOptions,
		JsonCommand,
		LinkAction,
		LinkTarget,
		PhosphorData,
		PhosphorDialog,
		PhosphorDialogType,
		PhosphorJsonData,
		PhosphorJsonScreen,
		PhosphorScreen,
		PhosphorScreenContent,
		PhosphorScreenJsonContent,
		PhosphorToggle,
		SingleAction,
		TextOptions
	} from '$lib/PhosphorData';
	import Modal from './Modal.svelte';

	import { onMount } from 'svelte';
	import Toggle from './Toggle.svelte';
	import Link from './Link.svelte';
	import Countdown from './Countdown.svelte';
	import { figlet } from '$lib/figlet-load';
	import { applyVariableCommand, evaluateCondition, setVar } from '$lib/phosphorVariables.svelte';
	import { preloadAudio } from '$lib/audio-cache';
	import { setTheme } from '$lib/theme.svelte';
	import { page } from '$app/state';

	let { data }: { data: PhosphorJsonData } = $props();

	enum ScreenDataState {
		Unloaded = 0,
		Ready,
		Active,
		Done
	}

	enum AppStatus {
		Unset = 0,
		Ready,
		Active,
		Done
	}
	let containerRef: HTMLElement | null = $state(null);
	const SUPPORTED_FONTS = ['bigmoneyse', 'slant']; //['Big Money-se', 'Slant'];

	// State
	let activeScreenId: string | null = $state(null);
	let activeElementId: string | null = $state(null);
	let activeDialogId: string | null = $state(null);
	let loadingQueue: any[] = $state([]);
	let status: AppStatus = $state(AppStatus.Unset);
	let renderScanlines = $state(true);
	let screenFlicker = $state(true);
	let showFooter = $state(true);

	// Options
	let defaultspeed = $state(5);

	/// Screen width management
	let columns = $state(-1);
	let _columns = $state(-1);
	let minCols = data.config.minWidth || 40;
	const setScreenWidth = () => {
		const grid = measureMonospaceGrid({ container: containerRef });
		columns = Math.max(minCols, grid.cols - 1);
		if (data.config.maxWidth) columns = Math.min(columns, data.config.maxWidth);
		_columns = grid.cols;
		console.log('Screen columns set to:', columns);
	};
	const debouncedSetScreenWidth = debounce(setScreenWidth, 300);

	// Helpers ------------------------------------------------------

	const buildScreen = (src: PhosphorJsonScreen): PhosphorScreen | null => {
		const id = src.id ?? nanoid();
		const type = src.type;
		const content = parseScreenContent(src.content || []).flat();

		if (!id || !type) return null;

		return {
			id,
			type,
			content
		} as PhosphorScreen;
	};
	const parseScreenContent = (content: PhosphorScreenJsonContent[]): PhosphorScreenContent[] => {
		if (!content || !content.length) return [];
		const parsed = content.map((element) => parseScreenContentElement(element)).flat();
		return parsed.map((element) => generateScreenData(element)).filter((el) => el !== undefined);
	};

	const setActiveScreen = (index: number) => {
		if (index < 0 || index >= screens.length) return;
		activeScreenId = screens[index].id;
		const screen = screens[index];
		if (!screen.content.length) return;
		const firstElement = screen.content[0];
		activeElementId = firstElement.id!;
		activateScreen();
	};
	const activateScreen = () => {
		if (!currentScreen) return;
		switch (currentScreen.type) {
			case 'static':
				// all content is rendered at once
				currentScreen.content.forEach((element) => {
					setElementState(element.id, ScreenDataState.Done);
				});
				break;
			case 'screen':
				currentScreen.content[0].loadState = ScreenDataState.Active;
				status = AppStatus.Active;
				activeElementId = currentScreen.content[0].id;
				break;

			default:
				// console.warn('Unknown screen type:', currentScreen.type);
				break;
		}
	};

	function buildDialog(src: PhosphorDialog): PhosphorDialog | null {
		const id = src.id ?? null;
		let content: any[] | null = null;
		if (src.type === 'alert') {
			content = src.content;
		}
		if (!id) return null;
		return { id, type: src.type, content } as PhosphorDialog;
	}

	function parseScreenContentElement(element: any): any {
		if (typeof element === 'string') return element.split('\n');
		if (element.type === 'text' && SUPPORTED_FONTS.includes(element?.textOpts?.bigFont)) {
			// console.log(element.textOpts.bigFont);
			return bigFont(element.text || '', element.textOpts.bigFont)
				.split('\n')
				.map((t) => {
					return {
						...element,
						text: t
					};
				});
		}
		return element;
	}

	const flattenCommands = (commands: JsonCommand[]): Command[] => {
		return commands
			.map((cmd) => {
				if (typeof cmd.command === 'string') {
					return { command: cmd.command, action: cmd.action, allowRegex: cmd?.allowRegex ?? false };
				} else {
					return cmd.command.map((command) => {
						return { command, action: cmd.action, allowRegex: cmd?.allowRegex ?? false };
					});
				}
			})
			.flat();
	};

	const generateScreenData = (element: any): PhosphorScreenContent | undefined => {
		const id = element.id || nanoid();

		// if an element has "load" property, its requires more work
		// to prepare so it's can't yet be considered "ready".
		const onLoad = element.onLoad || null;
		if (onLoad) {
			loadingQueue.push(element.id);
		}

		const loadState = onLoad ? ScreenDataState.Unloaded : ScreenDataState.Ready;

		const textOpts: TextOptions = {
			speed: element?.textOpts?.speed || defaultspeed,
			isPassword: element?.textOpts?.isPassword || false,
			playSound: element?.textOpts?.playSound || true,
			preserveSpacing: element?.textOpts?.preserveSpacing ?? true,
			align: element?.textOpts?.align || 'left',
			bigFont: element?.textOpts?.bigFont || undefined,
			fillWidth: element?.textOpts?.fillWidth || false,
			padChar: element?.textOpts?.padChar || '',
			borderChar: element?.textOpts?.borderChar || '',
			marginChar: element?.textOpts?.marginChar || '',
			fillChar: element?.textOpts?.fillChar || ' ',
			padding: element?.textOpts?.padding || 0,
			margin: element?.textOpts?.margin || 0
		};
		const displayOpts: DisplayOptions = {
			delayAfterMs: element.displayOpts?.delayAfterMs || undefined
		};

		// If the element is a string, create a Text object
		if (typeof element === 'string') {
			return {
				id,
				type: 'text',
				text: element,
				loadState: loadState,
				onLoad,
				textOpts
			};
		}

		// Everything else must be an object with a "type" property
		if (!element.type) {
			return;
		}

		switch (element.type.toLowerCase()) {
			case 'image':
			case 'bitmap':
				return {
					id,
					type: 'bitmap',
					src: element.src || '',
					alt: element.alt || '',
					className: element.className || '',
					loadState: loadState,
					onLoad,
					displayOpts
				};
			case 'text':
				return {
					id,
					type: 'text',
					text: element.text || '',
					className: element.className || '',
					loadState: loadState,
					onLoad,
					textOpts,
					displayOpts
				};
			case 'link':
				if (element.target) {
					if (Array.isArray(element.target)) {
						const linkTargetBase = (element.target as LinkTarget[]).find(
							(e) => e.shiftKey === false
						);
						const linkTargetShift = (element.target as LinkTarget[]).find(
							(e) => e.shiftKey === true
						);
						element.actions = {};
						if (linkTargetBase)
							element.actions.base = { type: linkTargetBase.type, target: linkTargetBase.target };
						if (linkTargetShift)
							element.actions.shiftKey = {
								type: linkTargetShift.type,
								target: linkTargetShift.target
							};
					} else {
						element.actions = { base: { type: 'link', target: element.target } };
					}
				}

				return {
					id,
					type: 'link',
					text: element.text || '',
					// target: element.target || '',
					actions: element.actions || {},
					className: element.className || '',
					loadState: loadState,
					onLoad,
					textOpts,
					displayOpts
				};
			case 'prompt':
				return {
					id,
					type: 'prompt',
					prompt: element.prompt || '$> ',
					commands: flattenCommands(element.commands) || [],
					className: element.className || '',
					loadState: loadState,
					onLoad,
					textOpts,
					allowMetaCommands: element.allowMetaCommands || false,
					displayOpts
					// isPassword: element.isPassword || false
				};
			case 'toggle':
				return {
					id,
					type: 'toggle',
					states: element.states || [],
					className: element.className || '',
					loadState: loadState,
					onLoad,
					textOpts,
					displayOpts
				};
			case 'countdown':
				return {
					id,
					type: 'countdown',
					prompt: element.text || 'T-MINUS ',
					duration: element.duration || 60,
					className: element.className || '',
					loadState: loadState,
					onLoad,
					textOpts,
					displayOpts
				};
			// case 'dialog':
			// 	return {
			// 		id,
			// 		type: 'dialog',
			// 		target: element.target,
			// 		loadState: loadState,
			// 		onLoad
			// 	};
			case 'variable':
				applyVariableCommand({
					id,
					type: 'variable',
					target: element.target,
					context: element.context
				});
				return undefined;
			// {
			// 	id,
			// 	type: 'variable',
			// 	target: element.target,
			// 	context: element.context,
			// 	loadState: loadState,
			// 	onLoad
			// };
			default:
				return undefined;
		}
	};
	const setElementState = (id: string, state: ScreenDataState) => {
		const screen = getScreen(activeScreenId!);
		const content = screen?.content.find((element) => element.id === id);
		if (content && content.loadState !== state) {
			content.loadState = state;
		}
	};

	const getScreen = (id: string): PhosphorScreen | null => {
		return screens.find((scr) => scr.id === id) || null;
	};

	const activateNextScreenData = () => {
		// find the currently active element and, if possible, activate it
		if (!currentScreen) return;
		const activeIndex =
			currentScreen.content.findIndex((e) => e.loadState === ScreenDataState.Active) ?? -1;
		if (activeIndex === -1) {
			return;
		}

		currentScreen.content[activeIndex].loadState = ScreenDataState.Done;
		// console.log($state.snapshot(currentScreen.content[activeIndex]));
		if (activeIndex === currentScreen.content.length - 1) {
			// last element was just completed
			// screen is done
			activeElementId = null;
			status = AppStatus.Done;
			return;
		}

		currentScreen.content[activeIndex + 1].loadState = ScreenDataState.Active;
		activeElementId = currentScreen.content[activeIndex + 1].id;
	};

	// DIALOG MANAGEMENT
	const closeWaiters = new Set<() => void>();
	const toggleDialog = (dialogId?: string) => {
		activeDialogId = dialogId || null;
		if (activeDialogId === null) {
			for (const fn of closeWaiters) fn();
			closeWaiters.clear();
		}
	};
	const awaitDialogClose = (): Promise<void> => {
		if (activeDialogId === null) return Promise.resolve();
		return new Promise<void>((resolve) => {
			const once = () => {
				closeWaiters.delete(once);
				resolve();
			};
			closeWaiters.add(once);
		});
	};
	const showDialogAndWait = (id: string): Promise<void> => {
		toggleDialog(id);
		return awaitDialogClose();
	};

	// TOGGLE MANAGEMENT
	const getScreenIndex = (id: string) => screens.findIndex((s) => s.id === id);
	const toggleToggle = (toggleId: string) => {
		if (!currentScreen) return;
		// find the toggle element by ID and switch its state
		const currentScreenIndex = getScreenIndex(activeScreenId!);
		const toggleElementIndex = currentScreen.content.findIndex(
			(el) => el.id === toggleId && el.type === 'toggle'
		);

		const toggleElement = currentScreen.content[toggleElementIndex];

		if (toggleElement && toggleElement.type === 'toggle') {
			//superfluous
			const toggleStateIndex = toggleElement.states.findIndex((state) => state.active);
			toggleElement.states.forEach((state) => (state.active = false));
			const nextIndex =
				toggleStateIndex + 1 == toggleElement.states.length ? 0 : toggleStateIndex + 1;
			const next = toggleElement.states[nextIndex];

			const newStates = toggleElement.states.map((s, i) => ({
				...s,
				active: i === nextIndex
			}));
			const newToggle = {
				...toggleElement,
				states: newStates
			} as PhosphorToggle;
			const newContent = [
				...currentScreen.content.slice(0, toggleElementIndex),
				newToggle,
				...currentScreen.content.slice(toggleElementIndex + 1)
			];
			screens[currentScreenIndex].content = newContent;
		}
	};

	// SCREEN MANAGEMENT
	const unloadScreen = (screenId?: string) => {
		if (!currentScreen) return;
		currentScreen.content.forEach((element) => {
			element.loadState = ScreenDataState.Unloaded;
		});
	};
	const changeScreen = (targetScreenId: string) => {
		unloadScreen();
		const targetScreen = getScreen(targetScreenId);
		if (!targetScreen) {
			console.warn('Target screen not found:', targetScreenId);
			return;
		}
		const activeElement = targetScreen.content[0];
		activeScreenId = targetScreenId;
		activeElementId = activeElement.id;
		status = AppStatus.Active;
		activateScreen();
	};

	// COMMAND HANDLING
	const handlePromptCommand = async (command: string, args: Action) => {
		if (Array.isArray(args)) {
			// Sequential logic
			await runActionSequential(command, args);
		} else {
			// console.log(args);
			if (!args || !args.type) {
				console.error('Something has gone terribly wrong');
				return;
			}
			await runAction(command, args);
		}
	};

	const runAction = async (command: string, action: SingleAction) => {
		switch (action.type) {
			case 'link':
				action.target && changeScreen(action.target);
				break;
			case 'dialog':
				if (action.target) {
					await showDialogAndWait(action.target);
				}
				break;
			case 'toggle':
				action.target && toggleToggle(action.target);
				break;
			case 'variable':
				applyVariableCommand(action, command);
				break;
			case 'condition':
				const pass = evaluateCondition(action.condition);
				const branch = pass ? action.true : action.false;
				if (!branch) return;
				const list = Array.isArray(branch) ? branch : [branch];
				for (const act of list) {
					await runAction(command, act);
				}
				break;
			default:
				console.warn('Unknown command type:', action.type);
		}
	};

	const runActionSequential = async (command: string, actions: SingleAction[]) => {
		for (const action of actions) {
			await runAction(command, action);
		}
	};

	const handleLinkClick = async (action: LinkAction, shiftKey: boolean) => {
		// console.log(shiftKey);
		// console.log($state.snapshot(action));
		const branch = shiftKey ? action.shiftKey : action.base;
		if (Array.isArray(branch)) {
			// Sequential logic
			await runActionSequential('', branch);
		} else {
			// console.log(branch);
			if (!branch || !branch.type) {
				console.error('Something has gone terribly wrong');
				return;
			}
			await runAction('', branch);
		}
	};

	const handleLinkClickOld = (target: string | LinkTarget[], shiftKey: boolean) => {
		if (!target) return;
		if (typeof target === 'string') {
			changeScreen(target);
			return;
		}

		const linkTarget = target.find((e) => e.shiftKey == shiftKey);
		// console.log(linkTarget);
		if (linkTarget) {
			// console.log('Found Target');
			if (linkTarget.type === 'screen' && linkTarget.target) {
				changeScreen(linkTarget.target);
			} else if (linkTarget.type === 'dialog' && linkTarget.target) {
				toggleDialog(linkTarget.target);
			}
			// else if (linkTarget.type === 'url' && linkTarget.target) {
			//     if (shiftKey) {
			//         window.open(linkTarget.target, '_blank');
			//     } else {
			//         window.location.href = linkTarget.target;
			//     }
			// }
		}
	};

	const handleTeletypeNewLine = () => {};

	let screens: PhosphorScreen[] = $state([]);
	let dialogs: PhosphorDialog[] = $state([]);
	const currentScreen = $derived.by(() => {
		return getScreen(activeScreenId!);
	});

	const parseScreens = () => {
		let s = data.screens.map(buildScreen).filter((s) => s !== null) as PhosphorScreen[];
		if (!s.length) return [];
		const activeScreen = 0;

		return s;
	};

	const parseDialogs = () => {
		const parsedDialogs = data.dialogs
			.map(buildDialog)
			.filter((s) => s !== null) as PhosphorDialog[];
		if (!parsedDialogs.length) return [];
		return parsedDialogs;
	};

	const parseVariables = () => {
		data.variables.forEach((v) => {
			setVar(v.id, v.default);
		});
	};

	const applyConfiguration = () => {
		const getParam = (param: string, fallback: boolean): boolean => {
			const TRUTHY = ['yes', 'on', 'true', 'show'];
			return page.url.searchParams.get(param) != null
				? TRUTHY.includes((page.url.searchParams.get(param) || '').toLowerCase())
				: fallback;
		};
		const settings = extractConfiguration(data);

		renderScanlines = getParam('renderScanlines', settings.renderScanlines);
		screenFlicker = getParam('screenFlicker', settings.screenFlicker);
		showFooter = getParam('showFooter', settings.showFooter);
		setTheme(settings.theme);
	};

	const getStartScreen = () => {
		let initialId = page.url.searchParams.get('screen');
		let screenIdx = -1;
		if (initialId) screenIdx = getScreenIndex(initialId);
		return screenIdx >= 0 ? screenIdx : 0;
	};

	onMount(() => {
		setScreenWidth();
		console.log(`Source data loaded for ${data.metadata.title} - v${data.metadata.version}`);
		// figlet.defaults({ fontPath: '/src/lib/assets/fonts' });
		applyConfiguration();
		preloadAudio();
		figlet.preloadFonts(SUPPORTED_FONTS).then(() => {
			defaultspeed = data.config.speed || 5;
			screens = parseScreens();
			dialogs = parseDialogs();
			parseVariables();
			setScreenWidth();
			setActiveScreen(getStartScreen());
			window.addEventListener('resize', debouncedSetScreenWidth);
		});
		// try {
		// } finally {
		// }
		return () => window.removeEventListener('resize', debouncedSetScreenWidth);
	});
</script>

{#if columns > 0}
	{#if _columns < minCols}<div>Screen is too small, content may not display properly</div>{/if}
	{#if renderScanlines}
		<Scanlines />
	{/if}
	<div class={`phosphor ${screenFlicker ? 'flicker' : ''}`}>
		<section class="__main__" bind:this={containerRef}>
			{#if activeScreenId && columns > 0}
				{#if getScreen(activeScreenId)}
					{@const currentScreen = getScreen(activeScreenId) as PhosphorScreen}
					{#each currentScreen.content as element, index (element.id)}
						{#if element.loadState === ScreenDataState.Ready}
							<!-- <div class="TEST">{JSON.stringify(element)}</div> -->
						{:else if element.loadState === ScreenDataState.Active}
							<!-- <div class="active"> -->
							{#if element.type === 'text' || element.type === 'link' || element.type === 'prompt'}
								{@const text = element.type === 'prompt' ? element.prompt : (element.text ?? '')}
								<Teletype
									{text}
									{columns}
									autocomplete={false}
									className={element.className}
									onComplete={() => activateNextScreenData()}
									onNewLine={handleTeletypeNewLine}
									textOpts={element.textOpts ?? {}}
									displayOpts={element.displayOpts}
								/>
							{:else if element.type === 'toggle'}
								{@const t = element.states.find((item: any) => item.active === true)?.text}
								<Teletype
									text={t || ''}
									{columns}
									autocomplete={false}
									className={element.className}
									onComplete={() => activateNextScreenData()}
									onNewLine={handleTeletypeNewLine}
									textOpts={element.textOpts ?? {}}
									displayOpts={element.displayOpts}
								/>
							{:else if element.type === 'bitmap'}
								<Bitmap
									className={element.className}
									src={element.src}
									alt={element.alt}
									onComplete={() => activateNextScreenData()}
								/>
							{:else if element.type === 'countdown'}
								<Countdown
									prompt={element.prompt || 'T-MINUS '}
									duration={element.duration || 60}
									{columns}
									className={element.className || ''}
									onComplete={() => activateNextScreenData()}
									textOpts={element.textOpts ?? {}}
								/>
								<!-- {:else if element.type === 'dialog'}
								{@const a = await showDialogAndWait(element.target)} -->
							{:else}
								{@const a = activateNextScreenData()}
							{/if}
							<!-- </div> -->
						{:else if element.loadState === ScreenDataState.Done}
							<!-- <div class="rendered"> -->
							{#if element.type === 'text'}
								<Text
									text={element.text?.length ? element.text : '\\'}
									{columns}
									className={element.className || ''}
									onRendered={() => setElementState(element.id, ScreenDataState.Done)}
									textOpts={element.textOpts ?? {}}
								/>
							{:else if element.type === 'link'}
								<Link
									text={element.text || ''}
									{columns}
									actions={element.actions}
									className={element.className || ''}
									onClick={handleLinkClick}
									onRendered={() => setElementState(element.id, ScreenDataState.Done)}
									textOpts={element.textOpts ?? {}}
								/>
							{:else if element.type === 'countdown'}
								<Text
									text={`${element.prompt}00:00` || ''}
									{columns}
									className={element.className || ''}
									onRendered={() => setElementState(element.id, ScreenDataState.Done)}
									textOpts={element.textOpts ?? {}}
								/>
							{:else if element.type === 'bitmap'}
								<Bitmap
									className={element.className || ''}
									src={element.src}
									alt={element.alt}
									autocomplete={true}
									onComplete={() => setElementState(element.id, ScreenDataState.Done)}
								/>
							{:else if element.type === 'prompt'}
								<Prompt
									className={element.className || ''}
									disabled={!!activeDialogId}
									prompt={element.prompt}
									commands={element.commands}
									onCommand={handlePromptCommand}
									textOpts={element.textOpts ?? {}}
									allowMetaCommands={element.allowMetaCommands}
								/>
							{:else if element.type === 'toggle'}
								<Toggle
									id={element.id}
									className={element.className || ''}
									{columns}
									bind:states={element.states}
								/>
							{/if}
							<!-- </div> -->
						{/if}
					{/each}
				{/if}
			{/if}
		</section>
		{#if activeDialogId}
			{@const dialog = dialogs.find((d) => d.id === activeDialogId) as PhosphorDialog}
			<Modal text={dialog.content} onClose={toggleDialog} />
		{/if}

		{#if showFooter && data.config.footer}
			<footer class="__footer__">
				<Text text={data.config.footer} {columns} />
			</footer>
		{/if}
	</div>
{/if}

<style lang="scss">
	@import '$lib/assets/fonts';
	// @import '$lib/assets/colours';

	.phosphor {
		padding: $lineheight;
		// min-height: 100%;
	}
	// .phosphor:after {
	// 	content: '';
	// 	display: block;
	// 	height: 100px;
	// }

	.__footer__ {
		position: fixed;
		left: 0px;
		bottom: 0px;
		// height: 30px;
		width: 100%;
		// background: #999;
		padding: $lineheight;
	}
</style>
