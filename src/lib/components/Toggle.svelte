<script lang="ts">
	import type { JsonToggleState } from '$lib/PhosphorData';
	import { setVar } from '$lib/phosphorVariables.svelte';
	import { onMount } from 'svelte';

	let {
		states = $bindable(), // Need to be bindable, because we push changes from Phosphor
		id,
		className,
		onRendered,
		onClick
	}: {
		states: { text: string; active: boolean; delayMs?: number; delayText?: string }[];
		id?: string;
		className?: string;
		onRendered?: () => void;
		onClick?: () => void;
	} = $props();

	let firstRun = true;

	let disabledTimer: number = $state(0);
	let oldState: JsonToggleState | undefined = $state(states[0]);
	// let delay: number = $state(0);

	let activeIndex = $derived(
		Math.max(
			0,
			states.findIndex((s) => s.active)
		)
	);
	let active = $derived(states[activeIndex]);

	onMount(() => {
		oldState = active;
	});

	$effect(() => {
		if (active.delayMs && !firstRun) {
			startCountdown(active.delayMs, () => {
				oldState = active;
			});
		}
		firstRun = false;
	});

	const startCountdown = (setDelay: number, callback?: () => void) => {
		disabledTimer = setDelay;
		let { done } = runEverySecond(countDown, setDelay);
		done.then(() => {
			oldState = active;
			callback && callback();
		});
	};

	const countDown = () => {
		if (disabledTimer > 0) {
			// console.log('Countdown:', disabledTimer);
			disabledTimer -= 100;
		}
	};

	const runEverySecond = (fn: any, milliseconds: number, opts = {}) => {
		// const { immediate = false } = opts;
		let count = 0;
		let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

		const done = new Promise((resolve) => {
			const tick = () => {
				try {
					fn();
				} finally {
					count += 100;
					if (count >= milliseconds) {
						clearInterval(intervalId);
						intervalId = undefined;
						resolve(void 0);
					}
				}
			};

			intervalId = setInterval(tick, 100);
		});

		return {
			cancel: () => {
				if (intervalId !== undefined) clearInterval(intervalId);
				intervalId = undefined;
			},
			done
		};
	};

	const handleClick = () => {
		if (active) {
			// let callback = () => {
			const nextIndex = activeIndex + 1 == states.length ? 0 : activeIndex + 1;
			states.forEach((state) => (state.active = false));
			states[nextIndex].active = true;
			// };
			// if (active.delay) {
			// 	startCountdown(active.delay, callback);
			// } else {
			// 	callback();
			// }
		}
	};

	const handleRendered = () => {
		onRendered && onRendered();
	};

	$effect(handleRendered);
	$effect(() => {
		if (!id) return;
		// console.log(`Setting toggle variable ${id} to ${activeIndex}`);
		setVar(id, activeIndex);
	});

	const renderCountdownText = (text: string): string => {
		if (!oldState || oldState.delayMs === undefined)
			return text.replace('%', `[${'.'.repeat(Math.floor(disabledTimer / 1000))}]`);
		let length = 20;
		let remaining = disabledTimer / oldState.delayMs;
		let bar = '='.repeat(Math.floor((1 - remaining) * length));
		let progress = `[${bar}${'&nbsp;'.repeat(length - bar.length)}]`;
		return text.replace('%', progress);
	};
</script>

<div
	class={`__toggle__ ${className ? className : ''} ${disabledTimer > 0 ? 'disabled' : ''}`}
	onclick={handleClick}
>
	{#if disabledTimer > 0 && oldState}{@html renderCountdownText(
			oldState.delayText || '%'
		)}{:else}{active.text}{/if}
</div>

<style lang="scss">
	@import '$lib/assets/fonts';
	@import '$lib/assets/colours';
	.disabled {
		color: rgb(var(--foreground-disabled)); //$foreground-disabled;
	}
	.__toggle__:not(.disabled) {
		& {
			cursor: pointer;
			display: block;
		}
		&:hover,
		&.active {
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
	}
</style>
