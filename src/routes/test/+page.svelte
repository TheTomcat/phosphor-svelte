<script lang="ts">
	import Multiline from '$lib/components/Multiline.svelte';
	import Phosphor from '$lib/components/Phosphor.svelte';
	import { debounce } from '$lib/utils';
	import { onMount } from 'svelte';
	let text =
		'This is a test of the multiline component. It should break the text at appropriate points. \nIt should also preserve line breaks as well.';

	const breakText = (text: string, cols: number): string[] => {
		let lines = text.split('\n');
		let output: string[] = [];
		for (let line of lines) {
			if (line.length <= cols) {
				output.push(line);
				continue;
			}
			// break line into multiple lines, breaking at the last space before cols
			while (line.length > cols) {
				let breakIndex = line.substring(0, cols).lastIndexOf(' ');
				if (breakIndex === -1) breakIndex = cols; // no space found, hard break
				output.push(line.substring(0, breakIndex));
				line = line.substring(breakIndex).trimStart();
			}
			if (line.length > 0) output.push(line);
		}
		return output;
	};

	export function measureMonospaceGrid(opts?: { container?: HTMLElement | null }) {
		const { container = null } = opts || {};

		// 1) Create a hidden measuring span
		const span = document.createElement('span');
		span.textContent = 'M'; // Tall/wide glyph; fine for monospace
		span.style.position = 'absolute';
		span.style.visibility = 'hidden';
		span.style.whiteSpace = 'pre'; // preserve exact width
		span.style.top = '-9999px';
		span.style.left = '-9999px';
		span.style.letterSpacing = '0';
		span.style.padding = '0';
		span.style.margin = '0';

		document.body.appendChild(span);

		// 2) Measure single character cell
		const charWidth = span.getBoundingClientRect().width;
		const lineHeightPx = span.getBoundingClientRect().height;

		// 3) Determine available area (viewport or container)
		let widthPx: number;
		let heightPx: number;
		if (container) {
			const rect = container.getBoundingClientRect();
			widthPx = rect.width;
			heightPx = rect.height;
		} else {
			widthPx = window.innerWidth;
			heightPx = window.innerHeight;
		}

		// 4) Compute cols/rows
		const cols = Math.max(0, Math.floor(widthPx / charWidth));
		const rows = Math.max(0, Math.floor(heightPx / lineHeightPx));

		// Cleanup
		span.remove();

		return {
			charWidth, // px per column
			lineHeight: lineHeightPx, // px per row
			widthPx,
			heightPx,
			cols,
			rows
		};
	}

	let columns = $state(-1);
	const setScreenWidth = () => {
		const grid = measureMonospaceGrid(); //{ container: containerRef });
		columns = grid.cols;
	};

	const debouncedSetScreenWidth = debounce(setScreenWidth, 300);

	onMount(() => {
		setScreenWidth();

		window.addEventListener('resize', debouncedSetScreenWidth);
		return () => window.removeEventListener('resize', debouncedSetScreenWidth);
	});
</script>

<Multiline {text} cols={columns} textOpts={{ preserveSpacing: true, playSound: true }} />

{JSON.stringify(breakText(text, 14))}
{columns}
