import { Observable, fromEventPattern, interval } from 'rxjs';
import { buffer, filter, map } from 'rxjs/operators';

import {
	LogLevel,
	LogEvent,
	Logger,
	LoggerTransport,
	getPrimaryLoggerTransport,
	stringifyLogEvent
} from '../src';

describe('README Examples', () => {

	it('can execute the vanilla JS example', () => {

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
	});

	it('can execute the typescript example', () => {

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
	});

	it('can execute the event filtering example', () => {

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

		getPrimaryLoggerTransport()
			.setFilter(null); // reset the primary transport's filter to not break other tests
	});

	it('can execute the rxjs example', () => {

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

			// required if event caching is not disabled
			// (caching is enabled by default)
			map((event: LogEvent) => event.clone()),

			// accumulate log events for 1 second
			buffer(interval(1000)),

			// if we didn't get any new logs after 5 seconds, just skip this round
			filter((events: LogEvent[]) => events.length > 0),

			// stringify and concatenate the buffered events
			map((events: LogEvent[]) => serializeEvents(events))

		).subscribe(outputString => {

			// Dump the buffer to a file, or send to a server, or wherever.
			writeToFile(outputString);
		});
	});

	it('can execute the customization example', () => {

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
	});
});