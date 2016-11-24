"use strict";

var fs = require('fs');
var Parser = require('./parser');

var Collector = {
    dependenciesFiles: {},
    dependenciesMasterFiles: [],
    type: undefined
};

/**
 * Get the components files (less or JS) needed with their hierarchy.
 *
 * @param {Array} pageFolders
 * @param {Array} componentFolders
 * @param {string} type Is the type of files to search in the component
 * @returns {Collector.dependenciesFiles|{}}
 */
Collector.find = function(pageFolders, componentFolders, type) {
    Collector.type = type;
    // Reinit this in case of this script is called twice at time
    Collector.dependenciesFiles = {};
    Collector.dependenciesMasterFiles = [];


    // Subscribe to 'FETCH_PAGE.SUCCESS' event
    Parser.emitter.on('FETCH_PAGE.SUCCESS', function(event) {
        // Init key in dependenciesFiles for page
        if (Collector.dependenciesFiles[event.file] === undefined) {
            Collector.dependenciesFiles[event.file] = [];
        }
    });

    // Subscribe to 'FETCH_DEPENDENCY.SUCCESS' event
    Parser.emitter.on('FETCH_DEPENDENCY.SUCCESS', function(event) {
        var filename = event.folder +'/'+ event.componentName + '/' + Collector.type,
            index = Collector.dependenciesFiles[event.page].indexOf(filename);

        if (typeof event.master !== 'undefined') {
            if (Collector.dependenciesMasterFiles.indexOf(filename) < 0) {
                try {
                    fs.accessSync(filename, fs.F_OK);

                    Collector.dependenciesMasterFiles.push(filename);
                } catch (e) {
                }
            }
        }

        //Remove duplicate file for the same page
        if (index >= 0) {
            Collector.dependenciesFiles[event.page].splice(index, 1);
        }

        try {
            fs.accessSync(filename, fs.R_OK);
            // When an already added components is re-added,
            // It is removed to its position and replace at the top of the dependencies.
            Collector.removeExists(filename, event.page);
            Collector.dependenciesFiles[event.page].unshift(filename);
        } catch (e) {
        }
    });

    Parser.parseComponents(pageFolders, componentFolders, type);

    var files = [];

    for (var i in Collector.dependenciesMasterFiles) {
        files.push(Collector.dependenciesMasterFiles[i]);
    }

    for (var i in Collector.dependenciesFiles) {
        var tmp = Collector.dependenciesFiles[i].filter(function(i) {
            return Collector.dependenciesMasterFiles.indexOf(i) < 0;
        });
        if (tmp.length > 0) {
            tmp.map(function(el) {
                files.push(el);
            });
        }
    }

    // Delete duplicate content
    Collector.dependenciesFiles = files.filter(function(el, pos) {
        return files.indexOf(el) == pos;
    });

    return Collector.dependenciesFiles;
};

/**
 * Remove a file in the array of dependencies files.
 *
 * @param {string} filename - file of the component
 * @param {string} currentPage - name of the root page component
 */
Collector.removeExists = function (filename, currentPage) {
    if (Collector.dependenciesFiles[currentPage].indexOf(filename) >= 0) {
        Collector.dependenciesFiles[currentPage].splice(Collector.dependenciesFiles[currentPage].indexOf(filename), 1);
    }
};

module.exports = Collector;