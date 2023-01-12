import { EventEmitter } from '../src';

describe('EventEmitter', () => {

	describe('general usage', () => {

		it('properly tracks callbacks for mass broadcasting', () => {

			const emitter = new EventEmitter<any>();

			expect(() => emitter.add(null as any)).not.toThrowError();
			expect(emitter.count).toBe(0);
			expect(() => emitter.emit('test')).not.toThrowError();

			const sampleFn = jasmine.createSpy('testEmitterSpy');
			expect(() => emitter.add(sampleFn)).not.toThrowError();
			expect(emitter.count).toBe(1);
			expect(emitter.has(sampleFn)).toBe(true);
			expect(sampleFn).not.toHaveBeenCalled();
			expect(() => emitter.emit('test')).not.toThrowError();
			expect(sampleFn).toHaveBeenCalledTimes(1);

			emitter.clear();
			expect(() => emitter.emit('test')).not.toThrowError();
			expect(sampleFn).toHaveBeenCalledTimes(1);
		});
	});
});