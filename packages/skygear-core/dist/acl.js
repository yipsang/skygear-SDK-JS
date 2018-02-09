'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccessLevel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AccessLevelMap;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _role = require('./role');

var _role2 = _interopRequireDefault(_role);

var _record = require('./record');

var _record2 = _interopRequireDefault(_record);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
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


var AccessLevel = exports.AccessLevel = {
  NoAccessLevel: null,
  ReadOnlyLevel: 'read',
  ReadWriteLevel: 'write'
};

var AccessLevelMap = (_AccessLevelMap = {}, _defineProperty(_AccessLevelMap, AccessLevel.NoAccessLevel, 0), _defineProperty(_AccessLevelMap, AccessLevel.ReadOnlyLevel, 1), _defineProperty(_AccessLevelMap, AccessLevel.ReadWriteLevel, 2), _AccessLevelMap);

function accessLevelNumber(level) {
  return AccessLevelMap[level] || 0;
}

/**
 * Access Control List
 *
 * It describes the read and write permission of a record to public, specific
 * roles or users.
 */

var ACL = function () {

  /**
   * Constructs a new ACL object.
   *
   * @param  {Object[]} attrs
   */
  function ACL(attrs) {
    var _this = this;

    _classCallCheck(this, ACL);

    // default ACL: public read only
    this.public = AccessLevel.ReadOnlyLevel;
    this.roles = {};
    this.users = {};

    if (attrs) {
      this.public = AccessLevel.NoAccessLevel;

      _lodash2.default.forEach(attrs, function (perAttr) {
        perAttr.level = perAttr.level || AccessLevel.ReadOnlyLevel;
        if (perAttr.public) {
          if (accessLevelNumber(perAttr.level) > accessLevelNumber(_this.public)) {
            _this.public = perAttr.level;
          }
        } else if (perAttr.role) {
          var theRole = _role2.default.define(perAttr.role);
          var currentLevel = _this.roles[theRole.name];
          if (accessLevelNumber(perAttr.level) > accessLevelNumber(currentLevel)) {
            _this.roles[theRole.name] = perAttr.level;
          }
        } else if (perAttr.user_id) {
          var _currentLevel = _this.users[perAttr.user_id];
          if (accessLevelNumber(perAttr.level) > accessLevelNumber(_currentLevel)) {
            _this.users[perAttr.user_id] = perAttr.level;
          }
        } else {
          throw new Error('Invalid ACL Entry: ' + JSON.stringify(perAttr));
        }
      });
    }
  }

  /**
   * Serializes ACL to a JSON object.
   */


  _createClass(ACL, [{
    key: 'toJSON',
    value: function toJSON() {
      var json = [];
      if (this.public) {
        json.push({
          public: true,
          level: this.public
        });
      }

      _lodash2.default.each(this.roles, function (perRoleLevel, perRoleName) {
        if (perRoleLevel) {
          json.push({
            role: perRoleName,
            level: perRoleLevel
          });
        }
      });

      _lodash2.default.each(this.users, function (perUserLevel, perUserId) {
        if (perUserLevel) {
          json.push({
            user_id: perUserId, //eslint-disable-line
            level: perUserLevel
          });
        }
      });

      return json;
    }

    /**
     * Sets public to have no access.
     */

  }, {
    key: 'setPublicNoAccess',
    value: function setPublicNoAccess() {
      this.public = AccessLevel.NoAccessLevel;
    }

    /**
     * Sets public to have read access only.
     */

  }, {
    key: 'setPublicReadOnly',
    value: function setPublicReadOnly() {
      this.public = AccessLevel.ReadOnlyLevel;
    }

    /**
     * Sets public to have both read and write access.
     */

  }, {
    key: 'setPublicReadWriteAccess',
    value: function setPublicReadWriteAccess() {
      this.public = AccessLevel.ReadWriteLevel;
    }

    /**
     * Sets a specific role to have no access.
     *
     * @param {Role} role - the role
     */

  }, {
    key: 'setNoAccessForRole',
    value: function setNoAccessForRole(role) {
      if (!role || !(role instanceof _role2.default)) {
        throw new Error(role + ' is not a role.');
      }

      this.roles[role.name] = AccessLevel.NoAccessLevel;
    }

    /**
     * Sets a specific role to have read access only.
     *
     * @param {Role} role - the role
     */

  }, {
    key: 'setReadOnlyForRole',
    value: function setReadOnlyForRole(role) {
      if (!role || !(role instanceof _role2.default)) {
        throw new Error(role + ' is not a role.');
      }

      this.roles[role.name] = AccessLevel.ReadOnlyLevel;
    }

    /**
     * Sets a specific role to have read and write access.
     *
     * @param {Role} role - the role
     */

  }, {
    key: 'setReadWriteAccessForRole',
    value: function setReadWriteAccessForRole(role) {
      if (!role || !(role instanceof _role2.default)) {
        throw new Error(role + ' is not a role.');
      }

      this.roles[role.name] = AccessLevel.ReadWriteLevel;
    }

    /**
     * Sets a specific user to have no access.
     *
     * @param {Record} user - the user record
     */

  }, {
    key: 'setNoAccessForUser',
    value: function setNoAccessForUser(user) {
      if (!user || !(user instanceof _record2.default) || !(user.recordType === 'user')) {
        throw new Error(user + ' is not a user.');
      }

      this.users[user._id] = AccessLevel.NoAccessLevel;
    }

    /**
     * Sets a specific user to have read access only.
     *
     * @param {Record} user - the user record
     */

  }, {
    key: 'setReadOnlyForUser',
    value: function setReadOnlyForUser(user) {
      if (!user || !(user instanceof _record2.default) || !(user.recordType === 'user')) {
        throw new Error(user + ' is not a user.');
      }

      this.users[user._id] = AccessLevel.ReadOnlyLevel;
    }

    /**
     * Sets a specific user to have read and write access.
     *
     * @param {Record} user - the user record
     */

  }, {
    key: 'setReadWriteAccessForUser',
    value: function setReadWriteAccessForUser(user) {
      if (!user || !(user instanceof _record2.default) || !(user.recordType === 'user')) {
        throw new Error(user + ' is not a user.');
      }

      this.users[user._id] = AccessLevel.ReadWriteLevel;
    }

    /**
     * Checks if public has read access.
     *
     * @return {Boolean} true if public has read access
     */

  }, {
    key: 'hasPublicReadAccess',
    value: function hasPublicReadAccess() {
      return accessLevelNumber(this.public) >= accessLevelNumber(AccessLevel.ReadOnlyLevel);
    }

    /**
     * Checks if public has write access.
     *
     * @return {Boolean} true if public has write access
     */

  }, {
    key: 'hasPublicWriteAccess',
    value: function hasPublicWriteAccess() {
      return accessLevelNumber(this.public) === accessLevelNumber(AccessLevel.ReadWriteLevel);
    }

    /**
     * Checks if the specific role has read access.
     *
     * @param {Role} role - the role
     * @return {Boolean} true if the role has read access
     */

  }, {
    key: 'hasReadAccessForRole',
    value: function hasReadAccessForRole(role) {
      if (!role || !(role instanceof _role2.default)) {
        throw new Error(role + ' is not a role.');
      }

      return this.hasPublicReadAccess() || accessLevelNumber(this.roles[role.name]) >= accessLevelNumber(AccessLevel.ReadOnlyLevel);
    }

    /**
     * Checks if the specific role has write access.
     *
     * @param {Role} role - the role
     * @return {Boolean} true if the role has write access
     */

  }, {
    key: 'hasWriteAccessForRole',
    value: function hasWriteAccessForRole(role) {
      if (!role || !(role instanceof _role2.default)) {
        throw new Error(role + ' is not a role.');
      }

      return this.hasPublicWriteAccess() || accessLevelNumber(this.roles[role.name]) >= accessLevelNumber(AccessLevel.ReadWriteLevel);
    }

    /**
     * Checks if the specific user has read access.
     *
     * @param {Record} user - the user
     * @return {Boolean} true if the user has read access
     */

  }, {
    key: 'hasReadAccessForUser',
    value: function hasReadAccessForUser(user) {
      if (!user || !(user instanceof _record2.default) || !(user.recordType === 'user')) {
        throw new Error(user + ' is not a user.');
      }

      return this.hasPublicReadAccess() || accessLevelNumber(this.users[user._id]) >= accessLevelNumber(AccessLevel.ReadOnlyLevel);
    }

    /**
     * Checks if the specific user has write access.
     *
     * @param {Record} user - the user
     * @return {Boolean} true if the user has write access
     */

  }, {
    key: 'hasWriteAccessForUser',
    value: function hasWriteAccessForUser(user) {
      if (!user || !(user instanceof _record2.default) || !(user.recordType === 'user')) {
        throw new Error(user + ' is not a user.');
      }

      return this.hasPublicWriteAccess() || accessLevelNumber(this.users[user._id]) >= accessLevelNumber(AccessLevel.ReadWriteLevel);
    }

    /**
     * Checks if the specific user and role has read access.
     *
     * @param {Record} user - the user
     * @param {Role[]} roles - roles
     * @return {Boolean} true if the user and roles has read access
     */

  }, {
    key: 'hasReadAccess',
    value: function hasReadAccess(user, roles) {
      if (this.hasReadAccessForUser(user)) {
        return true;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = roles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var role = _step.value;

          if (this.hasReadAccessForRole(role)) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }

    /**
     * Checks if the specific user and role has write access.
     *
     * @param {Record} user - the user
     * @param {Role[]} roles - roles
     * @return {Boolean} true if the user and roles has write access
     */

  }, {
    key: 'hasWriteAccess',
    value: function hasWriteAccess(user, roles) {
      if (this.hasWriteAccessForUser(user)) {
        return true;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = roles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var role = _step2.value;

          if (this.hasWriteAccessForRole(role)) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return false;
    }

    /**
     * Constructs a new ACL object from JSON object.
     *
     * @param  {Object} attrs - the JSON object
     * @return {ACL} the created acl object
     */

  }], [{
    key: 'fromJSON',
    value: function fromJSON(attrs) {
      return new ACL(attrs);
    }
  }]);

  return ACL;
}();

exports.default = ACL;