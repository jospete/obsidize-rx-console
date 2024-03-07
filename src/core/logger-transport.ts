import { EventEmitter, EventEmitterDelegate } from './event-emitter';
import { LogEvent, LogEventAction, broadcastLogEvent } from './log-event';
import { LogEventGuardContext } from './log-event-guard-context';
import { LogEventBuffer } from './log-event-buffer';
import { getGlobalInstance } from './utility';

/**
 * Core mechanism that allows many `Logger` instances to report back to a shared resource.
 * 
 * Primary entrypoints:
 * - `events()` - the shared `EventEmitter` of this tranport
 * - `setFilter(...)` - determines which events get emitted
 * - `setDefaultBroadcastEnabled(...)` - toggles global `console` variable usage
 * 
 * NOTE: Call `disableEventCaching()` to revert to v5.x non-event-caching behavior.
 */
export class LoggerTransport extends LogEventGuardContext {

	private readonly mEvents: EventEmitter<LogEvent> = new EventEmitter<LogEvent>();
	private readonly mInterceptProxy: EventEmitterDelegate<LogEvent> = this.send.bind(this);
	private readonly mDefaultBroadcastDelegate: LogEventAction = broadcastLogEvent;

	/**
	 * Data source responsible for producing new events, or
	 * recycling previously created ones.
	 */
	public readonly buffer: LogEventBuffer = new LogEventBuffer();

	public events(): EventEmitter<LogEvent> {
		return this.mEvents;
	}

	public addListener<R extends LogEvent = LogEvent>(listener: EventEmitterDelegate<R>): this {
		this.mEvents.addListener(listener);
		return this;
	}

	public removeListener<R extends LogEvent = LogEvent>(listener: EventEmitterDelegate<R>): this {
		this.mEvents.removeListener(listener);
		return this;
	}

	public removeAllListeners(): this {
		this.mEvents.removeAllListeners();
		return this;
	}

	public disableEventCaching(): this {
		this.buffer.capacity = 0;
		return this;
	}

	public pipeTo(other: LoggerTransport): this {
		if (other !== this) {
			this.mEvents.addListener(other.mInterceptProxy);
		}
		return this;
	}

	public unpipeFrom(other: LoggerTransport): this {
		this.mEvents.removeListener(other.mInterceptProxy);
		return this;
	}

	public pipeToDefault(): this {
		return this.pipeTo(getPrimaryLoggerTransport());
	}

	public unpipeFromDefault(): this {
		return this.unpipeFrom(getPrimaryLoggerTransport());
	}

	public isDefaultBroadcastEnabled(): boolean {
		return this.mEvents.hasListener(this.mDefaultBroadcastDelegate);
	}

	public enableDefaultBroadcast(): this {
		this.mEvents.addListener(this.mDefaultBroadcastDelegate);
		return this;
	}

	public disableDefaultBroadcast(): this {
		this.mEvents.removeListener(this.mDefaultBroadcastDelegate);
		return this;
	}

	public setDefaultBroadcastEnabled(enabled: boolean): this {
		return enabled
			? this.enableDefaultBroadcast()
			: this.disableDefaultBroadcast();
	}

	/**
	 * Default creator function used by the `Logger` class.
	 */
	public createEvent(level: number, context: string, message: string, params?: any[], timestamp?: number): LogEvent {
		return this.buffer.get(level, context, message, params, timestamp);
	}

	/**
	 * If the transport can accept the given event, sends the event
	 * to all listeners in the `events()` EventEmitter instance.
	 * If the event is _not_ accepted, this does nothing.
	 */
	public send(ev: LogEvent): void {
		if (this.accepts(ev)) {
			this.mEvents.emit(ev);
		}
	}
}

/**
 * Root level transport used by all `Logger` instances by default.
 * 
 * Defined as a getter function rather than as a static property on `LoggerTransport`
 * to avoid potential conflicts with static members in sub-classes of `LoggerTransport`.
 */
export function getPrimaryLoggerTransport(): LoggerTransport {
	return getGlobalInstance('LoggerTransport_MAIN', LoggerTransport);
}