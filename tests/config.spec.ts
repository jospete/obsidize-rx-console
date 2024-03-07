import { Config, LogEvent, LogLevel, LogLevelNameMap } from './../src';

describe('Config', () => {
	let config: Config;

	beforeEach(() => {
		config = Config.sharedInstance;
	});

	afterEach(() => {
		config.reset();
	});

	it('should have an option to override the default parameter join string', () => {
		const sep = config.parameterSeparator;
		const testParam1 = { someKey: true, anotherKey: 'this is for testing' };
		const testParam1Str = JSON.stringify(testParam1);
		const testParam2 = true;
		const testParam2Str = JSON.stringify(testParam2);
		const ev = new LogEvent(LogLevel.DEBUG, 'TestTag', 'test message', [testParam1, testParam2]);
		expect(ev.getMessageWithParams()).toBe(ev.message + sep + testParam1Str + sep + testParam2Str);

		const sep2 = config.parameterSeparator = '<TEST>';
		expect(ev.getMessageWithParams()).toBe(ev.message + sep2 + testParam1Str + sep2 + testParam2Str);
	});

	it('should have an option to override the default stringify max length', () => {
		const sep = config.parameterSeparator;
		const testParam1 = { someKey: true, anotherKey: 'this is for testing' };
		const testParam1Str = JSON.stringify(testParam1);
		const testParam2 = true;
		const testParam2Str = JSON.stringify(testParam2);
		const ev = new LogEvent(LogLevel.DEBUG, 'TestTag', 'test message', [testParam1, testParam2]);
		expect(ev.getMessageWithParams()).toBe(ev.message + sep + testParam1Str + sep + testParam2Str);

		const len = config.stringifyMaxLength = 10;
		const truncatedParam1 = testParam1Str.substring(0, len) + '...';
		expect(ev.getMessageWithParams()).toBe(ev.message + sep + truncatedParam1 + sep + testParam2Str);
	});

	it('should have an option to override the default level name map', () => {
		const levelNameMap = new LogLevelNameMap({ POTATO: LogLevel.DEBUG });
		const ev = new LogEvent(LogLevel.DEBUG, 'TestTag', 'test message');
		const customLevelTag = `[POTATO]`;
		expect(ev.toString().includes(customLevelTag)).toBe(false);

		config.levelNameMap = levelNameMap;
		expect(ev.toString().includes(customLevelTag)).toBe(true);
	});
});