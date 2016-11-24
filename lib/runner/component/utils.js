"use strict";

var fs = require('fs');

var Utils = {};

/**
 * @param {string} filename
 */
Utils.removeFileIfExists = function (filename) {
    try {
        fs.accessSync(filename, fs.F_OK);
        fs.unlink(filename);
    } catch (e) {
    }
};

/**
 * @param {string} element
 * @param {int} maxLength
 * @returns {string}
 */
Utils.writeCase = function (element, maxLength) {
    return ' ' + element + ' '.repeat(maxLength - element.length - 1);
};

/**
 * @param {string} element
 * @param {int} maxLength
 * @returns {int[]}
 */
Utils.getStartEndLength = function (element, maxLength) {
    var spaceElementLine = maxLength - element.length,
        startLine = Math.floor(spaceElementLine/2) + spaceElementLine % 2 ,
        endLine = Math.floor(spaceElementLine/2)
    ;

    return [startLine, endLine];
};

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {int}
 */
Utils.getMaxLength = function (arr1, arr2) {
    var arr = arr1.concat(arr2);
    var longest = arr.sort(function (a, b) { return b.length - a.length; })[0];

    if (undefined !== longest) {
        return longest.length;
    }

    return 0;
};

/**
 * Determine if an array contains one or more items from another array.
 *
 * @param {Array} haystack the array to search.
 * @param {Array} arr the array providing items to check for in the haystack.
 * @return {boolean} true|false if haystack contains at least one item from arr.
 */
Utils.findOne = function (haystack, arr) {
    return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
    });
};

/**
 * Get the template name given a component name.
 *
 * @param {string} componentName
 * @returns {string}
 */
Utils.getTemplateName = function(componentName) {
    return Utils.camelToSnakeCase(componentName) + '.html.twig';
};

/**
 * Get the component dependencies required in the given template.
 *
 * @param {string} file
 * @returns {Array.<*>}
 */
Utils.parseTemplateFileDependencies = function(file) {
    var content = fs.readFileSync(file).tostring();
    var requireList = [];
    var regex = /view_object\('(\w+)'\)/gmi;
    var matche;

    while ((matche = regex.exec(content)) !== null) {
        if (matche.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        requireList = requireList.concat([Utils.getComponentNameFromTemplateFunction(matche[0].slice(0,-1))]);
    }

    return requireList.filter(function(elem, pos) {
        return requireList.indexOf(elem) == pos;
    });
};

/**
 * Get the component name from the template function name (wc_component_name => ComponentName).
 *
 * @param {string} templateFunctionName - template function name like wc_component_name
 * @returns {*}
 */
Utils.getComponentNameFromTemplateFunction = function(templateFunctionName) {
    return Utils.snakeToCamelCase(templateFunctionName.slice(3));
};

/**
 * Right trim function.
 *
 * @param {string} stringToTrim
 * @returns {string}
 */
Utils.rTrim = function(stringToTrim){
    return stringToTrim.replace(/\s+$/,"");
};

/**
 * Converts a snake case string to a camel case string.
 *
 * @param {string} snakeCaseString
 * @returns {string}
 */
Utils.snakeToCamelCase = function(snakeCaseString){
    var camelCase = snakeCaseString.replace(/(\_\w)/g, function(m){return m[1].toUpperCase();});

    return camelCase[0].toUpperCase() + camelCase.slice(1);
};

/**
 * Converts a camel case string to a snake case string.
 *
 * @param {string} camelCaseString
 * @returns {string}
 */
Utils.camelToSnakeCase = function(camelCaseString){
    return camelCaseString.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "");
};

module.exports = Utils;