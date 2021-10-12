import { LogEvent } from './log-event';
import { LogEventEmitterBase } from './log-event-emitter-base';
import { LogEventEmitterLike } from './log-event-emitter-like';

/**
 * A read-only event stream of LogEvent instances.
 * Exposes the input source stream, as well as an 'events' stream that
 * only emits filtered values which meet the 'enabled' and 'level' requirements.
 */
export class LogEventEmitter<T extends LogEvent> extends LogEventEmitterBase<T> {

	constructor(
		protected readonly aggregator: LogEventEmitterLike<T>
	) {
		super();
	}

	public emit(ev: T): void {
		if (this.isEnabled() || !!ev && this.accepts(ev)) {
			this.aggregator.emit(ev);
		}
	}

	/**
	 * Generates a deep clone of this instance.
	 * NOTE: does not generate sub-class instances.
	 */
	public copy(): LogEventEmitter<T> {
		const result = new LogEventEmitter<T>(this.aggregator);
		result.configure(this.toConfig());
		result.accepts = this.accepts;
		return result;
	}
}