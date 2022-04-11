import { Logger } from './../src/core/logger';
import { fromEventPattern, Observable } from 'rxjs';
import { bufferCount, take } from 'rxjs/operators';

import { EventEmitterLike, LogEvent, LogEventEmitter, LogLevel, RxConsole } from '../src';
import { noopAggregator } from './util';

describe('LogEventEmitter', () => {

	describe('configure()', () => {

		it('has the standard ConsoleLike methods implemented', async () => {

			const console = new RxConsole();
			const logger = new Logger('SubjectTester', console);
			const events = console.asObservable<Observable<LogEvent>>(fromEventPattern);
			const eventsPromise = events.pipe(bufferCount(8), take(1)).toPromise();

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

		it('gracefully handles partial configuration objects', () => {

			const logEvents = new LogEventEmitter(noopAggregator, 'TestEmitter');

			expect(() => logEvents.configure(null)).not.toThrowError();
			expect(() => logEvents.configure({ level: -1 })).not.toThrowError();
			expect(logEvents.getLevel()).toBe(logEvents.getMinLevel());
			expect(() => logEvents.configure({ level: 5, minLevel: 1, maxLevel: 10 })).not.toThrowError();
			expect(logEvents.getLevel()).toBe(5);
			expect(() => logEvents.configure({ minLevel: 6 })).not.toThrowError();
			expect(logEvents.getMinLevel()).toBe(6);
			expect(logEvents.getLevel()).toBe(6);
		});
	});

	describe('configure() / toConfig()', () => {

		it('can be used to pass configuration between loggers', () => {

			const logger1 = new LogEventEmitter(noopAggregator, 'TestEmitter');
			const logger2 = new LogEventEmitter(noopAggregator, 'TestEmitter');

			expect(logger1.toConfig()).toEqual(logger2.toConfig());

			logger1.configure({ enabled: false, level: LogLevel.WARN });
			expect(logger1.toConfig()).not.toEqual(logger2.toConfig());

			logger2.configure(logger1.toConfig());
			expect(logger1.toConfig()).toEqual(logger2.toConfig());
		});
	});

	describe('setEnabled()', () => {

		it('overrides the acceptance delegate as a kill switch for a logger instance', () => {

			const aggregator: EventEmitterLike<any> = {
				emit: jasmine.createSpy('fakeAggregatorEmit')
			};

			const logger = new LogEventEmitter(aggregator, 'TestEmitter').configure({ level: LogLevel.INFO });
			const testEvent = new LogEvent(LogLevel.TRACE, 'test', [], '');
			expect(aggregator.emit).not.toHaveBeenCalled();

			logger.emit(testEvent);
			expect(aggregator.emit).not.toHaveBeenCalled();

			// Override so that all events pass
			logger.accepts = () => true;
			logger.emit(testEvent);

			expect(aggregator.emit).toHaveBeenCalledTimes(1);

			logger.setEnabled(false);
			expect(aggregator.emit).toHaveBeenCalledTimes(1);
		});
	});

	describe('accepts()', () => {

		it('defines the acceptance predicate which dictates when events will be emitted', () => {

			const aggregator: EventEmitterLike<any> = {
				emit: jasmine.createSpy('fakeAggregatorEmit')
			};

			const logger = new LogEventEmitter(aggregator, 'TestEmitter').configure({ level: LogLevel.INFO });
			expect(aggregator.emit).not.toHaveBeenCalled();

			const testEvent1 = new LogEvent(LogLevel.INFO, 'test', [], '');
			const testEvent2 = new LogEvent(LogLevel.TRACE, 'test', [], '');

			logger.emit(testEvent1);
			logger.emit(testEvent2);

			// Once because the TRACE log will be suppressed by the default acceptance predicate
			expect(aggregator.emit).toHaveBeenCalledTimes(1);

			// Override so that all events pass
			logger.accepts = () => true;
			logger.emit(testEvent1);
			logger.emit(testEvent2);
			logger.emit({} as any);

			expect(aggregator.emit).toHaveBeenCalledTimes(4);

			// Revert to default by setting a non-function value
			logger.accepts = null;
			logger.emit(testEvent1);
			logger.emit(testEvent2);
			logger.emit({} as any);

			expect(aggregator.emit).toHaveBeenCalledTimes(5);
		});
	});
});