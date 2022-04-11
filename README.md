# @obsidize/rx-console

This is yet another logging library in an attempt to strip away unnecessary dependencies that break
interoperability between browser and node environments.

The goals of this module are:

- Allow runtime configuration of log levels
- Ability to intercept log events, so they can be transported to a persistence source
- Make no assumptions about the persistence layer (i.e. no dependency declarations that lock this module to node or the browser, like node fs)
- Configurability at each abstraction level, from the root ```RxConsole``` class all the way down to the ```LogEvent``` class.

#### Why Did I Make This Module?

[Winston](https://www.npmjs.com/package/winston) 
and [Bunyan](https://www.npmjs.com/package/bunyan)
are excellent tools for creating a complex logger heirarchy and routing log traffic to external transports.
However, they have (completely unnecessary) mandatory dependencies to node-specific things like fs and stream utilities. 
This may lead one down the rabbit-hole of trying to shim or "fake" these dependencies in order to get all the other 
benefits of using these logging modules, which in turn leads to bundling pain and misery.

On the other side of the spectrum we have the
[debug](https://www.npmjs.com/package/debug) 
and [loglevel](https://www.npmjs.com/package/loglevel) modules, which are super-light-weight browser-compatible loggers with no concept of transports.
(Honestly if you don't need transport abstractions, consider using one of these)

I needed a middle ground between these two types of modules, and this is the result.

## Installation

- npm:

```bash
npm install --save @obsidize/rx-console
```

- git:

```bash
npm install --save git+https://github.com/jospete/obsidize-rx-console.git
```

## Usage (TypeScript)

This module exposes a utility function ```getLogger()``` for generating logger instances:

```typescript
import { getLogger, LogEventSource, RxConsole, LogLevel } from '@obsidize/rx-console';

class MyServiceThing {

	private readonly logger: LogEventSource = getLogger('MyServiceThing');

	test(): void {
		this.logger.debug('test!');
	}
}

// You can use the main instance, or make your own with:
// export const myCustomConsole = new RxConsole();
RxConsole
	.main
	.setLevel(LogLevel.DEBUG)
	.enableDefaultBroadcast();

const service = new MyServiceThing();
service.test(); // 2021-02-16T00:42:20.777Z [DEBUG] [MyServiceThing] test!
```

> "Well that was unnecessary, we could have just used _console.log('test');_ right ...?"

Not exactly -- this approach offers a few advantages:

1. Unlike ```console.log()```, LogEvent instances carry _context_ about where the log came from, so 
we can infer more useful data in the output like what time the event happened and what class (AKA "logger name") it came from.
2. This allows us to route events to a **file in cordova**, or to an **http server**, or just **buffer log events in memory**.
3. This allows us to route events through RxJS operators, which in of itself has many benefits for stream transformation.

```typescript
import { Observable, fromEventPattern, inverval } from 'rxjs';
import { buffer, map } from 'rxjs/operators';
import { RxConsole, LogEvent } from '@obsidize/rx-console';

RxConsole.main.asObservable<Observable<LogEvent>>(fromEventPattern).pipe(

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
const {RxConsole, LogLevel, getLogger} = rxConsole;

RxConsole
	.main
	.setLevel(LogLevel.TRACE)
	.enableDefaultBroadcast();

const logger = getLogger('RunKitLogger');

logger.debug('test');
// "2021-03-15T21:13:42.356Z [DEBUG] [RunKitLogger] test"

logger.info('some object info: ', {myValueIs: 42, isOptionalParam: true, someOtherValue: 'yep'});
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
import { LogEvent, LogEventDelegate, LogEventEmitter, RxConsole } from '@obsidize/rx-console';

class MyCustomLogEvent extends LogEvent {

	// Add some special sauce to your custom event instances.
	specialSauceData: number = 42;
}

class MyCustomLogger extends LogEventEmitter<MyCustomLogEvent> {

	// Override the createEvent() method to generate your custom event type.
	protected createEvent(level: number, message: string, params: any[]): MyCustomLogEvent {
		return new MyCustomLogEvent(level, message, params, this.name);
	}
}

class MyCustomConsole extends RxConsole<MyCustomLogEvent, MyCustomLogger> {

	// Override the createLogger() method to generate your custom subject type.
	protected createLogger(name: string): MyCustomLogger {
		return new MyCustomLogger(this, name);
	}
}

const myConsoleInstance = new MyCustomConsole();
const logger = myConsoleInstance.getLogger('TestLogger');

myConsoleInstance.listeners.add(ev => {
	console.log(ev.message); // 'custom log'
	console.log(ev.specialSauceData); // 42
});

logger.info('custom log');

// NOTE: You can also wire your custom console back into the main instance
myConsoleInstance.listeners.add(RxConsole.main.proxy as LogEventDelegate);
```

## API

Source documentation can be found [here](https://jospete.github.io/obsidize-rx-console/)

## Supplemental Notes

It is important to note that this module is only creating and emitting the log data.
Any logic that has to do with _transporting_ the data (AKA to a file or server) should be considered a separate entity.

Available Transports
- [@obsidize/rotating-file-stream](https://github.com/jospete/obsidize-rotating-file-stream) - spreads data seamlessly across multiple files in a rotating fashion