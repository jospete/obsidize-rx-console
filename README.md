# @obsidize/rx-console

A logging library that is more configurable than modules like [debug](https://www.npmjs.com/package/debug),
without the restrictiveness / platform-locking of modules like [winston](https://www.npmjs.com/package/winston).

#### Highlights

- Only one dependency (tslib to play nice with typescript projects)
- Compatible on anything that runs JavaScript
- Compact (~3Kb es5 file)

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
const serializeEvents = (events: LogEvent[]) => {
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

## Custom Extensions

This module is fully customizable at each level.

The below code snippet can be considered a TL;DR of how this module works under the hood.

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
		transport: LoggerTransport = CustomTransport.main
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
const primaryTransport = getPrimaryLoggerTransport();
transport.pipeTo(primaryTransport);

// you can also break the connection to the default instance later on
transport.setPipelineEnabled(primaryTransport, false);

const logger = new CustomLogger('TestLogger');
logger.info('custom log');
```

## API

Source documentation can be found [here](https://jospete.github.io/obsidize-rx-console/)