import { LogEvent } from './log-event';
import { type LogEventInterceptor } from './log-event-interceptor';
import { LogEventSink, getDefaultLoggerSink } from './log-event-sink';

/**
 * Baseline for anything that wants to listen for / respond to events.
 */
export abstract class LogEventListener<T extends LogEvent = LogEvent> implements LogEventInterceptor<T> {

	private readonly proxy = this.onInterceptLogEvent.bind(this);

	constructor(
		private readonly source: LogEventSink<T> = getDefaultLoggerSink<T>(),
		autoWatch?: boolean
	) {
		if (autoWatch) this.enabled = true;
	}

	public get enabled(): boolean {
		return this.source.onNext.has(this.proxy);
	}

	public set enabled(value: boolean) {
		if (value) this.watchSource();
		else this.unwatchSource();
	}

	public watchSource(): void {
		this.source.onNext.add(this.proxy);
	}

	public unwatchSource(): void {
		this.source.onNext.remove(this.proxy);
	}

	public abstract onInterceptLogEvent(ev: T): void;
}