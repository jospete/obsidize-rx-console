import { RxConsoleUtility, ConsoleLike, LogEventEmitterLike } from '../src';

const { identity } = RxConsoleUtility;

export const noopAggregator: LogEventEmitterLike = { emit: identity };

export const mockConsole: ConsoleLike = {
	verbose: identity,
	trace: identity,
	debug: identity,
	log: identity,
	info: identity,
	warn: identity,
	error: identity,
	fatal: identity
};