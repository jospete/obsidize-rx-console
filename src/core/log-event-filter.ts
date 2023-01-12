import { LogEvent } from './log-event';
import { LogLevel } from './log-level';

/**
 * Gatekeeping mechanism to filter out unwanted logs.
 */
export class LogEventFilter<T extends LogEvent = LogEvent> {

	private mMinLevel: number = LogLevel.VERBOSE;

	public getMinLevel(): number {
		return this.mMinLevel;
	}

	/**
	 * Set the minimum required level for events.
	 * Events with a level below the given value will
	 * be rejected by accepts().
	 */
	public setMinLevel(value: number): this {
		this.mMinLevel = Math.max(LogLevel.VERBOSE, value);
		return this;
	}

	public accepts(ev: T): boolean {
		return !!ev && ev.level >= this.getMinLevel();
	}
}