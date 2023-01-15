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

export function getLogLevelName(level: number): string {
	return namesByLevel.get(level) || ('L-' + level);
}