# @obsidize/rx-console

A logging library that is more configurable than modules like [debug](https://www.npmjs.com/package/debug),
without the restrictiveness / platform-locking of modules like [winston](https://www.npmjs.com/package/winston).

#### Highlights

- Only one dependency (tslib to play nice with typescript projects)
- Compatible on both Browser / NodeJS
- Compact (~4Kb es5 file)

#### Goals

- Allow runtime configuration of log levels
- Ability to intercept log events, so they can be transported to a persistence source
- Make no assumptions about the persistence layer (i.e. no dependency declarations that lock this module to node or the browser, like node 'fs' or 'stream' packages)
- Configurability at each abstraction layer (Event / Sink / Listener)

## Installation

- npm:

```bash
npm install -P -E @obsidize/rx-console
```

## Usage (TypeScript)

Context-based loggers can be created like so:

```typescript
import { Logger, setDefaultLoggerBroadcastEnabled } from '@obsidize/rx-console';

// turn on default `window.console` usage
setDefaultLoggerBroadcastEnabled(true);

class MyServiceThing {

	private readonly logger = new Logger('MyServiceThing');

	test(): void {
		this.logger.debug('test!');
	}
}

const service = new MyServiceThing();
service.test(); // 2021-02-16T00:42:20.777Z [DEBUG] [MyServiceThing] test!
```

## Usage (RxJS)

Log events can be redirected to an rxjs stream like so:

```typescript
import { Observable, fromEventPattern, inverval } from 'rxjs';
import { buffer, map } from 'rxjs/operators';
import { LogEvent, getDefaultLoggerSink } from '@obsidize/rx-console';

// noop function for example purposes
const writeToFile = (..._args: any[]) => { };
const sink = getDefaultLoggerSink();

sink.asObservable<Observable<LogEvent>>(fromEventPattern).pipe(

	// accumulate log events for 5 seconds
	buffer(interval(5000)),

	// stringify and concatenate the buffered events
	map(bufferedEvents => bufferedEvents.map(e => e.toString()).join('\n'))

).subscribe(outputString => {

	// Dump the buffer to a file, or send to a server, or wherever.
	writeToFile(outputString);
});
```

## Usage (NodeJS / Vanilla JavaScript)

The same concepts in the TypeScript example also apply to NodeJS / vanilla JS usage.

The below snippet can be tested with runkit on NPM.

```javascript
var rxConsole = require("@obsidize/rx-console");
const {Logger, LogLevel, getDefaultLoggerSink, setDefaultLoggerBroadcastEnabled} = rxConsole;

getDefaultLoggerSink().filter.setMinLevel(LogLevel.DEBUG);
setDefaultLoggerBroadcastEnabled(true);

const logger = new Logger('RunKitLogger');

logger.debug('test');
// "2021-03-15T21:13:42.356Z [DEBUG] [RunKitLogger] test"

logger.info('some object info: ', { myValueIs: 42, isOptionalParam: true, someOtherValue: 'yep' });
// "2021-03-15T21:13:42.360Z [INFO] [RunKitLogger] some object info: "
// Object {myValueIs: 42, isOptionalParam: true, someOtherValue: "yep"}

logger.fatal('EXPLOSIONS?!?!?!');
// "2021-03-15T21:13:42.363Z [FATAL] [RunKitLogger] EXPLOSIONS?!?!?!"

logger.verbose('im obnoxious');
// Does not log anything because VERBOSE < DEBUG
```

## Custom Extensions

This module is customizable at each level thanks to generics:

```typescript
import { LogEvent, LogEventSink, Logger, getDefaultLoggerSink, type LogEventInterceptor } from '@obsidize/rx-console';

class MyCustomLogEvent extends LogEvent {

	// Add some special sauce to your custom event instances.
	specialSauceData: number = 42;
}

class MyCustomSink extends LogEventSink<MyCustomLogEvent> {

	// Create a main instance for your loggers to report back to
	public static readonly main = new MyCustomSink();
}

class MyCustomLogger extends Logger<MyCustomLogEvent> {

	constructor(
		name: string,
		aggregator: LogEventInterceptor<MyCustomLogEvent> = MyCustomSink.main
	) {
		super(name, aggregator);
	}

	// Override the createEvent() method to generate your custom event type.
	protected createEvent(level: number, message: string, params: any[]): MyCustomLogEvent {
		return new MyCustomLogEvent(level, message, params, this.name);
	}
}

MyCustomSink.main.onNext.add(ev => {

	console.log(ev.message); // 'custom log'
	console.log(ev.specialSauceData); // 42

	// uses the default output transforms
	// (or your custom ones if supplied in the MyCustomConsole class)
	ev.broadcastTo(console);
});

// NOTE: You can also wire your custom console back into the default main instance
MyCustomSink.main.pipeTo(getDefaultLoggerSink());

const logger = new MyCustomLogger('TestLogger');

logger.info('custom log');
```

## API

Source documentation can be found [here](https://jospete.github.io/obsidize-rx-console/)

## Supplemental Notes

It is important to note that this module is only creating and emitting the log data.
Any logic that has to do with _transporting_ the data (AKA to a file or server) should be considered a separate entity.

Available Transports
- [@obsidize/rotating-file-stream](https://github.com/jospete/obsidize-rotating-file-stream) - spreads data seamlessly across multiple files in a rotating fashion