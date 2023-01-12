import { fromEventPattern, lastValueFrom, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import {
	getDefaultLoggerSink,
	LogEvent,
	LogLevel,
	Logger,
	LogEventSink
} from '../src';

describe('LogEventSink', () => {

	it('has a default main instance', () => {
		expect(getDefaultLoggerSink()).toBeTruthy();
	});

	it('emits emits child logger events on the parent RxConsole instance', async () => {

		const sink = new LogEventSink();

		const testMessage = 'a sample log message';
		const logger = new Logger('MyCustomLogger', sink);
		const events = sink.asObservable<Observable<LogEvent>>(fromEventPattern);
		const eventPromise = lastValueFrom(events.pipe(take(1)));

		logger.debug(testMessage);
		const ev = await eventPromise;
		expect(ev.tag).toBe(logger.name);
		expect(ev.level).toBe(LogLevel.DEBUG);
		expect(ev.message).toBe(testMessage);
	});

	describe('enabled', () => {

		it('can be set to false to disable all emissions', () => {

			const sink = new LogEventSink();
			const spy = jasmine.createSpy('sinkSpy');

			sink.onNext.add(spy);

			expect(spy).not.toHaveBeenCalled();

			sink.onInterceptLogEvent(new LogEvent(LogLevel.VERBOSE, 'test', [], 'test'));
			expect(spy).toHaveBeenCalledTimes(1);

			sink.enabled = false;

			sink.onInterceptLogEvent(new LogEvent(LogLevel.VERBOSE, 'test2', [], 'test2'));
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('pipeTo', () => {

		it('can route events to other instances', async () => {

			const console = new LogEventSink();
			const console2 = new LogEventSink();
			const testMessage = 'a sample log message';
			const logger = new Logger('MyCustomLogger', console);
			const events = console2.asObservable<Observable<LogEvent>>(fromEventPattern);

			console.pipeTo(console2);
			const eventPromise = lastValueFrom(events.pipe(take(1)));

			logger.debug(testMessage);

			const ev = await eventPromise;

			expect(ev.tag).toBe(logger.name);
			expect(ev.level).toBe(LogLevel.DEBUG);
			expect(ev.message).toBe(testMessage);
		});
	})
});