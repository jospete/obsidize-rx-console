import { take, toArray } from 'rxjs/operators';

import { RxConsole, getLogger, LogLevel, LogEvent, getLogLevelName } from '../src';

describe('RxConsole', () => {

	it('Has a static main instance', () => {
		expect(RxConsole.main).toBeTruthy();
		expect(RxConsole.main.isMainInstance).toBe(true);
	});

	it('emits emits child logger events on the parent RxConsole instance', async () => {

		const console = new RxConsole();
		expect(console.isMainInstance).toBe(false);

		const testMessage = 'a sample log message';
		const logger = console.getLogger('MyCustomLogger', { logEvents: { level: LogLevel.VERBOSE } });
		const eventPromise = console.events.pipe(take(1)).toPromise();

		logger.debug(testMessage);
		const ev = await eventPromise;
		expect(ev.tag).toBe(logger.name);
		expect(ev.level).toBe(LogLevel.DEBUG);
		expect(ev.message).toBe(testMessage);
	});

	it('can route custom RxConsole instances to other instances', async () => {

		const console = new RxConsole();
		const console2 = new RxConsole();
		const testMessage = 'a sample log message';
		const logger = console.getLogger('MyCustomLogger', { logEvents: { level: LogLevel.VERBOSE } });

		const sub = console.pipeEventsTo(console2);
		const eventPromise = console2.events.pipe(take(1)).toPromise();

		logger.debug(testMessage);
		const ev = await eventPromise;
		expect(ev.tag).toBe(logger.name);
		expect(ev.level).toBe(LogLevel.DEBUG);
		expect(ev.message).toBe(testMessage);

		sub.unsubscribe();
		console2.destroy();
		console.destroy();
	});

	it('can solo a target logger and silence all others', async () => {

		const console = new RxConsole();
		const testMessage = 'a sample log message';
		const loggerA = console.getLogger('CustomLoggerA');
		const loggerB = console.getLogger('CustomLoggerB');
		const eventPromise = console.events.pipe(take(5), toArray()).toPromise();

		expect(console.hasSoloLogger()).toBe(false);
		expect(console.getSoloLogger()).not.toBeDefined();

		loggerA.debug(testMessage);
		loggerB.debug(testMessage);

		console.setSoloLogger(loggerB);

		expect(console.hasSoloLogger()).toBe(true);
		expect(console.getSoloLogger()).toBe(loggerB);

		loggerA.debug(testMessage);
		loggerB.debug(testMessage);

		console.setSoloLogger(null);

		expect(console.hasSoloLogger()).toBe(false);
		expect(console.getSoloLogger()).not.toBeDefined();

		loggerA.debug(testMessage);
		loggerB.debug(testMessage);

		const events: LogEvent[] = await eventPromise;
		const loggerACount = events.filter(ev => ev.tag === loggerA.name).length;
		const loggerBCount = events.filter(ev => ev.tag === loggerB.name).length;

		expect(loggerACount).toBe(2);
		expect(loggerBCount).toBe(3);

		console.destroy();
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

			expect(() => RxConsole.main.destroy()).toThrowError();
			expect(RxConsole.main.isDestroyed()).toBe(false);
		});
	});

	describe('setLevel()', () => {

		it('sets the global level among all log entry instances', () => {

			const console = new RxConsole();
			const logger1 = console.getLogger('LogSourceOne');
			const logger2 = console.getLogger('LogSourceTwo');
			expect(logger1).not.toBe(logger2);

			logger1.setLevel(LogLevel.DEBUG);
			logger2.setLevel(LogLevel.WARN);

			expect(logger1.getLevel()).toBe(LogLevel.DEBUG);
			expect(logger2.getLevel()).toBe(LogLevel.WARN);

			console.setLevel(LogLevel.INFO);

			expect(logger1.getLevel()).toBe(LogLevel.INFO);
			expect(logger2.getLevel()).toBe(LogLevel.INFO);

			console.destroy();
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