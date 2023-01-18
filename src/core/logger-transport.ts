import { tautology } from './utility';
import { EventEmitter } from './event-emitter';

import {
	LogEvent,
	LogEventFilterPredicate,
	broadcastLogEvent
} from './log-event';

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
export class LoggerTransport {

	private readonly mEvents: EventEmitter<LogEvent> = new EventEmitter<LogEvent>();
	private readonly interceptProxy = this.onInterceptLogEvent.bind(this);
	private mFilter: LogEventFilterPredicate = tautology;

	public events(): EventEmitter<LogEvent> {
		return this.mEvents;
	}

	public accepts(ev: LogEvent): boolean {
		return this.mFilter(ev);
	}

	public pipeTo(other: LoggerTransport): this {
		return this.setPipelineEnabled(other, true);
	}

	public setFilter(value: LogEventFilterPredicate): this {
		this.mFilter = value;
		return this;
	}

	public isDefaultBroadcastEnabled(): boolean {
		return this.events().hasListener(performDefaultBroadcast);
	}

	public setDefaultBroadcastEnabled(enabled: boolean): this {
		this.events().toggleListener(performDefaultBroadcast, enabled);
		return this;
	}

	public setPipelineEnabled(other: LoggerTransport, enabled: boolean): this {
		this.events().toggleListener(other.interceptProxy, enabled);
		return this;
	}

	public transmit(level: number, tag: string, message: string, params: any[]): this {
		const ev = this.createEvent(level, tag, message, params);
		this.onInterceptLogEvent(ev);
		return this;
	}

	protected createEvent(level: number, tag: string, message: string, params: any[]): LogEvent {
		return new LogEvent(level, tag, message, params);
	}

	protected onInterceptLogEvent(ev: LogEvent): void {
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
	return (mDefaultTransport === undefined)
		? (mDefaultTransport = new LoggerTransport())
		: mDefaultTransport;
}