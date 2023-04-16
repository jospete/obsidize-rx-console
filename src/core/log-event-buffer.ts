import { LogEvent } from './log-event';
import { isFunction, isNumber } from './utility';

export type LogEventCreator = (level: number, context: string, message: string, params: any[]) => LogEvent;

function createDefaultEvent(level: number, context: string, message: string, params: any[]): LogEvent {
	return new LogEvent(level, context, message, params);
}

/**
 * Utility to recycle LogEvent instances so that this module can
 * put a soft cap on how much garbage it creates.
 * 
 * Note that the event instances cached in this buffer are the
 * same ones that get passed on to transport event listeners, and that
 * this module expects the consumers of these instances to NOT modify them.
 * 
 * To disable caching completely, set capacity to zero (emulates v5.x behavior).
 */
export class LogEventBuffer {

	private items: LogEvent[] = [];
	private mCapacity: number = 1;
	private mCursor: number = 0;
	private mOnCreate: LogEventCreator = createDefaultEvent;

	public get capacity(): number {
		return this.mCapacity;
	}

	public set capacity(value: number) {
		if (isNumber(value))
			this.mCapacity = Math.max(0, Math.round(value));
	}

	public get onCreateEvent(): LogEventCreator {
		return this.mOnCreate;
	}

	public set onCreateEvent(value: LogEventCreator) {
		this.mOnCreate = isFunction(value) ? value : createDefaultEvent;
	}

	public clear(): void {
		
		while (this.items.length > 0)
			this.items.pop();

		this.mCursor = 0;
	}

	public get(level: number, context: string, message: string, params: any[]): LogEvent {

		if (this.capacity <= 0)
			return this.onCreateEvent(level, context, message, params);

		if (this.items.length < this.capacity) {
			const result = this.onCreateEvent(level, context, message, params);
			this.items.push(result);
			return result;
		}

		const cachedItem = this.items[this.mCursor];
		cachedItem.initialize(level, context, message, params);

		this.mCursor = (this.mCursor + 1) % this.items.length;

		return cachedItem;
	}
}