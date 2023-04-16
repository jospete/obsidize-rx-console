import { LogEvent, LogEventLike, LogEventGuard, LogEventGuardMode, LogLevel } from '../src';

describe('LogEventGuard', () => {

	it('has several modes that can be swapped between while leaving the filter in-tact', () => {

		const guard = new LogEventGuard();
		expect(guard.mode).toBe(LogEventGuardMode.DEFAULT);

		function exampleFilter(ev: LogEventLike): boolean {
			return ev.tag === 'test';
		}

		guard.filter = exampleFilter;
		guard.mode = LogEventGuardMode.ACCEPT_ALL;
		expect(guard.filter).toBe(exampleFilter);

		const ev = new LogEvent(LogLevel.DEBUG, 'invalid-source', 'this should not get accepted');
		expect(guard.accepts(ev)).toBe(true);
		expect(guard.filterAccepts(ev)).toBe(false);

		guard.mode = LogEventGuardMode.DEFAULT;
		expect(guard.accepts(ev)).toBe(false);
		expect(guard.filterAccepts(ev)).toBe(false);
	});
});