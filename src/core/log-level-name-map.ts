import { LogLevel } from './log-level';
import { isFunction, isNumber, isObject, isString } from './utility';

export type LogLevelNameConfig = Record<string, number>;
export type CustomLevelNameDelegate = (level: number) => string;

function generateCustomLevelName(level: number): string {
	return `L-${level}`;
}

/**
 * Utility to customize numeric level name mappings.
 */
export class LogLevelNameMap {

	public static readonly main = new LogLevelNameMap();

	private readonly namesByLevel = new Map<number, string>();
	private readonly config: LogLevelNameConfig = LogLevel;
	private mCustomizer: CustomLevelNameDelegate = generateCustomLevelName;

	constructor() {
		this.reset();
	}

	public get customizer(): CustomLevelNameDelegate {
		return this.mCustomizer;
	}

	/**
	 * Set to null to revert to the default customizer function.
	 */
	public set customizer(value: CustomLevelNameDelegate | null) {
		this.mCustomizer = isFunction(value) ? value! : generateCustomLevelName;
	}

	public get(level: number): string {
		return this.namesByLevel.get(level) || this.customizer(level);
	}

	public reset(): void {
		this.namesByLevel.clear();
		this.update(this.config);
	}

	public update(config: LogLevelNameConfig): void {

		if (!isObject(config))
			return;

		for (const [name, level] of Object.entries(config)) {
			if (isString(name) && isNumber(level)) {
				this.namesByLevel.set(level, name);
			}
		}
	}
}