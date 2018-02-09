'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectToContainer = exports.resetPassword = exports.forgotPassword = undefined;
exports._forgotPassword = _forgotPassword;
exports._resetPassword = _resetPassword;

var _skygearCore = require('skygear-core');

var _skygearCore2 = _interopRequireDefault(_skygearCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Send a forgot password email to the email address.
 *
 * @injectTo {AuthContainer} as forgotPassword
 * @param  {String} email - target email address
 * @return {Promise} promise
 *
 * @example
 * skygear.auth.forgotPassword(email).then(...);
 */
function _forgotPassword(email) {
  return this.container.lambda('user:forgot-password', {
    email: email
  });
}

/**
 * Reset password with a code generated by the server. The code can be
 * retrieved by forgotPassword.
 *
 * @injectTo {AuthContainer} as resetPassword
 * @param  {String} userID - target user ID
 * @param  {String} code - code generated by server
 * @param  {Number} expireAt - utc timestamp
 * @param  {String} newPassword - new password of the user
 * @return {Promise} promise
 *
 * @example
 * skygear.auth.resetPassword(userID, code, expireAt, newPassword).then(...);
 */
function _resetPassword(userID, code, expireAt, newPassword) {
  return this.container.lambda('user:reset-password', {
    user_id: userID, /* eslint camelcase: 0 */
    code: code, /* eslint camelcase: 0 */
    expire_at: expireAt, /* eslint camelcase: 0 */
    new_password: newPassword
  });
}

/**
 * @ignore
 */
var forgotPassword = exports.forgotPassword = _forgotPassword.bind(_skygearCore2.default.auth);

/**
 * @ignore
 */
var resetPassword = exports.resetPassword = _resetPassword.bind(_skygearCore2.default.auth);

/**
 * @private
 */
var injectToContainer = exports.injectToContainer = function injectToContainer() {
  var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _skygearCore2.default;

  var authContainerPrototype = container.auth.constructor.prototype;
  authContainerPrototype.forgotPassword = _forgotPassword;
  authContainerPrototype.resetPassword = _resetPassword;
};