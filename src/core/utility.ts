export function tautology(): boolean {
	return true;
}

export function isFunction(value: any): boolean {
	return typeof value === 'function';
}

export function isString(value: any): boolean {
	return typeof value === 'string';
}

export function truncate(str: string, targetLength: number): string {

	if (!isString(str) || str.length <= targetLength)
		return str;

	return `${str.substring(0, targetLength)}...`;
}

export function jsonStringifySafe(value: any): string {
	try {
		return JSON.stringify(value);
	} catch {
		return value + '';
	}
}

export function stringify(value: any, maxLength: number = 250): string {
	return truncate(jsonStringifySafe(value), maxLength);
}

export function stringifyAndJoin(values: any[], joinStr: string = ' :: ', maxLength?: number): string {

	if (!Array.isArray(values) || values.length <= 0)
		return '';

	const stringifiedValues = values.map(p => stringify(p, maxLength));
	return joinStr + stringifiedValues.join(joinStr);
}