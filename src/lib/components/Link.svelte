<script lang="ts">
	import type { Action, LinkAction, LinkTarget, TextOptions } from '$lib/PhosphorData';
	import { formatText } from '$lib/utils';

	let {
		text,
		columns,
		// target,
		actions,
		className,
		onClick,
		onRendered,
		textOpts
	}: {
		text: string;
		columns: number;
		// target: string | LinkTarget[];
		actions: LinkAction;
		className?: string;
		onClick?: (target: LinkAction, shiftKey: boolean) => void;
		onRendered?: () => void;
		textOpts?: TextOptions;
	} = $props();

	let renderedText = $derived(formatText(text, columns, textOpts));

	let touches = $state(0);
	const handleTouchStart = (e: TouchEvent) => {
		touches = e.touches.length;
	};
	const handleTouchEnd = (e: TouchEvent) => {
		e.preventDefault();

		onClick && onClick(actions, e.shiftKey);

		touches = 0;
	};
	const handleClick = (e: MouseEvent) => {
		e.preventDefault();
		onClick && onClick(actions, e.shiftKey);
	};
	const handleRendered = () => {
		onRendered && onRendered();
	};
	$effect(handleRendered);
</script>

<span
	class={`__link__ ${className ? className : ''}`}
	onclick={handleClick}
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	{@html renderedText}
</span>

<style lang="scss">
	@import '$lib/assets/fonts';
	@import '$lib/assets/colours';

	.__link__ {
		& {
			cursor: pointer;
			display: block;
		}
		&:hover,
		&:active {
			color: rgb(var(--background)); //$background;
			background: rgb(var(--foreground)); //$foreground;
			text-shadow: rgb(var(--background-glow)); //$background-glow;
			box-shadow: rgb(var(--foreground-glow)); //$foreground-glow;
			transition:
				background 50ms,
				foreground 150ms;
		}

		&:hover {
			opacity: 1;
			transition:
				background 50ms,
				foreground 150ms;
		}

		&:active {
			opacity: 0.5;
			transition: opacity 50ms;
		}

		// alert class
		&.alert:hover,
		&.alert:active {
			color: rgb(var(--background)); //$background;
			background: rgb(var(--alert)); //$alert;
			text-shadow: rgb(var(--background-glow)); //$background-glow;
			box-shadow: rgb(var(--alert-glow)); //$alert-glow;
			transition:
				background 50ms,
				foreground 150ms;
		}
	}
</style>
