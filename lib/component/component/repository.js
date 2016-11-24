"use strict";

/**
 * Repository of all loaded components
 *
 * @type {{collection: {}, register: Function, get: Function, has: Function, all: Function}}
 */
var repository = {
    collection: {},

    /**
     * Register a component
     *
     * @param component
     */
    register: function(component) {
        console.info('[Component] ' + component.name + ' is now stored in repository');
        repository.collection[component.name] = component;
    },

    /**
     * get a component by its name
     *
     * @param name
     * @returns {*}
     */
    get: function(name) {
        return repository.collection[name];
    },

    /**
     * Check if component is registered
     *
     * @param name
     * @returns {boolean}
     */
    has: function(name) {
        return typeof(repository.collection[name]) !== 'undefined';
    },

    /**
     * Delete a component from the collection
     *
     * @param name
     */
    remove: function(name) {
        if (typeof(repository.collection[name].destroy) == 'function') {
            repository.collection[name].destroy.call(repository.collection[name])
        }
        delete repository.collection[name];
    },

    /**
     * Fetch all registered components
     *
     * @returns {{}}
     */
    all: function() {
        return repository.collection;
    }
};

module.exports = repository;