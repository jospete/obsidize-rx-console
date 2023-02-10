import { EventEmitter, EventEmitterDelegate } from './event-emitter';
import { LogEvent, broadcastLogEvent } from './log-event';
import { LogEventGuardContext } from './log-event-guard-context';

function performDefaultBroadcast(ev: LogEvent): void {
	broadcastLogEvent(ev);
}

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
	private readonly interceptProxy: EventEmitterDelegate<LogEvent> = this.transmit.bind(this);

	public events(): EventEmitter<LogEvent> {
		return this.mEvents;
	}

	public pipeTo(other: LoggerTransport): this {
		this.mEvents.addListener(other.interceptProxy);
		return this;
	}

	public unpipeFrom(other: LoggerTransport): this {
		this.mEvents.removeListener(other.interceptProxy);
		return this;
	}

	public pipeToDefault(): this {
		return this.pipeTo(getPrimaryLoggerTransport());
	}

	public unpipeFromDefault(): this {
		return this.unpipeFrom(getPrimaryLoggerTransport());
	}

	public isDefaultBroadcastEnabled(): boolean {
		return this.mEvents.hasListener(performDefaultBroadcast);
	}

	public enableDefaultBroadcast(): this {
		this.mEvents.addListener(performDefaultBroadcast);
		return this;
	}

	public disableDefaultBroadcast(): this {
		this.mEvents.removeListener(performDefaultBroadcast);
		return this;
	}

	public setDefaultBroadcastEnabled(enabled: boolean): this {
		return enabled
			? this.enableDefaultBroadcast()
			: this.disableDefaultBroadcast();
	}

	public transmit(ev: LogEvent): void {
		if (this.accepts(ev)) this.mEvents.emit(ev);
	}

	public createEvent(level: number, context: string, message: string, params: any[]): LogEvent {
		return new LogEvent(level, context, message, params);
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
	return (mDefaultTransport === undefined)
		? (mDefaultTransport = new LoggerTransport())
		: mDefaultTransport;
}