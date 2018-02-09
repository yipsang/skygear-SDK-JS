'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var definedRoles = {};

/**
 * Role
 */

var Role = function () {

  /**
   * Constructs a new Role object.
   *
   * @param  {String} name - role name
   */
  function Role(name) {
    _classCallCheck(this, Role);

    if (!Role.isValidName(name)) {
      throw new Error('Role name is not valid. Please start with alphanumeric string.');
    }

    this._name = name;
  }

  /**
   * Role name
   *
   * @type {String}
   */


  _createClass(Role, [{
    key: 'name',
    get: function get() {
      return this._name;
    }

    /**
     * @private
     */

  }], [{
    key: 'isValidName',
    value: function isValidName(name) {
      if (!name) {
        return false;
      }

      return true;
    }

    /**
     * @private
     */

  }, {
    key: 'define',
    value: function define(name) {
      var defined = definedRoles[name];
      if (defined !== undefined) {
        return defined;
      }

      defined = new Role(name);
      definedRoles[name] = defined;

      return defined;
    }

    /**
     * Adds a role to a collection of roles without duplication.
     *
     * @param  {Role[]} roles - collection of roles
     * @param  {Role} aRole - role to be added
     * @return {Role[]}
     */

  }, {
    key: 'union',
    value: function union(roles, aRole) {
      var duplicatedRole = _lodash2.default.find(roles, function (perRole) {
        return perRole.name === aRole.name;
      });

      if (duplicatedRole === undefined) {
        return _lodash2.default.union(roles, [aRole]);
      } else {
        return roles;
      }
    }

    /**
     * Removes a role to a collection of roles.
     *
     * @param  {Role[]} roles - collection of roles
     * @param  {Role} aRole - role to be removed
     * @return {Role[]}
     */

  }, {
    key: 'subtract',
    value: function subtract(roles, aRole) {
      return _lodash2.default.filter(roles, function (perRole) {
        return perRole.name !== aRole.name;
      });
    }

    /**
     * Checks if a collection of roles contain a role.
     *
     * @param  {Role[]} roles - collection of role
     * @param  {Role} aRole - target role
     * @return {Boolean}
     */

  }, {
    key: 'contain',
    value: function contain(roles, aRole) {
      return _lodash2.default.find(roles, function (perRole) {
        return perRole.name === aRole.name;
      }) !== undefined;
    }
  }]);

  return Role;
}();

exports.default = Role;
module.exports = exports['default'];