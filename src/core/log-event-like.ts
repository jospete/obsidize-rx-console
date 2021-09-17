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