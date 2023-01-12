import { Observable, fromEventPattern, interval } from 'rxjs';
import { buffer, map } from 'rxjs/operators';

import {
	LogEvent,
	LogLevel,
	Logger,
	getDefaultLoggerSink,
	setDefaultLoggerBroadcastEnabled,
	LogEventSink,
	type LogEventInterceptor
} from '../src';

describe('README Examples', () => {

	it('can execute the TLDR example', () => {

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
	});

	it('can execute the rxjs example', () => {

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
	});

	it('can execute the vanilla JS example', () => {

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
	});

	it('can execute the custom extensions example', () => {

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
	});
});