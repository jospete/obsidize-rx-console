/**
 * Default levels for convenience.
 */
export enum LogLevel {
	VERBOSE = 100,
	TRACE = 200,
	DEBUG = 300,
	INFO = 400,
	WARN = 500,
	ERROR = 600,
	FATAL = 1000
}

/**
 * Translate a level to its named counterpart.
 * Useful for tagging levels in stringified LogEvent instances.
 */
export const getLogLevelName = (level: number): string => {
	switch (level) {
		case LogLevel.VERBOSE: return 'VERBOSE';
		case LogLevel.TRACE: return 'TRACE';
		case LogLevel.DEBUG: return 'DEBUG';
		case LogLevel.INFO: return 'INFO';
		case LogLevel.WARN: return 'WARN';
		case LogLevel.ERROR: return 'ERROR';
		case LogLevel.FATAL: return 'FATAL';
		default: return ('CUSTOM-LEVEL-' + level);
	}
};