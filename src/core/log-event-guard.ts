import { LogEvent, LogEventFilterPredicate } from './log-event';
import { isFunction, tautology } from './utility';

/**
 * Configuration option for more granular control of guards.
 */
export const enum LogEventGuardMode {
	/**
	 * Standard mode that delegates filtering to the filter function.
	 */
	DEFAULT = 0,

	/**
	 * Override mode that ignores the filter function and allows
	 * all events to pass through.
	 */
	ACCEPT_ALL = 1,

	/**
	 * Override mode that ignores the filter function and prevents
	 * all events from passing through.
	 */
	BLOCK_ALL = 2
}

/**
 * Gate-keeping mechanism for log events.
 * The primary entry point is the `accepts()` method.
 */
export class LogEventGuard {
	private mFilter: LogEventFilterPredicate = tautology;
	public mode: LogEventGuardMode = LogEventGuardMode.DEFAULT;

	/**
	 * Currently set filter function.
	 * Defaults to `tautology` and performs no event suppression.
	 */
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

	/**
	 * Returns true if this guard accepts the given event based
	 * only on its current filter function (mode is ignored).
	 */
	public filterAccepts(ev: LogEvent): boolean {
		return !!this.mFilter(ev);
	}

	/**
	 * Returns true if this guard accepts the given event based
	 * on its current mode and filter function.
	 */
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