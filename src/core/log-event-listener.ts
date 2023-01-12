import { LogEvent } from './log-event';
import { type LogEventInterceptor } from './log-event-interceptor';
import { LogEventSink, getDefaultSink } from './log-event-sink';

/**
 * Baseline for anything that wants to listen for / respond to events.
 */
export abstract class LogEventListener<T extends LogEvent = LogEvent> implements LogEventInterceptor<T> {

	private readonly listener = this.onInterceptLogEvent.bind(this);

	constructor(
		private readonly source: LogEventSink<T> = getDefaultSink<T>(),
		autoWatch: boolean = true
	) {
		this.enabled = autoWatch;
	}

	public get enabled(): boolean {
		return this.source.onNext.has(this.listener);
	}

	public set enabled(value: boolean) {
		if (value) this.watchSource();
		else this.unwatchSource();
	}

	public watchSource(): void {
		this.source.onNext.add(this.listener);
	}

	public unwatchSource(): void {
		this.source.onNext.remove(this.listener);
	}

	public abstract onInterceptLogEvent(ev: T): void;
}