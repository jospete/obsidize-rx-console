import jsonStringifySafe from 'json-stringify-safe';

import { ConsoleLike } from './console-like';
import { LogEventLike } from './log-event-like';
import { getLogLevelName, LogLevel } from './log-level';

/**
 * Single event instance, typically spawned by a LogEventSubject.
 */
export class LogEvent implements LogEventLike {

	constructor(
		public readonly timestamp: number,
		public readonly level: number,
		public readonly tag: string,
		public readonly message: string,
		public readonly params: any[],
	) {
	}

	public static truncate(str: string, targetLength: number): string {
		const safeStr = str + '';
		return (safeStr.length <= targetLength)
			? safeStr
			: (safeStr.substring(0, targetLength) + '...');
	}

	public static stringifyOptionalParams(optionalParams: any[]): string {
		const joinStr = ' :: ';
		const safeParams = [].slice.call(optionalParams)
			.map(p => LogEvent.truncate(jsonStringifySafe(p), 250));
		return (safeParams.length > 0)
			? (joinStr + safeParams.join(joinStr))
			: '';
	}

	public static toDefaultStringFormat(ev: LogEventLike): string {
		const { timestamp, level, tag, message, params } = ev;
		const timestampJson = new Date(timestamp).toJSON();
		const levelStr = getLogLevelName(level);
		const paramStr = LogEvent.stringifyOptionalParams(params);
		return `${timestampJson} [${levelStr}] [${tag}] ${message}${paramStr}`;
	}

	public static broadcast(ev: LogEventLike, console: ConsoleLike): void {
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

	public broadcastTo(console: ConsoleLike): void {
		LogEvent.broadcast(this, console);
	}

	public toString(): string {
		return LogEvent.toDefaultStringFormat(this);
	}
}