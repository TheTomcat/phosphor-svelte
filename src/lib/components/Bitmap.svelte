<script lang="ts">
	import { onMount } from 'svelte';

	let {
		src,
		className,
		alt,
		autocomplete,
		onComplete
	}: {
		src: string;
		className?: string;
		alt?: string;
		autocomplete?: boolean;
		onComplete?: () => void;
	} = $props();

	let loading = $state(true);
	let image = $state<HTMLImageElement | null>(null);
	let animateTimerId: ReturnType<typeof setInterval> | null = null;

	const TICK = 150;
	const STEPS = [0.01, 0.02, 0.05, 0.08, 0.13, 0.21, 0.34, 0.55, 0.89, 1.0];

	let currentStep = $state(0);
	let canvas: HTMLCanvasElement;

	const clearAnimationTimer = () => {
		if (animateTimerId) {
			clearInterval(animateTimerId);
			animateTimerId = null;
		}
	};

	const resampleImage = (resolution: number) => {
		const ctx = canvas.getContext('2d');
		if (!ctx || !image) return;
		const w = image.width;
		const h = image.height;
		const dw = w * resolution;
		const dh = h * resolution;

		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(image, 0, 0, dw, dh);
		ctx.drawImage(canvas, 0, 0, dw, dh, 0, 0, w, h);
	};

	const animate = () => {
		clearAnimationTimer();
		animateTimerId = setInterval(() => {
			if (currentStep < STEPS.length) {
				resampleImage(STEPS[currentStep]);
				currentStep = currentStep + 1;
			} else {
				clearAnimationTimer();
				loading = false;
				onComplete && onComplete();
			}
		}, TICK);
	};

	const loadImage = () => {
		image = new Image();
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		if (ctx && image) {
			console.log('Yes');
			image.onload = () => {
				if (!image) return;
				const w = image.width;
				const h = image.height;
				canvas.width = w;
				canvas.height = h;
				if (!autocomplete) {
					loading = false;
					animate();
				} else {
					ctx.drawImage(image, 0, 0);
					onComplete && onComplete();
				}
			};
			image.src = src;
		}
	};
	onMount(() => {
		loadImage();
	});
</script>

<div class={`__image__ ${className ? className : ''}`}>
	{#if loading}
		<div class="progressbar"></div>
	{/if}
	<canvas bind:this={canvas}></canvas>
</div>

<style lang="scss">
	@import '$lib/assets/progressbar';

	.__image__ {
		.progressbar {
			&::after {
				content: '';
				animation: loadingdots 1.5s easeback-in infinite;
			}
		}

		canvas {
			max-width: 100%;
		}

		&.monochrome {
			mix-blend-mode: luminosity;
		}

		&.luminosity {
			mix-blend-mode: luminosity;
		}

		&.lighten {
			mix-blend-mode: lighten;
		}

		&.multiply {
			mix-blend-mode: multiply;
		}

		&.screen {
			mix-blend-mode: screen;
		}

		&.overlay {
			mix-blend-mode: overlay;
		}

		&.darken {
			mix-blend-mode: darken;
		}

		&.color-dodge {
			mix-blend-mode: color-dodge;
		}

		&.color-burn {
			mix-blend-mode: color-burn;
		}

		&.hard-light {
			mix-blend-mode: hard-light;
		}

		&.soft-light {
			mix-blend-mode: soft-light;
		}

		&.difference {
			mix-blend-mode: difference;
		}

		&.exclusion {
			mix-blend-mode: exclusion;
		}

		&.hue {
			mix-blend-mode: hue;
		}

		&.saturation {
			mix-blend-mode: saturation;
		}

		&.color {
			mix-blend-mode: color;
		}
	}
</style>
