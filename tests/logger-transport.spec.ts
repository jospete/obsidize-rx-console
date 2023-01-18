import { fromEventPattern, lastValueFrom, Observable, take } from 'rxjs';
import { LogEvent, Logger, LoggerTransport, LogLevel } from '../src';

describe('LoggerTransport', () => {

	describe('setDefaultBroadcastEnabled()', () => {

		it('registers the default window.console broadcast function', async () => {

			const transport = new LoggerTransport();
			expect(transport.isDefaultBroadcastEnabled()).toBe(false);

			transport.setDefaultBroadcastEnabled(true);
			expect(transport.isDefaultBroadcastEnabled()).toBe(true);

			transport.setDefaultBroadcastEnabled(false);
			expect(transport.isDefaultBroadcastEnabled()).toBe(false);
		});
	});

	describe('pipeTo()', () => {

		it('can route events to other instances', async () => {

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
	});
});