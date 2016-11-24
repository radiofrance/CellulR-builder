"use strict";

var fs = require('fs');
var gutil = require('gulp-util');
var pad = require('pad');
var Parser = require('./parser');

var TreeBuilder = {
    levels: {},
    componentsList: [],
    count: 1,
    parent: 0
};

/**
 * @param previousComponent
 * @param level
 * @returns {boolean|*}
 */
TreeBuilder.checkBrother = function(previousComponent, level) {
    if (previousComponent.level <= 1 || previousComponent.level == level) {
        return previousComponent;
    }

    if (TreeBuilder.componentsList[previousComponent.parent] != undefined) {
        return TreeBuilder.checkBrother(TreeBuilder.componentsList[previousComponent.parent], level);
    }

    return false;
};

/**
 * @param parent
 * @returns {boolean}
 */
TreeBuilder.checkParentHasBrother = function (parent) {
    if (TreeBuilder.componentsList[parent].parent != undefined
        && TreeBuilder.levels[TreeBuilder.componentsList[parent].parent] > 0) {
        return true;
    }

    return false;
};

/**
 * @param component
 * @param string
 * @returns {string|*}
 */
TreeBuilder.displayBranch = function(component, string) {

    string = string || '';

    if (TreeBuilder.componentsList[component.parent].level <= 1) {
        return string;
    }

    string = (TreeBuilder.checkParentHasBrother(component.parent) ? '\u2502' : ' ') + '   ' + string;

    if (component.parent > 0) {
        return TreeBuilder.displayBranch(TreeBuilder.componentsList[component.parent], string);
    }

    return string;
};

/**
 * @param event
 */
TreeBuilder.checkParent = function(event) {
    if (TreeBuilder.componentsList[TreeBuilder.count-1].level < event.level) {
        TreeBuilder.parent = TreeBuilder.count-1;
    }

    // Check if the last item was a on a deep level
    if (TreeBuilder.componentsList[TreeBuilder.count-1].level > event.level) {
        // And check if the current item is a brother of others items in the same level
        var brother = TreeBuilder.checkBrother(TreeBuilder.componentsList[TreeBuilder.count-1], event.level);
        if (brother != false) {
            TreeBuilder.parent = brother.parent;
        }
    }

    TreeBuilder.componentsList[TreeBuilder.count-1]['nextLevel'] = event.level;
};

/**
 * Build the tree of dependencies.
 *
 * @param {Array} pageFolders
 * @param {Array} componentFolders
 */
TreeBuilder.build = function(pageFolders, componentFolders) {
    Parser.emitter.on('FETCH_DEPENDENCY.SUCCESS', function(event) {
        if (TreeBuilder.componentsList[TreeBuilder.count-1] !== undefined) {
            TreeBuilder.checkParent(event);
        }

        if (TreeBuilder.levels[TreeBuilder.parent] == undefined) {
            TreeBuilder.levels[TreeBuilder.parent] = 0;
        }

        TreeBuilder.levels[TreeBuilder.parent] += 1;

        TreeBuilder.componentsList[TreeBuilder.count] = {
            'level': event.level,
            'nextLevel': 0,
            parent: TreeBuilder.parent,
            'name': event.componentName,
            'master': typeof event.master !== 'undefined' ? event.master : false
        };
        TreeBuilder.count++;
    });

    Parser.parseComponents(pageFolders, componentFolders);

    var output = '';

    for (var componentK in TreeBuilder.componentsList) {
        var component = TreeBuilder.componentsList[componentK];

        if (component.level == 1 ) {
            output += "\n";
            output += "\n"+pad('', 30, ' ').bgGreen;
            output += "\n"+pad('Page : ' + component.name, 30).bgGreen.black;
            output += "\n"+pad('', 30, ' ').bgGreen;
        } else {
            // Si le précédent est son frère
            if (TreeBuilder.componentsList[component.parent] != undefined) {
                TreeBuilder.levels[component.parent] -= 1;
            }
            var symbol = '\u2514';
            if (component.nextLevel == component.level
                || (component.nextLevel > component.level && TreeBuilder.levels[component.parent] > 0)) {
                symbol = '\u251c';
            }
            output += "\n" + (TreeBuilder.displayBranch(component) + symbol + '\u2500\u2500 ').green + component.name + (component.master ? ' (master-component)' : '');
        }
    }

    gutil.log(output);
};

module.exports = TreeBuilder;