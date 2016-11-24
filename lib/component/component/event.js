"use strict";

/**
 * Represents an event.
 *
 * @param stateEvent
 */
 var event = function(stateEvent) {
     this.name = stateEvent.name;
     this.component = stateEvent.component;

     if (!!stateEvent.opt) {
       this.opt = stateEvent.opt;
     }
 };

module.exports = event;
