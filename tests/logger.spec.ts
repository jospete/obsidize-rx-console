import { RxConsole } from './../src/core/rx-console';
import { Logger, EventEmitter } from '../src';

describe('Logger', () => {

	it('is the standard way to perform context-based logging in this module', () => {

        const aggregator = new EventEmitter();
        const logger = new Logger('TestLogger', aggregator);
        const eventSpy = jasmine.createSpy('eventSpy');

        aggregator.add(eventSpy);
        expect(eventSpy).not.toHaveBeenCalled();

        logger.debug('Hello, World!');
        expect(eventSpy).toHaveBeenCalled();
    });

    it('uses RxConsole.main as the default aggregator', () =>  {

        const logger = new Logger('TestLogger2');
        const eventSpy = jasmine.createSpy('eventSpy');

        RxConsole.main.listeners.add(eventSpy);
        expect(eventSpy).not.toHaveBeenCalled();

        logger.debug('Hello, World!');
        expect(eventSpy).toHaveBeenCalled();
    });
});