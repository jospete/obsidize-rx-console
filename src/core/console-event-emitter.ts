import { LogLevel } from './log-level';
import { LogEvent } from './log-event';
import { ConsoleLike } from './console-like';
import { LogEventEmitter } from './log-event-emitter';
import { LogEventEmitterLike } from './log-event-emitter-like';

/**
 * Simplified type import type for explicit declarations.
 */
export type LogEventSource = ConsoleEventEmitter<LogEvent>;

/**
 * Special kind of LogEventObservable that can spawn its own events via the createEvent() method.
 */
export class ConsoleEventEmitter<T extends LogEvent = LogEvent> extends LogEventEmitter<T> implements ConsoleLike {

	constructor(
		aggregator: LogEventEmitterLike<T>,
		public readonly name: string
	) {
		super(aggregator);
	}

	public verbose(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.VERBOSE, message, params);
	}

	public trace(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.TRACE, message, params);
	}

	public debug(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.DEBUG, message, params);
	}

	public log(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.DEBUG, message, params);
	}

	public info(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.INFO, message, params);
	}

	public warn(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.WARN, message, params);
	}

	public error(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.ERROR, message, params);
	}

	public fatal(message: string, ...params: any[]): void {
		this.emitWith(LogLevel.FATAL, message, params);
	}

	protected emitWith(level: number, message: string, params: any[]): void {
		this.emit(this.createEvent(level, message, params));
	}

	/**
	 * Generates a LogEvent (or sub-class equivalent) instance to be emitted in the source stream.
	 * Override this to provide a custom data-type implementation.
	 */
	protected createEvent(level: number, message: string, params: any[]): T {
		return new LogEvent(level, message, params, this.name) as T;
	}
}