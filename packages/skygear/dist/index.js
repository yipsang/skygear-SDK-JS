'use strict';

var container = require('skygear-core');
var forgotPassword = require('skygear-forgot-password');
var sso = require('skygear-sso');

// Inject sub-package modules into container.
// Should keep in-sync with (project-root)/lib/index.js.
forgotPassword.injectToContainer(container);
sso.injectToContainer(container);

module.exports = container;