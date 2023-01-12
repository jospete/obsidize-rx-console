/**
 * Default levels for convenience.
 * These values are spaced out in such a way that you can add more granularity as needed.
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

const namesByLevel = new Map<number, string>(
	Object.entries(LogLevel).map(([k, v]) => [v, k])
);

/**
 * Translate a level to its named counterpart.
 * Useful for tagging levels in stringified LogEvent instances.
 */
export function getLogLevelName(level: number): string {
	return namesByLevel.get(level) || ('L-' + level);
}