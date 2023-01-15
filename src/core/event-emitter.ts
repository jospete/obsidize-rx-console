import { isFunction } from './utility';

export type EventEmitterDelegate<T> = (value: T) => any;

export type ObservableEventPatternGenerator<T> = (
	addHandler: (listener: any) => any,
	removeHandler: (listener: any) => any
) => T;

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

	public toggleListener<R extends T = T>(listener: EventEmitterDelegate<R>, active: boolean): this {
		if (active) this.addListener(listener);
		else this.removeListener(listener);
		return this;
	}

	public removeAllListeners(): this {
		this.mListeners.clear();
		return this;
	}

	public asObservable<ObservableType>(
		generator: ObservableEventPatternGenerator<ObservableType>
	): ObservableType {
		return generator(
			listener => this.addListener(listener),
			listener => this.removeListener(listener)
		);
	}
}