import { RxConsoleUtility } from '../src';

describe('RxConsoleUtility', () => {

	describe('optObject()', () => {

		it('returns a plain empty object when the given value is falsy', () => {
			expect(RxConsoleUtility.optObject(null)).toEqual({});
		});
	});

	describe('stringifyOptionalParams()', () => {

		it('uses the join string and max length when they are given', () => {
			expect(RxConsoleUtility.stringifyOptionalParams([{ test: true }, 42])).toEqual(' :: {"test":true} :: 42');
			expect(RxConsoleUtility.stringifyOptionalParams([{ test: true }, 42], ' | ', 5)).toEqual(' | {"tes... | 42');
		});
	});

	describe('isString()', () => {

		it('returns true only when the given value is a string', () => {
			expect(RxConsoleUtility.isString([{ test: true }, 42])).toBe(false);
			expect(RxConsoleUtility.isString({})).toBe(false);
			expect(RxConsoleUtility.isString(null)).toBe(false);
			expect(RxConsoleUtility.isString(0)).toBe(false);
			expect(RxConsoleUtility.isString(50)).toBe(false);
			expect(RxConsoleUtility.isString('')).toBe(true);
			expect(RxConsoleUtility.isString('hello')).toBe(true);
		});
	});

	describe('isPopulatedString()', () => {

		it('returns true only when the given value is a string that is non-empty', () => {
			expect(RxConsoleUtility.isPopulatedString([{ test: true }, 42])).toBe(false);
			expect(RxConsoleUtility.isPopulatedString({})).toBe(false);
			expect(RxConsoleUtility.isPopulatedString(null)).toBe(false);
			expect(RxConsoleUtility.isPopulatedString(0)).toBe(false);
			expect(RxConsoleUtility.isPopulatedString(50)).toBe(false);
			expect(RxConsoleUtility.isPopulatedString('')).toBe(false);
			expect(RxConsoleUtility.isPopulatedString(' ')).toBe(true);
			expect(RxConsoleUtility.isPopulatedString('hello')).toBe(true);
		});
	});
});