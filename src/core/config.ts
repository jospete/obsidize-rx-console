import { DEFAULT_JOIN_STRING, DEFAULT_STRINGIFY_MAX_LENGTH, getGlobalInstance } from './utility';
import { LogLevelNameMap } from './log-level-name-map';

/**
 * Options used across this module.
 * These can be configured globally by making changes to `Config.sharedInstance`.
 */
export class Config {
	/**
	 * The separator used when joining stringified log parameters.
	 */
	public parameterSeparator: string = DEFAULT_JOIN_STRING;
	/**
	 * The max length of stringified log parameters before truncation is applied.
	 */
	public stringifyMaxLength: number = DEFAULT_STRINGIFY_MAX_LENGTH;
	/**
	 * The map to use for parsing named levels from raw level integer values.
	 */
	public levelNameMap: LogLevelNameMap = LogLevelNameMap.main;

	/**
	 * Shared window instance used to apply settings globally.
	 */
	public static get sharedInstance(): Config {
		return getGlobalInstance('Config_MAIN', Config);
	}

	/**
	 * Reset all options to defaults
	 */
	public reset(): void {
		this.parameterSeparator = DEFAULT_JOIN_STRING;
		this.stringifyMaxLength = DEFAULT_STRINGIFY_MAX_LENGTH;
		this.levelNameMap = LogLevelNameMap.main;
	}
}