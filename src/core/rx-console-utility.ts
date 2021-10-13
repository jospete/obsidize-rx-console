import { ConsoleLike } from './console-like';
import { LogEventLike } from './log-event-like';
import { getLogLevelName, LogLevel } from './log-level';

/**
 * Helper functions for common checks and data transformation.
 */
export namespace RxConsoleUtility {

	export function identity(value: any): any {
		return value;
	}

	export function isNumber(value: any): boolean {
		return typeof value === 'number';
	}

	export function isBoolean(value: any): boolean {
		return typeof value === 'boolean';
	}

	export function isString(value: any): boolean {
		return typeof value === 'string';
	}

	export function isFunction(value: any): boolean {
		return typeof value === 'function';
	}

	export function isPopulatedString(value: any): boolean {
		return isString(value) && value.length > 0;
	}

	export function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}

	export function optObject<T>(value: T): T {
		return (value || {} as T);
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

	export function stringifyOptionalParams(optionalParams: any[], joinStr: string = ' :: ', maxLength: number = 250): string {
		if (!Array.isArray(optionalParams) || optionalParams.length <= 0) return '';
		const serializedParams = optionalParams.map(p => truncate(stringifySafe(p), maxLength));
		return (joinStr + serializedParams.join(joinStr));
	}

	export function stringifyLogEventBaseValues(ev: LogEventLike): string {
		const { timestamp, level, tag, message } = ev;
		const timestampJson = new Date(timestamp).toJSON();
		const levelStr = getLogLevelName(level);
		return `${timestampJson} [${levelStr}] [${tag}] ${message}`;
	}

	export function stringifyLogEvent(ev: LogEventLike): string {
		const safeEvent = optObject(ev);
		const { params } = safeEvent;
		const baseMessage = stringifyLogEventBaseValues(safeEvent);
		const paramsStr = stringifyOptionalParams(params);
		return baseMessage + paramsStr;
	}

	export function callConsoleDynamic(console: ConsoleLike, level: number, message: string, params: any[]): void {

		// ** This waters down the levels to ones that are definitely defined on 99% of clients.

		if (level >= LogLevel.ERROR) {
			console.error(message, ...params);
			return;
		}

		if (level >= LogLevel.WARN) {
			console.warn(message, ...params);
			return;
		}

		console.log(message, ...params);
	}
}