import { take } from 'rxjs/operators';

import { RxConsole, getLogger, LogLevel, LogEvent, getLogLevelName } from '../src';

describe('RxConsole', () => {

	it('Has a static main instance', () => {
		expect(RxConsole.main).toBeTruthy();
	});

	it('has a static mock console instance', () => {
		const { mockConsole } = RxConsole;
		expect(mockConsole.verbose).not.toThrowError();
		expect(mockConsole.trace).not.toThrowError();
		expect(mockConsole.debug).not.toThrowError();
		expect(mockConsole.log).not.toThrowError();
		expect(mockConsole.info).not.toThrowError();
		expect(mockConsole.warn).not.toThrowError();
		expect(mockConsole.error).not.toThrowError();
		expect(mockConsole.fatal).not.toThrowError();
	});

	it('emits emits child logger events on the parent RxConsole instance', async () => {

		const console = new RxConsole();
		const testMessage = 'a sample log message';
		const logger = console.getLogger('MyCustomLogger', { logEvents: { level: LogLevel.VERBOSE } });
		const eventPromise = console.events.pipe(take(1)).toPromise();

		logger.debug(testMessage);
		const ev = await eventPromise;
		expect(ev.tag).toBe(logger.name);
		expect(ev.level).toBe(LogLevel.DEBUG);
		expect(ev.message).toBe(testMessage);
	});

	describe('getLogger()', () => {

		it('uses the main instance to generate loggers', () => {

			spyOn(RxConsole.main, 'getLogger').and.callThrough();

			const logger1 = getLogger('TestLogger');
			expect(RxConsole.main.getLogger).toHaveBeenCalledTimes(1);
			expect(logger1.getLevel()).toBeLessThan(LogLevel.INFO);

			const logger2 = getLogger(logger1.name, { logEvents: { level: LogLevel.INFO } });
			expect(RxConsole.main.getLogger).toHaveBeenCalledTimes(2);
			expect(logger1).toBe(logger2);
		});
	});

	describe('setLevel()', () => {

		it('sets the global level among all log entry instances', () => {

			const logger1 = getLogger('LogSourceOne');
			const logger2 = getLogger('LogSourceTwo');
			expect(logger1).not.toBe(logger2);

			logger1.setLevel(LogLevel.DEBUG);
			logger2.setLevel(LogLevel.WARN);

			expect(logger1.getLevel()).toBe(LogLevel.DEBUG);
			expect(logger2.getLevel()).toBe(LogLevel.WARN);

			RxConsole.main.setLevel(LogLevel.INFO);

			expect(logger1.getLevel()).toBe(LogLevel.INFO);
			expect(logger2.getLevel()).toBe(LogLevel.INFO);
		});
	});

	describe('destroy()', () => {

		it('destroys non-main instances', () => {

			const console = new RxConsole();
			const sampleEvent = new LogEvent(LogLevel.INFO, 'test', [], '');
			const logger = console.getLogger('ThrowAwayLogger');

			expect(console.isDestroyed()).toBe(false);
			expect(logger.isDestroyed()).toBe(false);

			console.destroy();
			expect(console.isDestroyed()).toBe(true);
			expect(logger.isDestroyed()).toBe(true);
			expect(() => console.destroy()).toThrowError();
			expect(() => console.emit(sampleEvent)).toThrowError();

			RxConsole.main.destroy();
			expect(RxConsole.main.isDestroyed()).toBe(false);
			expect(() => RxConsole.main.destroy()).not.toThrowError();
			expect(() => RxConsole.main.emit(sampleEvent)).not.toThrowError();
		});
	});

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