'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelationContainer = exports.RelationQueryResult = exports.RelationRemoveResult = exports.RelationResult = exports.RelationQuery = exports.Relation = exports.Mutual = exports.Inward = exports.Outward = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _container = require('./container');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    cls.apply(this, arguments);
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

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

/**
 * Outward relation direction
 *
 * @type {String}
 */
var Outward = exports.Outward = 'outward';

/**
 * Inward relation direction
 *
 * @type {String}
 */
var Inward = exports.Inward = 'inward';

/**
 * Mutual relation direction
 *
 * @type {String}
 */
var Mutual = exports.Mutual = 'mutual';

var format = /^[a-zA-Z]+$/;

/**
 * Relation
 *
 * It describes a relationship of the current user with other users.
 */

var Relation = exports.Relation = function () {

  /**
   * Constructs a new Relation object.
   *
   * @param  {String} identifier - identifier of the relation
   * @param  {String} direction - direction of the relation
   * @param  {Record[]} targets - target users of the relation
   */
  function Relation(identifier, direction) {
    var targets = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    _classCallCheck(this, Relation);

    if (!Relation.validName(identifier)) {
      throw new Error('Relation identifier can only be [a-zA-Z]+');
    }
    this.identifier = identifier;
    if (Relation.validDirection(direction)) {
      this.direction = direction;
    } else {
      throw new Error('Relation direction not supported.');
    }
    this.targets = targets;
    this.fails = [];
  }

  /**
   * Target user ids
   *
   * @type {String[]}
   */


  _createClass(Relation, [{
    key: 'targetsID',
    get: function get() {
      return _.map(this.targets, function (user) {
        return user._id;
      });
    }

    /**
     * @private
     */

  }], [{
    key: 'validDirection',
    value: function validDirection(direction) {
      return direction === Mutual || direction === Outward || direction === Inward;
    }

    /**
     * @private
     */

  }, {
    key: 'validName',
    value: function validName(identifier) {
      return format.test(identifier);
    }

    /**
     * @private
     */

  }, {
    key: 'extend',
    value: function extend(identifier, direction) {
      if (!Relation.validName(identifier)) {
        throw new Error('Relation identifier can only be [a-zA-Z]+');
      }
      var RelationProto = {
        identifier: identifier,
        direction: direction
      };
      function RelationCls() {
        var targets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        Relation.call(this, identifier, direction);
        this.targets = targets;
      }
      RelationCls.prototype = _.create(Relation.prototype, RelationProto);
      return RelationCls;
    }
  }]);

  return Relation;
}();

/**
 * @private
 */


var RelationQuery = exports.RelationQuery = function () {
  function RelationQuery(relationCls) {
    _classCallCheck(this, RelationQuery);

    this.identifier = relationCls.prototype.identifier;
    this.direction = relationCls.prototype.direction;
    this.limit = 50;
    this.page = 0;
  }

  _createClass(RelationQuery, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        name: this.identifier,
        direction: this.direction,
        limit: this.limit,
        page: this.page
      };
    }
  }]);

  return RelationQuery;
}();

/**
 * Result of add relation API
 */


var RelationResult = exports.RelationResult = function RelationResult(results) {
  _classCallCheck(this, RelationResult);

  /**
   * Succesfully added target users
   *
   * @type {Record[]}
   */
  this.success = [];

  /**
   * Errors
   *
   * @type {Object[]}
   */
  this.fails = [];
  this.partialError = false;
  var len = results.length;
  for (var i = 0; i < len; i++) {
    if (results[i].type === 'error') {
      this.fails.push(results[i]);
      this.partialError = true;
    } else {
      this.success.push(new _container.UserRecord(results[i].data));
    }
  }
};

/**
 * Result of remove relation API
 */


var RelationRemoveResult = exports.RelationRemoveResult = function RelationRemoveResult(results) {
  _classCallCheck(this, RelationRemoveResult);

  /**
   * Succesfully removed target users
   *
   * @type {String[]}
   */
  this.success = [];

  /**
   * Errors
   *
   * @type {Object[]}
   */
  this.fails = [];
  this.partialError = false;
  var len = results.length;
  for (var i = 0; i < len; i++) {
    if (results[i].type === 'error') {
      this.fails.push(results[i]);
      this.partialError = true;
    } else {
      this.success.push(results[i].id);
    }
  }
};

/**
 * Result of query relation API
 */


var RelationQueryResult = exports.RelationQueryResult = function (_extendableBuiltin2) {
  _inherits(RelationQueryResult, _extendableBuiltin2);

  function RelationQueryResult() {
    _classCallCheck(this, RelationQueryResult);

    return _possibleConstructorReturn(this, (RelationQueryResult.__proto__ || Object.getPrototypeOf(RelationQueryResult)).apply(this, arguments));
  }

  _createClass(RelationQueryResult, [{
    key: 'overallCount',


    /**
     * The count would return the number of all matching records, and ignore the
     * offset and limit of the query.
     *
     * @type {Number} the number of all matching records
     */
    get: function get() {
      return this._overallCount;
    }
  }], [{
    key: 'createFromBody',


    /**
     * @private
     */
    value: function createFromBody(body) {
      var users = _.map(body.result, function (attrs) {
        return new _container.UserRecord(attrs.data);
      });
      var result = new RelationQueryResult();
      users.forEach(function (val) {
        return result.push(val);
      });
      var info = body.info;
      result._overallCount = info ? info.count : undefined;
      return result;
    }
  }]);

  return RelationQueryResult;
}(_extendableBuiltin(Array));

var RelationContainer = exports.RelationContainer = function () {
  function RelationContainer(container) {
    _classCallCheck(this, RelationContainer);

    this.container = container;
  }

  /**
   * Queries users with a relation query object.
   *
   * @param  {RelationQuery} queryObj
   * @return {Promise<RelationQueryResult>} promise with user records
   */


  _createClass(RelationContainer, [{
    key: 'query',
    value: function query(queryObj) {
      return this.container.makeRequest('relation:query', queryObj.toJSON()).then(RelationQueryResult.createFromBody);
    }

    /**
     * Queries friends of current user. Convenient method of
     * {@link RelationContainer#query}.
     *
     * @return {Promise<RelationQueryResult>} promise with user records
     */

  }, {
    key: 'queryFriend',
    value: function queryFriend() {
      var query = new RelationQuery(this.Friend);
      return this.query(query);
    }

    /**
     * Queries followers of current user. Convenient method of
     * {@link RelationContainer#query}.
     *
     * @return {Promise<RelationQueryResult>} promise with user records
     */

  }, {
    key: 'queryFollower',
    value: function queryFollower() {
      var query = new RelationQuery(this.Follower);
      return this.query(query);
    }

    /**
     * Queries users that the current user is following. Convenient method of
     * {@link RelationContainer#query}.
     *
     * @return {Promise<RelationQueryResult>} promise with user records
     */

  }, {
    key: 'queryFollowing',
    value: function queryFollowing() {
      var query = new RelationQuery(this.Following);
      return this.query(query);
    }

    /**
     * Adds relation to the current user.
     *
     * @param {Relation} relation
     * @return {Promise<RelationResult>} promise with user records
     */

  }, {
    key: 'add',
    value: function add(relation) {
      return this.container.makeRequest('relation:add', {
        name: relation.identifier,
        direction: relation.direction,
        targets: relation.targetsID
      }).then(function (body) {
        return new RelationResult(body.result);
      });
    }

    /**
     * Removes relation from the current user.
     *
     * @param {Relation} relation
     * @return {Promise<RelationRemoveResult>} promise with user id
     */

  }, {
    key: 'remove',
    value: function remove(relation) {
      return this.container.makeRequest('relation:remove', {
        name: relation.identifier,
        direction: relation.direction,
        targets: relation.targetsID
      }).then(function (body) {
        return new RelationRemoveResult(body.result);
      });
    }

    /**
     * Relation query class.
     *
     * @type {RelationQuery}
     */

  }, {
    key: 'Query',
    get: function get() {
      return RelationQuery;
    }

    /**
     * @type {Relation}
     */

  }, {
    key: 'Friend',
    get: function get() {
      return Relation.extend('friend', Mutual);
    }

    /**
     * @type {Relation}
     */

  }, {
    key: 'Follower',
    get: function get() {
      return Relation.extend('follow', Inward);
    }

    /**
     * @type {Relation}
     */

  }, {
    key: 'Following',
    get: function get() {
      return Relation.extend('follow', Outward);
    }
  }]);

  return RelationContainer;
}();