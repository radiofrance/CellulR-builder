var componentObject = require('./component/component.js');
var event = require('./component/event.js');
var eventHandler = require('./component/eventHandler.js');
var repository = require('./component/repository.js');
var state = require('./component/state.js');

var component = {
    component: componentObject,
    event: event,
    eventHandler: eventHandler,
    repository: repository,
    state: state
};

module.exports = component;
