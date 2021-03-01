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

	export function stringifyOptionalParams(optionalParams: any[]): string {
		const joinStr = ' :: ';
		const safeParams = [].slice.call(optionalParams)
			.map(p => truncate(stringifySafe(p), 250));
		return (safeParams.length > 0)
			? (joinStr + safeParams.join(joinStr))
			: '';
	}

	export function toDefaultStringFormatBase(ev: LogEventLike): string {
		const { timestamp, level, tag, message } = ev;
		const timestampJson = new Date(timestamp).toJSON();
		const levelStr = getLogLevelName(level);
		return `${timestampJson} [${levelStr}] [${tag}] ${message}`;
	}

	export function toDefaultStringFormat(ev: LogEventLike): string {
		const { timestamp, level, tag, message, params } = ev;
		const timestampJson = new Date(timestamp).toJSON();
		const levelStr = getLogLevelName(level);
		const paramStr = stringifyOptionalParams(params);
		return `${timestampJson} [${levelStr}] [${tag}] ${message}${paramStr}`;
	}

	export function broadcast(ev: LogEventLike, console: ConsoleLike): void {
		switch (ev.level) {
			case LogLevel.FATAL:
			case LogLevel.ERROR:
				console.error(ev.message, ...ev.params);
				break;
			case LogLevel.WARN:
				console.warn(ev.message, ...ev.params);
				break;
			default:
				console.log(ev.message, ...ev.params);
				break;
		}
	}
}