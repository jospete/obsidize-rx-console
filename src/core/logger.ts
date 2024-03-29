import { LogLevel } from './log-level';
import { ConsoleLike } from './console';
import { LoggerTransport, getPrimaryLoggerTransport } from './logger-transport';
import { LogEventGuardContext } from './log-event-guard-context';
import { LogEvent } from './log-event';

/**
 * Stand-in for `console` object usage.
 * 
 * Instead of calling console.log() / console.warn() / etc. and losing
 * the information immediately to the javascript runtime, this will
 * pack the information in the call into a `LogEvent`, which can then
 * have zero or more post-processing routines run on it, and be emitted
 * to zero or more event observers in the parent `LoggerTransport`.
 * 
 * In general, there should be at least one new `Logger` instance per
 * file and / or scope in your project.
 */
export class Logger extends LogEventGuardContext implements ConsoleLike {
	constructor(
		public readonly name: string,
		public transport: LoggerTransport = getPrimaryLoggerTransport()
	) {
		super();
	}

	public use(transport: LoggerTransport): this {
		this.transport = transport;
		return this;
	}

	public verbose(message: string, ...params: any[]): void {
		this.emit(LogLevel.VERBOSE, message, params);
	}

	public trace(message: string, ...params: any[]): void {
		this.emit(LogLevel.TRACE, message, params);
	}

	public debug(message: string, ...params: any[]): void {
		this.emit(LogLevel.DEBUG, message, params);
	}

	public log(message: string, ...params: any[]): void {
		this.emit(LogLevel.DEBUG, message, params);
	}

	public info(message: string, ...params: any[]): void {
		this.emit(LogLevel.INFO, message, params);
	}

	public warn(message: string, ...params: any[]): void {
		this.emit(LogLevel.WARN, message, params);
	}

	public error(message: string, ...params: any[]): void {
		this.emit(LogLevel.ERROR, message, params);
	}

	public fatal(message: string, ...params: any[]): void {
		this.emit(LogLevel.FATAL, message, params);
	}

	// default to using the transport's creator function
	// can be customized in sub-classes
	public createEvent(level: number, message: string, params?: any[], timestamp?: number): LogEvent {
		return this.transport.createEvent(level, this.name, message, params, timestamp);
	}

	// can be customized in sub-classes
	public emit(level: number, message: string, params?: any[], timestamp?: number): void {
		const ev = this.createEvent(level, message, params, timestamp);
		this.emitEvent(ev);
	}

	// can be customized in sub-classes
	public emitEvent(ev: LogEvent): void {
		if (this.accepts(ev)) {
			this.transport.send(ev);
		}
	}
}