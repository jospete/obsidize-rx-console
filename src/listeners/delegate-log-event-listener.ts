import { LogEvent, LogEventListener, LogEventSink } from '../core';

/**
 * Simple listener that runs a given "onNext" function on each emission.
 */
export class DelegateLogEventListener<T extends LogEvent = LogEvent> extends LogEventListener<T> {

	constructor(
		private readonly onNext: (ev: T) => void,
		source?: LogEventSink<T>,
		autoWatch?: boolean
	) {
		super(source, autoWatch);
	}

	public onInterceptLogEvent(ev: T): void {
		this.onNext(ev);
	}
}

const windowConsoleBroadcast = new DelegateLogEventListener(LogEvent.performDefaultBroadcast);

/**
 * When enabled, calls `LogEvent.performDefaultBroadcast` on all default sink emissions.
 */
export function setDefaultBroadcastEnabled(enabled: boolean): void {
	windowConsoleBroadcast.enabled = enabled;
}