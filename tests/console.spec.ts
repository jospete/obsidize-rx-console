import { callConsoleDynamic, Logger, LoggerTransport, LogLevel } from '../src';

class MockConsole extends Logger {

	constructor(name: string = 'MockConsole', transport: LoggerTransport = new LoggerTransport()) {
		super(name, transport);
	}
}

describe('ConsoleLike', () => {

	describe('callConsoleDynamic', () => {

		it('calls error on levels that meet or exceed "error" value', () => {

			const mockConsole = new MockConsole();
			spyOn(mockConsole, 'error').and.callThrough();

			callConsoleDynamic(mockConsole, LogLevel.WARN, 'test warn', []);
			expect(mockConsole.error).toHaveBeenCalledTimes(0);

			callConsoleDynamic(mockConsole, LogLevel.FATAL, 'test error', []);
			expect(mockConsole.error).toHaveBeenCalledTimes(1);

			callConsoleDynamic(mockConsole, LogLevel.FATAL - 1, 'test error', []);
			expect(mockConsole.error).toHaveBeenCalledTimes(2);

			callConsoleDynamic(mockConsole, LogLevel.ERROR, 'test error', []);
			expect(mockConsole.error).toHaveBeenCalledTimes(3);

			callConsoleDynamic(mockConsole, LogLevel.WARN, 'test error', []);
			expect(mockConsole.error).toHaveBeenCalledTimes(3);
		});

		it('calls warn on levels inbetween "warn" and "error"', () => {

			const mockConsole = new MockConsole();
			spyOn(mockConsole, 'warn').and.callThrough();

			callConsoleDynamic(mockConsole, LogLevel.FATAL, 'test FATAL', []);
			expect(mockConsole.warn).toHaveBeenCalledTimes(0);

			callConsoleDynamic(mockConsole, LogLevel.WARN, 'test warn', []);
			expect(mockConsole.warn).toHaveBeenCalledTimes(1);

			callConsoleDynamic(mockConsole, LogLevel.WARN + 1, 'test warn', []);
			expect(mockConsole.warn).toHaveBeenCalledTimes(2);

			callConsoleDynamic(mockConsole, LogLevel.ERROR, 'test error', []);
			expect(mockConsole.warn).toHaveBeenCalledTimes(2);

			callConsoleDynamic(mockConsole, LogLevel.WARN - 1, 'test info', []);
			expect(mockConsole.warn).toHaveBeenCalledTimes(2);
		});

		it('calls log on levels below "warn"', () => {

			const mockConsole = new MockConsole();
			spyOn(mockConsole, 'log').and.callThrough();

			callConsoleDynamic(mockConsole, LogLevel.WARN, 'test warn', []);
			expect(mockConsole.log).toHaveBeenCalledTimes(0);

			callConsoleDynamic(mockConsole, LogLevel.WARN - 1, 'test warn-ish', []);
			expect(mockConsole.log).toHaveBeenCalledTimes(1);

			callConsoleDynamic(mockConsole, LogLevel.INFO, 'test stuff', []);
			callConsoleDynamic(mockConsole, LogLevel.DEBUG, 'test stuff', []);
			callConsoleDynamic(mockConsole, LogLevel.TRACE, 'test stuff', []);
			callConsoleDynamic(mockConsole, LogLevel.VERBOSE, 'test stuff', []);
			expect(mockConsole.log).toHaveBeenCalledTimes(5);

			callConsoleDynamic(mockConsole, LogLevel.ERROR, 'test stuff', []);
			callConsoleDynamic(mockConsole, LogLevel.FATAL, 'test stuff', []);
			expect(mockConsole.log).toHaveBeenCalledTimes(5);
		});
	});
});