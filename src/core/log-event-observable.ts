import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { LogEvent } from './log-event';
import { LogLevel } from './log-level';
import { RxConsoleUtility } from './rx-console-utility';

/**
 * Configurable options for a LogEventObservable instance.
 */
export interface LogEventObservableConfig {
	level: number;
	minLevel: number;
	maxLevel: number;
	enabled: boolean;
}

/**
 * A read-only event stream of LogEvent instances.
 * Exposes the input source stream, as well as an 'events' stream that
 * only emits filtered values which meet the 'enabled' and 'level' requirements.
 */
export class LogEventObservable<T extends LogEvent> {

	public static readonly configDefaults: LogEventObservableConfig = {
		minLevel: LogLevel.VERBOSE,
		maxLevel: LogLevel.FATAL,
		level: LogLevel.VERBOSE,
		enabled: true
	};

	private mMinLevel: number = LogEventObservable.configDefaults.minLevel;
	private mMaxLevel: number = LogEventObservable.configDefaults.maxLevel;
	private mLevel: number = LogEventObservable.configDefaults.level;
	private mEnabled: boolean = LogEventObservable.configDefaults.enabled;

	public accepts: (ev: T) => boolean = (ev: T) => this.acceptsLevel(ev.level);

	public readonly events: Observable<T> = this.source.pipe(
		filter(ev => this.isEnabled() && !!ev && this.accepts(ev))
	);

	constructor(
		public readonly source: Observable<T>
	) {
	}

	public isEnabled(): boolean {
		return this.mEnabled;
	}

	/**
	 * Set the enabled state of this emitter.
	 * When disabled, the 'events' stream will not emit any values, regardless of the set level.
	 */
	public setEnabled(value: boolean): this {
		this.mEnabled = !!value;
		return this;
	}

	/**
	 * Get the minimum required level for output events in the 'events' stream.
	 */
	public getLevel(): number {
		return this.mLevel;
	}

	/**
	 * Set the minimum required level for output events in the 'events' stream.
	 * Any events below this level will be omitted from the stream.
	 * NOTE: this value will be clamped between the minLevel and maxLevel values.
	 */
	public setLevel(value: number): this {
		this.mLevel = Math.max(this.getMinLevel(), Math.min(value, this.getMaxLevel()));
		return this;
	}

	public getMinLevel(): number {
		return this.mMinLevel;
	}

	/**
	 * Set the min possible level for this stream.
	 * See setLevel() for more info.
	 * 
	 * NOTE: the minimum possible value will always be hard-capped to 0 to prevent negatives and/or maxLevel conflicts.
	 */
	public setMinLevel(value: number): this {
		this.mMinLevel = Math.max(0, Math.min(this.getMaxLevel() - 1, value));
		this.syncLevel();
		return this;
	}

	public getMaxLevel(): number {
		return this.mMaxLevel;
	}

	/**
	 * Set the max possible level for this stream.
	 * See setLevel() for more info.
	 * 
	 * NOTE: the maximum possible value will always be hard-capped to 1 to prevent negatives and/or minLevel conflicts.
	 */
	public setMaxLevel(value: number): this {
		this.mMaxLevel = Math.max(1, this.getMinLevel() + 1, value);
		this.syncLevel();
		return this;
	}

	/**
	 * Returns true if the currently set level is less than or equal to the given level.
	 * 
	 * For example, if the current level is DEBUG (default) and the given level is FATAL, this will return true.
	 * If the current Level is DEBUG and the given level is TRACE, this will return false.
	 */
	public acceptsLevel(level: number): boolean {
		return this.getLevel() <= level;
	}

	public syncLevel(): this {
		this.setLevel(this.getLevel());
		return this;
	}

	public toConfig(): LogEventObservableConfig {
		return {
			enabled: this.isEnabled(),
			level: this.getLevel(),
			minLevel: this.getMinLevel(),
			maxLevel: this.getMaxLevel()
		};
	}

	/**
	 * Generates a deep clone of this instance.
	 * NOTE: does not generate sub-class instances.
	 */
	public copy(): LogEventObservable<T> {
		const result = new LogEventObservable(this.source);
		result.configure(this.toConfig());
		return result;
	}

	public configure(config: Partial<LogEventObservableConfig>): this {
		const { minLevel, maxLevel, level, enabled } = RxConsoleUtility.optObject(config);
		if (RxConsoleUtility.isNumber(minLevel)) this.setMinLevel(minLevel as number);
		if (RxConsoleUtility.isNumber(maxLevel)) this.setMaxLevel(maxLevel as number);
		if (RxConsoleUtility.isNumber(level)) this.setLevel(level as number);
		if (RxConsoleUtility.isBoolean(enabled)) this.setEnabled(!!enabled);
		return this;
	}
}