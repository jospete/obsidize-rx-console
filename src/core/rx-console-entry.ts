import { Observable, Subscription, Unsubscribable } from 'rxjs';

import { LogEvent } from './log-event';
import { LogEventSubject } from './log-event-subject';
import { LogEventObservable, LogEventObservableConfig } from './log-event-observable';

/**
 * Simplified type for when generics are not explicitly used.
 */
export type LogEventSource = LogEventSubject<LogEvent>;

/**
 * Simplified type for when generics are not explicitly used.
 */
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
	logEvents?: Partial<LogEventObservableConfig>;
}

/**
 * Metadata instance for loggers created by an RxConsole.
 */
export class RxConsoleEntry<T extends LogEvent, LoggerType
	extends LogEventSubject<T>>
	implements Unsubscribable {

	private readonly mLevelChangeSubscription: Subscription;
	private readonly mLoggerSubscription: Subscription;

	constructor(
		public readonly logger: LoggerType,
		hooks: RxConsoleEntryHooks,
		options: RxConsoleEntryOptions = {}
	) {
		this.mLevelChangeSubscription = hooks.onLevelChange.subscribe(v => this.logger.setLevel(v));
		this.mLoggerSubscription = this.logger.events.subscribe(ev => hooks.emit(ev));
		this.configure(options);
	}

	public configure(options: RxConsoleEntryOptions): this {
		if (options && options.logEvents) this.logger.configure(options.logEvents);
		return this;
	}

	/**
	 * Alias of destroy, required to implement the Unsubscribable interface.
	 */
	public unsubscribe(): void {
		this.destroy();
	}

	/**
	 * Permanently destroys this entry and its associated logger instance.
	 * Use with caution.
	 */
	public destroy(): void {
		this.mLevelChangeSubscription.unsubscribe();
		this.mLoggerSubscription.unsubscribe();
		this.logger.destroy();
	}
}