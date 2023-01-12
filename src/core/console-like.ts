import { LogLevel } from './log-level';

/**
 * Watered-down version of the default browser window.console object.
 */
export interface ConsoleLike {
	verbose?(message: string, ...params: any[]): void;
	trace(message: string, ...params: any[]): void;
	debug(message: string, ...params: any[]): void;
	log(message: string, ...params: any[]): void;
	info(message: string, ...params: any[]): void;
	warn(message: string, ...params: any[]): void;
	error(message: string, ...params: any[]): void;
	fatal?(message: string, ...params: any[]): void;
}

export function callConsoleDynamic(
	console: ConsoleLike,
	level: number,
	message: string,
	params: any[]
): void {

	// ** This waters down the levels to ones that are definitely defined on 99% of clients.

	if (level >= LogLevel.ERROR) {
		console.error(message, ...params);
		return;
	}

	if (level >= LogLevel.WARN) {
		console.warn(message, ...params);
		return;
	}

	console.log(message, ...params);
}
