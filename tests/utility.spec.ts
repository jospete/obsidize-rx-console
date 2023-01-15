import { stringifyAndJoin, stringify, truncate } from '../src';

describe('utility', () => {

	describe('truncate', () => {

		it('shortens the length of strings that exceed the given target length', () => {
			expect(truncate('hello', 5)).toBe('hello');
			expect(truncate('hello', 4)).toBe('hell...');
		});
	});

	describe('stringify', () => {

		it('attempts to stringify an object, but does not explode on error', () => {
			expect(stringify({ hello: 'test' })).toBe('{"hello":"test"}');
			const circularObject = { parent: null };
			circularObject.parent = circularObject as any;
			expect(stringify(circularObject)).toBe('[object Object]');
		});
	});

	describe('stringifyAndJoin()', () => {

		it('uses the join string and max length when they are given', () => {
			expect(stringifyAndJoin([{ test: true }, 42])).toEqual(' :: {"test":true} :: 42');
			expect(stringifyAndJoin([{ test: true }, 42], ' | ', 5)).toEqual(' | {"tes... | 42');
		});
	});
});