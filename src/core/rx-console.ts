import { LogEvent } from './log-event';
import { LogEventDelegate } from './log-event-like';
import { LogEventEmitterBase } from './log-event-emitter-base';
import { EventEmitter, ObservableEventPatternGenerator } from './event-emitter';
import { Logger } from './logger';

/**
 * Core entry point for a collection of loggers.
 * 
 * All loggers created from here via getLogger() will have their level updated when
 * this instance's level is updated, and all LogEvent instances will be funnelled back to
 * this instance's registered event listeners.
 * 
 * To route events into an rxjs-like observable, use asObservable().
 */
export class RxConsole<T extends LogEvent = LogEvent> extends LogEventEmitterBase<T> {

	public static readonly main: RxConsole<LogEvent> = new RxConsole();

	public readonly listeners: EventEmitter<T> = new EventEmitter();
	public readonly proxy: LogEventDelegate<T> = this.emit.bind(this);

	private mSoloLogger: Logger<T> | undefined = undefined;

	public get isMainInstance(): boolean {
		return RxConsole.main === (this as any);
	}

	protected onWillEmit(ev: T): void {
		this.listeners.emit(ev);
	}

	protected acceptsSoloEvent(ev: T): boolean {
		return !!ev && ev.tag === this.mSoloLogger?.name;
	}

	/**
	 * Routes all traffic for this instance to ```window.console```
	 */
	public enableDefaultBroadcast(): this {
		this.listeners.add(LogEvent.performDefaultBroadcast);
		return this;
	}

	/**
	 * Removes ```window.console``` traffic routing from this instance if it was enabled previously.
	 * Does nothing if global log traffic routing is not enabled.
	 */
	public disableDefaultBroadcast(): this {
		this.listeners.remove(LogEvent.performDefaultBroadcast);
		return this;
	}

	public asObservable<T>(generator: ObservableEventPatternGenerator<T>): T {
		return this.listeners.asObservable(generator);
	}

	public hasSoloLogger(): boolean {
		return !!this.getSoloLogger();
	}

	/**
	 * Get the current solo'd logger.
	 * Returns undefined if there is no solo logger set.
	 */
	public getSoloLogger(): Logger<T> | undefined | null {
		return this.mSoloLogger;
	}

	/**
	 * Set a logger to debug in isolation.
	 * Set to null to clear the current solo logger.
	 */
	public setSoloLogger(value: Logger<T> | undefined | null): this {
		this.mSoloLogger = value ? value : undefined;
		this.accepts = this.hasSoloLogger()
			? (ev: T) => this.acceptsSoloEvent(ev)
			: this.getDefaultAcceptanceDelegate();
		return this;
	}
}