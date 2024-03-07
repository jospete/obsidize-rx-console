import { Config } from './config';
import { callConsoleDynamic, ConsoleLike } from './console';
import { LogLevelNameMap } from './log-level-name-map';
import { optional, stringifyAndJoin } from './utility';

/**
 * General shape of a log event.
 * Minimal set of values required for LogEvent utility functions to work properly.
 */
export interface LogEventLike {
	readonly level: number;
	readonly tag: string;
	readonly message: string;
	readonly params: any[] | undefined;
	readonly timestamp: number;
}

export type LogEventAction = (ev: LogEventLike) => void;
export type LogEventSerializer = (ev: LogEventLike) => string;
export type LogEventFilterPredicate = (ev: LogEventLike) => boolean;

/**
 * Serializes the given log event, using all values except for `params`.
 */
export function stringifyLogEventBaseValues(
	ev: LogEventLike,
	levelNameMap: LogLevelNameMap = LogLevelNameMap.main
): string {
	if (!ev) {
		return (ev + '');
	}

	const { tag, level, message, timestamp } = ev;
	const timestampJson = new Date(timestamp).toJSON();
	const levelStr = levelNameMap.get(level);

	return `${timestampJson} [${levelStr}] [${tag}] ${message}`;
}

/**
 * Serializes the given log event, using all values (including `params`).
 * Note that the default behavior for `params` serialization is to
 * stringify and truncate each value past a certain threshold.
 * 
 * For more details on how `params` is serialized, 
 * see the `stringifyAndJoin` utility function.
 */
export function stringifyLogEvent(
	ev: LogEventLike,
	levelNameMap?: LogLevelNameMap,
	stringifySeparator?: string,
	stringifyMaxLength?: number
): string {
	if (!ev) {
		return (ev + '');
	}

	const baseMessage = stringifyLogEventBaseValues(ev, levelNameMap);
	const paramsStr = stringifyAndJoin(ev.params, stringifySeparator, stringifyMaxLength);

	return baseMessage + paramsStr;
}

/**
 * Serializes the given event and passes it onto the target console-like object.
 * 
 * The default serializer only performs partial serialization excluding `params`,
 * and delegates handling of `params` to the console-like object.
 * 
 * The default console-like target is the global `console` object.
 */
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

/**
 * Base class for values that get generated by `Logger` instances.
 * 
 * NOTE: this class should be considered read-only, and its
 * fields should not be mutated directly. The caching system
 * in this module expects that event instances will not be
 * mutated by external sources.
 */
export class LogEvent implements LogEventLike {
	public level!: number;
	public tag!: string;
	public message!: string;
	public params!: any[] | undefined;
	public timestamp!: number;

	private readonly config: Config = Config.sharedInstance;

	constructor(
		level: number,
		tag: string,
		message: string,
		params?: any[],
		timestamp?: number
	) {
		this.initialize(
			level,
			tag,
			message,
			params,
			timestamp
		);
	}

	/**
	 * Convenience api akin to JSON.stringify().
	 */
	public static stringify(
		ev: LogEventLike,
		ignoreParams?: boolean,
		levelNameMap?: LogLevelNameMap,
		parameterSeparator?: string,
		stringifyMaxLength?: number
	): string {
		return ignoreParams
			? stringifyLogEventBaseValues(ev, levelNameMap)
			: stringifyLogEvent(ev, levelNameMap, parameterSeparator, stringifyMaxLength);
	}

	/**
	 * See `stringifyAndJoin` for argument details.
	 */
	public getMessageWithParams(
		parameterSeparator?: string,
		stringifyMaxLength?: number
	): string {
		parameterSeparator = optional(parameterSeparator, this.config.parameterSeparator);
		stringifyMaxLength = optional(stringifyMaxLength, this.config.stringifyMaxLength);
		return this.message + stringifyAndJoin(this.params, parameterSeparator, stringifyMaxLength);
	}

	public toString(
		ignoreParams?: boolean,
		levelNameMap?: LogLevelNameMap,
		parameterSeparator?: string,
		stringifyMaxLength?: number
	): string {
		levelNameMap = optional(levelNameMap, this.config.levelNameMap);
		parameterSeparator = optional(parameterSeparator, this.config.parameterSeparator);
		stringifyMaxLength = optional(stringifyMaxLength, this.config.stringifyMaxLength);
		return LogEvent.stringify(this, ignoreParams, levelNameMap, parameterSeparator, stringifyMaxLength);
	}

	/**
	 * Make a copy of this instance.
	 * Useful if you want to buffer events without 
	 * disabling event caching at the transport level.
	 */
	public clone(): LogEvent {
		return new LogEvent(
			this.level,
			this.tag,
			this.message,
			this.params,
			this.timestamp
		);
	}

	/**
	 * Used by the caching system to recycle existing event instances.
	 * It is not recommended to use this directly.
	 */
	public initialize(
		level: number,
		tag: string,
		message: string,
		params: any[] | undefined = undefined,
		timestamp: number = Date.now()
	): void {
		this.level = level;
		this.tag = tag;
		this.message = message;
		this.params = params;
		this.timestamp = timestamp;
	}
}