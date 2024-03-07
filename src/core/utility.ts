export const DEFAULT_JOIN_STRING = ' :: ';
export const DEFAULT_STRINGIFY_MAX_LENGTH = 250;

/**
 * placeholder that always returns true, used by default in
 * most filter functions for this module.
 */
export function tautology(): boolean {
	return true;
}

export function isFunction(value: any): boolean {
	return typeof value === 'function';
}

export function isString(value: any): boolean {
	return typeof value === 'string';
}

export function isObject(value: any): boolean {
	return typeof value === 'object' && value !== null;
}

export function isNumber(value: any): boolean {
	return typeof value === 'number' && !Number.isNaN(value);
}

export function isUndefined(value: any): boolean {
	return typeof value === 'undefined';
}

export function isNil(value: any): boolean {
	return isUndefined(value) || value === null;
}

export function optional<T>(value: T, fallback: T): T {
	return isNil(value) ? fallback : value;
}

/**
 * Abbreviates the given string if it exceeds the target length.
 */
export function truncate(str: string, targetLength: number): string {
	if (isString(str) && str.length > targetLength) {
		return `${str.substring(0, targetLength)}...`;
	}

	return str;
}

/**
 * Attempts to run `JSON.stringify()` on the given value,
 * and does a brute force string coersion on error.
 */
export function jsonStringifySafe(value: any): string {
	try {
		return JSON.stringify(value);
	} catch {
		return value + '';
	}
}

/**
 * Performs `JSON.stringify()` on the given value, and truncates the result
 * if it exceeds the target maximum length.
 */
export function stringify(
	value: any,
	maxLength: number = DEFAULT_STRINGIFY_MAX_LENGTH
): string {
	return truncate(jsonStringifySafe(value), maxLength);
}

/**
 * Performs `stringify()` on all values, and joins 
 * them together with the given separator.
 */
export function stringifyAndJoin(
	values: any[] | undefined,
	separator: string = DEFAULT_JOIN_STRING,
	maxLength?: number
): string {
	if (Array.isArray(values) && values.length > 0) {
		const stringifiedValues: string[] = [];
		for (const value of values) {
			stringifiedValues.push(stringify(value, maxLength));
		}
		return separator + stringifiedValues.join(separator);
	}

	return '';
}

export interface ClassConstructor<T> {
	new(...args: any[]): T;
}

declare var global: any;

export function getGlobalInstance<T>(key: string, Ctor: ClassConstructor<T>): T {
	const target: any = window || global;
	const globalKey = `__obsidize_rx-console_${key}`;
	let value = target[globalKey];

	if (!(value && (value instanceof Ctor))) {
		value = target[globalKey] = new Ctor();
	}

	return value;
}