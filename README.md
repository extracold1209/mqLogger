# What is MQLogger

> It is for nodejs

This library is just send query to remote log server (like HTML beacon API)

but if message is unreachable, save message to file and it is loadable next execution

# Installation

```bash
# yarn
$ yarn add mq-logger
``` 

```bash
# npm
$ npm install mq-logger
```

# How to Use

## General use
```typescript
import MQLogger from 'mq-logger';

const logger = new MQLogger();

logger.send({any: 'event', you: 'want'}); // return Promise but no need wait
```

## Use GlobalInstance
```typescript
// if want to use globalInstance
// entry module
import MQLogger from 'mq-logger';

const logger = new MQLogger();

MQLogger.setGlobalInstance(logger);

// another file
const instance = MQLogger.getGlobalInstance();
instance.send(/* ... */);
```

