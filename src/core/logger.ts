import { LogEvent } from './log-event';
import { RxConsole } from './rx-console';
import { EventEmitterLike } from './event-emitter';
import { LogEventEmitter } from './log-event-emitter';

/**
 * Standard method for constucting loggers.
 * Uses ```RxConsole.main``` as the default aggregator.
 */
export class Logger<T extends LogEvent = LogEvent> extends LogEventEmitter<T> {

    constructor(
        name: string,
        aggregator: EventEmitterLike<T> = RxConsole.main
    ) {
        super(aggregator, name);
    }
}