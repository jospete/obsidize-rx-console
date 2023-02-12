import { LogLevel, LogLevelNameMap } from '../src';

describe('LogLevel', () => {

	describe('getLogLevelName()', () => {

		const nameMap = LogLevelNameMap.main;

		it('is a convenience for converting numeric levels to their associated name', () => {

			const targets: { level: number, value: string }[] = [
				{ level: LogLevel.VERBOSE, value: 'VERBOSE' },
				{ level: LogLevel.TRACE, value: 'TRACE' },
				{ level: LogLevel.DEBUG, value: 'DEBUG' },
				{ level: LogLevel.INFO, value: 'INFO' },
				{ level: LogLevel.WARN, value: 'WARN' },
				{ level: LogLevel.ERROR, value: 'ERROR' },
				{ level: LogLevel.FATAL, value: 'FATAL' },
				{ level: 1234, value: 'L-1234' }
			];

			targets.forEach(target => {
				expect(nameMap.get(target.level)).toBe(target.value);
			});
		});
	});
	
	describe('LogLevelNameMap', () => {

		describe('update()', () => {

			it('allows for custom named log levels', () => {

				const nameMap = new LogLevelNameMap();

				expect(nameMap.get(LogLevel.WARN)).toBe('WARN');
	
				const LEVEL_POTATO = 1234;
				const LEVEL_BANANA = 5;
	
				nameMap.update({
					POTATO: LEVEL_POTATO, 
					BANANA: LEVEL_BANANA, 
					CUSTOM_WARN: LogLevel.WARN
				});
	
				expect(nameMap.get(LEVEL_POTATO)).toBe('POTATO');
				expect(nameMap.get(LEVEL_BANANA)).toBe('BANANA');
				expect(nameMap.get(LogLevel.WARN)).toBe('CUSTOM_WARN');
			});
	
			it('does not explode when given bad input', () => {

				const nameMap = new LogLevelNameMap();

				expect(() => nameMap.update(null as any)).not.toThrowError();
				expect(() => nameMap.update({} as any)).not.toThrowError();
				expect(() => nameMap.update('' as any)).not.toThrowError();
				expect(() => nameMap.update({test: true} as any)).not.toThrowError();
			});
		})
	});
});