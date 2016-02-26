# good-bunyan-json

A [Good logger](https://github.com/hapijs/good) for [winston](https://github.com/winstonjs/winston)

Supports custom formatter functions and json logging output.

## Usage

```js
var winston = require('winston');
var GoodWinstonReporter = require('./lib');


var options = {
  opsInterval: 5000,
  reporters: [{
    reporter: GoodWinstonReporter,
    events: {
      log: '*',
      request: '*',
      response: '*',
      error: '*',
      ops: '*'
    },
    config: {
      logger: winston
    }
  }]
};

server.register({
  register: require('good'),
  options: options
}, function (err) {
  if (err) {
    console.error(err);
  } else {
    server.start(function () {
      console.info('Server started at ' + server.info.uri);
    });

    server.log('info', 'Hello');
    server.log('error', 'Error');
  }
});

```
