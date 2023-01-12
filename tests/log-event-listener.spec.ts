import { DelegateLogEventListener, LogEventSink } from '../src';

describe('LogEventListener', () => {

	it('has autoWatch diabled by default', () => {

		const spy = jasmine.createSpy('delegateListener');
		const listener = new DelegateLogEventListener(spy);

		expect(listener.enabled).toBe(false);

		listener.enabled = true;
		expect(listener.enabled).toBe(true);
	});

	it('takes optional source sink and auto-watch as constructor params', () => {

		const sink = new LogEventSink();
		const autoWatch = true;
		const spy = jasmine.createSpy('delegateListener');
		const listener = new DelegateLogEventListener(spy, sink, autoWatch);

		expect(listener.enabled).toBe(true);
	});
});