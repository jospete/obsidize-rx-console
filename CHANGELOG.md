# Changelog

## 6.2.1

- Refactor `truncate` utility function logic to fix issue where output string could
	potentially be longer than input string due to trailing ellipsis.

## 6.2.0

- Add `Config` class to allow for global configuration of `LogEvent` serialization

## 6.1.6

- Add option to specify log level names in LogLevelNameMap constructor
- Add method getMessageWithParams() on LogEvent class to get the message and params without tag or timestamp

## 6.1.5

- Refactor primary transport ref to be placed on the global/window object so it doesn't get lost between module scopes
- Add convenience accessors for event listener add/remove on `LoggerTransport` class

## 6.1.4

- Add `LogEvent.clone()` function to handle log event buffering when event cache is enabled

## 6.1.3

- Expose `broadcastLogEvent()` function to further increase customizability

## 6.1.2

- Add static packed tarball asset to this repo to circumvent latency with npm publishes

## 6.1.1

- Attempt to fix publish issues

## 6.1.0

- Refactor `stringifyLogEventBaseValues()` to optionally take a custom `LogLevelNameMap` instance
- Expose log level -> name conversion customizer function
- Refactor core event creation hooks to accept a timestamp as a parameter
- Add new method `emitEvent()` to `Logger` class to allow users to emit custom rolled events such as proxy events from other logging systems

## 6.0.0

- Remove deprecated features from v5.x
- Introduce event caching to optimize memory footprint (can be disabled via `LoggerTransport.disableEventCaching()`)
- General internal changes to avoid creating closures and any unnecessary garbage

## 5.3.0

- Add ability to customize log level names at runtime via `LogLevelNameMap.main.update(...)`
- Add `LogEvent.stringify(...)` and `LogEvent.toString()` convenience options
- Deprecate `getLogLevelName()` in favor of `LogLevelNameMap.main.get(...)`
- Deprecate `LoggerTransport.transmit()` in favor of `LoggerTransport.send()`
- Code cleanup and documentation

## 5.2.0

- Add LogEventGuard and LogEventGuardContext constructs to encapsulate log event filtering logic
- Refactor Logger and LoggerTransport classes to extend LogEventGuardContext so they can share the same type of event filtering functionality

## 5.1.0

- Refactor Logger transport to be configurable after creation
- Add enabled flag to LoggerTransport
- Streamline LoggerTransport piping interface

## 5.0.x

- Further API redesigns to see how small this library can get while maintaining core functionality

## 4.0.x

- Overhaul core design to be both simpler and more compact

## 3.1.0

- Add new class ```LogEventAggregator``` to allow for more fluid customization options

## 3.0.0

- Remove deprecated ```getLogger()``` function
- Set new ```Logger``` class as the primary entry point for generating logger instances

#### Notes:

Due to the static design of ```RxConsole```, it is best that the static instance not keep track of all loggers, and
that loggers should instead be created explicitly by the developer using the ```new``` keyword.

In the previous implementation with the ```getLogger()``` function, all created loggers would get stored in an internal map, 
and would end up out-living the context they were created for.

This would in-turn prevent browsers from reclaiming this memory, and cause a gradual slow down in things such as Angular apps
with a frequent create / destroy cycle (everything would get destroyed except for the logger associated with the destroyed thing).

## 2.0.4

- Add convenience methods ```enableDefaultBroadcast()``` and ```disableDefaultBroadcast()``` to reduce setup boilerplate
- Add new class ```Logger``` that will supercede ```getLogger()``` as the primary entry point