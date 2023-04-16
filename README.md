# @obsidize/rx-console

A logging library that is tiny, highly configurable, and platform-agnostic.

More configurable than modules like [debug](https://www.npmjs.com/package/debug),
without the restrictiveness / platform-locking of modules like [winston](https://www.npmjs.com/package/winston).

#### Highlights

- Zero dependencies
- Compatible on anything that runs JavaScript
- Compact (~6Kb es5 file)

#### Goals

- Allow runtime configuration of log levels
- Ability to intercept log events, so they can be transported to a persistence source
- Make no assumptions about the persistence layer (i.e. no dependency declarations that lock this module to node or the browser, like node 'fs' or 'stream' packages)
- Optional integration with RxJS
- Configurability at each abstraction layer (example code shown further down)

## Installation

```bash
npm install -P -E @obsidize/rx-console
```

## Usage (NodeJS / Vanilla JavaScript)

The below snippet can be tested with runkit on NPM.

```javascript
const {
	Logger, 
	LogLevel, 
	getPrimaryLoggerTransport
} = require('@obsidize/rx-console');

// get a reference to the root log event transport
getPrimaryLoggerTransport()
	// set custom filter for what events get emitted
	.setFilter(ev => ev.level >= LogLevel.DEBUG)
	// turn on default global `console` variable usage
	.setDefaultBroadcastEnabled(true);

const logger = new Logger('RunKitLogger');

logger.debug('test');
// "2021-03-15T21:13:42.356Z [DEBUG] [RunKitLogger] test"

const someObj = { 
	myValueIs: 42, 
	isOptionalParam: true, 
	someOtherValue: 'yep' 
};

logger.info('some object info: ', someObj);
// "2021-03-15T21:13:42.360Z [INFO] [RunKitLogger] some object info: "
// Object {myValueIs: 42, isOptionalParam: true, someOtherValue: "yep"}

logger.warn('something unusual happened');
// "2021-03-15T21:13:42.363Z [WARN] [RunKitLogger] something unusual happened

logger.fatal('EXPLOSIONS?!?!?!');
// "2021-03-15T21:13:42.366Z [FATAL] [RunKitLogger] EXPLOSIONS?!?!?!"

logger.verbose('im obnoxious');
// Does not log anything because VERBOSE < DEBUG
```

## Usage (TypeScript)

TypeScript usage is virtually identical to vanilla JavaScript.

Here's an example of using a logger within the context of a class:

```typescript
import { Logger, LogLevel, getPrimaryLoggerTransport } from '@obsidize/rx-console';

// NOTE: this only needs to be done once, as a part of your app's main setup routine
getPrimaryLoggerTransport()
	.setFilter(ev => ev.level >= LogLevel.DEBUG)
	// can also be fed in a 'prod' flag from your app
	.setDefaultBroadcastEnabled(true);

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
import { buffer, map, filter } from 'rxjs/operators';
import { LogEvent, getPrimaryLoggerTransport, stringifyLogEvent } from '@obsidize/rx-console';

// no-op function for example purposes
const writeToFile = (..._args: any[]) => { };

// combine the buffered events into a single string
const serializeEvents = (events: LogEvent[]): string => {
	// customize this however you want
	return events.map(ev => stringifyLogEvent(ev)).join('\n') + '\n';
};

// Wraps the transport's EventEmitter as an rxjs observable using 
// the `fromEventPattern` rxjs creator function.
const eventStream = getPrimaryLoggerTransport()
	.events() // get a reference to the transport's EventEmitter instance
	.asObservable<Observable<LogEvent>>(fromEventPattern);

eventStream.pipe(

	// accumulate log events for 5 seconds
	buffer(interval(5000)),

	// if we didn't get any new logs after 5 seconds, just skip this round
	filter((events: LogEvent[]) => events.length > 0),

	// stringify and concatenate the buffered events
	map((events: LogEvent[]) => serializeEvents(events))

).subscribe(outputString => {

	// Dump the buffer to a file, or send to a server, or wherever.
	writeToFile(outputString);
});
```

## Runtime Event Filtering

Both `LoggerTransport` and `Logger` extend the `LogEventGuardContext` class,
which allows you to suppress events both on the transport side 
(shared between loggers that use the transport) and on the logger side (one-off filtering).

```typescript
import { Logger, LogLevel, getPrimaryLoggerTransport } from '@obsidize/rx-console';

getPrimaryLoggerTransport()
	.setFilter(ev => ev.level >= LogLevel.DEBUG);

const logger1 = new Logger('TestLogger')
	.setFilter(ev => ev.level >= LogLevel.TRACE);

const logger2 = new Logger('TestLogger')
	.setFilter(ev => ev.level >= LogLevel.INFO);

logger1.trace('trace test'); // suppressed because the transport's guard caught it
logger1.debug('debug test'); // "debug test"

logger2.debug('debug test'); // suppressed because this logger's guard caught it
logger2.info('info test'); // "info test"

logger2.setEnabled(false);
logger2.error('BOOM!!!'); // suppressed because the logger is disabled
```

## Custom Extensions

This module is fully customizable via class extensions:

```typescript
import { LogEvent, LoggerTransport, Logger, getPrimaryLoggerTransport } from '@obsidize/rx-console';

// Create a custom event type
class CustomLogEvent extends LogEvent {

	// Add some special sauce to your custom event instances.
	specialSauceData: number = 42;
}

// Create a custom transport that knows how to create your custom event type
class CustomTransport extends LoggerTransport {

	// Create a main instance for your loggers to report back to
	public static readonly main = new CustomTransport();

	// override to return your custom event type
	public createEvent(level: number, tag: string, message: string, params: any[]): CustomLogEvent {
		return new CustomLogEvent(level, tag, message, params);
	}
}

// Create a custom logger that uses your custom transport as the default
class CustomLogger extends Logger {

	constructor(
		name: string,
		transport: CustomTransport = CustomTransport.main
	) {
		super(name, transport);
	}
}

const transport = CustomTransport.main;

transport.events().addListener((ev: CustomLogEvent) => {
	console.log(ev.message); // 'custom log'
	console.log(ev.specialSauceData); // 42
});

// NOTE: You can also wire your custom transport back into the default instance
transport.pipeToDefault();

const logger = new CustomLogger('TestLogger');
logger.info('custom log');

// you can also break the connection to the default instance later on
transport.unpipeFromDefault();
```

## API

Source documentation can be found [here](https://jospete.github.io/obsidize-rx-console/)