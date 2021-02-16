import { LogEvent, LogLevel } from '../src/index';

describe('LogEvent', () => {

	it('has assorted tools for creating and displaying event data', () => {
		const now = new Date();
		const sampleEvent = new LogEvent(LogLevel.DEBUG, 'test message', [], 'custom-tag', now.getTime());
		expect(sampleEvent.toString()).toBe(`${now.toJSON()} [DEBUG] [custom-tag] test message`);
		const sampleEvent2 = new LogEvent(LogLevel.DEBUG, 'another message', [{ testValue: true }], 'custom-tag', now.getTime());
		expect(sampleEvent2.toString()).toBe(`${now.toJSON()} [DEBUG] [custom-tag] another message :: {"testValue":true}`);
	});
});