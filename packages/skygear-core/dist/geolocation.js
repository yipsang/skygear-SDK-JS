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

/**
 * Geolocation
 *
 * A model representing a latlong location in Skygear record.
 */
var Geolocation = function () {

  /**
   * Constructs a new Geolocation object.
   *
   * @param  {Number} latitude - latitude of the location
   * @param  {Number} longitude - longitude of the location
   */
  function Geolocation(latitude, longitude) {
    _classCallCheck(this, Geolocation);

    if (!_lodash2.default.isNumber(latitude)) {
      throw new Error('Latitude is not a number');
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude is not in expected range (-90, 90)');
    }
    if (!_lodash2.default.isNumber(longitude)) {
      throw new Error('Longitude is not a number');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude is not in expected range (-180, 180)');
    }

    /**
     * Latitude
     *
     * @type {Number}
     */
    this.latitude = latitude;

    /**
     * Longitude
     *
     * @type {Number}
     */
    this.longitude = longitude;
  }

  /**
   * Serializes Geolocation to a JSON object.
   *
   * @return {Object} the JSON object
   */


  _createClass(Geolocation, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        $lat: this.latitude,
        $lng: this.longitude,
        $type: 'geo'
      };
    }

    /**
     * Constructs a new Geolocation object from JSON object.
     *
     * @param {Object} attrs - the JSON object
     * @param {Number} attrs.$latitude - latitude of the location
     * @param {Number} attrs.$longitude - longitude of the location
     */

  }], [{
    key: 'fromJSON',
    value: function fromJSON(attrs) {
      return new Geolocation(attrs.$lat, attrs.$lng);
    }
  }]);

  return Geolocation;
}();

exports.default = Geolocation;
module.exports = exports['default'];