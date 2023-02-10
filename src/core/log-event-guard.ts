import { LogEvent, LogEventFilterPredicate } from './log-event';
import { isFunction, tautology } from './utility';

export const enum LogEventGuardMode {
	DEFAULT = 0,
	ACCEPT_ALL = 1,
	BLOCK_ALL = 2
}

/**
 * Gate-keeping mechanism for log events.
 * The primary entry point is the `accepts()` method.
 */
export class LogEventGuard {

	private mFilter: LogEventFilterPredicate = tautology;
	public mode: LogEventGuardMode = LogEventGuardMode.DEFAULT;

	public get filter(): LogEventFilterPredicate {
		return this.mFilter;
	}

	public set filter(value: LogEventFilterPredicate | null) {
		this.mFilter = isFunction(value) ? value! : tautology;
	}

	public setFilter(value: LogEventFilterPredicate | null): this {
		this.filter = value;
		return this;
	}

	public setMode(mode: LogEventGuardMode): this {
		this.mode = mode;
		return this;
	}

	public filterAccepts(ev: LogEvent): boolean {
		return !!this.mFilter(ev);
	}

	public accepts(ev: LogEvent): boolean {
		switch (this.mode) {
			case LogEventGuardMode.ACCEPT_ALL:
				return true;
			case LogEventGuardMode.BLOCK_ALL:
				return false;
			default:
				return this.filterAccepts(ev);
		}
	}
}