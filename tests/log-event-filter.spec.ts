import { LogEventFilter, LogEvent, LogLevel } from '../src';

function createLogEventWithLevel(level: LogLevel): LogEvent {
	return new LogEvent(level, 'test', [], 'root');
}

describe('LogEventFilter', () => {

	describe('accepts()', () => {

		it('filters events that do not meet the assigned min level', () => {
			const filter = new LogEventFilter().setMinLevel(LogLevel.INFO);
			expect(filter.accepts(createLogEventWithLevel(LogLevel.VERBOSE))).toBe(false);
			expect(filter.accepts(createLogEventWithLevel(LogLevel.DEBUG))).toBe(false);
			expect(filter.accepts(createLogEventWithLevel(LogLevel.INFO))).toBe(true);
			expect(filter.accepts(createLogEventWithLevel(LogLevel.WARN))).toBe(true);
		});
	});
});