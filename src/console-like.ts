/**
 * Watered-down version of the default browser window.console object.
 */
export interface ConsoleLike {
	verbose?(message: string, ...params: any[]): void;
	trace(message: string, ...params: any[]): void;
	debug(message: string, ...params: any[]): void;
	log(message: string, ...params: any[]): void;
	warn(message: string, ...params: any[]): void;
	error(message: string, ...params: any[]): void;
	fatal?(message: string, ...params: any[]): void;
}
