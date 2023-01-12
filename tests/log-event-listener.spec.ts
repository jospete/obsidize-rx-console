import { DelegateLogEventListener, LogEventSink } from '../src';

describe('LogEventListener', () => {

	it('has autoWatch enabled by default', () => {

		const spy = jasmine.createSpy('delegateListener');
		const listener = new DelegateLogEventListener(spy);

		expect(listener.enabled).toBe(true);

		listener.enabled = false;
		expect(listener.enabled).toBe(false);
	});

	it('takes optional source sink and auto-watch as constructor params', () => {

		const sink = new LogEventSink();
		const autoWatch = false;
		const spy = jasmine.createSpy('delegateListener');
		const listener = new DelegateLogEventListener(spy, sink, autoWatch);

		expect(listener.enabled).toBe(false);
	});
});