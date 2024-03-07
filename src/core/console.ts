import { LogLevel } from './log-level';

/**
 * Baseline interface shared between Logger class and the standard
 * `console` javascript global.
 */
export interface ConsoleLike {
	verbose?(message: string, ...params: any[]): void;
	trace(message: string, ...params: any[]): void;
	debug(message: string, ...params: any[]): void;
	log(message: string, ...params: any[]): void;
	info(message: string, ...params: any[]): void;
	warn(message: string, ...params: any[]): void;
	error(message: string, ...params: any[]): void;
	fatal?(message: string, ...params: any[]): void;
}

const NO_PARAMS: any[] = [];

/**
 * Calls the appropriate method on the given target,
 * based on the given level (See `LogLevel` for presets).
 */
export function callConsoleDynamic(
	target: ConsoleLike,
	level: number,
	message: string,
	params: any[] = NO_PARAMS
): void {
	// Only use .error(), .warn(), and .log() to reduce chance of 
	// reference errors on the given target object.
	// (also reduces overall cost of this operation)

	if (level >= LogLevel.ERROR) {
		target.error(message, ...params);
		return;
	}

	if (level >= LogLevel.WARN) {
		target.warn(message, ...params);
		return;
	}

	target.log(message, ...params);
}
