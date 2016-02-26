'use strict';

var Squeeze = require('good-squeeze').Squeeze;
var Hoek = require('hoek');
var Joi = require('joi');

var availableLevels = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];

var defaultFormatters = {};
defaultFormatters.ops = function (data) {
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
};

defaultFormatters.response = function (data) {
  return {
    method: data.method.toUpperCase(),
    parh: data.path,
    statusCode: data.statusCode,
    responseTime: data.responseTime
  };
};

defaultFormatters.log = function (data) {
  return data;
};

defaultFormatters.request = function (data) {
  return data;
};

defaultFormatters.error = function (data) {
  return {
    message: data.message,
    stack: data.stack
  };
};

var settingsSchema = Joi.object().keys({
  levels: Joi.object().keys({
    ops: Joi.string().valid(availableLevels).default('info'),
    response: Joi.string().valid(availableLevels).default('info'),
    error: Joi.string().valid(availableLevels).default('error'),
    log: Joi.string().valid(availableLevels).default('info'),
    request: Joi.string().valid(availableLevels).default('info')
  }),
  formatters: Joi.object().keys({
    ops: Joi.func().default(defaultFormatters.ops),
    response: Joi.func().default(defaultFormatters.response),
    log: Joi.func().default(defaultFormatters.log),
    error: Joi.func().default(defaultFormatters.error),
    request: Joi.func().default(defaultFormatters.request)
  }),
  logger: Joi.object().required()
});

var GoodWinstonJsonReporter = function (events, config) {
  var self = this;
  this.winston = config.logger;

  if (!(this instanceof GoodWinstonJsonReporter)) {
    return new GoodWinstonJsonReporter(events, config);
  }
  config.levels = config.levels || {};
  config.formatters = config.formatters || {};

  Joi.validate(config, settingsSchema, function (err, value) {
    if (err) {
      throw err;
    }
    self.settings = value;
  });
};

GoodWinstonJsonReporter.prototype.init = function (stream, emitter, callback) {
  var self = this;

  if (!stream._readableState.objectMode) {
    return callback(new Error('stream must be in object mode'));
  }

  stream.on('data', function (data) {
    var event = data.event;
    var level = self.settings.levels[event];
    if (level != null) {
      var formatter = self.settings.formatters[event];
      self.winston.log(level, formatter(data));
    }
  });
  callback();
};

module.exports = GoodWinstonJsonReporter;
