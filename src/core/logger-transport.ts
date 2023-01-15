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

export class LoggerTransport {

	private readonly mEvents: EventEmitter<LogEvent> = new EventEmitter<LogEvent>();
	private readonly interceptProxy = this.onInterceptLogEvent.bind(this);
	private mFilter: LogEventFilterPredicate = tautology;

	protected onInterceptLogEvent(ev: LogEvent): void {
		if (this.accepts(ev)) this.mEvents.emit(ev);
	}

	protected createEvent(level: number, tag: string, message: string, params: any[]): LogEvent {
		return new LogEvent(level, tag, message, params);
	}

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
}

let mDefaultTransport: LoggerTransport | undefined = undefined;

export function getPrimaryLoggerTransport(): LoggerTransport {
	return (mDefaultTransport === undefined)
		? (mDefaultTransport = new LoggerTransport())
		: mDefaultTransport;
}