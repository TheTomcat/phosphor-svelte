<!-- src/routes/import/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import { nextTheme, theme } from '$lib/theme.svelte';
	import Ajv from 'ajv';

	import schema from '$lib/assets/jsonschema.json';
	import type { PhosphorJsonData } from '$lib/PhosphorData';
	import {
		clearPhosphorData,
		formatAjvError,
		hasPhosphorData,
		loadPhosphorData,
		savePhosphorData,
		type Result
	} from '$lib/phosphorStorage';
	import { onMount } from 'svelte';

	let modalVisible = $state(false);

	let data = $state<PhosphorJsonData>();
	let metadata = $derived(data?.metadata || null);
	let errors = $state<string[]>([]);
	let ref: HTMLInputElement;

	onMount(() => {
		let result = loadPhosphorData();
		if (result.ok) {
			data = result.data;
			errors = [];
			return;
		} else {
			if ('parseError' in result) {
				errors = [result.parseError];
			} else {
				errors = formatAjvError(result.errors);
			}
		}
	});

	async function onChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const text = await file.text();
		const obj = JSON.parse(text);

		const result = savePhosphorData(obj);
		if (result.ok) {
			data = result.data;
			errors = [];
		} else {
			if ('parseError' in result) {
				errors = [result.parseError];
			} else {
				errors = formatAjvError(result.errors);
			}
			data = undefined;
			metadata = null;
			return;
		}
	}

	const handleDelete = () => {
		awaitModalResponse().then((result) => {
			if (result === 'confirm') {
				clearPhosphorData();
				data = undefined;
				ref.value = '';
			}
		});
	};

	let _resolve: ((v: 'confirm' | 'close') => void) | null = null;

	const awaitModalResponse = async () => {
		if (_resolve) throw new Error('Modal already awaiting a response');

		modalVisible = true;

		return new Promise<'confirm' | 'close'>((resolve) => {
			_resolve = (result) => {
				modalVisible = false;
				const r = _resolve;
				_resolve = null;
				r?.(result);
				resolve(result); // resolve outer promise
			};
		});
	};

	const handleConfirm = () => _resolve?.('confirm');
	const handleClose = () => _resolve?.('close');

	const gotoApp = () => {
		if (!hasPhosphorData()) {
			alert('No data found. Please import a JSON file first.');
			return;
		}
		goto('/app');
	};
</script>

<div class="centered">
	Upload a JSON file:
	<input type="file" accept="application/json" onchange={onChange} bind:this={ref} />
	{#if metadata}
		<div>
			<div>Currently loaded: {metadata.description}</div>
			<div>by {metadata.author}</div>
		</div>
	{:else if errors.length > 0}
		<div>
			<strong>Errors found in JSON file:</strong>
			<ul>
				{#each errors as error}
					<li>{error}</li>
				{/each}
			</ul>
		</div>
	{/if}
	<div class="row">
		<button onclick={handleDelete}>Delete Data</button>
		<button onclick={nextTheme}>Theme</button>
		<button onclick={gotoApp}>Goto App</button>
	</div>
	<div><a href={'/src/lib/assets/jsonschema.json'}>Download the JSONSchema reference</a></div>
</div>
{#if modalVisible}
	<section class="__modal__">
		<div class="content">
			WARNING! Are you sure you want to delete the data?
			<div class="row">
				<button onclick={handleConfirm}>Confirm</button>
				<button onclick={handleClose}>Close</button>
			</div>
		</div>
	</section>
{/if}

<style lang="scss">
	.centered {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		gap: 1em;
	}
	.gap2 {
		gap: 2em;
	}

	.row {
		display: flex;

		flex-direction: row;
		justify-content: space-around;
		gap: 2em;
		align-items: center;
	}
	button {
		border: 1px solid;
		padding: 1em;
		border-radius: 4px;
		cursor: pointer;
		box-shadow: 2px 2px 4px rgb(var(--background-glow) / 0.5);
	}
	button:hover {
		background-color: rgb(var(--foreground));
		color: rgb(var(--background));
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
	input {
		cursor: pointer;
	}
	input:hover {
		background-color: rgb(var(--foreground));
		color: rgb(var(--background));
	}
	input:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgb(var(--accent));
	}

	input[type='file'] {
		border: 2px solid;
		padding: 0.5em;
		&::file-selector-button {
			padding: 0.5em; //1em 1.5em;
			border-width: 1;
			color: rgb(var(--foreground));
			cursor: pointer;
			margin-right: 1em;
		}
		&:hover {
			border-color: #888;

			&::file-selector-button {
				color: rgb(var(--background));
			}
		}
	}

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
