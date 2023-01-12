import { LogEvent } from './log-event';
import { EventEmitter, ObservableEventPatternGenerator } from './event-emitter';
import { type LogEventInterceptor } from './log-event-interceptor';
import { LogEventFilter } from './log-event-filter';

/**
 * Collects events from arbitrary sources and re-broadcasts them
 * based on the assigned filter and enabled state.
 */
export class LogEventSink<T extends LogEvent = LogEvent> implements LogEventInterceptor<T> {

	public readonly onNext: EventEmitter<T> = new EventEmitter<T>();
	public readonly proxy = this.onInterceptLogEvent.bind(this);

	public filter: LogEventFilter<T> = new LogEventFilter<T>();
	public enabled: boolean = true;

	/**
	 * Notify "other" when this sink receives a new log event.
	 */
	public pipeTo(other: LogEventSink | LogEventSink<T>): void {
		this.onNext.add(other.proxy);
	}

	public asObservable<ObservableType>(
		generator: ObservableEventPatternGenerator<ObservableType>
	): ObservableType {
		return this.onNext.asObservable(generator);
	}

	public onInterceptLogEvent(ev: T): void {
		if (this.enabled && this.filter.accepts(ev))
			this.onNext.emit(ev);
	}
}

let defaultSink: LogEventSink;

/**
 * Get a reference to the default root sink used by all Logger instances.
 */
export function getDefaultLoggerSink<T extends LogEvent = LogEvent>(): LogEventSink<T> {

	if (!defaultSink)
		defaultSink = new LogEventSink();

	return defaultSink as any;
}