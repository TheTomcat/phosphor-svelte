<script lang="ts">
	import { onMount, tick } from 'svelte';

	let {
		text,
		className,
		onClose
	}: { text: string | string[]; className?: string; onClose: () => void } = $props();

	let _audioRef: HTMLAudioElement;
	// NEW: sound props
	import soundSrc from '$lib/assets/error.mp3';
	let soundVolume: number = 0.3; // 0..1
	let soundPlaybackRate: number = 1.0; // optional slight pitch/speed tweak

	function startSound() {
		if (!soundSrc) return;
		// if (!textOpts?.playSound) return;
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

	let hasPressed = $state(false);
	let renderedText = $derived.by(() => {
		if (typeof text === 'string') return text.replaceAll(' ', '&nbsp;');
		return text.map((s) => s.replaceAll(' ', '&nbsp;'));
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		e.preventDefault();
		const key = e.key.toLowerCase();
		switch (key) {
			case 'enter':
				if (!hasPressed) {
					hasPressed = true;
					return;
				}
			case 'escape':
				onClose && onClose();
				break;
			default:
				break;
		}
	};
	onMount(() => {
		startSound();
		tick().then(() => {
			document.body.classList.add('static');
			window.addEventListener('keydown', handleKeyDown);
		});
		return () => {
			document.body.classList.remove('static');
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<section class="__modal__ {className ? className : ''}" onclick={() => onClose()}>
	<div class="content">
		{#if typeof text === 'string'}
			<p>{text}</p>
		{:else}
			{#each text as line, i}
				<p data-key={i}>{line}</p>
			{/each}
		{/if}
	</div>
</section>

<!-- <div class="backdrop" on:click={onClose}></div> -->

<style lang="scss">
	@import '$lib/assets/fonts';
	@import '$lib/assets/colours';

	.__modal__ {
		position: fixed;
		height: 100vh;
		width: 100vw;
		top: 0;
		left: 0;
		background: rgb(var(--background) / 0.8); //rgba($background, 0.8);
		color: rgb(var(--foreground)); //$foreground;

		.content {
			position: fixed;
			top: 50%;
			left: 50%;
			padding: $lineheight * 0.5;
			transform: translate(-50%, -50%);
			background: rgb(var(--foreground)); //$foreground;
			color: rgb(var(--background)); //$background;
			text-shadow: rgb(var(--background-glow)); //$background-glow;

			p {
				margin: 0;
			}
		}
	}

	body.static {
		height: 100vh;
		overflow-y: hidden;
	}
</style>
