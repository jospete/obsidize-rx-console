import { isFunction } from './utility';

/**
 * Standard callback provided to `EventEmitter` instances.
 */
export type EventEmitterDelegate<T> = (value: T) => any;

/**
 * General shape of an observable proxy function like
 * `fromEventPattern` in RxJS.
 */
export type ObservableEventPatternGenerator<T> = (
	addHandler: (listener: any) => any,
	removeHandler: (listener: any) => any
) => T;

/**
 * Generalized, minimal implementation of a container that
 * holds callbacks, and can emit values to them.
 * 
 * This implementation does not accept "named" events like `emitter.on('error', function (err) {...})`,
 * and as a consequence is drastically more simple / compact / efficient than other event emitter implementations.
 * 
 * In general, rather than smashing multiple "named" events onto one emitter, 
 * just make multiple emitter instances instead.
 * 
 * For Example:
 * - `emitter.on('next', ...)` -> onNext: EventEmitter<T>;
 * - `emitter.on('done', ...)` -> onDone: EventEmitter<T>;
 * - `emitter.on('error', ...)` -> onError: EventEmitter<any>;
 */
export class EventEmitter<T> {

	private readonly mListeners: Set<EventEmitterDelegate<T>> = new Set();

	public get listenerCount(): number {
		return this.mListeners.size;
	}

	public emit<R extends T = T>(value: R): void {
		this.mListeners.forEach(listener => listener(value));
	}

	public hasListener<R extends T = T>(listener: EventEmitterDelegate<R>): boolean {
		return this.mListeners.has(listener as any);
	}

	public addListener<R extends T = T>(listener: EventEmitterDelegate<R>): this {
		if (isFunction(listener)) this.mListeners.add(listener as any);
		return this;
	}

	public removeListener<R extends T = T>(listener: EventEmitterDelegate<R>): this {
		this.mListeners.delete(listener as any);
		return this;
	}

	public removeAllListeners(): this {
		this.mListeners.clear();
		return this;
	}

	/**
	 * Transform this instance into an observable stream, using the given
	 * generator function.
	 * 
	 * This caters mainly towards the fromEventPattern creator function
	 * provided by RxJS.
	 */
	public asObservable<ObservableType>(
		generator: ObservableEventPatternGenerator<ObservableType>
	): ObservableType {
		return generator(
			listener => this.addListener(listener),
			listener => this.removeListener(listener)
		);
	}
}