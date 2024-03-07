import { fromEventPattern, lastValueFrom, Observable, take } from 'rxjs';
import { getPrimaryLoggerTransport, LogEvent, Logger, LoggerTransport, LogLevel } from '../src';

describe('LoggerTransport', () => {
	it('should have convenience accessors for event listeners', () => {
		const transport = new LoggerTransport();
		const emitter = transport.events();
		const noop = () => { };

		spyOn(emitter, 'addListener').and.callThrough();
		transport.addListener(noop);
		expect(emitter.addListener).toHaveBeenCalledWith(noop);

		spyOn(emitter, 'removeListener').and.callThrough();
		transport.removeListener(noop);
		expect(emitter.removeListener).toHaveBeenCalledWith(noop);

		spyOn(emitter, 'removeAllListeners').and.callThrough();
		transport.removeAllListeners();
		expect(emitter.removeAllListeners).toHaveBeenCalled();
	});

	it('should allow for event caching to be disabled', () => {
		const transport = new LoggerTransport();

		const ev1 = transport.createEvent(0, 'test', 'message', []);
		const ev2 = transport.createEvent(0, 'test', 'message', []);
		expect(ev1).toBe(ev2);

		transport.disableEventCaching();

		const ev3 = transport.createEvent(0, 'test', 'message', []);
		const ev4 = transport.createEvent(0, 'test', 'message', []);

		expect(ev1).not.toBe(ev3);
		expect(ev1).not.toBe(ev4);
		expect(ev3).not.toBe(ev4);
	});

	it('should allow for using setFilter() and setEnabled() to customize acceptance behavior', () => {
		const transport = new LoggerTransport()
			.setFilter(ev => ev.level >= LogLevel.INFO)
			.setEnabled(false);

		const ev = new LogEvent(LogLevel.DEBUG, 'test-event', 'some stuff');
		expect(transport.accepts(ev)).toBe(false);

		transport.setFilter(null);
		expect(transport.accepts(ev)).toBe(false);
		expect(transport.isEnabled()).toBe(false);

		transport.setEnabled(1 as any);
		expect(transport.accepts(ev)).toBe(true);
		expect(transport.isEnabled()).toBe(true);
		expect(() => transport.setEnabled(transport.isEnabled())).not.toThrowError();
	});

	describe('setDefaultBroadcastEnabled()', () => {
		it('should register the default window.console broadcast function', async () => {
			const transport = new LoggerTransport();
			expect(transport.isDefaultBroadcastEnabled()).toBe(false);

			transport.setDefaultBroadcastEnabled(true);
			expect(transport.isDefaultBroadcastEnabled()).toBe(true);

			transport.setDefaultBroadcastEnabled(false);
			expect(transport.isDefaultBroadcastEnabled()).toBe(false);
		});
	});

	describe('pipeTo()', () => {
		it('should allow for routing events to other instances', async () => {
			const transport = new LoggerTransport();
			const transport2 = new LoggerTransport();
			const testMessage = 'a sample log message';
			const logger = new Logger('MyCustomLogger', transport);
			const events = transport2.events().asObservable<Observable<LogEvent>>(fromEventPattern);

			transport.pipeTo(transport2);

			const eventPromise = lastValueFrom(events.pipe(take(1)));
			logger.debug(testMessage);

			const ev = await eventPromise;
			expect(ev.tag).toBe(logger.name);
			expect(ev.level).toBe(LogLevel.DEBUG);
			expect(ev.message).toBe(testMessage);
		});

		it('should do nothing when passed a reference to itself (help avoid infinite loops)', async () => {
			const transport = new LoggerTransport();
			const testMessage = 'a sample log message';
			const logger = new Logger('MyCustomLogger', transport);

			transport.pipeTo(transport);

			expect(() => logger.debug(testMessage)).not.toThrowError();
		});
	});

	describe('getPrimaryLoggerTransport()', () => {
		it('should return a valid instance', () => {
			const transport = getPrimaryLoggerTransport();
			expect(transport instanceof LoggerTransport).toBe(true);
		});

		it('should return the same instance from multiple calls', () => {
			const transport1 = getPrimaryLoggerTransport();
			const transport2 = getPrimaryLoggerTransport();
			const transport3 = getPrimaryLoggerTransport();
			expect(transport1).toBe(transport2);
			expect(transport2).toBe(transport3);
		});
	});
});