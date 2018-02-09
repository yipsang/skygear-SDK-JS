'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PubsubContainer = exports.Pubsub = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

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
var _ = require('lodash');
var _ws = require('websocket');
var WebSocket = null;
if (_ws) {
  WebSocket = _ws.w3cwebsocket;
} else {
  WebSocket = window.WebSocket; //eslint-disable-line
}
var url = require('url');
var ee = require('event-emitter');

var ON_OPEN = 'onOpen';
var ON_CLOSE = 'onClose';

/**
 * The Pubsub client
 */

var Pubsub = exports.Pubsub = function () {

  /**
   * Constructs a new Pubsub object.
   *
   * @param  {container} container - the Skygear container
   * @param  {Boolean} internal - true if it is an internal pubsub client
   * @return {Pubsub} pubsub client
   */
  function Pubsub(container) {
    var internal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, Pubsub);

    this._container = container;
    this._ws = null;
    this._internal = internal;
    this._queue = [];
    this._ee = ee({});
    this._handlers = {};
    this._reconnectWait = 5000;
    this._retryCount = 0;
  }

  /**
   * Registers a connection open listener
   *
   * @param  {function()} listener - the listener
   * @return {EventHandler} event handler
   */


  _createClass(Pubsub, [{
    key: 'onOpen',
    value: function onOpen(listener) {
      this._ee.on(ON_OPEN, listener);
      return new _util.EventHandle(this._ee, ON_OPEN, listener);
    }

    /**
     * Registers a connection close listener
     *
     * @param  {function()} listener - the listener
     * @return {EventHandler} event handler
     */

  }, {
    key: 'onClose',
    value: function onClose(listener) {
      this._ee.on(ON_CLOSE, listener);
      return new _util.EventHandle(this._ee, ON_CLOSE, listener);
    }
  }, {
    key: '_pubsubUrl',
    value: function _pubsubUrl() {
      var internal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var parsedUrl = url.parse(this._container.endPoint);
      var protocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      var path = internal ? '/_/pubsub' : '/pubsub';
      var queryString = '?api_key=' + this._container.apiKey;
      return protocol + '//' + parsedUrl.host + path + queryString;
    }
  }, {
    key: '_hasCredentials',
    value: function _hasCredentials() {
      return !!this._container.apiKey;
    }

    /**
     * Connects to server if the Skygear container has credential, otherwise
     * close the connection.
     */

  }, {
    key: 'reconfigure',
    value: function reconfigure() {
      if (!this._hasCredentials()) {
        this.close();
        return;
      }

      this.connect();
    }
  }, {
    key: '_onopen',
    value: function _onopen() {
      var _this = this;

      // Trigger registed onOpen callback
      this._ee.emit(ON_OPEN, true);

      // Resubscribe previously subscribed channels
      _.forEach(this._handlers, function (handlers, channel) {
        _this._sendSubscription(channel);
      });

      // Flushed queued messages to the server
      _.forEach(this._queue, function (data) {
        _this._ws.send(JSON.stringify(data));
      });
      this._queue = [];
    }
  }, {
    key: '_onmessage',
    value: function _onmessage(data) {
      _.forEach(this._handlers[data.channel], function (handler) {
        handler(data.data);
      });
    }

    /**
     * Subscribes a function callback on receiving message at the specified
     * channel.
     *
     * @param {string} channel - name of the channel to subscribe
     * @param {function(object:*)} callback - function to be trigger with
     * incoming data
     * @return {function(object:*)} The callback function
     **/

  }, {
    key: 'on',
    value: function on(channel, callback) {
      return this.subscribe(channel, callback);
    }

    /**
     * Subscribes the channel for just one message.
     *
     * This function takes one message off from a pubsub channel,
     * returning a promise of that message. When a message
     * is received from the channel, the channel will be unsubscribed.
     *
     * @param {string} channel - name of the channel
     * @return {Promise<Object>} promise of next message in this channel
     */

  }, {
    key: 'once',
    value: function once(channel) {
      var _this2 = this;

      return new Promise(function (resolve) {
        var handler = function handler(data) {
          _this2.unsubscribe(channel, handler);
          resolve(data);
        };
        _this2.subscribe(channel, handler);
      });
    }

    /**
     * Publishes message to a channel.
     *
     * @param {String} channel - name of the channel
     * @param {Object} data - data to be published
     */

  }, {
    key: 'publish',
    value: function publish(channel, data) {
      if (!channel) {
        throw new Error('Missing channel to publish');
      }

      var dataType = typeof data === 'undefined' ? 'undefined' : _typeof(data);
      if (dataType !== 'object' || data === null || _.isArray(data)) {
        throw new Error('Data must be object');
      }

      var publishData = {
        action: 'pub',
        channel: channel,
        data: data
      };
      if (this.connected) {
        this._ws.send(JSON.stringify(publishData));
      } else {
        this._queue.push(publishData);
      }
    }
  }, {
    key: '_sendSubscription',
    value: function _sendSubscription(channel) {
      if (this.connected) {
        var data = {
          action: 'sub',
          channel: channel
        };
        this._ws.send(JSON.stringify(data));
      }
    }
  }, {
    key: '_sendRemoveSubscription',
    value: function _sendRemoveSubscription(channel) {
      if (this.connected) {
        var data = {
          action: 'unsub',
          channel: channel
        };
        this._ws.send(JSON.stringify(data));
      }
    }

    /**
     * Unsubscribes a function callback on the specified channel.
     *
     * If pass in `callback` is null, all callbacks in the specified channel
     * will be removed.
     *
     * @param {string} channel - name of the channel to unsubscribe
     * @param {function(object:*)=} callback - function to be trigger with
     * incoming data
     **/

  }, {
    key: 'off',
    value: function off(channel) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this.unsubscribe(channel, callback);
    }

    /**
     * Subscribes a function callback on receiving message at the specified
     * channel.
     *
     * @param {string} channel - name of the channel to subscribe
     * @param {function(object:*)} handler - function to be trigger with
     * incoming data
     * @return {function(object:*)} The callback function
     **/

  }, {
    key: 'subscribe',
    value: function subscribe(channel, handler) {
      if (!channel) {
        throw new Error('Missing channel to subscribe');
      }

      var alreadyExists = this.hasHandlers(channel);
      this._register(channel, handler);
      if (!alreadyExists) {
        this._sendSubscription(channel);
      }
      return handler;
    }

    /**
     * Unsubscribes a function callback on the specified channel.
     *
     * If pass in `callback` is null, all callbacks in the specified channel
     * will be removed.
     *
     * @param {string} channel - name of the channel to unsubscribe
     * @param {function(object:*)=} [handler] - function to be trigger with
     * incoming data
     **/

  }, {
    key: 'unsubscribe',
    value: function unsubscribe(channel) {
      var _this3 = this;

      var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (!channel) {
        throw new Error('Missing channel to unsubscribe');
      }

      if (!this.hasHandlers(channel)) {
        return;
      }

      var handlersToRemove;
      if (handler) {
        handlersToRemove = [handler];
      } else {
        handlersToRemove = this._handlers[channel];
      }

      _.forEach(handlersToRemove, function (handlerToRemove) {
        _this3._unregister(channel, handlerToRemove);
      });

      if (!this.hasHandlers(channel)) {
        this._sendRemoveSubscription(channel);
      }
    }

    /**
     * Checks if the channel is subscribed with any handler.
     *
     * @param {String} channel - name of the channel
     * @return {Boolean} true if the channel has handlers
     */

  }, {
    key: 'hasHandlers',
    value: function hasHandlers(channel) {
      var handlers = this._handlers[channel];
      return handlers ? handlers.length > 0 : false;
    }
  }, {
    key: '_register',
    value: function _register(channel, handler) {
      if (!this._handlers[channel]) {
        this._handlers[channel] = [];
      }
      this._handlers[channel].push(handler);
    }
  }, {
    key: '_unregister',
    value: function _unregister(channel, handler) {
      var handlers = this._handlers[channel];
      handlers = _.reject(handlers, function (item) {
        return item === handler;
      });
      if (handlers.length > 0) {
        this._handlers[channel] = handlers;
      } else {
        delete this._handlers[channel];
      }
    }
  }, {
    key: '_reconnect',
    value: function _reconnect() {
      var _this4 = this;

      var interval = _.min([this._reconnectWait * this._retryCount, 60000]);
      _.delay(function () {
        _this4._retryCount += 1;
        _this4.connect();
      }, interval);
    }

    /**
     * True if it is connected to the server.
     *
     * @type {Boolean}
     */

  }, {
    key: 'reset',


    /**
     * Closes connection and clear all handlers.
     */
    value: function reset() {
      this.close();
      this._handlers = {};
    }

    /**
     * Closes connection.
     */

  }, {
    key: 'close',
    value: function close() {
      if (this._ws) {
        this._clearWebSocket();
        this._ws.close();
        this._ee.emit(ON_CLOSE, false);
        this._ws = null;
      }
    }

    /**
     * @type {WebSocket}
     */

  }, {
    key: '_setWebSocket',
    value: function _setWebSocket(ws) {
      var _this5 = this;

      var emitter = this._ee;
      this._ws = ws;

      if (!this._ws) {
        return;
      }

      this._ws.onopen = function () {
        _this5._retryCount = 0;
        _this5._onopen();
      };
      this._ws.onclose = function () {
        emitter.emit(ON_CLOSE, false);
        _this5._reconnect();
      };
      this._ws.onmessage = function (evt) {
        var message;
        try {
          message = JSON.parse(evt.data);
        } catch (e) {
          console.log('Got malformed websocket data:', evt.data);
          return;
        }
        _this5._onmessage(message);
      };
    }
  }, {
    key: '_clearWebSocket',
    value: function _clearWebSocket() {
      if (!this._ws) {
        return;
      }

      this._ws.onopen = null;
      this._ws.onclose = null;
      this._ws.onmessage = null;
    }

    /**
     * Connects to server if the Skygear container has credentials and not
     * connected.
     */

  }, {
    key: 'connect',
    value: function connect() {
      if (!this._hasCredentials() || this.connected) {
        return;
      }

      var pubsubUrl = this._pubsubUrl(this._internal);

      // The old websocket will still call our _onopen and we will try to send
      // message with the new websocket, whose readyState may not be OPEN.
      // Therefore, we need to clear the websocket
      this._clearWebSocket();

      var ws = new this.WebSocket(pubsubUrl);
      this._setWebSocket(ws);
    }
  }, {
    key: 'connected',
    get: function get() {
      return this._ws && this._ws.readyState === 1;
    }
  }, {
    key: 'WebSocket',
    get: function get() {
      return WebSocket;
    }
  }]);

  return Pubsub;
}();

/**
 * Pubsub container
 *
 * A publish-subscribe interface, providing real-time message-based
 * communication with other users.
 */


var PubsubContainer = exports.PubsubContainer = function () {

  /**
   * @param  {Container} container - the Skygear container
   * @return {PubsubContainer}
   */
  function PubsubContainer(container) {
    _classCallCheck(this, PubsubContainer);

    /**
     * @private
     */
    this.container = container;

    this._pubsub = new Pubsub(this.container, false);
    this._internalPubsub = new Pubsub(this.container, true);

    /**
     * Indicating if the pubsub client should connect to server automatically.
     *
     * @type {Boolean}
     */
    this.autoPubsub = true;
  }

  /**
   * Subscribes a function callback on receiving message at the specified
   * channel.
   *
   * @param {string} channel - name of the channel to subscribe
   * @param {function(object:*)} callback - function to be trigger with
   * incoming data
   * @return {function(object:*)} The callback function
   **/


  _createClass(PubsubContainer, [{
    key: 'on',
    value: function on(channel, callback) {
      return this._pubsub.on(channel, callback);
    }

    /**
     * Unsubscribes a function callback on the specified channel.
     *
     * If pass in `callback` is null, all callbacks in the specified channel
     * will be removed.
     *
     * @param {string} channel - name of the channel to unsubscribe
     * @param {function(object:*)=} callback - function to be trigger with
     * incoming data
     **/

  }, {
    key: 'off',
    value: function off(channel) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this._pubsub.off(channel, callback);
    }

    /**
     * Subscribes the channel for just one message.
     *
     * This function takes one message off from a pubsub channel,
     * returning a promise of that message. When a message
     * is received from the channel, the channel will be unsubscribed.
     *
     * @param {string} channel - name of the channel
     * @return {Promise<Object>} promise of next message in this channel
     */

  }, {
    key: 'once',
    value: function once(channel) {
      return this._pubsub.once(channel);
    }

    /**
     * Registers listener on connection between pubsub client and server is open.
     *
     * @param  {function()} listener - function to be triggered when connection
     * open
     */

  }, {
    key: 'onOpen',
    value: function onOpen(listener) {
      this._pubsub.onOpen(listener);
    }

    /**
     * Registers listener on connection between pubsub client and server is
     * closed.
     *
     * @param  {function()} listener - function to be triggered when connection
     * closed
     */

  }, {
    key: 'onClose',
    value: function onClose(listener) {
      this._pubsub.onClose(listener);
    }

    /**
     * Publishes message to a channel.
     *
     * @param {String} channel - name of the channel
     * @param {Object} data - data to be published
     */

  }, {
    key: 'publish',
    value: function publish(channel, data) {
      this._pubsub.publish(channel, data);
    }

    /**
     * Checks if the channel is subscribed with any handler.
     *
     * @param {String} channel - name of the channel
     * @return {Boolean} true if the channel has handlers
     */

  }, {
    key: 'hasHandlers',
    value: function hasHandlers(channel) {
      this._pubsub.hasHandlers(channel);
    }

    /**
     * @private
     */

  }, {
    key: '_reconfigurePubsubIfNeeded',
    value: function _reconfigurePubsubIfNeeded() {
      if (!this.autoPubsub) {
        return;
      }

      this.reconfigure();
    }

    /**
     * Connects to server if the Skygear container has credential, otherwise
     * close the connection.
     */

  }, {
    key: 'reconfigure',
    value: function reconfigure() {
      this._internalPubsub.reset();
      if (this.deviceID !== null) {
        this._internalPubsub.subscribe('_sub_' + this.deviceID, function (data) {
          console.log('Receivied data for subscription: ' + data);
        });
      }
      this._internalPubsub.reconfigure();
      this._pubsub.reconfigure();
    }
  }, {
    key: 'deviceID',
    get: function get() {
      return this.container.push.deviceID;
    }
  }]);

  return PubsubContainer;
}();