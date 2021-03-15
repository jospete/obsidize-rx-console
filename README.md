# @obsidize/rx-console

This is yet another logging library in an attempt to strip away unnecessary dependencies that break
interoperability between browser and node environments.

For some reason, Winston and Bunyan have (completely unnecessary) mandatory dependencies to
node-specific things like fs and stream utilities. This may lead people down the rabbit-hole of
trying to shim or "fake" these dependencies in order to get all the other benefits of using these logging modules, which
in turn leads to bundling pain and misery.

Another approach is the debug and loglevel modules, which are super-light-weight browser variants.
(Honestly if size is an issue for you, just use one of these)

debug and loglevel work fine for debugging locally, but don't seem to scale well if you want to, for example, 
route logger traffic to a file on a cordova app or adjust the global log level in real-time.

The goal of this library is simple: create a single-source, runtime-configurable aggregator for multiple log streams, and make
**zero assumptions about where the data is being routed to**.

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

This module uses RxJS for event streaming, and exposes a utility function ```getLogger()``` for generating logger instances:

```typescript
import { getLogger, LogEventSource } from '@obsidize/rx-console';

export class MyServiceThing {
	
	private readonly logger: LogEventSource = getLogger('MyServiceThing');
	
	test(): void {
		this.logger.debug('test!');
	}
}

// ... in your main startup routine ...

import { RxConsole, LogLevel, LogEvent } from '@obsidize/rx-console';

// You can use the main instance, or make your own with:
// export const myCustomConsole = new RxConsole();
RxConsole.main
	.setLevel(LogLevel.DEBUG)
	.events
	.subscribe(ev => {
		// send log to standard browser console
		ev.broadcastTo(console); // 2021-02-16T00:42:20.777Z [DEBUG] [MyServiceThing] test!
	});

```

> "Well that was unnecessary, we could have just used _console.log('test');_ right ...?"

Not exactly -- the RxJS approach offers a few advantages:

1. Unlike ```console.log()```, LogEvent instances carry _context_ about where the log came from, so 
we can infer more useful data in the output like what time the event happened and what class (AKA "logger name") it came from.
2. Now you can _also_ route events to a **file in cordova**, or to an **http server**, or just **buffer log events in memory**.
3. All of these log events are now being passed through Observables, which means we now have the _nearly unlimited_ power of RxJS Observables at our disposal.

```typescript
import { RxConsole, LogLevel } from '@obsidize/rx-console';
import { inverval } from 'rxjs';
import { buffer, map } from 'rxjs/operators';

RxConsole.main.events.pipe(

	// accumulate log events for 5 seconds
	buffer(inverval(5000)),
	
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
require("rxjs"); // rxjs is a peer dependency. 
const rxConsole = require("@obsidize/rx-console");
const first = require('rxjs/operators').first;

const logger = rxConsole.getLogger('TestLog');
const eventPromise = rxConsole.RxConsole.main.events.pipe(first()).toPromise();

logger.debug('test!');

const logEvent = await eventPromise;
logEvent.toString();
// "2021-03-15T20:51:55.845Z [DEBUG] [TestLog] test!"
```

## Custom Extensions

This module is customizable at each level thanks to generics:

```typescript
import { LogEvent, LogEventSubject, RxConsole } from '@obsidize/rx-console';
import { map } from 'rxjs/operators';

class MyCustomEvent extends LogEvent {

	// Add some special sauce to your custom event instances.
	specialSauceData: number = 42;
}

class MyCustomLogSubject extends LogEventSubject<MyCustomEvent> {
	
	// Override the createEvent() method to generate your custom event type.
	protected createEvent(level: number, message: string, params: any[]): MyCustomEvent {
		return new MyCustomEvent(level, message, params, this.name);
	}
}

class MyCustomConsole extends RxConsole<MyCustomEvent, MyCustomLogSubject> {

	// Override the createEntryLogger() method to generate your custom subject type.
	protected createEntryLogger(name: string): MyCustomLogSubject {
		return new MyCustomLogSubject(name);
	}
}

const myConsoleInstance = new MyCustomConsole();
const logger = myConsoleInstance.getLogger('TestLogger');

logger.events.subscribe(ev => {
	console.log(ev.message); // 'custom log'
	console.log(ev.specialSauceData); // 42
});

logger.info('custom log');

// NOTE: You can also wire your custom console back into the main instance
myConsoleInstance.pipeEventsTo(RxConsole.main);

```

## Supplemental Notes

It is important to note that this module is only creating and emitting the log data.
Any logic that has to do with _transporting_ the data (AKA to a file or server) should be considered a separate entity.

Available Transports
- [@obsidize/rotating-file-stream](https://github.com/jospete/obsidize-rotating-file-stream) - spreads data seamlessly across multiple files in a rotating fashion