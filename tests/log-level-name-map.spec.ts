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
});