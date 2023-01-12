import { stringifyOptionalParams, stringifySafe, truncate } from '../src';

describe('utility', () => {

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
			circularObject.parent = circularObject as any;
			expect(stringifySafe(circularObject)).toBe('[object Object]');
		});
	});

	describe('stringifyOptionalParams()', () => {

		it('uses the join string and max length when they are given', () => {
			expect(stringifyOptionalParams([{ test: true }, 42])).toEqual(' :: {"test":true} :: 42');
			expect(stringifyOptionalParams([{ test: true }, 42], ' | ', 5)).toEqual(' | {"tes... | 42');
		});
	});
});