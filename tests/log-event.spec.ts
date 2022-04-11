import { LogEvent, LogLevel, RxConsoleUtility } from '../src';
import { mockConsole } from './util';

const { truncate, stringifySafe } = RxConsoleUtility;

describe('LogEvent', () => {

	describe('toString()', () => {

		it('dumps the event data using standard formatting defaults', () => {

			const now = new Date();

			const sampleEvent1 = new LogEvent(LogLevel.DEBUG, 'test message', [], 'custom-tag', now.getTime());
			const logMessage1 = `${now.toJSON()} [DEBUG] [custom-tag] test message`;
			expect(sampleEvent1.toString()).toBe(logMessage1);

			const sampleEvent2 = new LogEvent(LogLevel.DEBUG, 'another message', [{ testValue: true }], 'custom-tag', now.getTime());
			const logMessage2 = `${now.toJSON()} [DEBUG] [custom-tag] another message :: {"testValue":true}`;
			expect(sampleEvent2.toString()).toBe(logMessage2);
		});
	});

	describe('broadcast() and broadcastTo()', () => {

		it('routes the given LogEvent to its nearest ConsoleLike equivalent', () => {

			const now = new Date();
			const sampleEvent1 = new LogEvent(LogLevel.DEBUG, 'test message', [], 'custom-tag', now.getTime());
			spyOn(mockConsole, 'log').and.callThrough();
			sampleEvent1.broadcastTo(mockConsole);
			expect(mockConsole.log).toHaveBeenCalledWith(sampleEvent1.getBroadcastMessage());

			const sampleEvent2 = new LogEvent(LogLevel.WARN, 'test warning', [], 'custom-tag', now.getTime());
			spyOn(mockConsole, 'warn').and.callThrough();
			sampleEvent2.broadcastTo(mockConsole);
			expect(mockConsole.warn).toHaveBeenCalledWith(sampleEvent2.getBroadcastMessage());

			const sampleEvent3 = new LogEvent(LogLevel.FATAL, 'test error', [], 'custom-tag', now.getTime());
			spyOn(mockConsole, 'error').and.callThrough();
			sampleEvent3.broadcastTo(mockConsole);
			expect(mockConsole.error).toHaveBeenCalledWith(sampleEvent3.getBroadcastMessage());
		});
	});

	describe('truncate', () => {

		it('shortens the length of strings that exceed the given target length', () => {
			expect(truncate('hello', 5)).toBe('hello');
			expect(truncate('hello', 4)).toBe('hell...');
		});
	});

	describe('stringifySafe', () => {

		it('attempts to stringify an object, but does not explode on error', () => {
			expect(stringifySafe({ hello: 'test' })).toBe('{"hello":"test"}');
			const circularObject = { parent: null };
			circularObject.parent = circularObject;
			expect(stringifySafe(circularObject)).toBe('[object Object]');
		});
	});

	describe('performDefaultBroadcast', () => {

		it('broadcasts the event to window.console', () => {

			const ev = new LogEvent(LogLevel.DEBUG, 'hello', [], '');
			spyOn(ev, 'broadcastTo').and.callThrough();

			expect(ev.broadcastTo).not.toHaveBeenCalled();

			LogEvent.performDefaultBroadcast(ev);
			expect(ev.broadcastTo).toHaveBeenCalledWith(console);
		});
	});
});