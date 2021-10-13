import { RxConsoleUtility, ConsoleLike, EventEmitterLike } from '../src';

const { identity } = RxConsoleUtility;

export const noopAggregator: EventEmitterLike<any> = { emit: identity };

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