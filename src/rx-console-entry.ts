import { Observable, Subscription, Unsubscribable } from 'rxjs';

import { LogEvent } from './log-event';
import { LogEventSubject } from './log-event-subject';
import { LogEventObservable, LogEventObservableConfig } from './log-event-observable';

export type LogEventSource = LogEventSubject<LogEvent>;
export type ReadOnlyLogEventSource = LogEventObservable<LogEvent>;

/**
 * Bare-minimum interface for hooks required for an entry to function.
 */
export interface RxConsoleEntryHooks {
	onLevelChange: Observable<number>;
	emit(ev: LogEvent): void;
}

/**
 * Configuration options for an entry - note that these can also update pre-existing instances.
 */
export interface RxConsoleEntryOptions {
	logEvents?: LogEventObservableConfig;
}

/**
 * Metadata instance for loggers created by an RxConsole.
 */
export class RxConsoleEntry implements Unsubscribable {

	private readonly mLevelChangeSubscription: Subscription;
	private readonly mLoggerSubscription: Subscription;

	constructor(
		public readonly logger: LogEventSource,
		hooks: RxConsoleEntryHooks,
		options?: RxConsoleEntryOptions
	) {
		this.mLevelChangeSubscription = hooks.onLevelChange.subscribe(v => this.logger.setLevel(v));
		this.mLoggerSubscription = this.logger.events.subscribe(ev => hooks.emit(ev));
		this.configure(options);
	}

	public configure(options: RxConsoleEntryOptions = {}): this {
		if (options.logEvents) this.logger.configure(options.logEvents);
		return this;
	}

	public unsubscribe(): void {
		this.mLevelChangeSubscription.unsubscribe();
		this.mLoggerSubscription.unsubscribe();
	}

	public destroy(): void {
		this.unsubscribe();
	}
}