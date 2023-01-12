import { LogEvent } from './log-event';
import { LogEventSink } from './log-event-sink';

let defaultSink: LogEventSink;

/**
 * Get a reference to the default root sink used by all Logger instances.
 */
export function getDefaultLoggerSink<T extends LogEvent = LogEvent>(): LogEventSink<T> {

	if (!defaultSink)
		defaultSink = new LogEventSink();

	return defaultSink as any;
}

/**
 * When enabled, calls `LogEvent.performDefaultBroadcast` on all default sink emissions.
 */
export function setDefaultLoggerBroadcastEnabled(enabled: boolean): void {

	const emitter = getDefaultLoggerSink().onNext;
	const callback = LogEvent.performDefaultBroadcast;
	const currentlyEnabled = emitter.has(callback);

	if (enabled && !currentlyEnabled)
		emitter.add(callback);

	else if (!enabled && currentlyEnabled)
		emitter.remove(callback);
}