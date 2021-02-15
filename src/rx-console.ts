import { Observable, Subject } from 'rxjs';
import { distinct, share } from 'rxjs/operators';

import { LogEvent } from './log-event';
import { LogEventSubject } from './log-event-subject';
import { LogEventObservable } from './log-event-observable';
import { LogEventSource, RxConsoleEntry, RxConsoleEntryOptions, RxConsoleEntryHooks } from './rx-console-entry';
import { ConsoleLike } from './console-like';

/**
 * Core entry point for a collection of loggers.
 * All loggers created from here via getLogger() will have their level updated when
 * this instance's level is updated, and all LogEvent instances will be funnelled back to
 * this instance's 'events' Observable.
 */
export class RxConsole extends LogEventObservable<LogEvent> implements RxConsoleEntryHooks {

	public static readonly ERR_DESTROYED: string = 'RxConsole_ERR_DESTROYED';
	public static readonly main: RxConsole = new RxConsole();

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

	private readonly mEventSubject: Subject<LogEvent>;
	private readonly mOnLevelChange: Subject<number>;
	private readonly mLogMap: Map<string, RxConsoleEntry>;

	public readonly onLevelChange: Observable<number>;

	constructor() {

		const source = new Subject<LogEvent>();
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

	protected createEntry(name: string, options: RxConsoleEntryOptions = {}): RxConsoleEntry {
		return new RxConsoleEntry(new LogEventSubject(name), this, options);
	}

	public getLogger(name: string, options: RxConsoleEntryOptions = {}): LogEventSource {
		return this.getEntry(name, options).logger;
	}

	public emit(ev: LogEvent): void {
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

	public getEntry(name: string, options: RxConsoleEntryOptions = {}): RxConsoleEntry {

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