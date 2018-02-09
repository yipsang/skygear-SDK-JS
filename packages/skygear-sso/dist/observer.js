'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WindowMessageObserver = exports.NewWindowObserver = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window:false */


var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NewWindowObserver = exports.NewWindowObserver = function () {
  function NewWindowObserver() {
    _classCallCheck(this, NewWindowObserver);

    this.timer = null;
  }

  _createClass(NewWindowObserver, [{
    key: 'subscribe',
    value: function subscribe(newWindow) {
      var _this = this;

      this.unsubscribe();
      this.newWindow = newWindow;
      return new Promise(function (resolve, reject) {
        _this.timer = window.setInterval(function () {
          if (_this.newWindow.closed) {
            reject((0, _util.errorResponseFromMessage)('User cancel the login flow'));
          }
        }, 3000);
      });
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe() {
      if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
      }
    }
  }]);

  return NewWindowObserver;
}();

var WindowMessageObserver = exports.WindowMessageObserver = function () {
  function WindowMessageObserver() {
    _classCallCheck(this, WindowMessageObserver);

    this.onMessageReceived = null;
  }

  _createClass(WindowMessageObserver, [{
    key: 'subscribe',
    value: function subscribe() {
      var _this2 = this;

      this.unsubscribe();
      return new Promise(function (resolve) {
        _this2.onMessageReceived = function (message) {
          resolve(message.data);
          _this2.unsubscribe();
        };
        window.addEventListener('message', _this2.onMessageReceived);
      });
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe() {
      if (this.onMessageReceived) {
        window.removeEventListener('message', this.onMessageReceived);
        this.onMessageReceived = null;
      }
    }
  }]);

  return WindowMessageObserver;
}();