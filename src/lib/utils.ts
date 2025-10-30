// import figlet from 'figlet';
import { figlet } from '$lib/figlet-load';
import type {
	TextOptions,
	PhosphorVariableType,
	PhosphorJsonData,
	ThemeType
} from './PhosphorData';
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
	span.textContent = '='; // Tall/wide glyph; fine for monospace
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

type PhosphorConfiguration = {
	renderScanlines: boolean;
	screenFlicker: boolean;
	theme: ThemeType;
};

export const extractConfiguration = (data: PhosphorJsonData): PhosphorConfiguration => {
	return {
		renderScanlines: data.config?.renderScanlines ?? true,
		screenFlicker: data.config?.screenFlicker ?? true,
		theme: data.config?.theme ?? 'amber'
	};
};

export const bigFont = (text: string, bigFont: string): string => {
	// console.log(figlet.textSync(text, { font: bigFont }));
	return figlet.textSync(text, { font: bigFont });
};

export const formatText = (text: string, columns: number, textOpts?: TextOptions): string => {
	if (textOpts?.fillWidth) {
		let nRepeat = Math.ceil(columns / text.length);
		return text.repeat(nRepeat).slice(0, columns);
	}

	let lines = breakText(text, columns);
	let output: string[] = [];
	for (let line of lines) {
		output.push(alignText(line, columns, textOpts?.align || 'left', textOpts?.padChar ?? ' '));
	}

	return output.join('\n');
	const expanded = injectVariables(output.join('\n'));
	return expanded;
};

export const applyTextOpts2 = (text: string, columns: number, textOpts?: TextOptions): string => {
	if (textOpts?.fillWidth) {
		let nRepeat = Math.ceil(columns / text.length);
		return text.repeat(nRepeat).slice(0, columns);
	}

	let lines = breakText(text, columns);
	let output: string[] = [];
	for (let line of lines) {
		output.push(alignText(line, columns, textOpts?.align || 'left', textOpts?.padChar ?? ' '));
	}
	return output.join('\n');
};

export const applyTextOpts = (text: string, columns: number, textOpts?: TextOptions): string => {
	const margin = Math.max(0, textOpts?.margin ?? 0);
	const padding = Math.max(0, textOpts?.padding ?? 0);
	const padChar = textOpts?.padChar?.slice(0, 1) || ' ';
	const borderChar = textOpts?.borderChar?.slice(0, 1); // undefined => no border
	const fillChar = (textOpts?.fillChar || ' ').slice(0, 1);
	const marginChar = textOpts?.marginChar?.slice(0, 1) ?? ' ';
	const align = textOpts?.align ?? 'left';

	// total non-content width (per line)
	const borderWidth = borderChar ? 2 : 0; // one at each end
	const sidePadding = padding * 2;
	const sideMargins = margin * 2;

	const innerWidth = columns - sideMargins - borderWidth - sidePadding;
	if (innerWidth <= 0) {
		// Nothing fits; return a blank line sized to columns
		return ' '.repeat(Math.max(0, columns));
	}

	const leftMargin = marginChar.repeat(margin);
	const rightMargin = leftMargin;
	const leftBorder = borderChar ?? '';
	const rightBorder = borderChar ?? '';
	const leftPadding = padChar.repeat(padding);
	const rightPadding = leftPadding;

	let lines: string[];
	if (textOpts?.fillWidth) {
		let nRepeat = Math.ceil(innerWidth / Math.max(1, text.length));
		lines = [text.repeat(nRepeat).slice(0, innerWidth)];
	} else {
		lines = breakText(text, innerWidth);
	}

	let output: string[] = [];
	for (let line of lines) {
		const fillLine = (rightBorder + rightMargin + rightPadding).length > 0;
		const aligned = alignText(line, innerWidth, align, fillChar, fillLine);
		output.push(
			leftMargin + leftBorder + leftPadding + aligned + rightPadding + rightBorder + rightMargin
		);
	}
	return output.join('\n');
};

const alignText = (
	text: string,
	cols: number,
	align: 'left' | 'center' | 'right',
	fillChar: string = ' ',
	fillLine: boolean = false
): string => {
	if (text.length >= cols) return text;
	let space = cols - text.length;
	let output: string = '';
	switch (align) {
		case 'left':
			output = text;
			if (fillChar != ' ' || fillLine) output += fillChar.repeat(space);
			return output;
		case 'center':
			let left = space / 2;
			let right = Math.floor(space - left);
			left = Math.floor(left);
			output = fillChar.repeat(left) + text;
			if (fillChar != ' ' || fillLine) output += fillChar.repeat(right);
			return output;
		case 'right':
			return fillChar.repeat(space) + text;
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

type Seg = { kind: 'text'; text: string } | { kind: 'fmt'; className: string; text: string };

export interface SliceResult {
	visibleHtml: string; // HTML for [0..upUntil)
	cursorChar: string; // the single glyph at [upUntil] (unformatted)
	hiddenHtml: string; // HTML for (upUntil+1..end], no formatting
}

export function sliceFormatted(
	inputString: string,
	columns: number,
	textOpts: TextOptions,
	upUntil?: number
): SliceResult {
	const { preserveSpacing = false } = textOpts;
	let cursorFallback = '.';

	// 1) Expand variables first so visible-length is correct
	const expanded = applyTextOpts(injectVariables(inputString), columns, textOpts);

	// 2) Parse into flat segments: plain text or {class:content}
	const segments = parseSegments(expanded);

	// Also build the full "plain" string (what the user would see)
	const plain = segments.map((s) => (s.kind === 'text' ? s.text : s.text)).join('');

	// Clamp
	let i: number;
	if (upUntil !== undefined) {
		i = Math.max(0, Math.min(upUntil, plain.length));
	} else {
		i = plain.length;
	}

	// 3) Build visible HTML by consuming upUntil visible chars
	let remaining = i;
	let visibleHtml = '';

	for (const seg of segments) {
		if (remaining <= 0) break;

		if (seg.kind === 'text') {
			const take = seg.text.slice(0, remaining);
			visibleHtml += escapeHtml(take, preserveSpacing);
			remaining -= take.length;
		} else {
			// fmt
			const takeInner = seg.text.slice(0, remaining);
			if (takeInner.length > 0) {
				visibleHtml += `<span class="${escapeAttr(seg.className)}">${escapeHtml(takeInner, preserveSpacing)}</span>`;
				remaining -= takeInner.length;
			}
		}
	}

	// 4) Cursor & hidden (no formatting required in the tail)
	const cursorChar = plain.charAt(i) || cursorFallback;
	const hiddenRaw = plain.slice(i + 1); // tail after the cursor
	const hiddenHtml = escapeHtml(hiddenRaw, preserveSpacing);

	return { visibleHtml, cursorChar, hiddenHtml };
}

/** Parse `{class:content}` tokens (no nesting). Falls back to text if malformed. */
function parseSegments(s: string): Array<Seg> {
	const segs: Array<Seg> = [];
	let i = 0;
	let buffer = '';

	while (i < s.length) {
		const open = s.indexOf('{', i);
		if (open === -1) {
			buffer += s.slice(i);
			break;
		}

		// Add any preceding plain text
		buffer += s.slice(i, open);

		// Try to parse a {class:content}
		const close = s.indexOf('}', open + 1);
		if (close === -1) {
			// No closing brace; treat the rest as text
			buffer += s.slice(open);
			break;
		}

		const inside = s.slice(open + 1, close);
		const colon = inside.indexOf(':');

		// Not a valid token -> treat the '{' as literal and continue
		if (colon === -1) {
			buffer += s.slice(open, close + 1);
			i = close + 1;
			continue;
		}

		const className = inside.slice(0, colon).trim();
		const content = inside.slice(colon + 1);

		// If invalid class (empty or contains spaces/quotes), treat as text
		if (!className || /["'<>]/.test(className)) {
			buffer += s.slice(open, close + 1);
			i = close + 1;
			continue;
		}

		// Flush accumulated text
		if (buffer) {
			segs.push({ kind: 'text', text: buffer });
			buffer = '';
		}

		// Push formatted segment
		segs.push({ kind: 'fmt', className, text: content });

		i = close + 1;
	}

	if (buffer) segs.push({ kind: 'text', text: buffer });
	return segs;
}

function escapeHtml(str: string, preserveSpacing: boolean): string {
	const escaped = str
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
	return preserveSpacing ? escaped.replaceAll(' ', '&nbsp;') : escaped;
}

function escapeAttr(str: string): string {
	// Restrict to CSS class-safe characters; drop others
	return str.replace(/[^\w\- ]+/g, '');
}
