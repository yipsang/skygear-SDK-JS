'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PushContainer = undefined;

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


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _error = require('./error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Push container
 */
var PushContainer = exports.PushContainer = function () {

  /**
   * @param  {Container} container - the Skygear container
   * @return {PushContainer}
   */
  function PushContainer(container) {
    _classCallCheck(this, PushContainer);

    /**
     * @private
     */
    this.container = container;

    this._deviceID = null;
  }

  /**
   * @private
   *
   * Subsclass should override the implementation and provide the device type
   */


  _createClass(PushContainer, [{
    key: 'inferDeviceType',
    value: function inferDeviceType() {
      // To be implmented by subclass
      // TODO: probably web / node, handle it later
      throw new Error('Failed to infer type, please supply a value');
    }

    /**
     * You can register your device for receiving push notifications.
     *
     * @param {string} token - the device token
     * @param {string} type - the device type (either 'ios' or 'android')
     * @param {string} topic - the device topic, refer to application bundle
     * identifier on iOS and application package name on Android
     **/

  }, {
    key: 'registerDevice',
    value: function registerDevice(token, type, topic) {
      var _this = this;

      if (!token) {
        throw new Error('Token cannot be empty');
      }
      if (!type) {
        type = this.inferDeviceType();
      }

      var deviceID = void 0;
      if (this.deviceID) {
        deviceID = this.deviceID;
      }

      return this.container.makeRequest('device:register', {
        type: type,
        id: deviceID,
        topic: topic,
        device_token: token //eslint-disable-line camelcase
      }).then(function (body) {
        return _this._setDeviceID(body.result.id);
      }, function (error) {
        // Will set the deviceID to null and try again iff deviceID is not null.
        // The deviceID can be deleted remotely, by apns feedback.
        // If the current deviceID is already null, will regards as server fail.
        var errorCode = null;
        if (error.error) {
          errorCode = error.error.code;
        }
        if (_this.deviceID && errorCode === _error.ErrorCodes.ResourceNotFound) {
          return _this._setDeviceID(null).then(function () {
            return _this.registerDevice(token, type);
          });
        } else {
          return Promise.reject(error);
        }
      });
    }

    /**
     * Unregisters the current user from the current device.
     * This should be called when the user logouts.
     **/

  }, {
    key: 'unregisterDevice',
    value: function unregisterDevice() {
      var _this2 = this;

      if (!this.deviceID) {
        return Promise.reject(new _error.SkygearError('Missing device id', _error.ErrorCodes.InvalidArgument));
      }

      return this.container.makeRequest('device:unregister', {
        id: this.deviceID
      }).then(function () {
        // do nothing
        return;
      }, function (error) {
        var errorCode = null;
        if (error.error) {
          errorCode = error.error.code;
        }
        if (errorCode === _error.ErrorCodes.ResourceNotFound) {
          // regard it as success
          return _this2._setDeviceID(null);
        } else {
          return Promise.reject(error);
        }
      });
    }

    /**
     * Send a push notification to all devices associated with the specified
     * users.
     *
     * @param {string|string[]} users - a list of User IDs
     * @param {Object} notification - push notification payload
     * @param {Object} notification.apns - push notification payload for APNS
     * @param {Object} notification.gcm - push notification payload for GCM
     * @param {?string} topic - the device topic, refer to application bundle
     * identifier on iOS and application package name on Android
     * @return {Object[]} list of users to which notification was sent
     *
     * @see https://developers.google.com/cloud-messaging/concept-options
     * @see https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CreatingtheNotificationPayload.html
     **/

  }, {
    key: 'sendToUser',
    value: function sendToUser(users, notification, topic) {
      if (!_lodash2.default.isArray(users)) {
        users = [users];
      }
      var userIDs = _lodash2.default.map(users, function (user) {
        if (typeof user === 'string') {
          return user;
        }
        return user.id;
      });
      return this.container.makeRequest('push:user', {
        user_ids: userIDs, //eslint-disable-line camelcase
        notification: notification,
        topic: topic
      }).then(function (result) {
        return result.result;
      }, function (error) {
        return Promise.reject(error);
      });
    }

    /**
     * Send a push notification to specified devices.
     *
     * @param {string|string[]} devices - a list of Device IDs
     * @param {Object} notification - push notification payload
     * @param {Object} notification.apns - push notification payload for APNS
     * @param {Object} notification.gcm - push notification payload for GCM
     * @param {?string} topic - the device topic, refer to application bundle
     * identifier on iOS and application package name on Android
     * @return {Object[]} list of users to which notification was sent
     *
     * @see https://developers.google.com/cloud-messaging/concept-options
     * @see https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CreatingtheNotificationPayload.html
     **/

  }, {
    key: 'sendToDevice',
    value: function sendToDevice(devices, notification, topic) {
      if (!_lodash2.default.isArray(devices)) {
        devices = [devices];
      }
      var deviceIDs = _lodash2.default.map(devices, function (device) {
        if (typeof device === 'string') {
          return device;
        }
        return device.id;
      });
      return this.container.makeRequest('push:device', {
        device_ids: deviceIDs, //eslint-disable-line camelcase
        notification: notification,
        topic: topic
      }).then(function (result) {
        return result.result;
      }, function (error) {
        return Promise.reject(error);
      });
    }

    /**
     * The device ID
     *
     * @return {String}
     */

  }, {
    key: '_getDeviceID',
    value: function _getDeviceID() {
      var _this3 = this;

      return this.container.store.getItem('skygear-deviceid').then(function (deviceID) {
        _this3._deviceID = deviceID;
        return deviceID;
      }, function (err) {
        console.warn('Failed to get deviceid', err);
        _this3._deviceID = null;
        return null;
      });
    }
  }, {
    key: '_setDeviceID',
    value: function _setDeviceID(value) {
      var _this4 = this;

      this._deviceID = value;
      var store = this.container.store;
      var setItem = value === null ? store.removeItem('skygear-deviceid') : store.setItem('skygear-deviceid', value);
      return setItem.then(function () {
        return value;
      }, function (err) {
        console.warn('Failed to persist deviceid', err);
        return value;
      }).then(function (deviceID) {
        _this4.container.pubsub._reconfigurePubsubIfNeeded();
        return deviceID;
      });
    }
  }, {
    key: 'deviceID',
    get: function get() {
      return this._deviceID;
    }
  }]);

  return PushContainer;
}();