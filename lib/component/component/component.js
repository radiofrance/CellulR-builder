"use strict";

var eventHandler = require('./eventHandler.js');
var event = require('./event.js');

/**
 * Represents a Component
 */
var component = function() {
    this.name = 'unknown';
};

/**
 * Change state of component, will propagate an event.
 *
 * @param state
 * @returns {component}
 */
component.prototype.setState = function(state) {
    this.state = state;
    eventHandler.trigger(new event(state));

    return this;
};

/**
 * Get current state of the component
 *
 * @returns component.state
 */
component.prototype.getState = function() {
    return this.state
};

module.exports = component;
