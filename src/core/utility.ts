export function isFunction(value: any): boolean {
	return typeof value === 'function';
}

export function truncate(str: string, targetLength: number): string {
	const safeStr = str + '';
	if (safeStr.length <= targetLength) return safeStr;
	return (safeStr.substring(0, targetLength) + '...');
}

export function stringifySafe(value: any): string {
	try {
		return JSON.stringify(value);
	} catch (_) {
		return value + '';
	}
}

/**
 * Default serializer for optional params on a log event.
 */
export function stringifyOptionalParams(optionalParams: any[], joinStr: string = ' :: ', maxLength: number = 250): string {
	if (!Array.isArray(optionalParams) || optionalParams.length <= 0) return '';
	const serializedParams = optionalParams.map(p => truncate(stringifySafe(p), maxLength));
	return (joinStr + serializedParams.join(joinStr));
}