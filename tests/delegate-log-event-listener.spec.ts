import { getDefaultLoggerSink, setDefaultLoggerBroadcastEnabled } from '../src';

describe('DelegateLogEventListener', () => {

	describe('setDefaultLoggerBroadcastEnabled', () => {

		it('does nothing when initialized with false', () => {
			getDefaultLoggerSink().onNext.clear();
			expect(() => setDefaultLoggerBroadcastEnabled(false)).not.toThrowError();
			expect(getDefaultLoggerSink().onNext.count).toBe(0);
		});

		it('adds the default broadcast event when initialized with true', () => {
			getDefaultLoggerSink().onNext.clear();
			expect(() => setDefaultLoggerBroadcastEnabled(true)).not.toThrowError();
			expect(getDefaultLoggerSink().onNext.count).toBe(1);
		});
	});
});