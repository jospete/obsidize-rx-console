import { LogEvent, LogEventLike, Logger, LoggerTransport, LogLevel, stringifyLogEvent, stringifyLogEventBaseValues } from '../src';
import { broadcastLogEvent } from '../src/core/log-event';

describe('LogEvent', () => {

	describe('stringifyLogEventBaseValues()', () => {

		it('can operate on any value without blowing up', () => {
			expect(() => stringifyLogEventBaseValues(null as any)).not.toThrowError();
		});

		it('dumps the event data using standard formatting defaults, omitting the params from the result', () => {

			const now = new Date();

			const sampleEvent1 = new LogEvent(LogLevel.DEBUG, 'custom-tag', 'test message', [], now.getTime());
			const logMessage1 = `${now.toJSON()} [DEBUG] [custom-tag] test message`;
			expect(stringifyLogEventBaseValues(sampleEvent1)).toBe(logMessage1);

			const sampleEvent2 = new LogEvent(LogLevel.DEBUG, 'custom-tag', 'another message', [{ testValue: true }], now.getTime());
			const logMessage2 = `${now.toJSON()} [DEBUG] [custom-tag] another message`;
			expect(stringifyLogEventBaseValues(sampleEvent2)).toBe(logMessage2);
		});
	});

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

	describe('broadcastLogEvent()', () => {

		it('can accept a custom console-like target and serializer', () => {

			const mockConsole = new Logger('Mocked', new LoggerTransport());
			const ev = new LogEvent(LogLevel.DEBUG, 'custom-tag', 'some sample info');

			function customSerialize(ev: LogEventLike): string {
				return ev.message;
			}

			spyOn(mockConsole, 'log').and.callThrough();
			broadcastLogEvent(ev, customSerialize, mockConsole);
			expect(mockConsole.log).toHaveBeenCalledOnceWith(ev.message);
		});
	});
});