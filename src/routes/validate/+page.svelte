<script lang="ts">
	import {
		JSONEditor,
		createAjvValidator,
		renderValue,
		renderJSONSchemaEnum
	} from 'svelte-jsoneditor';
	import schema from '$lib/assets/jsonschema.json';
	import type {
		ContextMenuItem,
		JSONContent,
		JSONEditorSelection,
		MenuItem,
		TextContent
	} from 'svelte-jsoneditor';

	import { loadPhosphorData, savePhosphorData } from '$lib/phosphorStorage';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const schemaDefinitions = {
		job: {
			title: 'Job description',
			type: 'object',
			required: ['address'],
			properties: {
				company: {
					type: 'string',
					examples: ['ACME', 'Dexter Industries']
				},
				role: {
					description: 'Job title.',
					type: 'string',
					examples: ['Human Resources Coordinator', 'Software Developer'],
					default: 'Software Developer'
				},
				address: {
					type: 'string'
				},
				salary: {
					type: 'number',
					minimum: 120,
					examples: [100, 110, 120]
				}
			}
		}
	};

	// create a JSON schema validator powered by Ajv
	const validator = createAjvValidator({ schema, schemaDefinitions });

	// enable rendering a select box for enums
	function onRenderValue(props) {
		return renderJSONSchemaEnum(props, schema, schemaDefinitions) || renderValue(props);
	}

	const onRenderMenu = (
		items: MenuItem[],
		context: { mode: 'tree' | 'text' | 'table'; modal: boolean; readOnly: boolean }
	): MenuItem[] | undefined => {
		// let saveIcon: IconDefinition =
		let save: MenuItem = {
			type: 'button',
			text: 'Save',
			// icon: {},
			title: 'Save',
			onClick: () => {
				let result = savePhosphorData(content.json);
				if (result.ok) alert('Phosphor data saved successfully!');
			}
		};
		let app: MenuItem = {
			type: 'button',
			text: 'Term',
			// icon: {},
			title: 'Go To Terminal',
			onClick: () => {
				goto('/app');
			}
		};
		return [
			...items.slice(0, items.length - 1),
			{ type: 'separator' },
			save,
			{ type: 'separator' },
			app,
			items.at(-1)
		];
	};

	const onRenderContextMenu = (
		items: ContextMenuItem[],
		context: {
			mode: 'tree' | 'text' | 'table';
			modal: boolean;
			readOnly: boolean;
			selection: JSONEditorSelection | undefined;
		}
	): ContextMenuItem[] | false | undefined => {
		return items;
	};

	let content: JSONContent | TextContent = $state({ json: {} });

	onMount(() => {
		const result = loadPhosphorData();
		if (result.ok) {
			content = { json: result.data };
		}
	});

	const handleChange = (updatedContent, previousContent, { contentErrors, patchResult }) => {
		// content is an object { json: unknown } | { text: string }
		console.log('onChange: ', { updatedContent, previousContent, contentErrors, patchResult });
	};

	let firstTime = $state();
	onMount(() => {
		const firstTimeFlag = localStorage.getItem('phosphorDataEditorFirstTime');
		if (firstTimeFlag === null) {
			firstTime = true;
		} else {
			firstTime = false;
		}
	});

	const acceptTerms = () => {
		firstTime = false;
		localStorage.setItem('phosphorDataEditorFirstTime', 'false');
	};
	const goBack = () => {
		goto('/');
	};
</script>

<svelte:head>
	<title>Phosphor Data Editor</title>
</svelte:head>

{#if firstTime}
	<div class="container">
		<div class="warning">WARNING!</div>
		<div>
			This editor is both untested and very buggy. Please make sure that you have a backup of your
			data before using this editor. I take absolutely zero responsibility for any data loss.
			Really, it's probably a bug-filled nightmare.
		</div>
		<button onclick={acceptTerms}>Continue at your own risk</button>
		<button onclick={goBack}>Return to a place of safety</button>
	</div>
{:else}
	<div class="editor jse-theme-dark">
		<JSONEditor bind:content {validator} {onRenderContextMenu} {onRenderMenu} />
	</div>
{/if}

<style>
	@import 'svelte-jsoneditor/themes/jse-theme-dark.css';
	.editor {
		width: 100vh;
		height: 100vh;
	}
	.warning {
		font-size: larger;
	}
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		align-items: center;
	}
	button {
		width: fit-content;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		border-radius: 5px;
		border: solid;
	}
</style>
