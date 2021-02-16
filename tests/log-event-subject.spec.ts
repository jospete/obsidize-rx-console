import { bufferCount, take } from 'rxjs/operators';

import { LogLevel, RxConsole } from '../src';

describe('LogEventSubject', () => {

	it('has the standard ConsoleLike methods implemented', async () => {

		const console = new RxConsole();
		const logger = console.getLogger('SubjectTester');
		const eventsPromise = console.events.pipe(bufferCount(8), take(1)).toPromise();

		logger.verbose('1');
		logger.trace('2');
		logger.debug('3');
		logger.log('4');
		logger.info('5');
		logger.warn('6');
		logger.error('7');
		logger.fatal('8');

		const logEvents = await eventsPromise;

		const eventExpectationData: { level: number, message: string }[] = [
			{ level: LogLevel.VERBOSE, message: '1' },
			{ level: LogLevel.TRACE, message: '2' },
			{ level: LogLevel.DEBUG, message: '3' },
			{ level: LogLevel.DEBUG, message: '4' },
			{ level: LogLevel.INFO, message: '5' },
			{ level: LogLevel.WARN, message: '6' },
			{ level: LogLevel.ERROR, message: '7' },
			{ level: LogLevel.FATAL, message: '8' },
		];

		eventExpectationData.forEach((data, index) => {
			const ev = logEvents[index];
			expect(ev.level).toBe(data.level);
			expect(ev.message).toBe(data.message);
		});
	});

	describe('toEventObservable()', () => {

		it('transposes a subject instance to a readonly stream', async () => {

			const console = new RxConsole();
			const logger = console.getLogger('SubjectTester');
			const readonlyLogger = logger.toEventObservable();
			expect(logger).not.toEqual(readonlyLogger as any);

			const eventPromise = readonlyLogger.events.pipe(take(1)).toPromise();
			logger.info('test');

			const ev = await eventPromise;
			expect(ev.tag).toBe(logger.name);
			expect(ev.level).toBe(LogLevel.INFO);
			expect(ev.message).toBe('test');
		});
	});
});