import { LogLevel } from './log-level';
import { ConsoleLike } from './console';
import { LoggerTransport, getPrimaryLoggerTransport } from './logger-transport';

export class Logger implements ConsoleLike {

	constructor(
		public readonly name: string,
		protected readonly transport: LoggerTransport = getPrimaryLoggerTransport()
	) {
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

	protected emit(level: number, message: string, params: any[]): void {
		this.transport.transmit(level, this.name, message, params);
	}
}