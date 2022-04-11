import { fromEventPattern, Observable } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

import { RxConsole, LogLevel, LogEvent, Logger } from '../src';

describe('RxConsole', () => {

	it('Has a static main instance', () => {
		expect(RxConsole.main).toBeTruthy();
		expect(RxConsole.main.isMainInstance).toBe(true);
	});

	it('emits emits child logger events on the parent RxConsole instance', async () => {

		const console = new RxConsole();
		expect(console.isMainInstance).toBe(false);

		const testMessage = 'a sample log message';
		const logger = new Logger('MyCustomLogger', console).configure({ level: LogLevel.VERBOSE });
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
		const logger = new Logger('MyCustomLogger', console);
		const events = console2.asObservable<Observable<LogEvent>>(fromEventPattern);

		console.listeners.add(console2.proxy);
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
		const loggerA = new Logger('CustomLoggerA', console);
		const loggerB = new Logger('CustomLoggerB', console);
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

	it('can enable and disable default broadcasts to the window console object', () => {

		const rxConsole = new RxConsole();
		expect(rxConsole.listeners.has(LogEvent.performDefaultBroadcast)).toBe(false);

		rxConsole.enableDefaultBroadcast();
		expect(rxConsole.listeners.has(LogEvent.performDefaultBroadcast)).toBe(true);

		rxConsole.disableDefaultBroadcast();
		expect(rxConsole.listeners.has(LogEvent.performDefaultBroadcast)).toBe(false);

		expect(() => rxConsole.disableDefaultBroadcast()).not.toThrowError();
		expect(rxConsole.listeners.has(LogEvent.performDefaultBroadcast)).toBe(false);
	});
});