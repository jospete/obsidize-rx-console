import { Subject } from 'rxjs';

import { LogEvent, LogEventObservable } from '../src';

describe('LogEventObservable', () => {

	describe('configure()', () => {

		it('gracefully handles partial configuration objects', () => {

			const source = new Subject<LogEvent>();
			const logEvents = new LogEventObservable(source);

			expect(() => logEvents.configure(null)).not.toThrowError();
			expect(() => logEvents.configure({ level: -1 })).not.toThrowError();
			expect(logEvents.getLevel()).toBe(logEvents.getMinLevel());
			expect(() => logEvents.configure({ level: 5, minLevel: 1, maxLevel: 10 })).not.toThrowError();
			expect(logEvents.getLevel()).toBe(5);
			expect(() => logEvents.configure({ minLevel: 6 })).not.toThrowError();
			expect(logEvents.getMinLevel()).toBe(6);
			expect(logEvents.getLevel()).toBe(6);
		});
	});
});