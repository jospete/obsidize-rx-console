import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { LogLevel } from './log-level';
import { LogEvent } from './log-event';
import { ConsoleLike } from './console-like';
import { LogEventObservable } from './log-event-observable';

/**
 * Special kind of LogEventObservable that can spawn its own events via the createEvent() method.
 */
export class LogEventSubject<T extends LogEvent> extends LogEventObservable<T> implements ConsoleLike {

	public static readonly ERR_DESTROYED = 'LogEventSubject_ERR_DESTROYED';

	private readonly mSourceSubject: Subject<T>;
	public readonly name: string;

	constructor(
		name: string
	) {

		const source = new Subject<T>();
		const events = source.asObservable().pipe(share());

		super(events);

		this.name = name;
		this.mSourceSubject = source;
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

	public emitEvent(ev: T): void {
		this.mSourceSubject.next(ev);
	}

	public emit(level: number, message: string, params: any[]): void {
		this.emitEvent(this.createEvent(level, message, params));
	}

	// Creates a read-only version of this subject.
	// This is akin to Subject.asObservable()
	public toEventObservable(): LogEventObservable<T> {
		return this.copy();
	}

	public isDestroyed(): boolean {
		return !!this.mSourceSubject.closed;
	}

	// NOTE: this should not be called directly - it is a utility for RxConsole cleanup.
	public destroy(): void {
		this.mSourceSubject.error(LogEventSubject.ERR_DESTROYED);
		this.mSourceSubject.unsubscribe();
	}

	/**
	 * Override this to provide a custom data-type implementation.
	 */
	protected createEvent(level: number, message: string, params: any[]): T {
		return new LogEvent(level, message, params, this.name) as T;
	}
}