import { Subject, Subscription } from 'rxjs';

import { LogEvent } from './log-event';
import { LogEventSubject } from './log-event-subject';
import { LogEventObservable } from './log-event-observable';

export type LogEventSource = LogEventSubject<LogEvent>;
export type ReadOnlyLogEventSource = LogEventObservable<LogEvent>;

export interface RxConsoleEntry {
	readonly logger: LogEventSource;
	readonly broadcastHooks: { [key: string]: Subscription };
}

export interface RxConsoleEntryOptions {

}

export class RxConsole {

	private readonly mLogMap: Map<string, RxConsoleEntry> = new Map();
	private readonly mOnLevelChange: Subject<number> = new Subject();
	public onCreateLogger: (name: string, options: RxConsoleEntryOptions) => RxConsoleEntry

	public getEntry(name: string, options: RxConsoleEntryOptions = {}): RxConsoleEntry {

		let entry = this.mLogMap.get(name);

		if (!entry) {

			const logger = new LogEventSubject(name);

			entry = {
				logger,
				broadcastHooks: {
					levelChange: this.mOnLevelChange.subscribe(v => logger.level = v)
				}
			};

			this.mLogMap.set(name, entry);
		}

		return entry;
	}
}