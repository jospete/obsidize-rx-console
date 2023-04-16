import { LogEventBuffer, LogEvent } from '../src';

describe('LogEventBuffer', () => {

	it('ensures the capacity is always a positive integer', () => {

		const buffer = new LogEventBuffer();

		buffer.capacity = null as any;
		expect(buffer.capacity).toBe(1);

		buffer.capacity = 3.14159;
		expect(buffer.capacity).toBe(3);
	});

	it('has a default capacity of 1, and re-uses the same event object for each call to get()', () => {

		const buffer = new LogEventBuffer();
		expect(buffer.capacity).toBe(1);

		const ev1 = buffer.get(0, 'test', 'message', []);
		const ev2 = buffer.get(0, 'test', 'another message', []);
		expect(ev1).toBe(ev2);
	});

	it('can have caching disabled by setting the capacity to zero', () => {

		const buffer = new LogEventBuffer();
		buffer.capacity = 0;

		const ev1 = buffer.get(0, 'test', 'message', []);
		const ev2 = buffer.get(0, 'test', 'another message', []);
		expect(ev1).not.toBe(ev2);
	});

	it('can have a custom creator function assigned', () => {

		class MyLogEvent extends LogEvent { }

		function createCustomEvent(level: number, context: string, message: string, params: any[]): MyLogEvent {
			return new MyLogEvent(level, context, message, params);
		}

		const buffer = new LogEventBuffer();
		buffer.capacity = 3;
		
		const ev1 = buffer.get(0, 'test', 'message', []);
		expect(ev1 instanceof MyLogEvent).toBe(false);

		buffer.onCreateEvent = createCustomEvent;

		const ev2 = buffer.get(0, 'test', 'message', []);
		expect(ev2 instanceof MyLogEvent).toBe(true);

		buffer.onCreateEvent = null as any;

		const ev3 = buffer.get(0, 'test', 'message', []);
		expect(ev3 instanceof MyLogEvent).toBe(false);
	});

	it('can be cleared', () => {
		
		const buffer = new LogEventBuffer();
		buffer.capacity = 2;

		const ev1 = buffer.get(0, 'test', 'message', []);
		const ev2 = buffer.get(0, 'test', 'another message', []);
		const ev3 = buffer.get(0, 'test', 'another message', []);
		const ev4 = buffer.get(0, 'test', 'another message', []);

		expect(ev1).not.toBe(ev2);
		expect(ev1).toBe(ev3);
		expect(ev2).not.toBe(ev3);
		expect(ev2).toBe(ev4);

		buffer.clear();

		const ev5 = buffer.get(0, 'test', 'another message', []);
		const ev6 = buffer.get(0, 'test', 'another message', []);
		
		expect(ev5).not.toBe(ev1);
		expect(ev5).not.toBe(ev2);
		expect(ev5).not.toBe(ev6);
		expect(ev6).not.toBe(ev1);
		expect(ev6).not.toBe(ev2);
	});
});