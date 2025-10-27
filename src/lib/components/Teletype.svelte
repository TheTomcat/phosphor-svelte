<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let {
		text,
		columns,
		className,
		autostart = true,
		autocomplete = false,
		textOpts = {
			speed: 5,
			playSound: true
		},
		onComplete,
		onNewLine
	}: {
		text: string; // Text to animate
		columns: number;
		className?: string; // css class
		autostart?: boolean; // start animating immediately? default=True
		autocomplete?: boolean; // skip animating and instead fully render? default = false
		textOpts: TextOptions;
		onComplete?: () => void;
		onNewLine?: () => void;
	} = $props();

	let index = $state(0);
	let char = $state(0);
	let active = $state(false);
	let done = $state(!!autocomplete);
	let paused = $state(autocomplete === false);

	let _cursorRef: HTMLSpanElement;
	let _audioRef: HTMLAudioElement;
	let _cursorInterval: number = 5;
	let animateTimerId: ReturnType<typeof setInterval> | null = null;
	let _cursorY: number = 0;

	// NEW: sound props
	import soundSrc from '$lib/assets/teletype1.mp3';
	import type { TextOptions } from '$lib/PhosphorData';
	import { applyTextOpts, formatText, sliceFormatted } from '$lib/utils';
	import { injectVariables } from '$lib/phosphorVariables.svelte';
	// let soundSrc: string | null = ''; // e.g. '/sounds/teletype-loop.mp3'
	let soundVolume: number = 0.3; // 0..1
	let soundPlaybackRate: number = 1.0; // optional slight pitch/speed tweak

	function startSound() {
		if (!soundSrc) return;
		if (!textOpts?.playSound) return;
		if (!_audioRef) {
			_audioRef = new Audio(soundSrc);
			_audioRef.loop = true; // loop until stopped
			_audioRef.volume = Math.min(Math.max(soundVolume, 0), 1);
			_audioRef.playbackRate = soundPlaybackRate;
		}
		// calling play() can reject if user gesture not present; ignore
		_audioRef.play().catch(() => {
			/* autoplay blocked; parent can call exposeStart() */
		});
	}

	function stopSound() {
		if (_audioRef) {
			_audioRef.pause();
			_audioRef.currentTime = 0; // reset to start for next time
		}
	}

	const processedText = $derived.by(() => {
		return applyTextOpts(text, columns, textOpts);
	}); // calculate this once, so that we know how long the text is.

	// const visible = $derived(
	// 	textOpts.preserveSpacing
	// 		? processedText.substr(0, char).replaceAll(' ', '&nbsp;')
	// 		: processedText.substr(0, char)
	// );
	// const cursor = $derived(processedText.substr(char, 1) || '.');
	// const hidden = $derived(
	// 	textOpts.preserveSpacing
	// 		? processedText.substr(char + 1).replaceAll(' ', '&nbsp;')
	// 		: processedText.substr(char + 1)
	// );
	const filledText = $derived(injectVariables(text)); // split this up to avoid fetching variables for every tick.
	const sliced = $derived(sliceFormatted(filledText, columns, textOpts, char));

	const clearAnimateTimer = () => {
		if (animateTimerId) {
			clearInterval(animateTimerId);
			animateTimerId = null;
		}
	};

	const getCursorPosition = () => {
		if (!_cursorRef) return;
		const top = _cursorRef.offsetTop;
		if (_cursorY !== top) {
			_cursorY = top;
			onNewLine && onNewLine();
		}
	};

	const updateState = () => {
		if (done) return;

		let nextChar = char;
		let nextActive = active;
		let nextDone: boolean = done;
		let nextPaused = paused;

		if (!nextActive) {
			nextActive = true;
		}
		if (char < processedText.length) {
			nextChar = char + 1;
		} else {
			nextActive = false;
			nextDone = true;
		}
		char = nextChar;
		active = nextActive;
		done = nextDone;
	};

	const animate = () => {
		clearAnimateTimer();
		// if (paused) return;
		getCursorPosition();
		animateTimerId = setTimeout(tick, _cursorInterval);
	};
	const tick = () => {
		updateState();
		animate();
	};

	onMount(() => {
		done = !!autocomplete;
		paused = autocomplete === false;
		_cursorInterval = textOpts?.speed ?? _cursorInterval;
		if (done) {
			onComplete && onComplete();
			stopSound();
			return;
		}
		// if (!paused) {
		// console.log('mounted');
		active = true;
		startSound();
		animate();
		// }
	});

	$effect(() => {
		if (done) {
			clearAnimateTimer();
			stopSound();
			onComplete && onComplete();
			return;
		}
	});

	onDestroy(() => {
		clearAnimateTimer();
		stopSound();
	});
</script>

<div class={`__teletype__ ${className ? className : ''}`}>
	<span class="visible">{@html sliced.visibleHtml}</span>
	<span class="cursor" bind:this={_cursorRef}
		>{sliced.cursorChar === ' ' ? '.' : sliced.cursorChar}</span
	>
	<span class="hidden">{@html sliced.hiddenHtml}</span>
	<!-- <span class="visible">{@html visible}</span>
	<span class="cursor" bind:this={_cursorRef}>{cursor === ' ' ? '.' : cursor}</span>
	<span class="hidden">{@html hidden}</span> -->
</div>

<style lang="scss">
	@import '$lib/assets/colours';

	.__teletype__ {
		.cursor {
			color: rgb(var(--background) / 0.2); //rgba($background, 0.2);
			background: rgb(var(--foreground)); //$foreground;
		}

		.hidden {
			visibility: hidden;
		}
	}
</style>
