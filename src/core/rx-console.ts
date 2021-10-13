import { LogEvent } from './log-event';
import { RxConsoleUtility } from './rx-console-utility';
import { LogEventEmitterBase } from './log-event-emitter-base';
import { ConsoleEventEmitter, LogEventSource } from './console-event-emitter';
import { LogEventEmitterConfig } from './log-event-emitter-config';
import { LogEventDelegate } from './log-event-like';
import { EventEmitter } from './event-emitter';

/**
 * Alias for a generator function similar to (or equal to) the rxjs fromEventPattern() function.
 * We have this set as an alias so as to avoid dragging in rxjs as a required dependency.
 */
export type ObservableEventPatternGenerator<T> = (
	addHandler: (listener: any) => any,
	removeHandler: (listener: any) => any
) => T;

/**
 * Core entry point for a collection of loggers.
 * 
 * All loggers created from here via getLogger() will have their level updated when
 * this instance's level is updated, and all LogEvent instances will be funnelled back to
 * this instance's registered event listeners.
 * 
 * To route events into an rxjs-like observable, use asObservable().
 */
export class RxConsole<T extends LogEvent = LogEvent, LoggerType extends ConsoleEventEmitter<T> = ConsoleEventEmitter<T>> extends LogEventEmitterBase<T> {

	public static readonly main: RxConsole<LogEvent, LogEventSource> = new RxConsole();

	public readonly listeners: EventEmitter<T> = new EventEmitter();
	public readonly proxy: LogEventDelegate<T> = this.emit.bind(this);

	private readonly mLoggerMap: Map<string, LoggerType> = new Map();
	private mSoloName: string | undefined = undefined;

	public get isMainInstance(): boolean {
		return RxConsole.main === (this as any);
	}

	protected onWillEmit(ev: T): void {
		this.listeners.emit(ev);
	}

	protected acceptsSoloEvent(ev: T): boolean {
		return !!ev && ev.tag === this.mSoloName;
	}

	/**
	 * Override this to provide a custom data-type implementation.
	 */
	protected createLogger(name: string, _options?: Partial<LogEventEmitterConfig>): LoggerType {
		return new ConsoleEventEmitter(this, name) as LoggerType;
	}

	public asObservable<T>(generator: ObservableEventPatternGenerator<T>): T {
		return generator(
			listener => this.listeners.add(listener),
			listener => this.listeners.remove(listener)
		);
	}

	public hasSoloLogger(): boolean {
		return !!this.getSoloLogger();
	}

	/**
	 * Get the current solo'd logger.
	 * Returns undefined if there is no solo logger set.
	 */
	public getSoloLogger(): LoggerType | undefined | null {
		return RxConsoleUtility.isPopulatedString(this.mSoloName)
			? this.getLogger(this.mSoloName!)
			: undefined;
	}

	/**
	 * Set a logger to debug in isolation.
	 * Set to null to clear the current solo logger.
	 */
	public setSoloLogger(value: LoggerType | undefined | null): this {
		this.mSoloName = value ? value.name : undefined;
		this.accepts = this.hasSoloLogger()
			? (ev: T) => this.acceptsSoloEvent(ev)
			: this.getDefaultAcceptanceDelegate();
		return this;
	}

	/**
	 * Sets the *global* level filter for all created loggers.
	 */
	public setLevel(value: number): this {

		const previousLevel = this.getLevel();
		super.setLevel(value);
		const updatedLevel = this.getLevel();

		if (previousLevel !== updatedLevel) {
			this.mLoggerMap.forEach(logger => logger.setLevel(updatedLevel));
		}

		return this;
	}

	/**
	 * Find or create a logger instance for the given name.
	 */
	public getLogger(name: string): LoggerType {

		let logger = this.mLoggerMap.get(name);

		if (!logger) {
			logger = this.createLogger(name);
			this.mLoggerMap.set(name, logger);
		}

		return logger;
	}
}

/**
 * Conveinence for generating loggers via the standard 'main' RxConsole instance. 
 */
export function getLogger(name: string): LogEventSource {
	return RxConsole.main.getLogger(name);
}