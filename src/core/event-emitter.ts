import { RxConsoleUtility } from './rx-console-utility';

/**
 * Callback type for EventEmitter instances.
 */
export type EventEmitterDelegate<T> = (value: T) => any;

/**
 * General interface for emitting event values.
 */
export interface EventEmitterLike<T> {
	emit(ev: T): void;
}

/**
 * Simple event emitter utility used to track callbacks in this module.
 */
export class EventEmitter<T> implements EventEmitterLike<T> {

	private readonly mListeners: Set<EventEmitterDelegate<T>> = new Set();

	public get count(): number {
		return this.mListeners.size;
	}

	public emit(value: T): void {
		this.mListeners.forEach(listener => listener(value));
	}

	public has(listener: EventEmitterDelegate<T>): boolean {
		return this.mListeners.has(listener);
	}

	public add(listener: EventEmitterDelegate<T>): this {
		if (RxConsoleUtility.isFunction(listener)) this.mListeners.add(listener);
		return this;
	}

	public remove(listener: EventEmitterDelegate<T>): this {
		this.mListeners.delete(listener);
		return this;
	}

	public clear(): this {
		this.mListeners.clear();
		return this;
	}
}