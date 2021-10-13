import { LogEvent } from './log-event';
import { LogEventEmitterBase } from './log-event-emitter-base';
import { LogEventEmitterLike } from './log-event-emitter-like';

/**
 * A read-only event stream of LogEvent instances.
 * Exposes the input source stream, as well as an 'events' stream that
 * only emits filtered values which meet the 'enabled' and 'level' requirements.
 */
export class LogEventEmitter<T extends LogEvent = LogEvent> extends LogEventEmitterBase<T> {

	constructor(
		protected readonly aggregator: LogEventEmitterLike<T>
	) {
		super();
	}

	protected onWillEmit(ev: T): void {
		this.aggregator.emit(ev);
	}
}