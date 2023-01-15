import {
	Logger,
	LoggerTransport,
	getPrimaryLoggerTransport
} from '../src';

describe('Logger', () => {

	it('is the standard way to perform context-based logging in this module', () => {

		const transport = new LoggerTransport();
		const logger = new Logger('TestLogger', transport);
		const eventSpy = jasmine.createSpy('eventSpy');

		transport.events().addListener(eventSpy);
		expect(eventSpy).not.toHaveBeenCalled();

		logger.debug('Hello, World!');
		expect(eventSpy).toHaveBeenCalled();
	});

	it('uses getDefaultSink() as the default aggregator', () => {

		const logger = new Logger('TestLogger2');
		const eventSpy = jasmine.createSpy('eventSpy');
		const transport = getPrimaryLoggerTransport();

		transport.events().addListener(eventSpy);
		expect(eventSpy).not.toHaveBeenCalled();

		logger.debug('Hello, World!');
		expect(eventSpy).toHaveBeenCalled();

		transport.events().removeListener(eventSpy);
	});

	it('implements the ConsoleLike interface', () => {

		const transport = new LoggerTransport();
		const logger = new Logger('TestLogger', transport);
		const spy = jasmine.createSpy('sinkListener');

		transport.events().addListener(spy);

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