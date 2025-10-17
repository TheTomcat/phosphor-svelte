<script lang="ts">
	import type { Command, TextOptions } from '$lib/PhosphorData';
	import { onMount } from 'svelte';

	let {
		prompt,
		commands = [],
		className,
		disabled,
		textOpts = { isPassword: false },
		// isPassword = false,
		onCommand,
		onEscape,
		onRendered
	}: {
		prompt?: string;
		commands?: Command[];
		className?: string;
		disabled?: boolean;
		textOpts?: TextOptions;
		// isPassword?: boolean;
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
		return commands.find((element) => input.match(element.command));
	};

	const handleCommand = () => {
		if (!onCommand) return;
		const command = matchCommand(value);
		if (command) {
			value = '';
			console.log(command);
			onCommand(value, command.action);
		} else {
			invalidCommand = value;
			value = '';
			console.log('Invalid command:', invalidCommand);

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
				const re = /[a-z0-9,.<>/?[\]{}'";:*&^%$#@!~]/;
				if (key.length === 1 && key.match(re)) {
					e.preventDefault();
					value = value + key;
				} else if (key === ' ') {
					e.preventDefault();
					value = value + ' '; //(isPassword ? ' ' : '&nbsp;');
				} else {
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
{#if invalidCommand}<div class="blink alert">No such command: {invalidCommand}</div>{/if}

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
