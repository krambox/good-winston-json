'use strict';

var Squeeze = require('good-squeeze').Squeeze;
var Hoek = require('hoek');

var winston;

var internals = {
  availableLevels: ['silly', 'debug', 'verbose', 'info', 'warn', 'error'],
  defaultOptions: {
    log: 'info',
    request: 'info',
    response: 'info',
    error: 'error',
    ops: 'info'
  },
  defaultFormater: {
    ops: function (data) {
      var load = data.load;
      var concurrents = 0;
      Object.keys(load.concurrents).forEach(function (key) {
        concurrents = concurrents + load.concurrents[key];
      });

      return {
        uptime: data.proc.uptime,
        rss: data.proc.mem.rss,
        heapTotal: data.proc.mem.heapTotal,
        heapUsed: data.proc.mem.heapUsed,
        load: data.os.load,
        concurrents: concurrents
      };
    },
    response: function (data) {
      return {
        method: data.method.toUpperCase(),
        parh: data.path,
        statusCode: data.statusCode,
        responseTime: data.responseTime
      };
    },
    log: function (data) {
      return data;
    },
    request: function (data) {
      return data;
    },
    error: function (data) {
      return {
        message: data.message,
        stack: data.stack
      };
    }
  }
};

module.exports = internals.GoodWinstonJsonReporter = function (events, config) {
  if (!(this instanceof internals.GoodWinstonJsonReporter)) {
    return new internals.GoodWinstonJsonReporter(events, config);
  }
  
  winston = config.winston;
  this.options=internals.defaultOptions;
};

internals.GoodWinstonJsonReporter.prototype.init = function (readstream, emitter, callback) {
  var self = this;

  readstream.on('data', function (data) {
    var event = data.event;
    var level = self.options[event];

    if (level != null) {
      // Ops event
      if (event === 'ops') {
        winston.log(level, internals.defaultFormater.ops(data));
      // Response event
      } else if (event === 'response') {
        winston.log(level, internals.defaultFormater.response(data));
      // Log event
      } else if (event === 'log') {
        winston.log(level, internals.defaultFormater.log(data));
      // Request event
      } else if (event === 'request') {
        winston.log(level, internals.defaultFormater.request(data));
      // Error event
      } else if (event === 'error') {
        winston.log(level, internals.defaultFormater.error(data));
      }
    }
  });
  callback();
};
