'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Registry = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
/* eslint-disable no-var, camelcase */


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = exports.Registry = function () {
  function Registry() {
    _classCallCheck(this, Registry);

    this.funcMap = {
      op: {},
      event: {},
      hook: {},
      timer: {}
    };
    this.paramMap = {
      op: [],
      event: [],
      handler: [],
      hook: [],
      timer: [],
      provider: []
    };
    this.handlers = {};
    this.providers = {};
    this._hookTypeMap = {};
    this.staticAsset = {};
  }

  _createClass(Registry, [{
    key: '_addParamHandler',
    value: function _addParamHandler(param) {
      var kind = 'handler';
      var list = this.paramMap[kind];
      list = list.filter(function (item) {
        if (item.name === param.name && !_lodash2.default.isEmpty(_lodash2.default.intersection(item.methods, param.methods))) {
          console.log('Replacing previously registered ' + kind + ': ' + item.name);
          return false;
        }
        return true;
      });
      _lodash2.default.forEach(param.methods, function (method) {
        var newParam = _lodash2.default.cloneDeep(param);
        newParam.methods = [method];
        list.push(newParam);
      });
      this.paramMap[kind] = list;
    }
  }, {
    key: '_addParam',
    value: function _addParam(kind, param) {
      if (kind === 'handler') {
        return this._addParamHandler(param);
      }

      var list = this.paramMap[kind];
      list = list.filter(function (item) {
        if (item.name === param.name) {
          console.log('Replacing previously registered ' + kind + ': ' + item.name);
          return false;
        }
        return true;
      });
      list.push(param);
      this.paramMap[kind] = list;
    }
  }, {
    key: 'registerHook',
    value: function registerHook(name, func, options) {
      if (!options.type) {
        throw new Error('type is required for hook');
      }
      if (!options.trigger) {
        throw new Error('trigger is required for hook');
      }
      var opts = _extends({}, options, {
        name: name
      });
      this._addParam('hook', opts);
      this.funcMap.hook[name] = func;
      this._hookTypeMap[name] = options.type;
    }
  }, {
    key: 'registerOp',
    value: function registerOp(name, func, options) {
      var opts = {
        name: name,
        key_required: options.keyRequired,
        user_required: options.userRequired
      };
      this._addParam('op', opts);
      this.funcMap.op[name] = func;
    }
  }, {
    key: 'registerEvent',
    value: function registerEvent(name, func) {
      var eventParams = this.paramMap.event.filter(function (e) {
        return e.name === name;
      });
      if (eventParams.length === 0) {
        this._addParam('event', { name: name });
      }

      var funcList = this.funcMap.event[name] || [];
      funcList.push(func);

      this.funcMap.event[name] = funcList;
    }
  }, {
    key: 'registerTimer',
    value: function registerTimer(name, func, options) {
      var opts = _extends({}, options, {
        name: name
      });
      this._addParam('timer', opts);
      this.funcMap.timer[name] = func;
    }
  }, {
    key: 'registerHandler',
    value: function registerHandler(name, func, options) {
      var _this = this;

      var m = options.method || ['GET', 'POST', 'PUT'];
      var opts = {
        name: name,
        methods: m,
        key_required: options.keyRequired,
        user_required: options.userRequired
      };
      this._addParam('handler', opts);
      if (!this.handlers[name]) {
        this.handlers[name] = {};
      }
      m.forEach(function (_m) {
        _this.handlers[name][_m] = func;
      });
    }
  }, {
    key: 'registerProvider',
    value: function registerProvider(providerType, providerID, provider, options) {
      var opts = _extends({}, options, {
        type: providerType,
        id: providerID
      });
      this._addParam('provider', opts);
      this.providers[providerID] = provider;
    }
  }, {
    key: 'registerAsset',
    value: function registerAsset(path, func) {
      this.staticAsset[path] = func;
    }
  }, {
    key: 'getFunc',
    value: function getFunc(kind, name) {
      if (kind === 'event') {
        throw new Error('getFunc() is not compatible with event kind');
      }
      return this.funcMap[kind][name];
    }
  }, {
    key: 'getEventFunctions',
    value: function getEventFunctions(name) {
      return this.funcMap.event[name];
    }
  }, {
    key: 'getHookType',
    value: function getHookType(name) {
      return this._hookTypeMap[name];
    }
  }, {
    key: 'getHandler',
    value: function getHandler(name, method) {
      return this.handlers[name][method];
    }
  }, {
    key: 'getProvider',
    value: function getProvider(name) {
      return this.providers[name];
    }
  }, {
    key: 'funcList',
    value: function funcList() {
      return this.paramMap;
    }
  }]);

  return Registry;
}();

var registry = new Registry();
exports.default = registry;