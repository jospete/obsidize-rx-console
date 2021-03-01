import { ConsoleLike } from './console-like';
import { LogEventLike } from './log-event-like';
import { getLogLevelName, LogLevel } from './log-level';

export namespace RxConsoleUtility {

	export function isNumber(value: any): boolean {
		return typeof value === 'number';
	}

	export function isBoolean(value: any): boolean {
		return typeof value === 'boolean';
	}

	export function optObject<T>(value: T): T {
		return (value || {} as T);
	}

	export function sliceArray<T>(value: T[]): T[] {
		return [].slice.call(value);
	}

	export function truncate(str: string, targetLength: number): string {
		const safeStr = str + '';
		return (safeStr.length <= targetLength)
			? safeStr
			: (safeStr.substring(0, targetLength) + '...');
	}

	export function stringifySafe(value: any): string {
		try {
			return JSON.stringify(value);
		} catch (e) {
			return value + '';
		}
	}

	export function stringifyOptionalParams(optionalParams: any[], joinStr: string = ' :: '): string {
		const safeParams = sliceArray(optionalParams).map(p => truncate(stringifySafe(p), 250));
		return (safeParams.length > 0) ? (joinStr + safeParams.join(joinStr)) : '';
	}

	export function stringifyLogEventBaseValues(ev: LogEventLike): string {
		const { timestamp, level, tag, message } = ev;
		const timestampJson = new Date(timestamp).toJSON();
		const levelStr = getLogLevelName(level);
		return `${timestampJson} [${levelStr}] [${tag}] ${message}`;
	}

	export function stringifyLogEvent(ev: LogEventLike): string {
		const { params } = optObject(ev);
		const baseMessage = stringifyLogEventBaseValues(ev);
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