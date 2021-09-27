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
});