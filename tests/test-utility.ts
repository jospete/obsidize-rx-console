import { ConsoleLike, EventEmitterLike } from '../src';

function identity(input: any, ..._extras: any[]) {
	return input;
}

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