"use strict";

/**
 * Deal with events of components
 *
 * @type {{subscribers: {}, subscribe: Function, trigger: Function}}
 */
var eventHandler = {
    subscribers: {},

    /**
     * Subscribe to specific event
     *
     * @param eventName
     * @param callback
     */
    subscribe: function (eventName, callback) {
        if (typeof(eventHandler.subscribers[eventName]) == 'undefined') {
            eventHandler.subscribers[eventName] = [];
        }
        eventHandler.subscribers[eventName].push(callback);
    },

    /**
     * Trigger specific event
     *
     * @param event
     */
    trigger: function (event) {
        if (typeof(eventHandler.subscribers[event.name]) == 'undefined') {
            return;
        }

        var i, callback;
        for (i in eventHandler.subscribers[event.name]) {
            callback = eventHandler.subscribers[event.name][i];
            typeof(callback) != 'undefined' ? callback(event) : undefined;
        }
    },

    /**
     *  Remove a function from the subscribers list.
     *
     * @param {string} eventName
     * @param {function} callback
     */
    unsubscribe: function (eventName, callback) {
        if (typeof(eventHandler.subscribers[eventName]) != 'undefined') {
            var i = eventHandler.subscribers[eventName].indexOf(callback);
            i != -1 ? delete eventHandler.subscribers[eventName][i] : undefined;
        }
    }
};

module.exports = eventHandler;