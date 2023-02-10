import { LogEvent, LogEventFilterPredicate } from './log-event';
import { LogEventGuard, LogEventGuardMode } from './log-event-guard';

/**
 * Base class for entities that want to be able to filter log event instances.
 */
export class LogEventGuardContext {

	public guard: LogEventGuard = new LogEventGuard();

	public isEnabled(): boolean {
		return this.guard.mode !== LogEventGuardMode.BLOCK_ALL;
	}

	public setEnabled(enabled: boolean): this {
		const enabledValue = this.isEnabled() ? this.guard.mode : LogEventGuardMode.DEFAULT;
		this.guard.setMode(enabled ? enabledValue : LogEventGuardMode.BLOCK_ALL);
		return this;
	}

	public setFilter(value: LogEventFilterPredicate | null): this {
		this.guard.setFilter(value);
		return this;
	}

	public accepts(ev: LogEvent): boolean {
		return this.guard.accepts(ev);
	}
}