'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.getContainer = getContainer;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _container = require('../container');

var _auth = require('./auth');

var _relation = require('../relation');

var _database = require('../database');

var _pubsub = require('../pubsub');

var _push = require('./push');

var _settings = require('./settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
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


var CloudCodeContainer = function (_BaseContainer) {
  _inherits(CloudCodeContainer, _BaseContainer);

  function CloudCodeContainer() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        sendPluginRequest = _ref.sendPluginRequest,
        asUserId = _ref.asUserId;

    _classCallCheck(this, CloudCodeContainer);

    var _this = _possibleConstructorReturn(this, (CloudCodeContainer.__proto__ || Object.getPrototypeOf(CloudCodeContainer)).call(this));

    _this.asUserId = asUserId;
    _this.sendPluginRequest = !!sendPluginRequest;

    _this._auth = new _auth.CloudCodeAuthContainer(_this);
    _this._relation = new _relation.RelationContainer(_this);
    _this._db = new _database.DatabaseContainer(_this);
    _this._pubsub = new _pubsub.PubsubContainer(_this);
    _this._push = new _push.CloudCodePushContainer(_this);
    return _this;
  }

  _createClass(CloudCodeContainer, [{
    key: '_prepareRequestObject',
    value: function _prepareRequestObject(action, data) {
      var requestObject = _get(CloudCodeContainer.prototype.__proto__ || Object.getPrototypeOf(CloudCodeContainer.prototype), '_prepareRequestObject', this).call(this, action, data);

      if (this.auth.accessToken) {
        requestObject = requestObject.set('X-Skygear-Access-Token', this.auth.accessToken);
      }

      return requestObject;
    }
  }, {
    key: '_prepareRequestData',
    value: function _prepareRequestData(action, data) {
      var requestData = _get(CloudCodeContainer.prototype.__proto__ || Object.getPrototypeOf(CloudCodeContainer.prototype), '_prepareRequestData', this).call(this, action, data);
      var extraData = {};

      if (this.auth.accessToken) {
        extraData.access_token = this.auth.accessToken;
      }

      if (this.asUserId) {
        extraData._user_id = this.asUserId;
      }

      if (this.sendPluginRequest) {
        extraData._from_plugin = true;
      }

      return _lodash2.default.assign(extraData, requestData);
    }
  }, {
    key: 'auth',
    get: function get() {
      return this._auth;
    }
  }, {
    key: 'relation',
    get: function get() {
      return this._relation;
    }
  }, {
    key: 'publicDB',
    get: function get() {
      return this._db.public;
    }
  }, {
    key: 'privateDB',
    get: function get() {
      return this._db.private;
    }
  }, {
    key: 'pubsub',
    get: function get() {
      return this._pubsub;
    }
  }, {
    key: 'push',
    get: function get() {
      return this._push;
    }
  }]);

  return CloudCodeContainer;
}(_container.BaseContainer);

/**
 * Get a configured CloudCodeContainer.
 *
 * @param {String} [userId] - user ID of the user. If not specified, the default
 * is determined by the server.
 * @return {CloudCodeContainer} the cloud code container that acts as
 * the specified user.
 */


exports.default = CloudCodeContainer;
function getContainer(userId) {
  var container = new CloudCodeContainer();
  container.apiKey = _settings.settings.masterKey;
  container.endPoint = _settings.settings.skygearEndpoint + '/';
  if (userId) {
    container.asUserId = userId;
  }
  return container;
}