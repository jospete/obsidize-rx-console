import { ConsoleLike } from './console-like';
import { LogEventLike } from './log-event-like';
import { RxConsoleUtility } from './rx-console-utility';

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

	/**
	 * Default behaviour for handling events.
	 * Sends events to the global ```window.console``` instance.
	 */
	public static performDefaultBroadcast<R extends LogEvent>(ev: R): void {
		ev.broadcastTo(console);
	}

	/**
	 * Send this event to a ConsoleLike structure to be printed to some stdout stream.
	 * 
	 * Override this in a sub-class to cusotmize output data.
	 */
	public broadcastTo(console: ConsoleLike): void {
		RxConsoleUtility.callConsoleDynamic(console, this.level, this.getBroadcastMessage(), this.params);
	}

	/**
	 * Generates a message string based on the constructor inputs.
	 * Does NOT include 'params' values in the output - this is the prefix string
	 * to be given as the first argument to ConsoleLike structures.
	 * 
	 * Override this in a sub-class to cusotmize output data.
	 */
	public getBroadcastMessage(): string {
		return RxConsoleUtility.stringifyLogEventBaseValues(this);
	}

	/**
	 * Generates a loggable string based on the constructor inputs.
	 * Includes 'params' values in the output.
	 * 
	 * Override this in a sub-class to cusotmize output data.
	 */
	public toString(): string {
		return RxConsoleUtility.stringifyLogEvent(this);
	}
}