var url = require("url"), request = require('request');

function Client(options)
{
  this.protocol = options && options.protocol || 'http';
  this.hostname = options && options.hostname || 'api.golems.io';
  this.port =     options && options.port     || 80;
  this.aspect =   options && options.aspect   || 'person';
}

Client.prototype = {
  constructor: Client,
  pathname: function (spore) { return '/' + this.aspect + '/' + spore + '.json' },
  url: function (spore) { return { protocol: this.protocol, hostname: this.hostname, port: this.port, pathname: this.pathname(spore) }; },
  uri: function (spore) { return url.format(this.url(spore)); },
  get: function (spore, callback, error_callback) {
    request({uri: this.uri(spore)}, function (error, response, body) {
      if (error) {
        if (error_callback) error_callback(e);
        else throw new Error(error.message);
      } else {
        callback(JSON.parse(body));
      }
    });
  },
  random: function (callback, error_callback) { this.get("random", callback, error_callback); }
};

exports.Client = Client;

// a convenience method for calling random using the default options
exports.random = function (callback) { (new Client()).random(callback); }
