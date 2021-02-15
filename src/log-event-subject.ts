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

	constructor(name: string) {
		const source = new Subject<T>();
		const events = source.asObservable().pipe(share());
		super(name, events);
		this.mSourceSubject = source;
	}

	verbose(message: string, ...params: any[]): void {
		this.emit(LogLevel.VERBOSE, message, params);
	}

	trace(message: string, ...params: any[]): void {
		this.emit(LogLevel.TRACE, message, params);
	}

	debug(message: string, ...params: any[]): void {
		this.emit(LogLevel.DEBUG, message, params);
	}

	log(message: string, ...params: any[]): void {
		this.emit(LogLevel.DEBUG, message, params);
	}

	warn(message: string, ...params: any[]): void {
		this.emit(LogLevel.WARN, message, params);
	}

	error(message: string, ...params: any[]): void {
		this.emit(LogLevel.ERROR, message, params);
	}

	fatal(message: string, ...params: any[]): void {
		this.emit(LogLevel.FATAL, message, params);
	}

	emit(level: number, message: string, params: any[]): void {
		this.mSourceSubject.next(this.createEvent(level, message, params));
	}

	toEventObservable(): LogEventObservable<T> {
		return this.copy();
	}

	destroy(): void {
		this.mSourceSubject.error(LogEventSubject.ERR_DESTROYED);
		this.mSourceSubject.unsubscribe();
	}

	protected createEvent(level: number, message: string, params: any[]): T {
		return new LogEvent(Date.now(), level, this.name, message, params) as T;
	}
}