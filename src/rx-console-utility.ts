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

	export function toDefaultStringFormatBase(ev: LogEventLike): string {
		const { timestamp, level, tag, message } = ev;
		const timestampJson = new Date(timestamp).toJSON();
		const levelStr = getLogLevelName(level);
		return `${timestampJson} [${levelStr}] [${tag}] ${message}`;
	}

	export function toDefaultStringFormat(ev: LogEventLike): string {
		const { params } = optObject(ev);
		const baseMessage = toDefaultStringFormatBase(ev);
		const paramsStr = stringifyOptionalParams(params);
		return baseMessage + paramsStr;
	}

	export function pipeLogEventToConsole(ev: LogEventLike, console: ConsoleLike): void {

		if (!ev || !console) return;

		const normalizedMessage = toDefaultStringFormatBase(ev);
		const { params, level } = ev;

		switch (level) {
			case LogLevel.FATAL:
			case LogLevel.ERROR:
				console.error(normalizedMessage, ...params);
				break;
			case LogLevel.WARN:
				console.warn(normalizedMessage, ...params);
				break;
			default:
				console.log(normalizedMessage, ...params);
				break;
		}
	}
}