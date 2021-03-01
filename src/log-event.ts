import { ConsoleLike } from './console-like';
import { LogEventLike } from './log-event-like';
import { RxConsoleUtility } from './rx-console-utility';

const { pipeLogEventToConsole, toDefaultStringFormat, toDefaultStringFormatBase } = RxConsoleUtility;

/**
 * Single event instance, typically spawned by a LogEventSubject.
 */
export class LogEvent implements LogEventLike {

	constructor(
		public readonly level: number,
		public readonly message: string,
		public readonly params: any[],
		public readonly tag: string,
		public readonly timestamp: number = Date.now()
	) {
	}

	public broadcastTo(console: ConsoleLike): void {
		pipeLogEventToConsole(this, console);
	}

	public toBaseString(): string {
		return toDefaultStringFormatBase(this);
	}

	public toString(): string {
		return toDefaultStringFormat(this);
	}
}