import { LogEvent } from './log-event';
import { LogEventAggregator } from './log-event-aggregator';

/**
 * Standard aggregator for loggers created with ```new Logger()``` 
 */
export class RxConsole<T extends LogEvent = LogEvent> extends LogEventAggregator<T> {

	public static readonly main: RxConsole<LogEvent> = new RxConsole();

	public get isMainInstance(): boolean {
		return RxConsole.main === (this as any);
	}
}