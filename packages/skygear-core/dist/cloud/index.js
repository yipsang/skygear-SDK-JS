'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkygearError = exports.ErrorCodes = exports.getContainer = exports.CloudCodeContainer = exports.settings = exports.SkygearResponse = exports.SkygearRequest = exports.poolConnect = exports.pool = exports.skyconfig = exports.BaseAuthProvider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2015 Oursky Ltd.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


exports.op = op;
exports.every = every;
exports.event = event;
exports.handler = handler;
exports.provides = provides;
exports.hook = hook;
exports.beforeSave = beforeSave;
exports.afterSave = afterSave;
exports.beforeDelete = beforeDelete;
exports.afterDelete = afterDelete;
exports.staticAsset = staticAsset;
exports.configModule = configModule;

var _pg = require('./pg');

Object.defineProperty(exports, 'poolConnect', {
  enumerable: true,
  get: function get() {
    return _pg.poolConnect;
  }
});

var _common = require('./transport/common');

Object.defineProperty(exports, 'SkygearRequest', {
  enumerable: true,
  get: function get() {
    return _common.SkygearRequest;
  }
});
Object.defineProperty(exports, 'SkygearResponse', {
  enumerable: true,
  get: function get() {
    return _common.SkygearResponse;
  }
});

var _container = require('./container');

Object.defineProperty(exports, 'getContainer', {
  enumerable: true,
  get: function get() {
    return _container.getContainer;
  }
});

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

var _skyconfig2 = require('./skyconfig');

var _skyconfig3 = _interopRequireDefault(_skyconfig2);

var _settings3 = require('./settings');

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _container2 = _interopRequireDefault(_container);

var _error = require('../error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nameCntMap = {};

function incSuffix(name) {
  if (nameCntMap[name] !== undefined) {
    nameCntMap[name] += 1;
    return name + '-' + nameCntMap[name];
  }
  nameCntMap[name] = 0;
  return name;
}

function funcName(func) {
  var name = func.name;
  if (!name) {
    var hash = _crypto2.default.createHash('sha');
    hash.update(func.toString());
    name = hash.digest('hex');
  }
  return incSuffix(name);
}

/**
 * You can register the cloud code as lambda, with JSON input and output.
 *
 * This is a convenient way to inject custom logic to Skygear server and can
 * be called easily with `skygear.lambda` in the client side.
 *
 * @example
 * const skygearCloud = require('skygear/cloud');
 * skygearCloud.op('greeting', function(param) {
 *     return {
 *       'content': 'Hello, ' + param.name,
 *     };
 * }, {
 *     userRequired: false
 * });
 *
 * @param {String} name - lambda name
 * @param {function(param:Object, options:*)} func - function to be registered
 * @param {Object} [options]
 * @param {Boolean} [options.keyRequired] - require api key to call the lambda
 * @param {Boolean} [options.userRequired] - require user to call the lambda
 */
function op(name, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // move authRequired to keyRequired, if keyRequired not specified
  if (options.keyRequired === undefined && options.authRequired !== undefined) {
    console.warn('authRequired is deprecated, use keyRequired instead');
    options.keyRequired = options.authRequired;
  }

  _registry2.default.registerOp(name, func, options);
}

/**
 * You can register the cloud code to get run at specific time intervals like
 * a cron job.
 *
 * @example
 * const skygearCloud = require('skygear/cloud');
 * skygearCloud.every('@daily', function() {
 *   console.log('Meow');
 * });
 *
 * @param  {String} cron - time interval in cron job syntax
 * @param  {function(param: *)} func - function to be registered
 * @param  {Object} [options]
 */
function every(cron, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // TODO: check cron format
  options.spec = cron;
  var name = funcName(func);
  _registry2.default.registerTimer(name, func, options);
}

/**
 * You can register the cloud code to run at skygear life cycle event.
 *
 * @example
 * const skygearCloud = require('skygear/cloud');
 * skygearCloud.event('after-plugins-ready', function() {
 *   console.log('Meow');
 * });
 *
 * @param {String} name - skygear life cycle event name
 * @param {function(param: *)} func - function to be registered
 * @param {Object} [options]
 */
function event(name, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  _registry2.default.registerEvent(name, func, options);
}

/**
 * You can configure the cloud code as an HTTP handler, which can respond to
 * requests coming from outside the SDK. A custom HTTP endpoint can be
 * created using the `handler` function.
 *
 * A custom HTTP endpoint can be useful for the followings:
 *
 * - receiving requests from outside the Skygear SDK
 * - allowing a third party webhook to call upon (e.g. payment
 *   service)
 *
 * @example
 * const skygearCloud = require('skygear/cloud');¬
 * skygearCloud.handler('handler1', function(req) {
 *     // cloud code handling the request
 *     return 'String';
 * }, {
 *     method: ['GET', 'POST'],
 *     userRequired: false
 * });
 *
 * @example
 * skygearCloud.handler('private', function(req, options) {
 *     // cloud code handling the request
 *     const {
 *       context,
 *       container  // a cloud code container for the current request context
 *     } = options;
 *     return {
 *       status: 'ok',
 *       user_id: context.user_id // only available if userRequired=true
 *     };
 * }, {
 *     method: ['GET', 'POST'],
 *     userRequired: true
 * });
 *
 * @param {string} path - The path of the handler to be mount.
 * @param {function(request:*, options:*): object} func - function to be
 * registered.
 * @param {Object} [options]
 * @param {String[]|String} [options.method] - handler methods, e.g. GET, POST
 * @param {Boolean} [options.keyRequired] - require api key to call the lambda
 * @param {Boolean} [options.userRequired] - require user to call the lambda
 */
function handler(path, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (typeof options.method === 'string') {
    options.method = [options.method];
  }

  // move authRequired to keyRequired, if keyRequired not specified
  if (options.keyRequired === undefined && options.authRequired !== undefined) {
    console.warn('authRequired is deprecated, use keyRequired instead');
    options.keyRequired = options.authRequired;
  }

  _registry2.default.registerHandler(path, func, options);
}

/**
 * Authentication Provider allows a plugin to authenticate user based on
 * credentials from a third-party. The Authentication Provider responds to
 * Skygear Server whether the credentials are accepted.
 *
 * @example
 * const skygearCloud = require('skygear/cloud');¬
 *
 * skygearCloud.provides('auth', 'com.facebook', Provider);
 *
 * @param {string} providerType - Type of the provider, only auth is supported
 * now.
 * @param {string} providerID - unique identifier to the provider
 * @param {object} ProviderCls - a provider class
 * @param {object} [options] - options for setting
 */
function provides(providerType, providerID, ProviderCls) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var provider = new ProviderCls();
  _registry2.default.registerProvider(providerType, providerID, provider, options);
}

/**
 * BaseAuthProvider provides example interface that an AuthProvider should
 * provide.
 *
 * To create an actual AuthProvider, you can extend the BaseAuthProvider and
 * provide `login`, `logout` and `info` functions.
 *
 * @example
 *  class Provider extends skygearCloud.BaseAuthProvider {
 *    login(authData) {
 *      console.log(authData);
 *      // third-party API call
 *      return {
 *        principal_id: 'identifier',
 *        auth_data: {...}
 *      }
 *    }
 *
 *    logout(authData) {
 *      console.log(authData);
 *    }
 *
 *    info(authData) {
 *      console.log(authData);
 *    }
 *  }
 *
 */

var BaseAuthProvider = exports.BaseAuthProvider = function () {
  function BaseAuthProvider() {
    _classCallCheck(this, BaseAuthProvider);
  }

  _createClass(BaseAuthProvider, [{
    key: 'handleAction',
    value: function handleAction(action, param) {
      if (!this[action]) {
        throw new Error('Provider not support action: ' + param.action);
      }
      return this[action](param);
    }
    /**
     * this method must be overridden by subclass.
     * @abstract
     */

  }, {
    key: 'login',
    value: function login(authData) {
      // eslint-disable-line
      throw new Error('Subclass of BaseAuthProvider should implement login method.');
    }
    /**
     * this method must be overridden by subclass.
     * @abstract
     */

  }, {
    key: 'logout',
    value: function logout(authData) {
      // eslint-disable-line
      throw new Error('Subclass of BaseAuthProvider should implement logout method.');
    }
    /**
     * this method must be overridden by subclass.
     * @abstract
     */

  }, {
    key: 'info',
    value: function info(authData) {
      // eslint-disable-line
      throw new Error('Subclass of BaseAuthProvider should implement info method.');
    }
  }]);

  return BaseAuthProvider;
}();

/**
 * You can register the cloud code to run at database event.
 *
 * @example
 * const skygearCloud = require('skygear/cloud');
 * skygearCloud.hook('before-save', function(newRecord, oldRecord, pool) {
 *   console.log('Meow');
 *   return newRecord;
 * });
 *
 * @param {String} name - function name
 * @param {function(newRecord:*, oldRecord:*, pool:*, options: *)} func -
 * function to be registered
 * @param {Object} [options]
 * @param {String} [options.type] - record type
 * @param {String} [options.trigger] - type of database event that trigger the
 * hook
 * @param {Boolean} [options.async] - true if the function triggered
 * asynchronously
 */


function hook(name, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  _registry2.default.registerHook(name, func, options);
}

/**
 * beforeSave — executes decorated function before a record save operation
 * occurs
 *
 * @example
 * const skygearCloud = require('skygear/cloud');¬
 * skygearCloud.beforeSave('note', function(record, original, pool, options) {
 *     // cloud code handling the request
 *     return;
 * }, {
 *     async: true
 * });
 *
 * @param {string} recordType - The type of the record.
 * @param {function(record: lib/record.js~Record, originalRecord: lib/record.js~Record, pool: pool, options: *): *} func - function to be registered.
 * @param {Object} [options]
 * @param {Boolean} [options.async] - true if the function triggered
 * asynchronously
 */
function beforeSave(recordType, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var name = funcName(func);
  options.type = recordType;
  options.trigger = 'beforeSave';
  _registry2.default.registerHook(name, func, options);
}

/**
 * afterSave — executes decorated function after a record save operation
 * occurs
 *
 * @example
 * const skygearCloud = require('skygear/cloud');¬
 * skygearCloud.afterSave('note', function(record, original, pool, options) {
 *     // cloud code handling the request
 *     return;
 * }, {
 *     async: true
 * });
 *
 * @param {string} recordType - The type of the record.
 * @param {function(record: lib/record.js~Record, originalRecord: lib/record.js~Record, pool: pool, options: *): *} func - function to be registered.
 * @param {Object} [options]
 * @param {Boolean} [options.async] - true if the function triggered
 */
function afterSave(recordType, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var name = funcName(func);
  options.type = recordType;
  options.trigger = 'afterSave';
  _registry2.default.registerHook(name, func, options);
}

/**
 * beforeDelete — executes decorated function before a record delete operation
 * occurs
 *
 * @example
 * const skygearCloud = require('skygear/cloud');¬
 * skygearCloud.beforeDelete('note', function(record, original, pool, options) {
 *     // cloud code handling the request
 *     return;
 * }, {
 *     async: true
 * });
 *
 * @param {string} recordType - The type of the record.
 * @param {function(record: lib/record.js~Record, originalRecord: lib/record.js~Record, pool: pool, options: *): *} func - function to be registered.
 * @param {Object} [options]
 * @param {Boolean} [options.async] - true if the function triggered
 */
function beforeDelete(recordType, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var name = funcName(func);
  options.type = recordType;
  options.trigger = 'beforeDelete';
  _registry2.default.registerHook(name, func, options);
}

/**
 * afterDelete — executes decorated function after a record delete operation
 * occurs
 *
 * @example
 * const skygearCloud = require('skygear/cloud');¬
 * skygearCloud.afterDelete('note', function(record, original, pool, options) {
 *     // cloud code handling the request
 *     return;
 * }, {
 *     async: true
 * });
 *
 * @param {string} recordType - The type of the record.
 * @param {function(record: lib/record.js~Record, originalRecord: lib/record.js~Record, pool: pool, options: *): *} func - function to be registered.
 * @param {Object} [options]
 * @param {Boolean} [options.async] - true if the function triggered
 */
function afterDelete(recordType, func) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var name = funcName(func);
  options.type = recordType;
  options.trigger = 'afterDelete';
  _registry2.default.registerHook(name, func, options);
}

/**
 * staticAsset — declare certain path to be serve in static asset.
 *
 * All asset will be serve with the prefix `/static`. i.e. if the mount ping
 * is declare as `/css`. The final URL for requesting assets will be
 * `/static/css`.
 *
 * @example
 * const skygearCloud = require('skygear/cloud');¬
 * skygearCloud.staticAsset('/styles', function() {
 *     // Return the absolute path of the static assets directory
 *     // http://<yourapp>.skygeario.com/static/styles will be serving files
 *     // located at '<project_path>/css`
 *     return __dirname + '/css/';
 * });
 *
 * @param {string} mountPoint - the target mount point
 * @param {function(): string} func - function to return the absolute path of
 * the static assets.
 */
function staticAsset(mountPoint, func) {
  _registry2.default.registerAsset(mountPoint, func);
}

/**
 * Import and config the cloud code plugin module.
 *
 * This function will load the specified module by name using the `require`
 * function. The specified module must exists or an error is thrown.
 *
 * It is expected that the module will exports a function called `includeme`.
 * This function will also call the `includeme` function to config the module.
 */
function configModule(moduleName, options) {
  var _ref = options || {},
      ignoreWarning = _ref.ignoreWarning;

  var _require = require(moduleName),
      includeme = _require.includeme;

  if (includeme !== undefined) {
    var _settings2 = {};
    includeme(module.exports, _settings2);
  } else if (ignoreWarning !== true) {
    console.warn('The ' + moduleName + ' module does not export the includeme' + ' function. This function is required to config the module.');
  }
}

var skyconfig = exports.skyconfig = _skyconfig3.default;
var pool = exports.pool = _pg.pool;
var settings = exports.settings = _settings3.settings;
var CloudCodeContainer = exports.CloudCodeContainer = _container2.default;
var ErrorCodes = exports.ErrorCodes = _error.ErrorCodes;
var SkygearError = exports.SkygearError = _error.SkygearError;