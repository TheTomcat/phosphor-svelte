<script lang="ts">
	import '../../app.scss';
	import favicon from '$lib/assets/favicon.svg';
	import { initTheme, theme } from '$lib/theme.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { setTheme, type ThemeType } from '$lib/theme.svelte';

	// document.documentElement.dataset.theme = 'green';
	const suppliedTheme = $derived(page.url.searchParams.get('theme'));
	$effect(() => setTheme(suppliedTheme as ThemeType));
	let { children } = $props();
	onMount(initTheme);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="theme-root" data-theme={theme.theme}>
	{@render children?.()}
</div>
