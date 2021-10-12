import { LogEvent } from './log-event';
import { RxConsoleUtility } from './rx-console-utility';
import { LogEventDelegate, LogEventEmitterBase } from './log-event-emitter-base';
import { ConsoleEventEmitter, LogEventSource } from './console-event-emitter';
import { LogEventEmitterConfig } from './log-event-emitter-config';

/**
 * Core entry point for a collection of loggers.
 * All loggers created from here via getLogger() will have their level updated when
 * this instance's level is updated, and all LogEvent instances will be funnelled back to
 * this instance's 'events' Observable.
 */
export class RxConsole<T extends LogEvent, LoggerType extends ConsoleEventEmitter<T>>
	extends LogEventEmitterBase<T> {

	public static readonly main: RxConsole<LogEvent, LogEventSource> = new RxConsole();

	private readonly mLoggerMap: Map<string, LoggerType> = new Map();
	private mDelegate: LogEventDelegate<T> = RxConsoleUtility.noop;
	private mSoloName: string | undefined = undefined;

	public get isMainInstance(): boolean {
		return RxConsole.main === (this as any);
	}

	public get delegate(): LogEventDelegate<T> {
		return this.mDelegate;
	}

	public set delegate(value: LogEventDelegate<T>) {
		this.mDelegate = RxConsoleUtility.isFunction(value)
			? value
			: RxConsoleUtility.noop;
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

	public emit(ev: T): void {
		this.delegate(ev);
	}

	public getSoloLogger(): LoggerType | undefined | null {
		return RxConsoleUtility.isPopulatedString(this.mSoloName)
			? this.getLogger(this.mSoloName!)
			: undefined;
	}

	public hasSoloLogger(): boolean {
		return !!this.getSoloLogger();
	}

	/**
	 * Set a logger to debug in isolation.
	 * Set to null to clear the current solo logger.
	 */
	public setSoloLogger(value: LoggerType | undefined | null) {
		this.mSoloName = value ? value.name : undefined;
		this.accepts = this.hasSoloLogger()
			? (ev: T) => this.acceptsSoloEvent(ev)
			: this.getDefaultAcceptanceDelegate();
	}

	/**
	 * NOTE: this does not restrict circular subscriptions. 
	 * It is up to the caller to use this responsibly, lest ye fall into the hell hole of stack overflow.
	 */
	public pipeEventsTo(otherConsole: RxConsole<T, LoggerType>): void {
		this.delegate = ev => otherConsole.emit(ev);
	}

	public setLevel(value: number): this {

		const previousLevel = this.getLevel();
		super.setLevel(value);
		const updatedLevel = this.getLevel();

		if (previousLevel !== updatedLevel) {
			this.mLoggerMap.forEach(logger => logger.setLevel(updatedLevel));
		}

		return this;
	}

	public getLogger(name: string, options: Partial<LogEventEmitterConfig> = {}): LoggerType {

		let logger = this.mLoggerMap.get(name);

		if (logger) {
			logger.configure(options);

		} else {
			logger = this.createLogger(name, options);
			this.mLoggerMap.set(name, logger);
		}

		return logger;
	}
}

/**
 * Conveinence for generating loggers via the standard 'main' RxConsole instance. 
 */
export function getLogger(name: string, options?: Partial<LogEventEmitterConfig>): LogEventSource {
	return RxConsole.main.getLogger(name, options);
}