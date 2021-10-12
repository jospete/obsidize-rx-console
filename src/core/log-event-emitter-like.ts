import { LogEvent } from './log-event';

/**
 * Baseline interface for general log event emitters.
 */
export interface LogEventEmitterLike<T extends LogEvent> {
	emit(ev: T): void;
}