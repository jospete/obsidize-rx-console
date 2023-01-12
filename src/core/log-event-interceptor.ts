import { LogEvent } from './log-event';

/**
 * Baseline type for things that capture log events.
 */
export interface LogEventInterceptor<T extends LogEvent = LogEvent> {
    onInterceptLogEvent(ev: T): void;
}