'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _push = require('./push');

var _store = require('../store');

var _store2 = require('./store');

var _store3 = _interopRequireDefault(_store2);

var _database = require('../database');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _store.setStore)(_store3.default);
_index2.default._store = _store3.default;
// Cache of DatabaseContainer will use the container store
// So we have to recreate the _db after the store is changed
_index2.default._db = new _database.DatabaseContainer(_index2.default);
_index2.default._push = new _push.ReactNativePushContainer(_index2.default);

exports.default = _index2.default;
module.exports = exports['default'];