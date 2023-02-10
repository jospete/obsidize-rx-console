import {
	Logger,
	LoggerTransport,
	getPrimaryLoggerTransport,
	LogLevel
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

	it('can swap out its transport after creation', () => {

		const transport = new LoggerTransport();
		const transport2 = new LoggerTransport();
		const logger = new Logger('TestLogger', transport);

		logger.use(transport2);
		expect(logger.transport).toBe(transport2);
	});

	it('can have a custom filter applied', () => {

		const spy = jasmine.createSpy('sinkListener');
		const transport = new LoggerTransport();
		const logger = new Logger('TestLogger', transport)
			.setFilter(ev => ev.level >= LogLevel.INFO);

		transport.events().addListener(spy);
		logger.trace('should not emit trace');
		logger.debug('should not emit debug');
		logger.info('should emit info');
		logger.warn('should emit warn');

		expect(spy).toHaveBeenCalledTimes(2);
	});
});