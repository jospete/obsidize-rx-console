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

let windowConsoleBroadcast: DelegateLogEventListener;

/**
 * When enabled, calls `LogEvent.performDefaultBroadcast` on all default sink emissions.
 */
export function setDefaultBroadcastEnabled(enabled: boolean): void {

	// if we haven't created an instance yet, don't do anything when enabled=false
	if (!enabled && !windowConsoleBroadcast)
		return;

	if (!windowConsoleBroadcast)
		windowConsoleBroadcast = new DelegateLogEventListener(LogEvent.performDefaultBroadcast);

	windowConsoleBroadcast.enabled = enabled;
}