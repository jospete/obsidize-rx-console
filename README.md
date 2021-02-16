# @obsidize/rx-console


This is yet another logging library in an attempt to strip away unnecessary dependencies that break
interoperability between browser and node environments.


For some reason, Winston and Bunyan have (completely unnecessary) mandatory dependencies to
node-specific things like fs and stream utilities. This may lead people down the rabbit-hole of
trying to shim or "fake" these modules to get all the other benefits of using these modules, which
in turn leads to bundling pain and misery.


Another approach is the debug and loglevel modules, which are super-light-weight browser variants.
These work fine for debugging locally, but don't seem to scale well if you want to, for example, route logger
traffic to a file on a cordova app or adjust the global log level in real-time.


The goal of this library is simple: create a single-source, runtime-configurable aggregator for multiple log streams, and make
**zero assumptions about where the data is being routed to**.


This module uses RxJS for event streaming, and exposes a single entry point for generating logger instances:

```typescript
import { getLogger, LogEventSource, RxConsole, LogLevel } from '@obsidize/rx-console';

export class MyServiceThing {
	
	private readonly logger: LogEventSource = getLogger('MyServiceThing');
	
	test(): void {
		this.logger.debug('test!');
	}
}

// ... in your main startup routine ...'

// You can use the main instance, or make your own with:
// export const myCustomConsole = new RxConsole();
RxConsole.main
	.setLevel(LogLevel.DEBUG)
	.events
	.subscribe(ev => {
		// send log to standard browser console
		console.log(ev.toString());
	});

```

> "Well that was unnecessary, I could have just used _console.log('test');_ right...?"

Yes, but now in addition to logging to the browser, you can _also_ route events 
to a **file in cordova**, or to an **http server**, or just **buffer them in memory**.

All of these logger events are now being passed through RxJS, which means we now have 
the unbelievable power of RxJS Observables at our disposal.

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

Furthermore, this module is customizable at _each level_:

```typescript
import { LogEvent, LogEventSubject, RxConsole } from '@obsidize/rx-console';

class MyCustomEvent extends LogEvent {
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

```