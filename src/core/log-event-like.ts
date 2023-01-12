import { getLogLevelName } from './log-level';
import { stringifyOptionalParams } from './utility';

/**
 * General shape of a baseline log event emitted by this module.
 */
export interface LogEventLike {
	readonly level: number;
	readonly message: string;
	readonly params: any[];
	readonly tag: string;
	readonly timestamp: number;
}

/**
 * Serializes everything on the given event to a string, except
 * for the optional params on the event.
 */
export function stringifyLogEventBaseValues(ev: LogEventLike): string {
	const { timestamp, level, tag, message } = ev;
	const timestampJson = new Date(timestamp).toJSON();
	const levelStr = getLogLevelName(level);
	return `${timestampJson} [${levelStr}] [${tag}] ${message}`;
}

/**
 * Serializes everything on the given event to a string, including
 * the optional params.
 */
export function stringifyLogEvent(ev: LogEventLike): string {
	const safeEvent = (ev || {}) as any;
	const { params } = safeEvent;
	const baseMessage = stringifyLogEventBaseValues(safeEvent);
	const paramsStr = stringifyOptionalParams(params);
	return baseMessage + paramsStr;
}