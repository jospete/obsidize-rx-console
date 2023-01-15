import { callConsoleDynamic, ConsoleLike } from './console';
import { getLogLevelName } from './log-level';
import { stringifyAndJoin } from './utility';

export interface LogEventLike {
	readonly level: number;
	readonly tag: string;
	readonly message: string;
	readonly params: any[];
	readonly timestamp: number;
}

export type LogEventSerializer = (ev: LogEventLike) => string;
export type LogEventFilterPredicate = (ev: LogEventLike) => boolean;

export function stringifyLogEventBaseValues(ev: LogEventLike): string {
	if (!ev) return (ev + '');
	const { tag, level, message, timestamp } = ev;
	const timestampJson = new Date(timestamp).toJSON();
	const levelStr = getLogLevelName(level);
	return `${timestampJson} [${levelStr}] [${tag}] ${message}`;
}

export function stringifyLogEvent(ev: LogEventLike): string {
	if (!ev) return (ev + '');
	const baseMessage = stringifyLogEventBaseValues(ev);
	const paramsStr = stringifyAndJoin(ev.params);
	return baseMessage + paramsStr;
}

export function broadcastLogEvent(
	ev: LogEventLike,
	serialize: LogEventSerializer = stringifyLogEventBaseValues,
	target: ConsoleLike = console
): void {
	callConsoleDynamic(
		target,
		ev.level,
		serialize(ev),
		ev.params
	);
}

export class LogEvent implements LogEventLike {

	constructor(
		public readonly level: number,
		public readonly tag: string,
		public readonly message: string,
		public readonly params: any[] = [],
		public readonly timestamp: number = Date.now()
	) {
	}
}