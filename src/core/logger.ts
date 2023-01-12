import { LogLevel } from './log-level';
import { LogEvent } from './log-event';
import { getDefaultLoggerSink } from './log-event-sink';
import { type ConsoleLike } from './console-like';
import { type LogEventInterceptor } from './log-event-interceptor';

/**
 * Standard method for constucting loggers.
 * Uses ```getDefaultSink()``` as the default aggregator.
 */
export class Logger<T extends LogEvent = LogEvent> implements ConsoleLike {

	constructor(
		public readonly name: string,
		private readonly aggregator: LogEventInterceptor<T> = getDefaultLoggerSink<T>()
	) {
	}

	public verbose(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.VERBOSE, message, params);
	}

	public trace(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.TRACE, message, params);
	}

	public debug(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.DEBUG, message, params);
	}

	public log(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.DEBUG, message, params);
	}

	public info(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.INFO, message, params);
	}

	public warn(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.WARN, message, params);
	}

	public error(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.ERROR, message, params);
	}

	public fatal(message: string, ...params: any[]): void {
		this.emitWithLevel(LogLevel.FATAL, message, params);
	}

	protected createEvent(level: number, message: string, params: any[]): T {
		return new LogEvent(level, message, params, this.name) as T;
	}

	private emitWithLevel(level: number, message: string, params: any[]): void {
		this.emit(this.createEvent(level, message, params));
	}

	private emit(ev: T): void {
		this.aggregator.onInterceptLogEvent(ev);
	}
}