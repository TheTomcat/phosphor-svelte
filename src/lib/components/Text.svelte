<script lang="ts">
	import type { TextOptions } from '$lib/PhosphorData';
	import { formatText, sliceFormatted } from '$lib/utils';

	let {
		text,
		columns,
		className,
		onRendered,
		textOpts = {}
	}: {
		text: string;
		columns: number;
		className?: string;
		onRendered?: () => void;
		textOpts?: TextOptions;
	} = $props();

	// let formatted = $derived(formatText(text, columns, textOpts));
	// let rendered = $derived(
	// 	textOpts?.preserveSpacing ? formatted.replaceAll(' ', '&nbsp;') : formatted
	// );
	let output = $derived(sliceFormatted(text, columns, textOpts));

	const handleRendered = () => {
		onRendered && onRendered();
	};
	$effect(handleRendered);
</script>

<div class={`__text__ ${className ? className : ''}`}>
	{#if text == '\\'}
		<br />
	{:else}
		{@const lines = output.visibleHtml.split('\n')}
		{#each lines as e, i}
			{@html e}
			{#if i < lines.length}
				<br />
			{/if}
		{/each}
		<!-- {@html output.visibleHtml} -->
	{/if}
</div>

<style lang="scss">
	@import '$lib/assets/colours';

	.blink {
		animation: blink 1s steps(5, start) infinite;
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
