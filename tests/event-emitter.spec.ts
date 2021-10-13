import { EventEmitter } from '../src';

describe('EventEmitter', () => {

	describe('add()', () => {

		it('does nothing when given a non-function value', () => {

			const emitter = new EventEmitter<any>();

			expect(() => emitter.add(null)).not.toThrowError();
			expect(emitter.count).toBe(0);

			const sampleFn = () => { };
			expect(() => emitter.add(sampleFn)).not.toThrowError();
			expect(emitter.count).toBe(1);
			expect(emitter.has(sampleFn)).toBe(true);
		});
	});
});