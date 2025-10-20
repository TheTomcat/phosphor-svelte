import figlet from 'figlet';
import type { TextOptions } from './PhosphorData';
import { injectVariables } from './phosphorVariables.svelte';

export const debounce = (func: any, delay: number) => {
	let timer: ReturnType<typeof setTimeout> | null = null;

	return function () {
		// @ts-ignore
		const context = this;
		const args = arguments;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => func.apply(context, args), delay);
	};
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

const bigFont = (text: string, bigFont: string): string => {
	console.log(figlet.textSync(text, { font: bigFont }));
	console.log(figlet.textSync(text, { font: bigFont }).includes('\n'));
	return figlet.textSync(text, { font: bigFont });
};

export const formatText = (text: string, columns: number, textOpts?: TextOptions): string => {
	if (textOpts?.fillWidth) {
		let nRepeat = Math.ceil(columns / text.length);
		return text.repeat(nRepeat).slice(0, columns);
	}
	if (textOpts?.bigFont) {
		return bigFont(text, textOpts.bigFont);
	}
	let lines = breakText(text, columns);
	let output: string[] = [];
	for (let line of lines) {
		output.push(alignText(line, columns, textOpts?.align || 'left'));
	}

	// if (textOpts?.preserveSpacing) {
	// 	return output.join('\n').replace(' ', '&nbsp;');
	// }
	return injectVariables(output.join('\n'));
};

const alignText = (text: string, cols: number, align: 'left' | 'center' | 'right'): string => {
	if (text.length >= cols) return text;
	let space = cols - text.length;
	switch (align) {
		case 'left':
			return text;
		case 'center':
			console.log('TEST');
			let left = space / 2;
			let right = Math.floor(space - left);
			left = Math.floor(left);
			return ' '.repeat(left) + text; // + ' '.repeat(right);
		case 'right':
			return ' '.repeat(space) + text;
	}
};

const alignBlockText = (
	text: string[],
	cols: number,
	align: 'left' | 'center' | 'right'
): string[] => {
	let longestLineLength = Math.max(...text.map((t) => t.length));
	if (longestLineLength >= cols) return text;
	switch (align) {
		case 'left':
			return text;
		case 'center':
			return text.map((t) => {
				let left = (cols - longestLineLength) / 2;
				let right = Math.floor(cols - longestLineLength - left);
				left = Math.floor(left);
				return ' '.repeat(left) + t + ' '.repeat(right);
			});
		case 'right':
			return text.map((t) => {
				return ' '.repeat(cols - longestLineLength) + t;
			});
	}
};

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
			// console.log(`Breaking line at index ${breakIndex} ${line}`);
			output.push(line.substring(0, breakIndex));
			line = line.substring(breakIndex).trimStart();
		}
		if (line.length > 0) output.push(line);
	}
	return output;
};
