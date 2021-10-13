import { getLogLevelName, LogLevel } from '../src';

describe('LogLevel', () => {

	describe('getLogLevelName()', () => {

		it('is a convenience for converting numeric levels to their associated name', () => {

			const targets: { level: number, value: string }[] = [
				{ level: LogLevel.VERBOSE, value: 'VERBOSE' },
				{ level: LogLevel.TRACE, value: 'TRACE' },
				{ level: LogLevel.DEBUG, value: 'DEBUG' },
				{ level: LogLevel.INFO, value: 'INFO' },
				{ level: LogLevel.WARN, value: 'WARN' },
				{ level: LogLevel.ERROR, value: 'ERROR' },
				{ level: LogLevel.FATAL, value: 'FATAL' },
				{ level: 1234, value: 'CUSTOM-LEVEL-1234' }
			];

			targets.forEach(target => {
				expect(getLogLevelName(target.level)).toBe(target.value);
			});
		});
	});
});