import { LogEvent } from './log-event';
import { RxConsoleUtility } from './rx-console-utility';
import { LogEventPredicate } from './log-event-like';
import { EventEmitterLike } from './event-emitter';
import { LogEventEmitterConfig, LogEventEmitterConfigDefaults } from './log-event-emitter-config';

/**
 * A read-only event stream of LogEvent instances.
 * Exposes the input source stream, as well as an 'events' stream that
 * only emits filtered values which meet the 'enabled' and 'level' requirements.
 */
export abstract class LogEventEmitterBase<T extends LogEvent = LogEvent> implements EventEmitterLike<T> {

	private mMinLevel: number = LogEventEmitterConfigDefaults.minLevel;
	private mMaxLevel: number = LogEventEmitterConfigDefaults.maxLevel;
	private mLevel: number = LogEventEmitterConfigDefaults.level;
	private mEnabled: boolean = LogEventEmitterConfigDefaults.enabled;
	private mAccepts: LogEventPredicate<T> = this.getDefaultAcceptanceDelegate();

	protected abstract onWillEmit(ev: T): void;

	protected getDefaultAcceptanceDelegate(): LogEventPredicate<T> {
		return (ev: T) => this.acceptsLevel(ev.level);
	}

	public get accepts(): LogEventPredicate<T> {
		return this.mAccepts;
	}

	public set accepts(value: LogEventPredicate<T>) {
		this.mAccepts = RxConsoleUtility.isFunction(value)
			? value
			: this.getDefaultAcceptanceDelegate();
	}

	public emit(ev: T): void {
		if (this.isEnabled() && !!ev && this.accepts(ev)) {
			this.onWillEmit(ev);
		}
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
		this.mLevel = RxConsoleUtility.clamp(value, this.getMinLevel(), this.getMaxLevel());
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
		this.mMinLevel = RxConsoleUtility.clamp(value, 0, this.getMaxLevel() - 1);
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

	public toConfig(): LogEventEmitterConfig {
		return {
			enabled: this.isEnabled(),
			level: this.getLevel(),
			minLevel: this.getMinLevel(),
			maxLevel: this.getMaxLevel()
		};
	}

	public configure(config: Partial<LogEventEmitterConfig>): this {
		const { minLevel, maxLevel, level, enabled } = RxConsoleUtility.optObject(config);
		if (RxConsoleUtility.isNumber(minLevel)) this.setMinLevel(minLevel as number);
		if (RxConsoleUtility.isNumber(maxLevel)) this.setMaxLevel(maxLevel as number);
		if (RxConsoleUtility.isNumber(level)) this.setLevel(level as number);
		if (RxConsoleUtility.isBoolean(enabled)) this.setEnabled(!!enabled);
		return this;
	}
}