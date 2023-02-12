import { LogEvent, LogEventFilterPredicate } from './log-event';
import { LogEventGuard, LogEventGuardMode } from './log-event-guard';

/**
 * Base class for entities that want to be able to filter log event instances.
 */
export class LogEventGuardContext {

	public guard: LogEventGuard = new LogEventGuard();

	/**
	 * Returns true if the underling guard is set to any mode
	 * other than BLOCK_ALL.
	 */
	public isEnabled(): boolean {
		return this.guard.mode !== LogEventGuardMode.BLOCK_ALL;
	}

	/**
	 * Returns true if the underlying guard accepts the given event
	 * based on its current mode and custom filter function (if any).
	 */
	public accepts(ev: LogEvent): boolean {
		return this.guard.accepts(ev);
	}

	/**
	 * Customize which log events should be ignored by this instance.
	 * If the given predicate returns truthy, the event will be passed along
	 * to any registered listeners or transports; otherwise it will be suppressed.
	 * 
	 * Pass `null` to reset the filter.
	 */
	public setFilter(value: LogEventFilterPredicate | null): this {
		this.guard.setFilter(value);
		return this;
	}

	/**
	 * Set the enabled state of this instance, regarding whether or not it will
	 * emit any log events. When true, emits events as normal; when false,
	 * suppresses all events.
	 * 
	 * The main benefit of this is to temorarily suppress all events on this
	 * instance, while keeping the currently set filter in-tact.
	 * 
	 * e.g. If this instance has a custom filter set, and then is disabled,
	 * when this is re-enabled later it will continue using the custom filter.
	 */
	public setEnabled(enabled: boolean): this {

		if (enabled !== this.isEnabled()) {
			const mode = enabled ? LogEventGuardMode.DEFAULT : LogEventGuardMode.BLOCK_ALL;
			this.guard.setMode(mode);
		}

		return this;
	}
}