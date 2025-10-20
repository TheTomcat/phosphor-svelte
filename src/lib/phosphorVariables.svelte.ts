// src/lib/state/variables.ts
import { browser } from '$app/environment';
import type { JsonCommandVariable, PhosphorVariableType } from '$lib/PhosphorData';

export let vars: Record<string, PhosphorVariableType> = $state({}); // global KV store

export function getVar<T extends PhosphorVariableType = PhosphorVariableType>(
	name: string,
	fallback?: T
): T {
	return (name in vars ? (vars as any)[name] : (fallback as any)) as T;
}

export function setVar(name: string, value: PhosphorVariableType) {
	// assignment triggers reactivity for any component reading vars[name]
	vars[name] = value;
}

export function toggleVar(name: string) {
	const cur = vars[name];
	if (typeof cur === 'boolean') {
		vars[name] = !cur;
	} else if (cur === undefined) {
		vars[name] = true; // sensible default
	} else {
		// non-boolean toggle: treat truthy → false, falsy → true
		vars[name] = !Boolean(cur);
	}
}

export function incrementVar(name: string, by = 1) {
	const n = Number(vars[name] ?? 0);
	if (Number.isNaN(n)) throw new Error(`Cannot increment non-numeric var "${name}"`);
	vars[name] = n + by;
}

export function decrementVar(name: string, by = 1) {
	incrementVar(name, -by);
}

// Apply one variable command
export function applyVariableCommand(cmd: JsonCommandVariable, command?: string) {
	const { target, context } = cmd;
	const { action, value } = context ?? {};
	// console.log('Applying variable command:', cmd, context);
	switch (action) {
		case 'set':
			if (value === undefined) {
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
		default:
			throw new Error(`Unknown variable action for "${target}": ${String(action)}`);
	}
	console.log(getVar(target));
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
