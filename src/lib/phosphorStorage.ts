import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
// import addFormats from 'ajv-formats';
import { browser } from '$app/environment';

import schema from '$lib/assets/jsonschema.json';
import type { PhosphorJsonData } from '$lib/PhosphorData';

const STORAGE_KEY = 'phosphor-data';

const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
// addFormats(ajv);

const validate: ValidateFunction<PhosphorJsonData> = ajv.compile(schema);

// Helpers
export type Ok<T> = { ok: true; data: T };
export type Fail = { ok: false; errors: ErrorObject[] };
export type ParseFail = { ok: false; parseError: string };
export type Result<T> = Ok<T> | Fail | ParseFail;

export const formatAjvError = (errors: ErrorObject[] = []): string[] => {
	return errors.map((e) => {
		const path = e.instancePath || e.schemaPath || '/';
		const message = e.message ?? 'Unknown error';
		const extra = e.params ? ` (${JSON.stringify(e.params)})` : '';
		return `${path}: ${message}${extra}`;
	});
};

export const validateData = (data: unknown): Result<PhosphorJsonData> => {
	if (validate(data)) {
		return { ok: true, data: data as PhosphorJsonData };
	}
	return { ok: false, errors: validate.errors ?? [] };
};

export const hasPhosphorData = (): boolean => {
	if (!browser) return false;
	return localStorage.getItem(STORAGE_KEY) !== null;
};

export const clearPhosphorData = () => {
	if (!browser) return;
	localStorage.removeItem(STORAGE_KEY);
};

export const loadPhosphorData = (): Result<PhosphorJsonData> => {
	if (!browser) return { ok: false, parseError: 'Not in browser environment' };
	const json = localStorage.getItem(STORAGE_KEY);
	if (!json) return { ok: false, parseError: 'No data in localStorage' };
	let data: unknown;
	try {
		data = JSON.parse(json);
	} catch (e) {
		return { ok: false, parseError: 'Failed to parse JSON' };
	}
	return validateData(data);
};

export const savePhosphorData = (data: unknown): Result<PhosphorJsonData> => {
	if (!browser) return { ok: false, parseError: 'Not in browser environment' };

	const validation = validateData(data);
	if (validation.ok) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}
	return validation;
};
