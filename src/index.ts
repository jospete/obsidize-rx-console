import { RxConsole } from './rx-console';
import { RxConsoleEntryOptions, LogEventSource } from './rx-console-entry';

export { ConsoleLike } from './console-like';
export { LogEventLike } from './log-event-like';
export { LogEventObservable } from './log-event-observable';
export { LogEventSubject } from './log-event-subject';
export { LogEvent } from './log-event';
export { LogLevel, getLogLevelName } from './log-level';
export { RxConsole } from './rx-console';
export { RxConsoleUtility } from './rx-console-utility';

export {
	RxConsoleEntry,
	LogEventSource,
	ReadOnlyLogEventSource,
	RxConsoleEntryHooks,
	RxConsoleEntryOptions
} from './rx-console-entry';

/**
 * Conveinence for generating loggers via the standard 'main' RxConsole instance. 
 */
export const getLogger = (name: string, options?: RxConsoleEntryOptions): LogEventSource => {
	return RxConsole.main.getLogger(name, options);
};