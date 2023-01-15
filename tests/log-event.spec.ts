import { LogEvent, LogLevel, stringifyLogEvent } from '../src';

describe('LogEvent', () => {

	describe('stringifyLogEvent()', () => {

		it('can operate on any value without blowing up', () => {
			expect(() => stringifyLogEvent(null as any)).not.toThrowError();
		});

		it('dumps the event data using standard formatting defaults', () => {

			const now = new Date();

			const sampleEvent1 = new LogEvent(LogLevel.DEBUG, 'custom-tag', 'test message', [], now.getTime());
			const logMessage1 = `${now.toJSON()} [DEBUG] [custom-tag] test message`;
			expect(stringifyLogEvent(sampleEvent1)).toBe(logMessage1);

			const sampleEvent2 = new LogEvent(LogLevel.DEBUG, 'custom-tag', 'another message', [{ testValue: true }], now.getTime());
			const logMessage2 = `${now.toJSON()} [DEBUG] [custom-tag] another message :: {"testValue":true}`;
			expect(stringifyLogEvent(sampleEvent2)).toBe(logMessage2);
		});
	});
});