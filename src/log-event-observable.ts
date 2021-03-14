import { Observable } from 'rxjs';
import { skipWhile, filter } from 'rxjs/operators';

import { LogEvent } from './log-event';
import { LogLevel } from './log-level';
import { RxConsoleUtility } from './rx-console-utility';
const { isNumber, isBoolean, optObject } = RxConsoleUtility;

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

	public readonly events: Observable<T>;
	public accepts: (ev: T) => boolean = (ev: T) => this.acceptsLevel(ev.level);

	constructor(
		public readonly source: Observable<T>
	) {
		this.events = this.source.pipe(
			skipWhile(() => !this.isEnabled()),
			filter(ev => !!ev && this.accepts(ev))
		);
	}

	public isEnabled(): boolean {
		return this.mEnabled;
	}

	public setEnabled(value: boolean): this {
		this.mEnabled = !!value;
		return this;
	}

	public getLevel(): number {
		return this.mLevel;
	}

	public setLevel(value: number): this {
		this.mLevel = Math.max(this.getMinLevel(), Math.min(value, this.getMaxLevel()));
		return this;
	}

	public getMinLevel(): number {
		return this.mMinLevel;
	}

	public setMinLevel(value: number): this {
		// the minimum possible value will always be hard-capped to 0 to prevent negatives
		this.mMinLevel = Math.max(0, Math.min(this.getMaxLevel() - 1, value));
		this.syncLevel();
		return this;
	}

	public getMaxLevel(): number {
		return this.mMaxLevel;
	}

	public setMaxLevel(value: number): this {
		// the maximum possible value will always be hard-capped to 1 to prevent negatives
		this.mMaxLevel = Math.max(1, this.getMinLevel() + 1, value);
		this.syncLevel();
		return this;
	}

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

	public copy(): LogEventObservable<T> {
		const result = new LogEventObservable(this.source);
		result.configure(this.toConfig());
		return result;
	}

	public configure(config: Partial<LogEventObservableConfig>): this {
		const { minLevel, maxLevel, level, enabled } = optObject(config);
		if (isNumber(minLevel)) this.setMinLevel(minLevel as number);
		if (isNumber(maxLevel)) this.setMaxLevel(maxLevel as number);
		if (isNumber(level)) this.setLevel(level as number);
		if (isBoolean(enabled)) this.setEnabled(!!enabled);
		return this;
	}
}