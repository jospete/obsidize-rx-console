import { Observable, Subject } from 'rxjs';
import { distinct, share } from 'rxjs/operators';

import { LogEvent } from './log-event';
import { ConsoleLike } from './console-like';
import { LogEventSubject } from './log-event-subject';
import { LogEventObservable } from './log-event-observable';
import { RxConsoleEntry, RxConsoleEntryOptions, RxConsoleEntryHooks, LogEventSource } from './rx-console-entry';

/**
 * Core entry point for a collection of loggers.
 * All loggers created from here via getLogger() will have their level updated when
 * this instance's level is updated, and all LogEvent instances will be funnelled back to
 * this instance's 'events' Observable.
 */
export class RxConsole<T extends LogEvent, LoggerType extends LogEventSubject<T>>
	extends LogEventObservable<T>
	implements RxConsoleEntryHooks {

	public static readonly ERR_DESTROYED: string = 'RxConsole_ERR_DESTROYED';
	public static readonly main: RxConsole<LogEvent, LogEventSource> = new RxConsole();

	public static readonly mockConsole: ConsoleLike = {
		verbose: () => { },
		trace: () => { },
		debug: () => { },
		log: () => { },
		info: () => { },
		warn: () => { },
		error: () => { },
		fatal: () => { }
	};

	private readonly mEventSubject: Subject<T>;
	private readonly mOnLevelChange: Subject<number>;
	private readonly mLogMap: Map<string, RxConsoleEntry<T, LoggerType>>;

	public readonly onLevelChange: Observable<number>;

	constructor() {

		const source = new Subject<T>();
		const events = source.asObservable().pipe(share());

		super(events);

		this.mEventSubject = source;
		this.mOnLevelChange = new Subject();
		this.mLogMap = new Map();

		this.onLevelChange = this.mOnLevelChange.asObservable().pipe(
			distinct(),
			share()
		);
	}

	/**
	 * Override this to provide a custom data-type implementation.
	 */
	protected createEntryLogger(name: string, options: RxConsoleEntryOptions): LoggerType {
		return new LogEventSubject(name) as LoggerType;
	}

	protected createEntry(name: string, options: RxConsoleEntryOptions = {}): RxConsoleEntry<T, LoggerType> {
		return new RxConsoleEntry(this.createEntryLogger(name, options), this, options);
	}

	public getLogger(name: string, options: RxConsoleEntryOptions = {}): LogEventSubject<T> {
		return this.getEntry(name, options).logger;
	}

	public emit(ev: T): void {
		this.mEventSubject.next(ev);
	}

	public setLevel(value: number): this {
		super.setLevel(value);
		this.mOnLevelChange.next(value);
		return this;
	}

	public destroy(): void {
		this.mLogMap.forEach(entry => entry.destroy());
		this.mLogMap.clear();
		this.mEventSubject.error(RxConsole.ERR_DESTROYED);
		this.mEventSubject.unsubscribe();
		this.mOnLevelChange.error(RxConsole.ERR_DESTROYED);
		this.mOnLevelChange.unsubscribe();
	}

	public getEntry(name: string, options: RxConsoleEntryOptions = {}): RxConsoleEntry<T, LoggerType> {

		let entry = this.mLogMap.get(name);

		if (entry) {
			entry.configure(options);

		} else {
			entry = this.createEntry(name, options);
			this.mLogMap.set(name, entry);
		}

		return entry;
	}
}