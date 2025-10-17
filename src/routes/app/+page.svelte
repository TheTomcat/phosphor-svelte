<script lang="ts">
	import Phosphor from '$lib/components/Phosphor.svelte';
	import type { PhosphorJsonData } from '$lib/PhosphorData';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { setTheme, type ThemeType } from '$lib/theme.svelte';

	let data: PhosphorJsonData | undefined = $state();

	const theme = $derived(page.url.searchParams.get('theme'));
	$effect(() => setTheme(theme as ThemeType));

	onMount(() => {
		let json = localStorage.getItem('phosphor-data');
		if (!json) return;
		data = JSON.parse(json);
	});
</script>

<svelte:head>
	{#if data}
		<title>{data.config.name}</title>
	{:else}
		<title>Phosphor</title>
	{/if}
</svelte:head>
{#if data}
	<Phosphor {data} />
{:else}
	<div class="centered">
		<div>No data found. Please <a href="/import">import a JSON file first.</a></div>
	</div>
{/if}

<style>
	.centered {
		display: flex;
		justify-content: center; /* Centers horizontally */
		align-items: center; /* Centers vertically */
		height: 100vh; /* Parent needs a defined height */
	}
	a {
		border: 1px solid;
		border-radius: 4px;
		padding: 4px;
	}
	a:hover {
		text-decoration: underline;
		background-color: rgb(var(--foreground));
		color: rgb(var(--background));
	}
</style>
