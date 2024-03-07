import { EventEmitter } from '../src';

describe('EventEmitter', () => {
	it('should start with no listeners attached', () => {
		const emitter = new EventEmitter<any>();
		expect(emitter.listenerCount).toBe(0);
	});

	it('should add a listener', () => {
		const emitter = new EventEmitter<any>();
		const listener = () => { };
		emitter.addListener(listener);
		expect(emitter.listenerCount).toBe(1);
	});

	it('should not add duplicate listeners', () => {
		const emitter = new EventEmitter<any>();
		const listener = () => { };
		emitter.addListener(listener);
		emitter.addListener(listener);
		expect(emitter.listenerCount).toBe(1);
	});

	it('should remove a listener', () => {
		const emitter = new EventEmitter<any>();
		const listener = () => { };
		emitter.addListener(listener);
		expect(emitter.listenerCount).toBe(1);
		emitter.removeListener(listener);
		expect(emitter.listenerCount).toBe(0);
	});

	it('should do nothing when removing a listener that does not exist', () => {
		const emitter = new EventEmitter<any>();
		const listener = () => { };
		emitter.addListener(listener);
		expect(emitter.listenerCount).toBe(1);
		emitter.removeListener(listener);
		emitter.removeListener(listener);
		expect(emitter.listenerCount).toBe(0);
	});

	it('should not add listener values which are not a function', () => {
		const emitter = new EventEmitter<any>();
		emitter.addListener(null as any);
		emitter.addListener('' as any);
		emitter.addListener({} as any);
		emitter.addListener(true as any);
		emitter.addListener(0 as any);
		emitter.addListener(1 as any);
		expect(emitter.listenerCount).toBe(0);
	});

	it('should emit to all listeners exactly once per emit() call', () => {
		const spyCount = 4;
		const emitter = new EventEmitter<any>();
		const spies: jasmine.Spy<jasmine.Func>[] = [];

		for (let i = 0; i < spyCount; i++) {
			emitter.addListener(spies[i] = jasmine.createSpy(`spy${i}`));
		}

		expect(emitter.listenerCount).toBe(spyCount);

		emitter.emit('test');

		for (const spy of spies) {
			expect(spy).toHaveBeenCalledOnceWith('test');
		}
	});

	it('should remove all listeners at once', () => {
		const spyCount = 3;
		const emitter = new EventEmitter<any>();

		for (let i = 0; i < spyCount; i++) {
			emitter.addListener(() => { });
		}

		expect(emitter.listenerCount).toBe(spyCount);

		emitter.removeAllListeners();
		expect(emitter.listenerCount).toBe(0);
	});
});