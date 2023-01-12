import { Logger, LogEventSink, getDefaultSink } from '../src';

describe('Logger', () => {

	it('is the standard way to perform context-based logging in this module', () => {

		const aggregator = new LogEventSink();
		const logger = new Logger('TestLogger', aggregator);
		const eventSpy = jasmine.createSpy('eventSpy');

		aggregator.onNext.add(eventSpy);
		expect(eventSpy).not.toHaveBeenCalled();

		logger.debug('Hello, World!');
		expect(eventSpy).toHaveBeenCalled();
	});

	it('uses getDefaultSink() as the default aggregator', () => {

		const logger = new Logger('TestLogger2');
		const eventSpy = jasmine.createSpy('eventSpy');
		const defaultSink = getDefaultSink();

		defaultSink.onNext.add(eventSpy);
		expect(eventSpy).not.toHaveBeenCalled();

		logger.debug('Hello, World!');
		expect(eventSpy).toHaveBeenCalled();

		defaultSink.onNext.remove(eventSpy);
	});

	it('implements the ConsoleLike interface', () => {

		const sink = new LogEventSink();
		const logger = new Logger('TestLogger', sink);
		const spy = jasmine.createSpy('sinkListener');

		sink.onNext.add(spy);

		expect(() => logger.verbose('verbose')).not.toThrowError();
		expect(() => logger.trace('trace')).not.toThrowError();
		expect(() => logger.debug('debug')).not.toThrowError();
		expect(() => logger.log('log')).not.toThrowError();
		expect(() => logger.info('info')).not.toThrowError();
		expect(() => logger.warn('warn')).not.toThrowError();
		expect(() => logger.error('error')).not.toThrowError();
		expect(() => logger.fatal('fatal')).not.toThrowError();

		expect(spy).toHaveBeenCalledTimes(8);
	});
});