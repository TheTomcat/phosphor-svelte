<script lang="ts">
	import {
		THEMES,
		type Command,
		type PhosphorVariableType,
		type TextOptions,
		type ThemeType
	} from '$lib/PhosphorData';
	import { setVar } from '$lib/phosphorVariables.svelte';
	import { setTheme } from '$lib/theme.svelte';
	import { onMount } from 'svelte';

	let {
		prompt,
		commands = [],
		className,
		disabled,
		allowMetaCommands = true,
		//allowRegex = true,
		textOpts = { isPassword: false },
		onCommand,
		onEscape,
		onRendered
	}: {
		prompt?: string;
		commands?: Command[];
		className?: string;
		allowMetaCommands?: boolean;
		//allowRegex?: boolean;
		disabled?: boolean;
		textOpts?: TextOptions;
		onCommand?: (command: Command['command'], action: Command['action']) => void;
		onEscape?: () => void;
		onRendered?: () => void;
	} = $props();
	export const PROMPT_DEFAULT = '$> ';
	let ref: HTMLSpanElement;
	const css = ['__prompt__', disabled ? 'disabled' : null, className ? className : null]
		.join(' ')
		.trim();

	let value = $state('');
	let invalidCommand = $state('');
	let displayValue = $derived(value.replace(' ', '&nbsp;'));
	let isPassword = $derived(textOpts?.isPassword || false);

	const handleFocus = () => ref.focus();

	const matchCommand = (input: string) => {
		let simpleCommand = commands.find((element) => element.command === input);
		if (simpleCommand) return simpleCommand;
		return commands.find((element) => input.match(element.command) && element?.allowRegex);
	};

	const parseMetaCommand = (input: string) => {
		// Parse input for commands of the form SET VAR=VALUE and update appropriately
		if (input.toLowerCase().startsWith('set')) {
			const parts = input.toLowerCase().slice(3).trim().split('=');
			if (parts.length === 2) {
				const varName = parts[0].trim();
				const varValue = parts[1].trim();
				if (varName == 'theme' || varName == 'renderscanlines' || varName == 'screenflicker') {
					if (varName == 'theme' && THEMES.includes(varValue as any)) {
						setTheme(varValue as ThemeType);
						return `Theme set to ${varValue}`;
					}
					if (varValue === 'true' || varValue === 'false') {
						const newValue = varValue === 'true' ? true : false;
						// not supported yet. TODO: Move renderScanlines and screenFlicker into theme and export into Phosphor.svelte.
						return `Not yet supported.`;
					}
					return false;
				} else {
					// Normal command. Treat as such
					let newValue: PhosphorVariableType = varValue;
					if (varValue === 'true') newValue = true;
					if (varValue === 'false') newValue = false;
					if (parseInt(varValue).toString() === varValue) newValue = parseInt(varValue);
					setVar(varName, newValue);
					return `Command accepted`;
				}
			}
		}
		return false;
	};

	const handleCommand = () => {
		if (!onCommand) return;
		setVar('_lastCommand', value);
		const command = matchCommand(value);
		invalidCommand = '';
		// console.log(`Found matching command for ${$state.snapshot(value)}`, $state.snapshot(command));
		if (command) {
			// console.log(command);
			onCommand(value, command.action);
			value = '';
		} else {
			if (allowMetaCommands) {
				const handled = parseMetaCommand(value);
				if (handled) {
					value = '';
					invalidCommand = handled; //'OVERRIDE COMMAND ACCEPTED';
					// return;
				}
			} else {
				invalidCommand = `No such command: ${value}`;
				value = '';
				// console.log('Invalid command:', invalidCommand);
			}

			setTimeout(() => {
				invalidCommand = '';
			}, 3000);
		}
	};
	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) {
			value = '';
			return;
		}

		const key = e.key.toLowerCase();
		switch (key) {
			case 'backspace':
				e.preventDefault();
				if (!value.length) return;
				value = value.slice(0, -1);
				break;

			case 'enter':
				e.preventDefault();
				handleCommand();
				break;

			case 'escape':
				e.preventDefault();
				if (onEscape) onEscape();
				value = '';
				break;

			default:
				// support alphanumeric, space, and limited puntuation only
				const re = /[a-z0-9,.<>/?[\]{}'";:*&^%$#@!~=-]/;
				if (key.length === 1 && key.match(re)) {
					e.preventDefault();
					value = value + key;
				} else if (key === ' ') {
					e.preventDefault();
					value = value + ' '; //(isPassword ? ' ' : '&nbsp;');
				} else {
					console.warn(`Unrecognised key: ${key}`);
				}
				break;
		}
	};
	onMount(() => {
		if (onRendered) onRendered();
		document.addEventListener('keydown', handleKeyDown);
		if (!prompt) prompt = PROMPT_DEFAULT;
		ref.focus();
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div class={`__prompt__ ${className ? className : ''}`} onclick={handleFocus}>
	{#if prompt}
		<span class={'prompt'}>{prompt}</span>
	{/if}
	<span class={'input'} bind:this={ref}
		>{@html isPassword ? '*'.repeat(value.length) : displayValue}<span class="cursor">|</span>
	</span>
</div>
{#if invalidCommand}<span class="alert"
		><!-- {@html '&nbsp;'.repeat(Math.max(10 - value.length, 0))} -->{invalidCommand}</span
	>{/if}

<style lang="scss">
	@import '$lib/assets/colours';

	.__prompt__ {
		.cursor {
			// content: '|';
			background-color: rgb(var(--foreground)); //$foreground;
			color: rgb(var(--foreground)); //$foreground;
			animation: blink 1s steps(5, start) infinite;
		}

		.input {
			text-transform: uppercase;
		}
	}

	@keyframes blink {
		to {
			visibility: hidden;
		}
	}
	@-webkit-keyframes blink-animation {
		to {
			visibility: hidden;
		}
	}
</style>
