import { LogEvent, LogEventLike, Logger, LoggerTransport, LogLevel, LogLevelNameMap, stringifyLogEvent, stringifyLogEventBaseValues } from '../src';
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

		it('can accept a custom LogLevelNameMap instance', () => {

			const now = new Date();
			const map = new LogLevelNameMap();
			const ev = new LogEvent(2, 'custom-tag', 'test message', [], now.getTime());

			map.update({ BANANA: 1, CHERRY: 2, POTATO: 3});
			expect(ev.toString(true, map)).toBe(`${now.toJSON()} [CHERRY] [custom-tag] test message`);
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
			expect(sampleEvent2.toString()).toBe(logMessage2);
		});
	});

	describe('stringify()', () => {

		const now = new Date();
		const sampleEvent1 = new LogEvent(LogLevel.DEBUG, 'custom-tag', 'test message', [{test: true}], now.getTime());

		it('uses stringifyLogEvent', () => {
			expect(LogEvent.stringify(sampleEvent1)).toEqual(stringifyLogEvent(sampleEvent1));
		});

		it('uses stringifyLogEventBaseValues', () => {
			expect(LogEvent.stringify(sampleEvent1, true)).toEqual(stringifyLogEventBaseValues(sampleEvent1));
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