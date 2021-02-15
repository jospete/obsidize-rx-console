# @obsidize/rx-console


This is yet another logging library in an attempt to strip away unnecessary dependencies that break
interoperability between browser and node environments for general-purpose logging.


For some reason, Winston and Bunyan have (completely unnecessary) mandatory dependencies to
node-specific things like fs and stream utilities. This may lead people down the rabbit-hole of
trying to shim or "fake" these modules to get all the other benefits of using these modules, which
in turn leads to bundling pain and misery.


Another approach is the debug and loglevel modules, which are super-light-weight browser variants.
These work fine for debugging locally, but don't seem to scale well if you want to, for example, route logger
traffic to a file on a cordova app or adjust the global log level in real-time.


The goal of this library is simple: create a single-source aggregator for multiple log streams, and make
**zero assumptions about where the data is being routed to**.


This module uses RxJS as its primary means of event handling, and exposes a single entry point for generating logger instances:

```typescript
import { getLogger, LogEventSource, RxConsole, LogLevel } from '@obsidize/rx-console';

export class MyServiceThing {
	
	private readonly logger: LogEventSource = getLogger('MyServiceThing');
	
	test(): void {
		this.logger.debug('test!');
	}
}

// ... in your main startup routine ...
RxConsole.main.setLevel(LogLevel.DEBUG);
RxConsole.main.events.subscribe(ev => console.log(ev.toString())); // send log to standard browser console

```

> "Well that was unnecessary, I could have just used _console.log('test');_ right...?"

Yes, but now in addition to logging to the browser, you can _also_ route events 
to a **file in cordova**, or to a **http server**, or just **buffer them in memory**.

All of these logger events are now being passed through RxJS, which means we have 
the unbelievable power of RxJS Observables at our disposal now for logging.

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

	// Dump the buffer to a file, or to a server, or wherever.
	writeToFile(outputString);
});

```