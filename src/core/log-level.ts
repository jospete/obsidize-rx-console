/**
 * Default levels provided by this module.
 * Values are spaced out so more granular levels
 * can be defined between them if desired.
 */
export const LogLevel = {
	VERBOSE: 100,
	TRACE: 200,
	DEBUG: 300,
	INFO: 400,
	WARN: 500,
	ERROR: 600,
	FATAL: 1000
} as const;