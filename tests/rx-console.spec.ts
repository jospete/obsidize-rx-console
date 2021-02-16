import { RxConsole, getLogger, LogLevel, LogEvent } from '../src/index';

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
});