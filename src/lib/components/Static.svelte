<script lang="ts">
	import { onMount } from 'svelte';

	let {
		lifespan,
		className,
		onRendered,
		onClose
	}: {
		lifespan?: number;
		className?: string;
		onRendered?: () => void;
		onClose?: () => void;
	} = $props();
	const TICK = 1000;
	const LIFESPAN_DEFAULT = 1000;

	let time = 0;
	let animateTimerId: NodeJS.Timeout | null = null;
	let lifespanTimerId: NodeJS.Timeout | null = null;

	const css = ['__static__', className ? className : null].join(' ').trim();

	let canvas: HTMLCanvasElement;

	const handleKeyDown = (e: KeyboardEvent) => {
		e.preventDefault();
		const key = e.key.toLowerCase();
		switch (key) {
			case 'enter':
			case 'escape':
				onClose && onClose();
				break;
			default:
				break;
		}
	};

	const noise = () => {
		if (!canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;
		const img = context.createImageData(canvas.width, canvas.height);
		const pix = img.data;

		for (let i = 0, n = pix.length; i < n; i += 4) {
			let r = Math.random() * 200;
			pix[i] = r;
			pix[i + 1] = r;
			pix[i + 2] = r;
			pix[i + 3] = 255; // 100% opaque
		}
		context.putImageData(img, 0, 0);
		time = (time + 1) & canvas.height;
	};

	const clearAnimationTimer = () => {
		if (animateTimerId) {
			clearInterval(animateTimerId);
			animateTimerId = null;
		}
	};

	const animate = () => {
		clearAnimationTimer();
		noise();
		animateTimerId = setInterval(noise, TICK);
	};

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		animate();
		if (lifespan !== 0) {
			lifespanTimerId = setTimeout(
				() => {
					onClose && onClose();
				},
				lifespan ? lifespan : LIFESPAN_DEFAULT
			);
		}
		onRendered && onRendered();
		return () => {
			clearAnimationTimer();
			window.removeEventListener('keydown', handleKeyDown);
			if (lifespanTimerId) {
				clearTimeout(lifespanTimerId);
				lifespanTimerId = null;
			}
		};
	});
</script>

<section class={css}>
	<canvas width="320" height="240" bind:this={canvas}> </canvas>
</section>
