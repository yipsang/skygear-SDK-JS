'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatabaseContainer = exports.PublicDatabase = exports.Database = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _asset = require('./asset');

var _asset2 = _interopRequireDefault(_asset);

var _query2 = require('./query');

var _query3 = _interopRequireDefault(_query2);

var _query_result = require('./query_result');

var _query_result2 = _interopRequireDefault(_query_result);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Database = function () {

  /**
   * Creates a Skygear database.
   *
   * @param  {String} dbID - database ID
   * @param  {Container} container - Skygear Container
   * @return {Database}
   */
  function Database(dbID, container) {
    _classCallCheck(this, Database);

    if (dbID !== '_public' && dbID !== '_private' && dbID !== '_union') {
      throw new Error('Invalid database_id');
    }

    /**
     * The database ID
     * @type {String}
     */
    this.dbID = dbID;

    /**
     * @private
     */
    this.container = container;
    this._cacheStore = new _cache2.default(this.dbID, this.container.store);
    this._cacheResponse = true;
  }

  /**
   * Fetches a single record with the specified id from Skygear.
   *
   * Use this method to fetch a single record from Skygear by specifying a
   * record ID in the format of `type/id`. The fetch will be performed
   * asynchronously and the returned promise will be resolved when the
   * operation completes.
   *
   * @param  {String} id - record ID with format `type/id`
   * @return {Promise<Record>} promise with the fetched Record
   */


  _createClass(Database, [{
    key: 'getRecordByID',
    value: function getRecordByID(id) {
      var Record = this._Record;

      var _Record$parseID = Record.parseID(id),
          _Record$parseID2 = _slicedToArray(_Record$parseID, 2),
          recordType = _Record$parseID2[0],
          recordId = _Record$parseID2[1];

      var query = new _query3.default(Record.extend(recordType)).equalTo('_id', recordId);
      return this.query(query).then(function (users) {
        if (users.length === 1) {
          return users[0];
        } else {
          throw new Error(id + ' does not exist');
        }
      });
    }

    /**
     * Fetches records that match the Query from Skygear.
     *
     * Use this method to fetch records from Skygear by specifying a Query.
     * The fetch will be performed asynchronously and the returned promise will
     * be resolved when the operation completes.
     *
     * If cacheCallback is provided, the SDK would try to fetch result of the
     * query from local cache, before issuing query request to the server, and
     * trigger the cacheCallback function if cached result is found.
     *
     * @param  {Query} query
     * @param  {function(queryResult:QueryResult,isCached:boolean)} cacheCallback
     * @return {Promise<QueryResult>} promise with the QueryResult
     */

  }, {
    key: 'query',
    value: function query(_query) {
      var _this = this;

      var cacheCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var remoteReturned = false;
      var cacheStore = this.cacheStore;
      var Cls = _query.recordCls;
      var queryJSON = _query.toJSON();

      if (!queryJSON.offset && queryJSON.page > 0) {
        queryJSON.offset = queryJSON.limit * (queryJSON.page - 1);
      }

      var payload = _.assign({
        database_id: this.dbID //eslint-disable-line
      }, queryJSON);

      if (cacheCallback) {
        cacheStore.get(_query.hash).then(function (body) {
          if (remoteReturned) {
            return;
          }
          var records = _.map(body.result, function (attrs) {
            return new Cls(attrs);
          });
          var result = _query_result2.default.createFromResult(records, body.info);
          cacheCallback(result, true);
        }, function (err) {
          console.log('No cache found', err);
        });
      }
      return this.container.makeRequest('record:query', payload).then(function (body) {
        var records = _.map(body.result, function (attrs) {
          return new Cls(attrs);
        });
        var result = _query_result2.default.createFromResult(records, body.info);
        remoteReturned = true;
        if (_this.cacheResponse) {
          cacheStore.set(_query.hash, body);
        }
        return result;
      });
    }
  }, {
    key: '_presaveAssetTask',
    value: function _presaveAssetTask(key, asset) {
      if (asset.file) {
        return makeUploadAssetRequest(this.container, asset).then(function (a) {
          return [key, a];
        });
      } else {
        return Promise.resolve([key, asset]);
      }
    }
  }, {
    key: '_presave',
    value: function _presave(record) {
      var _this2 = this;

      // for every (key, value) pair, process the pair in a Promise
      // the Promise should be resolved by the transformed [key, value] pair
      var tasks = _.map(record, function (value, key) {
        if (value instanceof _asset2.default) {
          return _this2._presaveAssetTask(key, value);
        } else {
          return Promise.resolve([key, value]);
        }
      });

      return Promise.all(tasks).then(function (keyvalues) {
        _.each(keyvalues, function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key = _ref2[0],
              value = _ref2[1];

          record[key] = value;
        });
        return record;
      });
    }

    /**
     * Same as {@link Database#delete}.
     *
     * @param  {Record|Record[]|QueryResult} record - the record(s) to delete
     * @return {Promise<Record>} promise with the delete result
     * @see {@link Database#delete}
     */

  }, {
    key: 'del',
    value: function del(record) {
      return this.delete(record);
    }

    /**
     * Saves a record or records to Skygear.
     *
     * Use this method to save a record or records to Skygear.
     * The save will be performed asynchronously and the returned promise will
     * be resolved when the operation completes.
     *
     * New record will be created in the database while existing
     * record will be modified.
     *
     * options.atomic can be set to true, which makes the operation either
     * success or failure, but not partially success.
     *
     * @param {Record|Record[]} _records - the record(s) to save
     * @param {Object} [options={}] options - options for saving the records
     * @param {Boolean} [options.atomic] - true if the save request should be
     * atomic
     * @return {Promise<Record>} promise with saved records
     */

  }, {
    key: 'save',
    value: function save(_records) {
      var _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var records = _records;
      if (!_.isArray(records)) {
        records = [records];
      }

      if (_.some(records, function (r) {
        return r === undefined || r === null;
      })) {
        return Promise.reject('Invalid input, unable to save undefined and null');
      }

      var presaveTasks = _.map(records, this._presave.bind(this));
      return Promise.all(presaveTasks).then(function (processedRecords) {
        var payload = {
          database_id: _this3.dbID //eslint-disable-line
        };

        if (options.atomic) {
          payload.atomic = true;
        }

        payload.records = _.map(processedRecords, function (perRecord) {
          return perRecord.toJSON();
        });

        return _this3.container.makeRequest('record:save', payload);
      }).then(function (body) {
        var results = body.result;
        var savedRecords = [];
        var errors = [];

        _.forEach(results, function (perResult, idx) {
          if (perResult._type === 'error') {
            savedRecords[idx] = undefined;
            errors[idx] = perResult;
          } else {
            records[idx].update(perResult);
            records[idx].updateTransient(perResult._transient, true);

            savedRecords[idx] = records[idx];
            errors[idx] = undefined;
          }
        });

        if (records.length === 1) {
          if (errors[0]) {
            return Promise.reject(errors[0]);
          }
          return savedRecords[0];
        }
        return { savedRecords: savedRecords, errors: errors };
      });
    }

    /**
     * Deletes a record or records to Skygear.
     *
     * Use this method to delete a record or records to Skygear.
     * The delete will be performed asynchronously and the returned promise will
     * be resolved when the operation completes.
     *
     * @param  {Record|Record[]|QueryResult} _records - the records to delete
     * @return {Promise} promise
     */

  }, {
    key: 'delete',
    value: function _delete(_records) {
      var records = _records;
      var isQueryResult = records instanceof _query_result2.default;
      if (!_.isArray(records) && !isQueryResult) {
        records = [records];
      }

      var ids = _.map(records, function (perRecord) {
        return perRecord.id;
      });
      var payload = {
        database_id: this.dbID, //eslint-disable-line
        ids: ids
      };

      return this.container.makeRequest('record:delete', payload).then(function (body) {
        var results = body.result;
        var errors = [];

        _.forEach(results, function (perResult, idx) {
          if (perResult._type === 'error') {
            errors[idx] = perResult;
          } else {
            errors[idx] = undefined;
          }
        });

        if (records.length === 1) {
          if (errors[0]) {
            return Promise.reject(errors[0]);
          }
          return;
        }
        return errors;
      });
    }

    /**
     * @type {Store}
     */

  }, {
    key: 'cacheStore',
    get: function get() {
      return this._cacheStore;
    }

    /**
     * Indicating if query result should be cached locally
     *
     * @type {boolean}
     */

  }, {
    key: 'cacheResponse',
    get: function get() {
      return this._cacheResponse;
    }

    /**
     * Indicating if query result should be cached locally
     *
     * @type {boolean}
     */
    ,
    set: function set(value) {
      var b = !!value;
      this._cacheResponse = b;
    }
  }, {
    key: '_Record',
    get: function get() {
      return this.container.Record;
    }
  }]);

  return Database;
}();

exports.Database = Database;

var PublicDatabase = exports.PublicDatabase = function (_Database) {
  _inherits(PublicDatabase, _Database);

  function PublicDatabase() {
    _classCallCheck(this, PublicDatabase);

    return _possibleConstructorReturn(this, (PublicDatabase.__proto__ || Object.getPrototypeOf(PublicDatabase)).apply(this, arguments));
  }

  _createClass(PublicDatabase, [{
    key: 'setDefaultACL',


    /**
     * Sets default ACL of a newly created record.
     *
     * @param {ACL} acl - the default acl
     */
    value: function setDefaultACL(acl) {
      this._Record.defaultACL = acl;
    }

    /**
     * Sets the roles that are allowed to create records of a record type.
     *
     * @param {Class} recordClass - the record class created with
     * {@link Record.extend}
     * @param {Role[]} roles - the roles
     * @return {Promise} promise
     */

  }, {
    key: 'setRecordCreateAccess',
    value: function setRecordCreateAccess(recordClass, roles) {
      var roleNames = _.map(roles, function (perRole) {
        return perRole.name;
      });

      return this.container.makeRequest('schema:access', {
        type: recordClass.recordType,
        create_roles: roleNames //eslint-disable-line camelcase
      }).then(function (body) {
        return body.result;
      });
    }

    /**
     * Sets the default ACL of a newly created record of a record type.
     *
     * @param {Class} recordClass - the record class created with
     * {@link Record.extend}
     * @param {ACL} acl - the default acl
     * @return {Promise} promise
     */

  }, {
    key: 'setRecordDefaultAccess',
    value: function setRecordDefaultAccess(recordClass, acl) {
      return this.container.makeRequest('schema:default_access', {
        type: recordClass.recordType,
        default_access: acl.toJSON() //eslint-disable-line camelcase
      }).then(function (body) {
        return body.result;
      });
    }
  }, {
    key: 'defaultACL',


    /**
     * The default ACL of a newly created record
     *
     * @type {ACL}
     */
    get: function get() {
      return this._Record.defaultACL;
    }
  }]);

  return PublicDatabase;
}(Database);

/**
 * @private
 */


var DatabaseContainer = exports.DatabaseContainer = function () {

  /**
   * Creates a DatabaseContainer.
   *
   * @param  {Container} container - the Skygear container
   */
  function DatabaseContainer(container) {
    _classCallCheck(this, DatabaseContainer);

    /**
     * @private
     */
    this.container = container;

    this._public = null;
    this._private = null;
    this._cacheResponse = true;
  }

  /**
   * @type {PublicDatabase}
   */


  _createClass(DatabaseContainer, [{
    key: 'uploadAsset',


    /**
     * Uploads asset to Skygear server.
     *
     * @param  {Asset} asset - the asset
     * @return {Promise<Asset>} promise
     */
    value: function uploadAsset(asset) {
      return makeUploadAssetRequest(this.container, asset);
    }

    /**
     * True if the database cache result from response
     *
     * @type {Boolean}
     */

  }, {
    key: 'public',
    get: function get() {
      if (this._public === null) {
        this._public = new PublicDatabase('_public', this.container);
        this._public.cacheResponse = this._cacheResponse;
      }
      return this._public;
    }

    /**
     * Private database of the current user
     *
     * @type {Database}
     */

  }, {
    key: 'private',
    get: function get() {
      if (this.container.accessToken === null) {
        throw new Error('You must login before access to privateDB');
      }
      if (this._private === null) {
        this._private = new Database('_private', this.container);
        this._private.cacheResponse = this._cacheResponse;
      }
      return this._private;
    }
  }, {
    key: 'cacheResponse',
    get: function get() {
      return this._cacheResponse;
    }

    /**
     * True if the database cache result from response
     *
     * @type {Boolean}
     */
    ,
    set: function set(value) {
      var b = !!value;
      this._cacheResponse = b;
      if (this._public) {
        this._public.cacheResponse = b;
      }
      if (this._private) {
        this._private.cacheResponse = b;
      }
    }
  }]);

  return DatabaseContainer;
}();

function makeUploadAssetRequest(container, asset) {
  return new Promise(function (resolve, reject) {
    container.makeRequest('asset:put', {
      filename: asset.name,
      'content-type': asset.contentType,
      'content-size': asset.file.size
    }).then(function (res) {
      var newAsset = _asset2.default.fromJSON(res.result.asset);
      var postRequest = res.result['post-request'];

      var postUrl = postRequest.action;
      if (postUrl.indexOf('/') === 0) {
        postUrl = postUrl.substring(1);
      }
      if (postUrl.indexOf('http') !== 0) {
        postUrl = container.url + postUrl;
      }

      var _request = container.request.post(postUrl).set('X-Skygear-API-Key', container.apiKey);
      if (postRequest['extra-fields']) {
        _.forEach(postRequest['extra-fields'], function (value, key) {
          _request = _request.field(key, value);
        });
      }

      _request.attach('file', asset.file).end(function (err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(newAsset);
      });
    }, function (err) {
      reject(err);
    });
  });
}