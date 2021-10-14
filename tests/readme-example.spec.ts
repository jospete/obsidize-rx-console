import { Observable, fromEventPattern, interval } from 'rxjs';
import { buffer, map } from 'rxjs/operators';

import { LogEvent, LogEventDelegate, LogEventEmitter, RxConsole, getLogger, LogEventSource, LogLevel } from '../src';

describe('README Examples', () => {

	it('can execute the TLDR example', () => {

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
			.listeners
			.add(ev => {
				// send log to standard browser console
				ev.broadcastTo(console);
			});

		const service = new MyServiceThing();
		service.test(); // 2021-02-16T00:42:20.777Z [DEBUG] [MyServiceThing] test!
	});

	it('can execute the rxjs example', () => {

		const writeToFile = (..._args: any[]) => { };

		RxConsole.main.asObservable<Observable<LogEvent>>(fromEventPattern).pipe(

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

		RxConsole
			.main
			.setLevel(LogLevel.DEBUG)
			.listeners
			.add(ev => ev.broadcastTo(console));

		const logger = getLogger('RunKitLogger');

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
	});
});