'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorResponseFromMessage = errorResponseFromMessage;

var _skygearCore = require('skygear-core');

var _skygearCore2 = _interopRequireDefault(_skygearCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function errorResponseFromMessage(message) {
  return {
    error: new _skygearCore2.default.Error(message)
  };
}