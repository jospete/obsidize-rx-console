import { EventEmitter, EventEmitterDelegate } from './event-emitter';
import { LogEvent, LogEventAction, broadcastLogEvent } from './log-event';
import { LogEventGuardContext } from './log-event-guard-context';

/**
 * Core mechanism that allows many `Logger` instances to report back to a shared resource.
 * 
 * Primary entrypoints:
 * - `events()` - the shared `EventEmitter` of this tranport
 * - `setFilter(...)` - determines which events get emitted
 * - `setDefaultBroadcastEnabled(...)` - toggles global `console` variable usage
 */
export class LoggerTransport extends LogEventGuardContext {

	private readonly mEvents: EventEmitter<LogEvent> = new EventEmitter<LogEvent>();
	private readonly mInterceptProxy: EventEmitterDelegate<LogEvent> = this.send.bind(this);
	private readonly mDefaultBroadcastDelegate: LogEventAction = broadcastLogEvent;

	public events(): EventEmitter<LogEvent> {
		return this.mEvents;
	}

	public pipeTo(other: LoggerTransport): this {
		if (other !== this) this.mEvents.addListener(other.mInterceptProxy);
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
	 * Can be customized in sub-classes of LoggerTransport.
	 */
	public createEvent(level: number, context: string, message: string, params: any[]): LogEvent {
		return new LogEvent(level, context, message, params);
	}

	/**
	 * If the transport can accept the given event, sends the event
	 * to all listeners in the `events()` EventEmitter instance.
	 * If the event is _not_ accepted, this does nothing.
	 */
	public send(ev: LogEvent): void {
		if (this.accepts(ev)) this.mEvents.emit(ev);
	}
}

let mDefaultTransport: LoggerTransport | undefined = undefined;

/**
 * Root level transport used by all `Logger` instances by default.
 * 
 * Defined as a getter function rather than as a static property on `LoggerTransport`
 * to avoid potential conflicts with static members in sub-classes of `LoggerTransport`.
 */
export function getPrimaryLoggerTransport(): LoggerTransport {
	if (mDefaultTransport === undefined)
		mDefaultTransport = new LoggerTransport();
	return mDefaultTransport;
}