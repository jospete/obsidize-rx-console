# Changelog

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