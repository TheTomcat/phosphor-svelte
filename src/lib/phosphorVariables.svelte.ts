// src/lib/state/variables.ts
import { browser } from '$app/environment';
import type {
	Comparator,
	Operand,
	JsonCommandVariable,
	PhosphorVariableType,
	Condition,
	PhosphorVariable
} from '$lib/PhosphorData';

export const vars: Record<string, PhosphorVariableType> = $state({}); // global KV store

export function getVar<T extends PhosphorVariableType = PhosphorVariableType>(
	name: string,
	fallback?: T
): T {
	console.log(`Getting var "${name}":`, vars[name]);
	return (name in vars ? vars[name] : fallback) as T;
}

export function setVar(name: string, value: PhosphorVariableType) {
	// assignment triggers reactivity for any component reading vars[name]
	vars[name] = value;
	// console.log($state.snapshot(vars));
}

export function toggleVar(name: string) {
	const cur = vars[name];
	if (typeof cur === 'boolean') {
		vars[name] = !cur;
	} else if (cur === undefined) {
		vars[name] = true; // sensible default
	} else {
		// non-boolean toggle: treat truthy → false, falsy → true
		vars[name] = !cur;
	}
}

export function incrementVar(name: string, by = 1) {
	const n = Number(vars[name] ?? 0);
	if (Number.isNaN(n)) throw new Error(`Cannot increment non-numeric var "${name}"`);
	vars[name] = n + by;
}
export function concatenateVar(name: string, value: string, pre?: boolean) {
	const cur = String(vars[name] ?? '');
	vars[name] = pre ? value + cur : cur + value;
}

export function decrementVar(name: string, by = 1) {
	incrementVar(name, -by);
}

// export function pushVar(name: string, value: string) {
// 	const cur = vars[name];
// 	if (Array.isArray(cur)) {
// 		cur.push(value);
// 		vars[name] = cur; // re-assign to trigger reactivity
// 	} else if (cur === undefined) {
// 		vars[name] = [value];
// 	} else {
// 		throw new Error(`Cannot push to non-array var "${name}"`);
// 	}
// }

// Apply one variable command
export function applyVariableCommand(
	cmd: JsonCommandVariable | PhosphorVariable,
	command?: string
) {
	const { target, context } = cmd;
	const { action, value, rule } = context ?? {};
	// console.log('Applying variable command:', cmd, context);
	switch (action) {
		case 'set':
			if (value === undefined) {
				if (rule) {
					let r = buildRule(rule);
					// console.log(r);
					setVar(target, r);
					return;
				}
				setVar(target, command ?? '');
			} else {
				setVar(target, value);
			}
			break;
		case 'toggle':
			toggleVar(target);
			break;
		case 'increment':
			incrementVar(target, typeof value === 'number' ? value : 1);
			break;
		case 'decrement':
			decrementVar(target, typeof value === 'number' ? value : 1);
			break;
		case 'concatenate':
			concatenateVar(target, `${value}`, rule !== 'post');
			break;
		default:
			throw new Error(`Unknown variable action for "${target}": ${String(action)}`);
	}
	// console.log(getVar(target));
}

// Apply an array from JSON (ignore non-variable items safely)
export function applyVariableCommands(cmds: unknown[]) {
	(cmds ?? []).forEach((c) => {
		const cmd = c as Partial<JsonCommandVariable>;
		if (cmd?.type === 'variable' && cmd.target && cmd.context) {
			applyVariableCommand(cmd as JsonCommandVariable);
		}
	});
}

const KEY = 'phosphor-vars';

export function loadVarsFromStorage() {
	if (!browser) return;
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return;
		const obj = JSON.parse(raw) as Record<string, any>;
		for (const [k, v] of Object.entries(obj)) setVar(k, v);
	} catch {}
}

export function saveVarsToStorage() {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(vars));
	} catch {}
}

export type InjectOptions = {
	onMissing?: 'leave' | 'empty' | 'throw' | ((name: string) => string);
	stringify?: (value: PhosphorVariableType, name: string) => string;
};

export function injectVariables(text: string, opts: InjectOptions = {}): string {
	if (!text) return text;
	const { onMissing = 'leave', stringify = (v) => (v == null ? '' : String(v)) } = opts;

	const ESC = '\uE000'; // private-use placeholder
	const protectedText = text.replace(/\\\{\{/g, ESC + '{{');

	const out = protectedText.replace(/\{\{\s*([A-Za-z_][\w.-]*)\s*\}\}/g, (_m, name: string) => {
		const value = getVar(name);

		if (value === undefined) {
			if (onMissing === 'leave') return `{{${name}}}`;
			if (onMissing === 'empty') return '';
			if (onMissing === 'throw') throw new Error(`Missing variable: ${name}`);
			if (typeof onMissing === 'function') return onMissing(name);
			return `{{${name}}}`; // fallback
		}

		return stringify(value, name);
	});

	return out.replace(new RegExp(ESC + '\\{\\{', 'g'), '{{');
}

export function resolveOperand(op: Operand): PhosphorVariableType | undefined {
	switch (op.type) {
		case 'variable':
			return getVar(op.target);
		case 'value':
			return op.value;
		default:
			return undefined;
	}
}

export function evaluateCondition(cond: Condition): boolean {
	// console.log('Evaluating condition:', $state.snapshot(cond));
	// if ('and' in cond) cond.and.forEach((c) => console.log(evaluateCondition(c)));
	if ('and' in cond) return cond.and.every((c) => evaluateCondition(c));
	if ('or' in cond) return cond.or.some((c) => evaluateCondition(c));
	if ('not' in cond) return !evaluateCondition(cond.not);

	// simple
	const left = resolveOperand(cond.left);
	const right = resolveOperand(cond.right);
	const result = compareVariables(cond.op, left, right, cond.caseInsensitive);
	// console.log(`${left} ${cond.op} ${right} => ${result}`);
	return result;
}

export function compareVariables(
	op: Comparator,
	a: PhosphorVariableType | undefined,
	b: PhosphorVariableType | undefined,
	caseInsensitive = false
): boolean {
	if (a === undefined || b === undefined) return false;
	if (caseInsensitive && typeof a === 'string' && typeof b === 'string') {
		a = a.toLowerCase();
		b = b.toLowerCase();
	}
	switch (op) {
		case '=':
			return a === b;
		case '!=':
			return a !== b;
		case '<': {
			const an = toNumber(a),
				bn = toNumber(b);
			return an !== undefined && bn !== undefined && an < bn;
		}
		case '<=': {
			const an = toNumber(a),
				bn = toNumber(b);
			return an !== undefined && bn !== undefined && an <= bn;
		}
		case '>': {
			const an = toNumber(a),
				bn = toNumber(b);
			return an !== undefined && bn !== undefined && an > bn;
		}
		case '>=': {
			const an = toNumber(a),
				bn = toNumber(b);
			return an !== undefined && bn !== undefined && an >= bn;
		}
		case 'contains': {
			if (typeof a === 'string') return String(a).includes(String(b ?? ''));
			// if (Array.isArray(a)) return a.includes(b as any);
			return false;
		}
		case 'not contains': {
			if (typeof a === 'string') return !String(a).includes(String(b ?? ''));
			// if (Array.isArray(a)) return !a.includes(b as any);
			return false;
		}
		case 'startswith': {
			if (typeof a === 'string') return String(a).startsWith(String(b ?? ''));
			// if (Array.isArray(a)) return a.includes(b as any);
			return false;
		}
		case 'endswith': {
			if (typeof a === 'string') return String(a).endsWith(String(b ?? ''));
			// if (Array.isArray(a)) return a.includes(b as any);
			return false;
		}
		default:
			return false;
	}
}

function toNumber(value: PhosphorVariableType): number | undefined {
	if (typeof value === 'number') return value;
	const n = Number(value);
	return Number.isNaN(n) ? undefined : n;
}
function buildRule(rule: string): PhosphorVariableType {
	if (
		(rule.startsWith('[') || rule.startsWith('(')) &&
		(rule.endsWith(']') || rule.endsWith(')'))
	) {
		// Range rule
		const inclusiveStart = rule.startsWith('[');
		const inclusiveEnd = rule.endsWith(']');
		const parts = rule.slice(1, -1).split(',');
		if (parts.length !== 2) throw new Error(`Invalid range rule: ${rule}`);
		const start = parseFloat(parts[0]);
		const end = parseFloat(parts[1]);
		if (isNaN(start) || isNaN(end)) throw new Error(`Invalid range numbers in rule: ${rule}`);
		let min = inclusiveStart ? start : start + 1;
		let max = inclusiveEnd ? end : end - 1;
		if (min > max) throw new Error(`Invalid range: start greater than end in rule: ${rule}`);
		const result = Math.floor(Math.random() * (max - min + 1)) + min;
		return result;
	}
	if (parseFloat(rule).toString() === rule) {
		//we're given a number here.
		// return a boolean with rule probability of being true
		const prob = parseFloat(rule);
		if (isNaN(prob) || prob < 0 || prob > 1)
			throw new Error(`Invalid probability number in rule: ${rule}`);
		return Math.random() < prob;
	}
	// Accepts 0,A,X,
	const RULES = {
		'0': '0123456789',
		A: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		a: 'abcdefghijklmnopqrstuvwxyz',
		X: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		h: '0123456789abcdef',
		E: 'ACDEFGHKMNPQRSTUVWXY345679', // Exclude confusing chars
		C: 'IO0Q1B8Z2' // Confusing chars
	};

	let result: string = '';
	let i = 0;
	while (i < rule.length) {
		let char = rule.charAt(i);
		if (char === '%') {
			// escape next char
			i++;
			let nextChar = rule.charAt(i);
			console.log(nextChar);
			if (!nextChar) break;
			if (nextChar === '%') {
				result += '%';
				i++;
				continue;
			}
			if (nextChar in RULES) {
				const chars = RULES[nextChar as keyof typeof RULES];
				result += chars.charAt(Math.floor(Math.random() * chars.length));
				i++;
				continue;
			}
		} else {
			result += char;
			i++;
			continue;
		}
	}
	// for (let char of rule) {
	// 	if (char in RULES) {
	// 		const chars = RULES[char as keyof typeof RULES];
	// 		result += chars.charAt(Math.floor(Math.random() * chars.length));
	// 		continue;
	// 	} else if (char === '\\') {
	// 		// escape next char (TODO)
	// 		continue;
	// 	} else {
	// 		result += char;
	// 		continue;
	// 	}
	// }
	return result;
}
