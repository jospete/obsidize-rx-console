import { Observable } from 'rxjs';
import { skipWhile, filter } from 'rxjs/operators';

import { LogEvent } from './log-event';
import { LogLevel } from './log-level';

/**
 * Configurable options for a LogEventObservable instance.
 */
export interface LogEventObservableConfig {
	level?: number;
	minLevel?: number;
	maxLevel?: number;
	enabled?: boolean;
}

/**
 * A read-only event stream of LogEvent instances.
 * Exposes the input source stream, as well as an 'events' stream that
 * only emits filtered values which meet the 'enabled' and 'level' requirements.
 */
export class LogEventObservable<T extends LogEvent> implements LogEventObservableConfig {

	public static readonly configDefaults: LogEventObservableConfig = {
		minLevel: LogLevel.VERBOSE,
		maxLevel: LogLevel.FATAL,
		level: LogLevel.VERBOSE,
		enabled: true
	};

	private mMinLevel: number = LogLevel.VERBOSE;
	private mMaxLevel: number = LogLevel.FATAL;
	private mLevel: number = LogLevel.VERBOSE;
	private mEnabled: boolean = true;

	public readonly events: Observable<T>;
	public accepts: (ev: T) => boolean = ev => this.acceptsLevel(ev.level);

	constructor(
		public readonly name: string,
		public readonly source: Observable<T>,
		config: LogEventObservableConfig = LogEventObservable.configDefaults
	) {

		this.events = this.source.pipe(
			skipWhile(() => !this.enabled),
			filter(ev => !!ev && this.accepts(ev))
		);

		this.configure(config);
	}

	public get enabled(): boolean {
		return this.mEnabled;
	}

	public set enabled(value: boolean) {
		this.mEnabled = !!value;
	}

	public get minLevel(): number {
		return this.mMinLevel;
	}

	public get level(): number {
		return this.mLevel;
	}

	public set level(value: number) {
		this.mLevel = Math.max(this.minLevel, Math.min(value, this.maxLevel));
	}

	public set minLevel(value: number) {
		// the minimum possible value will always be hard-capped to 0 to prevent negatives
		this.mMinLevel = Math.max(0, Math.min(this.maxLevel - 1, value));
		this.level = this.level;
	}

	public get maxLevel(): number {
		return this.mMaxLevel;
	}

	public set maxLevel(value: number) {
		// the minimum possible value will always be hard-capped to 1 to prevent negatives
		this.mMaxLevel = Math.max(1, this.minLevel + 1, value);
		this.level = this.level;
	}

	public acceptsLevel(level: number): boolean {
		return this.level <= level;
	}

	public copy(): LogEventObservable<T> {
		const result = new LogEventObservable(this.name, this.source);
		result.configure(this);
		return result;
	}

	public configure(config: LogEventObservableConfig): void {
		const { minLevel, maxLevel, level, enabled } = config;
		if (typeof minLevel === 'number') this.minLevel = minLevel;
		if (typeof maxLevel === 'number') this.maxLevel = maxLevel;
		if (typeof level === 'number') this.level = level;
		if (typeof enabled === 'boolean') this.enabled = enabled;
	}
}