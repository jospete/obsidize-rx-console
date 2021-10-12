import { LogLevel } from './log-level';

/**
 * Configurable options for a LogEventObservable instance.
 */
export interface LogEventEmitterConfig {
	level: number;
	minLevel: number;
	maxLevel: number;
	enabled: boolean;
}

export const LogEventEmitterConfigDefaults: LogEventEmitterConfig = {
	minLevel: LogLevel.VERBOSE,
	maxLevel: LogLevel.FATAL,
	level: LogLevel.VERBOSE,
	enabled: true
};