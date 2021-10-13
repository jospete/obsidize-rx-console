import { fromEventPattern, Observable } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

import { RxConsole, getLogger, LogLevel, LogEvent } from '../src';

describe('RxConsole', () => {

	it('Has a static main instance', () => {
		expect(RxConsole.main).toBeTruthy();
		expect(RxConsole.main.isMainInstance).toBe(true);
	});

	it('emits emits child logger events on the parent RxConsole instance', async () => {

		const console = new RxConsole();
		expect(console.isMainInstance).toBe(false);

		const testMessage = 'a sample log message';
		const logger = console.getLogger('MyCustomLogger', { level: LogLevel.VERBOSE });
		const events = console.asObservable<Observable<LogEvent>>(fromEventPattern);
		const eventPromise = events.pipe(take(1)).toPromise();

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
		const logger = console.getLogger('MyCustomLogger', { level: LogLevel.VERBOSE });
		const events = console2.asObservable<Observable<LogEvent>>(fromEventPattern);

		console2.addEventListener(console.emitProxy);
		const eventPromise = events.pipe(take(1)).toPromise();

		logger.debug(testMessage);

		const ev = await eventPromise;

		expect(ev.tag).toBe(logger.name);
		expect(ev.level).toBe(LogLevel.DEBUG);
		expect(ev.message).toBe(testMessage);
	});

	it('can solo a target logger and silence all others', async () => {

		const console = new RxConsole();
		const testMessage = 'a sample log message';
		const loggerA = console.getLogger('CustomLoggerA');
		const loggerB = console.getLogger('CustomLoggerB');
		const events = console.asObservable<Observable<LogEvent>>(fromEventPattern);
		const eventPromise = events.pipe(take(5), toArray()).toPromise();

		expect(console.hasSoloLogger()).toBe(false);
		expect(console.getSoloLogger()).not.toBeDefined();

		loggerA.debug(testMessage);
		loggerB.debug(testMessage);

		console.setSoloLogger(loggerB);

		expect(console.hasSoloLogger()).toBe(true);
		expect(console.getSoloLogger()).toBe(loggerB);

		loggerA.debug(testMessage); // This should be suppressed
		loggerB.debug(testMessage);

		console.setSoloLogger(null);

		expect(console.hasSoloLogger()).toBe(false);
		expect(console.getSoloLogger()).not.toBeDefined();

		loggerA.debug(testMessage);
		loggerB.debug(testMessage);

		const loadedEvents: LogEvent[] = await eventPromise;
		const loggerACount = loadedEvents.filter(ev => ev.tag === loggerA.name).length;
		const loggerBCount = loadedEvents.filter(ev => ev.tag === loggerB.name).length;

		expect(loggerACount).toBe(2);
		expect(loggerBCount).toBe(3);
	});

	describe('getLogger()', () => {

		it('uses the main instance to generate loggers', () => {

			spyOn(RxConsole.main, 'getLogger').and.callThrough();

			const logger1 = getLogger('TestLogger');
			expect(RxConsole.main.getLogger).toHaveBeenCalledTimes(1);
			expect(logger1.getLevel()).toBeLessThan(LogLevel.INFO);

			const logger2 = getLogger(logger1.name, { level: LogLevel.INFO });
			expect(RxConsole.main.getLogger).toHaveBeenCalledTimes(2);
			expect(logger1).toBe(logger2);
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
		});
	});
});