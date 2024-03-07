import { stringifyAndJoin, stringify, truncate, jsonStringifySafe } from '../src';

function range(size: number): number[] {
	const result: number[] = [];
	for (let i = 0; i < size; i++) result.push(i);
	return result;
}

describe('utility', () => {
	describe('truncate()', () => {
		it('should shorten the length of strings that exceed the given target length', () => {
			const input = 'hello world';
			expect(truncate(input, 5)).toBe('hello...');
		});

		it('should not shorten the length of the input if the ellipsis extension would cause it to be longer than the original string', () => {
			const input = 'hello';
			expect(truncate(input, 4)).toBe(input);
			expect(truncate(input, 3)).toBe(input);
			expect(truncate(input, 2)).toBe(input);
			expect(truncate(input, 1)).toBe('h...');
		});
	});

	describe('jsonStringifySafe()', () => {
		it('should attempt to stringify an object, but does not explode on error', () => {
			expect(jsonStringifySafe({ hello: 'test' })).toBe('{"hello":"test"}');
			const circularObject = { parent: null };
			circularObject.parent = circularObject as any;
			expect(jsonStringifySafe(circularObject)).toBe('[object Object]');
		});
	});

	describe('stringify()', () => {
		it('should stringify the given value, and truncates the result', () => {
			expect(stringify({ hello: 'test' })).toBe('{"hello":"test"}');
			const value = range(50);
			expect(stringify(value, 10)).toBe('[0,1,2,3,4...');
		});
	});

	describe('stringifyAndJoin()', () => {
		it('should use the join string and max length when they are given', () => {
			expect(stringifyAndJoin([{ test: true }, 42])).toEqual(' :: {"test":true} :: 42');
			expect(stringifyAndJoin([{ test: true }, 42], ' | ', 5)).toEqual(' | {"tes... | 42');
		});
	});
});