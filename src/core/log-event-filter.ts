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
	 * Set the min possible level for this stream.
	 * See setLevel() for more info.
	 * 
	 * NOTE: the minimum possible value will always be hard-capped to 0 to prevent negatives and/or maxLevel conflicts.
	 */
	public setMinLevel(value: number): this {
		this.mMinLevel = Math.max(LogLevel.VERBOSE, value);
		return this;
	}

    public accepts(ev: T): boolean {
        return !!ev && ev.level >= this.getMinLevel();
    }
}