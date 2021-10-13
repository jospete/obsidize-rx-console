/**
 * Utility for declaring a bare-minimum shape for LogEvent instances.
 */
export interface LogEventLike {
	readonly timestamp: number;
	readonly level: number;
	readonly tag: string;
	readonly message: string;
	readonly params: any[];
	readonly extras?: any;
}

/**
 * Standard callback for handling emitted events
 */
export type LogEventDelegate<T extends LogEventLike = LogEventLike> = (ev: T) => void;

/**
 * Predicate that will dictate whether or not an event should be emitted.
 */
export type LogEventPredicate<T extends LogEventLike = LogEventLike> = (ev: T) => boolean;