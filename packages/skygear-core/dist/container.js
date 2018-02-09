'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseContainer = exports.UserRecord = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _asset = require('./asset');

var _asset2 = _interopRequireDefault(_asset);

var _role = require('./role');

var _role2 = _interopRequireDefault(_role);

var _acl = require('./acl');

var _acl2 = _interopRequireDefault(_acl);

var _record = require('./record');

var _record2 = _interopRequireDefault(_record);

var _reference = require('./reference');

var _reference2 = _interopRequireDefault(_reference);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

var _database = require('./database');

var _geolocation = require('./geolocation');

var _geolocation2 = _interopRequireDefault(_geolocation);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _type = require('./type');

var _error = require('./error');

var _auth = require('./auth');

var _relation = require('./relation');

var _pubsub = require('./pubsub');

var _push = require('./push');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
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
/* eslint camelcase: 0 */
var request = require('superagent');
var _ = require('lodash');
var ee = require('event-emitter');

/**
 * @type {Record}
 */
var UserRecord = exports.UserRecord = _record2.default.extend('user');

/**
 * BaseContainer provides the basic configuration for connecting to a
 * Skygear server.
 *
 * For development under different environments, developer may refer to these
 * classes:
 * - Web developement: {@link Container}
 * - React Native: {@link ReactNativeContainer}
 * - Cloud development: {@link CloudCodeContainer}
 *
 * It also proxies other Skygear classes, like {@link BaseContainer#Query}.
 * Thus developer who install Skygear with <script> tag in browser can have
 * access to those classes.
 */

var BaseContainer = exports.BaseContainer = function () {
  function BaseContainer() {
    _classCallCheck(this, BaseContainer);

    /**
     * @private
     */
    this.url = 'http://myapp.skygeario.com/';

    /**
     * API key of the skygear container
     * @type {String}
     */
    this.apiKey = null;

    /**
     * @private
     */
    this.request = request;

    /**
     * @private
     */
    this.ee = ee({});

    /**
     * @private
     */
    this.simpleRequest = false;
  }

  /**
   * The version of Skygear.
   *
   * @type {String}
   */


  _createClass(BaseContainer, [{
    key: 'config',


    /**
     * Sets a new end point and new API key to the container.
     *
     * @param {Object} options - configuration options of the skygear container
     * @param {String} options.apiKey - api key
     * @param {String} options.endPoint - end point
     * @param {Boolean} options.simpleRequest - simple request
     * @return {Promise<BaseContainer>} promise with the skygear container
     */
    value: function config(options) {
      if (options.apiKey) {
        this.apiKey = options.apiKey;
      }
      if (options.endPoint) {
        this.endPoint = options.endPoint;
      }
      if (options.simpleRequest !== undefined) {
        this.simpleRequest = options.simpleRequest;
      }

      return Promise.resolve(this);
    }

    /**
     * Sets a new API key to the container.
     *
     * @param  {String} apiKey - api key of the skygear container
     */

  }, {
    key: 'configApiKey',
    value: function configApiKey(apiKey) {
      this.apiKey = apiKey;
    }

    /**
     * Sets a new end point to the container.
     *
     * @param  {String} endPoint - end point of the skygear container
     */

  }, {
    key: 'configEndPoint',
    value: function configEndPoint(endPoint) {
      this.endPoint = endPoint;
    }

    /**
     * Sets the request made by the continer to be simple request.
     *
     * @param  {Boolean} simpleRequest - a flag to determine the container should make a simple request or not
     */

  }, {
    key: 'configSimpleRequest',
    value: function configSimpleRequest(simpleRequest) {
      this.simpleRequest = simpleRequest;
    }

    /**
     * @private
     */

  }, {
    key: 'makeRequest',
    value: function makeRequest(action, data) {
      var requestObject = this._prepareRequestObject(action, data);
      var requestData = this._prepareRequestData(action, data);

      if (this.simpleRequest) {
        requestObject.serialize(function (o) {
          return JSON.stringify(o);
        });
      }

      return this._handleResponse(new Promise(function (resolve) {
        requestObject.send(requestData).end(function (err, res) {
          resolve({
            err: err,
            res: res
          });
        });
      }));
    }

    /**
     * Calls a registered lambda function without arguments.
     *
     * @param  {String} name - name of the lambda function being called
     * @param  {Object} data - data passed to the lambda function
     * @return {Promise<Object>} promise with result of the lambda function
     */

  }, {
    key: 'lambda',
    value: function lambda(name, data) {
      return this.makeRequest(name, {
        args: data
      }).then(function (resp) {
        return resp.result;
      });
    }
  }, {
    key: '_prepareRequestObject',
    value: function _prepareRequestObject(action) {
      if (this.apiKey === null) {
        throw Error('Please config ApiKey');
      }

      var _action = action.replace(/:/g, '/');
      var headers = {
        Accept: 'application/json'
      };

      if (!this.simpleRequest) {
        headers = Object.assign(headers, {
          'Content-Type': 'application/json',
          'X-Skygear-API-Key': this.apiKey,
          'X-Skygear-SDK-Version': 'skygear-SDK-JS/' + this.VERSION
        });
      } else {
        headers = Object.assign(headers, {
          'Content-Type': 'text/plain;charset=UTF-8'
        });
      }

      return this.request.post(this.url + _action).set(headers);
    }
  }, {
    key: '_prepareRequestData',
    value: function _prepareRequestData(action, data) {
      if (this.apiKey === null) {
        throw Error('Please config ApiKey');
      }

      return _.assign({
        action: action,
        api_key: this.apiKey
      }, data);
    }
  }, {
    key: '_handleResponse',
    value: function _handleResponse(responsePromise) {
      return responsePromise.then(function (_ref) {
        var err = _ref.err,
            res = _ref.res;

        // Do an application JSON parse because in some condition, the
        // content-type header will got strip and it will not deserial
        // the json for us.
        var body = getRespJSON(res);

        if (err) {
          var skyErr = body.error || err;
          return Promise.reject({
            status: err.status,
            error: skyErr
          });
        } else {
          return Promise.resolve(body);
        }
      });
    }

    /**
     * @type {Query}
     */

  }, {
    key: 'clearCache',


    /**
     * Clears all cache in skygear container store.
     *
     * @return {Promise} resolve when cache is cleared successfully
     */
    value: function clearCache() {
      return this.store.clearPurgeableItems();
    }
  }, {
    key: 'VERSION',


    /**
     * The version of Skygear. Convenient getter.
     *
     * @type {String}
     */
    get: function get() {
      return this.constructor.VERSION;
    }
  }, {
    key: 'Query',
    get: function get() {
      return _query2.default;
    }

    /**
     * @type {Role}
     */

  }, {
    key: 'Role',
    get: function get() {
      return _role2.default;
    }

    /**
     * @type {ACL}
     */

  }, {
    key: 'ACL',
    get: function get() {
      return _acl2.default;
    }

    /**
     * @type {Record}
     */

  }, {
    key: 'Record',
    get: function get() {
      return _record2.default;
    }

    /**
     * @type {Record}
     */

  }, {
    key: 'UserRecord',
    get: function get() {
      return UserRecord;
    }

    /**
     * @type {Sequence}
     */

  }, {
    key: 'Sequence',
    get: function get() {
      return _type.Sequence;
    }

    /**
     * @type {Asset}
     */

  }, {
    key: 'Asset',
    get: function get() {
      return _asset2.default;
    }

    /**
     * @type {Reference}
     */

  }, {
    key: 'Reference',
    get: function get() {
      return _reference2.default;
    }

    /**
     * @type {Geolocation}
     */

  }, {
    key: 'Geolocation',
    get: function get() {
      return _geolocation2.default;
    }

    /**
     * @type {Database}
     */

  }, {
    key: 'Database',
    get: function get() {
      return _database.Database;
    }

    /**
     * @type {Relation}
     */

  }, {
    key: 'Friend',
    get: function get() {
      return this.relation.Friend;
    }

    /**
     * @type {Relation}
     */

  }, {
    key: 'Follower',
    get: function get() {
      return this.relation.Follower;
    }

    /**
     * @type {Relation}
     */

  }, {
    key: 'Following',
    get: function get() {
      return this.relation.Following;
    }

    /**
     * @type {SkygearError}
     */

  }, {
    key: 'Error',
    get: function get() {
      return _error.SkygearError;
    }

    /**
     * @type {ErrorCodes}
     */

  }, {
    key: 'ErrorCodes',
    get: function get() {
      return _error.ErrorCodes;
    }

    /**
     * @type {AuthContainer}
     */

  }, {
    key: 'AuthContainer',
    get: function get() {
      return _auth.AuthContainer;
    }

    /**
     * @type {RelationContainer}
     */

  }, {
    key: 'RelationContainer',
    get: function get() {
      return _relation.RelationContainer;
    }

    /**
     * @type {DatabaseContainer}
     */

  }, {
    key: 'DatabaseContainer',
    get: function get() {
      return _database.DatabaseContainer;
    }

    /**
     * @type {PubsubContainer}
     */

  }, {
    key: 'PubsubContainer',
    get: function get() {
      return _pubsub.PubsubContainer;
    }

    /**
     * @type {PushContainer}
     */

  }, {
    key: 'PushContainer',
    get: function get() {
      return _push.PushContainer;
    }

    /**
     * Endpoint of the skygear container
     *
     * @type {String}
     */

  }, {
    key: 'endPoint',
    get: function get() {
      return this.url;
    }

    /**
     * Endpoint of the skygear container
     *
     * @type {String}
     */
    ,
    set: function set(newEndPoint) {
      // TODO: Check the format
      if (newEndPoint) {
        if (!_.endsWith(newEndPoint, '/')) {
          newEndPoint = newEndPoint + '/';
        }
        this.url = newEndPoint;
      }
    }

    /**
     * @private
     */

  }, {
    key: 'store',
    get: function get() {
      if (!this._store) {
        this._store = (0, _store2.default)();
      }
      return this._store;
    }
  }], [{
    key: 'VERSION',
    get: function get() {
      return '1.3.1';
    }
  }]);

  return BaseContainer;
}();

/**
 * Container provides configuration for connecting to Skygear server, and
 * accessors to other containers, providing various functionalities:
 * - `skygear.auth` - {@link AuthContainer}: User authentications and user
 * roles API.
 * - `skygear.relation` - {@link RelationContainer}: User relation API, like
 * add and query Friends.
 * - `skygear.privateDB` - {@link Database}: Private database of the current
 * user, with record API, like query, save and delete.
 * - `skygear.publicDB` - {@link PublicDatabase}: Public database, providing
 * the same record API as {@link Database}, but with additional record role
 * API.
 * - `skygear.pubsub` - {@link PubsubContainer}: A publish-subscribe interface,
 * providing real-time message-based communication with other users.
 * - `skygear.push` - {@link PushContainer}: Push Notifications.
 */


var Container = function (_BaseContainer) {
  _inherits(Container, _BaseContainer);

  function Container() {
    _classCallCheck(this, Container);

    var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this));

    _this._auth = new _auth.AuthContainer(_this);
    _this._relation = new _relation.RelationContainer(_this);
    _this._db = new _database.DatabaseContainer(_this);
    _this._pubsub = new _pubsub.PubsubContainer(_this);
    _this._push = new _push.PushContainer(_this);
    /**
     * Options for how much time to wait for client request to complete.
     *
     * @type {Object}
     * @property {number} [timeoutOptions.deadline] - deadline for the request
     * and response to complete (in milliseconds)
     * @property {number} [timeoutOptions.response=60000] - maximum time to
     * wait for an response (in milliseconds)
     *
     * @see http://visionmedia.github.io/superagent/#timeouts
     */
    _this.timeoutOptions = {
      response: 60000
    };
    return _this;
  }

  /**
   * @type {AuthContainer}
   */


  _createClass(Container, [{
    key: 'config',


    /**
     * Sets a new end point and new API key to the container.
     *
     * After configuration,
     * - it tries to restore the user, access token and device id, and,
     * - the pubsub client connects to skygear server if a user is restored.
     *
     * @param {Object} options - configuration options of the skygear container
     * @param {String} options.apiKey - api key
     * @param {String} options.endPoint - end point
     * @return {Promise<Container>} promise with the skygear container
     */
    value: function config(options) {
      var _this2 = this;

      return _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), 'config', this).call(this, options).then(function () {
        var promises = [_this2.auth._getUser(), _this2.auth._getAccessToken(), _this2.push._getDeviceID()];
        return Promise.all(promises);
      }).then(function () {
        _this2.pubsub._reconfigurePubsubIfNeeded();
        return _this2;
      }, function () {
        return _this2;
      });
    }
  }, {
    key: '_prepareRequestObject',
    value: function _prepareRequestObject(action, data) {
      var requestObject = _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), '_prepareRequestObject', this).call(this, action, data);

      if (this.auth.accessToken && !this.simpleRequest) {
        requestObject = requestObject.set('X-Skygear-Access-Token', this.auth.accessToken);
      }

      if (this.timeoutOptions !== undefined && this.timeoutOptions !== null) {
        requestObject = requestObject.timeout(this.timeoutOptions);
      }

      return requestObject;
    }
  }, {
    key: '_prepareRequestData',
    value: function _prepareRequestData(action, data) {
      var requestData = _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), '_prepareRequestData', this).call(this, action, data);

      return _.assign({
        access_token: this.auth.accessToken
      }, requestData);
    }
  }, {
    key: '_handleResponse',
    value: function _handleResponse(responsePromise) {
      var _this3 = this;

      return _get(Container.prototype.__proto__ || Object.getPrototypeOf(Container.prototype), '_handleResponse', this).call(this, responsePromise).catch(function (err) {
        // Logout user implicitly if
        var errorCode = err.error.code;
        if (errorCode === _this3.ErrorCodes.AccessTokenNotAccepted) {
          return Promise.all([_this3.auth._setAccessToken(null), _this3.auth._setUser(null)]).then(function () {
            return Promise.reject(err);
          });
        }

        return Promise.reject(err);
      });
    }
  }, {
    key: 'auth',
    get: function get() {
      return this._auth;
    }

    /**
     * @type {RelationContainer}
     */

  }, {
    key: 'relation',
    get: function get() {
      return this._relation;
    }

    /**
     * @type {PublicDatabase}
     */

  }, {
    key: 'publicDB',
    get: function get() {
      return this._db.public;
    }

    /**
     * @type {Database}
     */

  }, {
    key: 'privateDB',
    get: function get() {
      return this._db.private;
    }

    /**
     * @type {PubsubContainer}
     */

  }, {
    key: 'pubsub',
    get: function get() {
      return this._pubsub;
    }

    /**
     * @type {PushContainer}
     */

  }, {
    key: 'push',
    get: function get() {
      return this._push;
    }
  }]);

  return Container;
}(BaseContainer);

exports.default = Container;


function getRespJSON(res) {
  if (res && res.body) {
    return res.body;
  }
  if (res && res.text) {
    try {
      return JSON.parse(res.text);
    } catch (err) {
      console.log('getRespJSON error. error: ', err);
    }
  }

  return {};
}