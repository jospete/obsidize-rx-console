import { LogLevelNameMap } from '../src';

describe('LogLevelNameMap', () => {

	it('accepts a customizer function for unknown log levels', () => {

		const map = new LogLevelNameMap();
		const defaultCustomizer = map.customizer;
		const newCustomizer = (level: number) => `FANCY-${level}`;

		map.customizer = newCustomizer;
		expect(map.customizer).toBe(newCustomizer);

		map.customizer = null;
		expect(map.customizer).toBe(defaultCustomizer);
	});

	it('accepts a custom initial config', () => {

		const testLevels = [
			'POTATO',
			'BANANA',
			'ORANGE'
		];

		const testLevelConfig: Record<string, number> = {};

		for (let i = 0; i < testLevels.length; i++) {
			testLevelConfig[testLevels[i]] = i;
		}

		const map = new LogLevelNameMap(testLevelConfig);

		for (let i = 0; i < testLevels.length; i++) {
			expect(map.get(i)).toBe(testLevels[i]);
		}

		expect(map.get(testLevels.length)).toBe(map.customizer(testLevels.length));
	});
});