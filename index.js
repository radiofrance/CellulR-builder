"use strict";

var component = require('./lib/component/component.js');

// Backward compatibility
// instead of :
// module.exports = component;
//
// TODO: Only on V3, delete index.js, delete "main" in package.json and use namespaces :
// webcomponents/runner and webcomponents/component
module.exports.component = component;