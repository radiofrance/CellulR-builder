"use strict";

var EventEmitter = require('events');
var fs = require('fs');

var Parser = {
    emitter: new EventEmitter()
};

/**
 * Search components in a list of folders.
 * First element in the folder as the priority on next.
 *
 * @param {Array} pageFolders - list of folders to search page component
 * @param {Array} componentFolders - list of folders to search component
 */
Parser.parseComponents = function(pageFolders, componentFolders) {
    for (var kFolder in pageFolders) {
        var folder = pageFolders[kFolder],
            files = fs.readdirSync(folder)
            ;

        for (var kFile in files) {
            var file = files[kFile],
                level = 0,
                stats = fs.lstatSync(folder+file);

            if (stats === undefined || !stats.isDirectory()) {
                continue;
            }

            Parser.emitter.emit('FETCH_PAGE.SUCCESS', {file: file});

            Parser.parseDependencies(folder, file, file, componentFolders, level);
        }
    }
};

/**
 * Search dependencies in the component.json file definition.
 * This method is used recursively.
 *
 * @param {string} folder - folder of the component
 * @param {Array} componentFolders - list of folders to search component
 * @param {string} componentName - name of the component in where it search dependencies
 * @param {string} page - name of the root page component
 * @param {int} level - level in tree
 */
Parser.parseDependencies = function (folder, componentName, page, componentFolders, level) {
    level = level + 1;
    var componentFile = folder + componentName + '/component.json',
        event = {
            'folder': folder,
            'componentName': componentName,
            'page': page,
            'componentFolders': componentFolders,
            'level': level
        };

    try {
        fs.accessSync(componentFile, fs.R_OK);
    } catch (e) {
        Parser.emitter.emit('FETCH_DEPENDENCY.FAIL', event);
        return false;
    }
    var definition = require(componentFile);

    // Check whether the WC is a master component
    if (typeof definition.master !== 'undefined') {
        event.master = definition.master;
    }

    Parser.emitter.emit('FETCH_DEPENDENCY.SUCCESS', event);

    if (Object.keys(definition.require).length > 0) {
        Object.keys(definition.require).map(function (subComponent) {
            for (var kFolder in componentFolders) {
                var componentFolder = componentFolders[kFolder];
                Parser.parseDependencies(componentFolder, subComponent, page, componentFolders, level);
            }
        })
    }
};

module.exports = Parser;