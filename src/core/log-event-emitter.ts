import { LogLevel } from './log-level';
import { LogEvent } from './log-event';
import { ConsoleLike } from './console-like';
import { EventEmitterLike } from './event-emitter';
import { LogEventEmitterBase } from './log-event-emitter-base';

/**
 * Simplified variant for type declarations.
 */
export type LogEventSource = LogEventEmitter<LogEvent>;

/**
 * Core builder that produces events via the standard ConsoleLike interface.
 * All events will be handed off to the given aggregator.
 */
export class LogEventEmitter<T extends LogEvent = LogEvent> extends LogEventEmitterBase<T> implements ConsoleLike {

	constructor(
		protected readonly aggregator: EventEmitterLike<T>,
		public readonly name: string
	) {
		super();
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

	protected onWillEmit(ev: T): void {
		this.aggregator.emit(ev);
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