'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectToContainer = undefined;

var _skygearCore = require('skygear-core');

var _skygearCore2 = _interopRequireDefault(_skygearCore);

var _oauth = require('./oauth');

var _custom_token = require('./custom_token');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @private
 */
var injectToContainer = exports.injectToContainer = function injectToContainer() {
  var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _skygearCore2.default;

  var authContainerPrototype = container.auth.constructor.prototype;
  authContainerPrototype.loginOAuthProviderWithPopup = _oauth.loginOAuthProviderWithPopup;
  authContainerPrototype.loginOAuthProviderWithRedirect = _oauth.loginOAuthProviderWithRedirect;
  authContainerPrototype.linkOAuthProviderWithPopup = _oauth.linkOAuthProviderWithPopup;
  authContainerPrototype.linkOAuthProviderWithRedirect = _oauth.linkOAuthProviderWithRedirect;
  authContainerPrototype.oauthHandler = _oauth.oauthHandler;
  authContainerPrototype.getLoginRedirectResult = _oauth.getLoginRedirectResult;
  authContainerPrototype.getLinkRedirectResult = _oauth.getLinkRedirectResult;
  authContainerPrototype.iframeHandler = _oauth.iframeHandler;
  authContainerPrototype.loginOAuthProviderWithAccessToken = _oauth.loginOAuthProviderWithAccessToken;
  authContainerPrototype.linkOAuthProviderWithAccessToken = _oauth.linkOAuthProviderWithAccessToken;
  authContainerPrototype.unlinkOAuthProvider = _oauth.unlinkOAuthProvider;
  authContainerPrototype.getOAuthProviderProfiles = _oauth.getOAuthProviderProfiles;
  authContainerPrototype.loginWithCustomToken = _custom_token.loginWithCustomToken;
};