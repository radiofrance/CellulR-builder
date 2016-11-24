"use strict";

var fs = require('fs');
var pathLib = require('path');
var gutil = require('gulp-util');
var pad = require('pad');
var Collector = require('./component/collector');
var TreeBuilder = require('./component/treeBuilder');
var Utils = require('./component/utils');

var Runner =  {
    types: {
        CSS: 'less/%s.less',
        JS: 'js/%s.js'
    }
};

/**
 * Get dependencies files.
 *
 * @see Collector::find()
 *
 * @param {Array} pageFolders
 * @param {Array} componentFolders
 * @param {string} type Is the type of files to search in the component
 * @returns {Collector.dependenciesFiles|{}}
 */
Runner.getFiles = function(pageFolders, componentFolders, type) {
    return Collector.find(pageFolders, componentFolders, type);
};

/**
 * Show the dependencies tree.
 *
 * @see TreeBuilder::build()
 *
 * @param {Array} pageFolders
 * @param {Array} componentFolders
 */
Runner.showTree = function(pageFolders, componentFolders) {
    return TreeBuilder.build(pageFolders, componentFolders);
};

/**
 * Create the compiled file with all LESS dependencies.
 *
 * @param {string} path
 * @param {string} filename
 * @param {Array}  lessFiles
 * @returns {string} Path to the compiled file
 */
Runner.writeInLessFile = function (path, filename, lessFiles) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        fs.mkdir(path);
    }

    var output = '',
        compiledFilename = path+'/'+filename+'.less';

    Utils.removeFileIfExists(compiledFilename);

    for (var lessKey in lessFiles) {
        var less = lessFiles[lessKey];
        var relativePath = pathLib.relative(pathLib.resolve(path), pathLib.resolve(less));
        output += '@import "'+relativePath+'";'+"\n";
    }

    fs.appendFile(compiledFilename, output);

    return compiledFilename;
};

/**
 * Create the compiled file with all JS dependencies.
 *
 * @param {string} path
 * @param {string} filename
 * @param {Array}  JSFiles
 * @returns {string} Path to the compiled file
 */
Runner.writeInJSFile = function (path, filename, JSFiles) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        fs.mkdir(path);
    }

    var output = '',
        compiledFilename = path+'/'+filename+'.js';

    Utils.removeFileIfExists(compiledFilename);

    for (var JSKey in JSFiles) {
        var js = JSFiles[JSKey];
        var relativePath = pathLib.relative(pathLib.resolve(path), pathLib.resolve(js));
        output += 'require(\''+relativePath+'\');'+"\n";
    }

    fs.appendFile(compiledFilename, output);

    return compiledFilename;
};

// TODO: Refacto and rebuild for the v3
Runner.validateComponentDependencies = function(folder, componentName, componentsNotInTemplate) {

    //right strim /
    var rtrimFolder = folder.replace(/\/+$/,"");
    var componentFile = rtrimFolder + '/' + componentName + '/component.json';

    try {
        fs.accessSync(componentFile, fs.R_OK);
    } catch (e) {
        return false;
    }

    var definition = require(componentFile),
        componentTemplateName = Utils.getTemplateName(componentName),
        errorFound = false,
        templatefile = rtrimFolder + '/' + componentName + '/' + componentTemplateName;
    var requireFromTemplate = Utils.parseTemplateFileDependencies(templatefile),
        requireList = requireFromTemplate.concat(componentsNotInTemplate);
    var fullListWithDouble = requireList.concat(Object.keys(definition.require));
    var fullList = fullListWithDouble.filter(function(elem, pos) {
        return fullListWithDouble.indexOf(elem) == pos;
    });

    var templateListColumnLength = Utils.getMaxLength(requireList, ['Template']) + 2,
        jsonListColumnLength = Utils.getMaxLength(Object.keys(definition.require), ['Json']) + 2;

    if (requireList.length > 0) {
        for (var component in requireList) {
            if (!Utils.findOne(Object.keys(definition.require),[requireList[component]])) {
                errorFound = true;
                // gutil.log('In component ' + '%s'.cyan + ' ' + '%s'.magenta + ' was used in template but ' + 'not defined in '.red + 'composer.json'.yellow, componentName, requireList[component]);
            }
        }
    }
    if (Object.keys(definition.require).length > 0) {
        Object.keys(definition.require).map(function (subComponent) {
            if (!Utils.findOne(requireList,[subComponent])) {
                errorFound = true;
                // gutil.log('In component ' + '%s'.cyan + ' ' + '%s'.magenta + ' was defined but ' + 'not use in '.red + 'template'.yellow, componentName, subComponent);
            }
        });
    }
    if (!errorFound) {
        gutil.log('No error detected in '.green + '%s'.cyan + ' component'.green, componentName);
    } else {
        var separationLine = '|' + "-".repeat(jsonListColumnLength) + '|' + "-".repeat(templateListColumnLength) + '|';
        var line = '|' + Utils.writeCase('Json', jsonListColumnLength) + '|' + Utils.writeCase('Template', templateListColumnLength) + '|';
        gutil.log(componentName.red);
        gutil.log(separationLine);
        gutil.log(line);
        gutil.log(separationLine);
        fullList.map(function(element) {
            var columnJson = '',
                columnTemplate = '';
            if (Utils.findOne(Object.keys(definition.require),[element])) {
                columnJson = element;
            }
            if (Utils.findOne(requireList,[element])) {
                columnTemplate = element;
            }
            var line = '|' + Utils.writeCase(columnJson, jsonListColumnLength) + '|' + Utils.writeCase(columnTemplate, templateListColumnLength) + '|';
            gutil.log(line);
        });
        gutil.log(separationLine);
    }
};

String.prototype.repeat= function(n){
    n = n || 1;

    return Array(n+1).join(this);
};

module.exports = Runner;