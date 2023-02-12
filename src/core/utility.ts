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

/**
 * Abbreviates the given string if it exceeds the target length.
 */
export function truncate(str: string, targetLength: number): string {

	if (isString(str) && str.length > targetLength)
		return `${str.substring(0, targetLength)}...`;
	
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
export function stringify(value: any, maxLength: number = 250): string {
	return truncate(jsonStringifySafe(value), maxLength);
}

/**
 * Performs `stringify()` on all values, and joins 
 * them together with the given separator.
 */
export function stringifyAndJoin(
	values: any[],
	separator: string = ' :: ',
	maxLength?: number
): string {

	if (Array.isArray(values) && values.length > 0) {	
		const stringifiedValues = values.map(p => stringify(p, maxLength));
		return separator + stringifiedValues.join(separator);
	}
	
	return '';
}