<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let {
		prompt,
		duration,
		columns,
		className,
		onRendered,
		onComplete,
		textOpts = { playSound: true }
	}: {
		prompt: string;
		duration: number;
		columns: number;
		className?: string;
		onRendered?: () => void;
		onComplete?: () => void;
		textOpts?: TextOptions;
	} = $props();

	let _audioRef: HTMLAudioElement;
	// NEW: sound props
	import soundSrc from '$lib/assets/beep.mp3';
	import type { TextOptions } from '$lib/PhosphorData';
	import { formatText } from '$lib/utils';
	// let soundSrc: string | null = ''; // e.g. '/sounds/teletype-loop.mp3'
	let soundVolume: number = 0.3; // 0..1
	let soundPlaybackRate: number = 1.0; // optional slight pitch/speed tweak

	function startSound() {
		if (!soundSrc) return;
		if (!textOpts?.playSound) return;
		if (!_audioRef) {
			_audioRef = new Audio(soundSrc);
			_audioRef.loop = false; // loop until stopped
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

	let rendered = $derived(prompt.replaceAll(' ', '&nbsp;'));
	// let countdownTimer = $state(duration);

	let now = $state(Date.now());
	let end = $state(0);

	let remaining = $derived(Math.round((end - now) / 1000));
	let h = $derived(Math.floor(remaining / 3600));
	let m = $derived(Math.floor((remaining - h * 3600) / 60));
	let s = $derived(remaining - h * 3600 - m * 60);
	let renderedTime = $derived.by(() => {
		return `${duration > 3600 ? h.toString().padStart(2, '0') + ':' : ''}${duration > 60 ? m.toString().padStart(2, '0') + ':' : ''}${s.toString().padStart(2, '0')}`;
	});
	let output = $derived(formatText(`${prompt}${renderedTime}`, columns, textOpts));
	let htmlOutput = $derived(textOpts?.preserveSpacing ? output.replaceAll(' ', '&nbsp;') : output);

	let countdownInterval: ReturnType<typeof setInterval> | null = null;
	onMount(() => {
		handleStart();
	});

	const handleStart = () => {
		now = Date.now();
		end = now + duration * 1000;
		countdownInterval = setInterval(updateTimer, 1000);
	};

	const updateTimer = () => {
		now = Date.now();
		startSound();
		if (now >= end) {
			// stopSound();
			now = end;
			onComplete && onComplete();
			if (countdownInterval) {
				clearInterval(countdownInterval);
				countdownInterval = null;
			}
		}
	};

	const handleRendered = () => {
		onRendered && onRendered();
	};
	$effect(handleRendered);
	onDestroy(() => clearInterval(countdownInterval!));
</script>

<div class={`__text__ ${className ? className : ''}`}>
	{@html htmlOutput}
</div>

<style lang="scss">
	// @import '$lib/assets/colours';

	.blink {
		animation: blink 1s steps(5, start) infinite;
	}

	@keyframes blink {
		to {
			visibility: hidden;
		}
	}
	@-webkit-keyframes blink {
		to {
			visibility: hidden;
		}
	}
</style>
