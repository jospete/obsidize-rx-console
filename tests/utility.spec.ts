import { stringifyAndJoin, stringify, truncate, jsonStringifySafe } from '../src';

function range(size: number): number[] {
	const result: number[] = [];
	for (let i = 0; i < size; i++) result.push(i);
	return result;
}

describe('utility', () => {

	describe('truncate()', () => {

		it('shortens the length of strings that exceed the given target length', () => {
			expect(truncate('hello', 5)).toBe('hello');
			expect(truncate('hello', 4)).toBe('hell...');
		});
	});

	describe('jsonStringifySafe()', () => {

		it('attempts to stringify an object, but does not explode on error', () => {
			expect(jsonStringifySafe({ hello: 'test' })).toBe('{"hello":"test"}');
			const circularObject = { parent: null };
			circularObject.parent = circularObject as any;
			expect(jsonStringifySafe(circularObject)).toBe('[object Object]');
		});
	});

	describe('stringify()', () => {

		it('stringifies the given value, and truncates the result', () => {
			expect(stringify({ hello: 'test' })).toBe('{"hello":"test"}');
			const value = range(50);
			expect(stringify(value, 10)).toBe('[0,1,2,3,4...');
		});
	});

	describe('stringifyAndJoin()', () => {

		it('uses the join string and max length when they are given', () => {
			expect(stringifyAndJoin([{ test: true }, 42])).toEqual(' :: {"test":true} :: 42');
			expect(stringifyAndJoin([{ test: true }, 42], ' | ', 5)).toEqual(' | {"tes... | 42');
		});
	});
});