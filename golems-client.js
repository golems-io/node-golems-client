var url = require("url"), qs = require('querystring'), request = require('request');

function Client(options)
{
  this.protocol = options && options.protocol || 'http';
  this.hostname = options && options.hostname || 'api.golems.io';
  this.port =     options && options.port     || 80;
  this.aspect =   options && options.aspect   || 'person';
  this.token = null;
}

Client.prototype = {
  constructor: Client,
  _url: function (pathname) {
    return {
      protocol: this.protocol, hostname: this.hostname, port: this.port,
      pathname: pathname, 
      query: this.token ? { token: this.token } : null
    }; },
  _uri: function (pathname) { return url.format(this._url(pathname)); },
  _get: function (pathname, callback, error_callback) {
console.log("requesting %s", this._uri(pathname));
    request({uri: this._uri(pathname)}, function (error, response, body) {
      if (error) {
        if (error_callback) error_callback(e);
        else throw new Error(error.message);
      } else {
        callback(JSON.parse(body));
      }
    });
  },

  _golem_pathname: function (spore) { return '/' + this.aspect + '/' + spore + '.json' },
  _random_pathname: function () { return this._golem_pathname("random"); },
  _schema_pathname: function () { return '/schema/' + this.aspect + '.json'; },

  get: function (spore, callback, error_callback) { this._get(this._golem_pathname(spore), callback, error_callback); },
  random: function (callback, error_callback) { this._get(this._random_pathname(), callback, error_callback); },
  schema: function (callback, error_callback) { this._get(this._schema_pathname(), callback, error_callback); },

  authorize: function (email, key, callback) {
    var client = this;
    request.post({
      url: "https://golems.herokuapp.com/auth/token", // TODO: switch to api.golems.io when cert available
        form: { email: email, key: key }
      }, function (error, response, body) {
        var result = qs.parse(body);
        client.token = result.token;
// TODO: set a timeout for reauthorization?
        return callback && callback(result);
      }
    );
  }

};

exports.Client = Client;

// a convenience method for calling random using the default options
exports.random = function (callback) { (new Client()).random(callback); }

// a convenience method for calling schema for given aspect and/or default
exports.schema = function (aspect, callback) {
  if (typeof(callback) === "undefined") {
    callback = aspect;
    aspect = null;
  }
  (new Client({aspect: aspect})).schema(callback);
};
