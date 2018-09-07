import * as _ from 'lodash';
import Fuse from 'fuse.js';

/**
 * Method performs search
 * @param {Array} objects is a array of objects where we should search
 * @param {Array} keys is a array of object keys to serach in
 * @param {String} value is a search phrase
 * @param {Object} [options={}] is a set of custom options to override default
 * @returns {Array} of found elements
 */
export function fuzzySearch (objects, keys, value, options = {}) {  // eslint-disable-line max-params
    const defaultOptions = {
        shouldSort         : true,
        tokenize           : true,
        matchAllTokens     : true,
        includeScore       : true,
        threshold          : 0,
        location           : 0,
        distance           : 100,
        maxPatternLength   : 32,
        minMatchCharLength : 3,
        keys // pass keys name, example ['firstName', 'data.type']
    };

    const fuseOptions = _.assign({}, defaultOptions, options);

    // if provided search string is empty - return original results
    if (!value) {
        return objects;
    }

    const fuse = new Fuse(objects, fuseOptions);
    // object structure is different if score is true
    return _.map(fuse.search(value), 'item');
}

// eslint-disable-next-line valid-jsdoc
/**
 * Present text-expression value in readable form
 * @param {string} [value=''] value to present
 * @param {{mergeTagLeftWrapper: string, mergeTagRightWrapper: string}} [options={}]
 * @returns {string} readable presentation for text-expression
 */
export function getReadableTextExpression (value = '', options) {
    const mergeTagLeftWrapper = _.get(options, 'mergeTagLeftWrapper', '{');
    const mergeTagRightWrapper = _.get(options, 'mergeTagRightWrapper', '}');
    return _.chain(value)
        .replace(/^[`'"](.*)[`'"]$/g, '$1')
        .replace(/\$\{this\.get\([`'"](.*)[`'"]\)\}/g, `${mergeTagLeftWrapper}$1${mergeTagRightWrapper}`)
        .value();
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
export function looseEqual(a, b) {
    // eslint-disable-next-line eqeqeq
    return a == b || (
        isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false
    );
}

/**
 * Check if a val exists in arr using looseEqual comparison
 */
export function looseIndexOf(arr, val) {
    for (let i = 0; i < arr.length; i++) {
        if (looseEqual(arr[i], val)) {
            return i;
        }
    }

    return -1;
}

export function inView (element, container) {
    if (!element) {
        return;
    }

    container = container || element.parentElement;

    const top = element.offsetTop;
    const parentTop = container.scrollTop;
    const bottom = top + element.offsetHeight;
    const parentBottom = container.offsetHeight;

    return top >= parentTop && bottom <= parentBottom;
}

export function scrollIntoView(element, options = { container: null, marginTop: 0 }) {
    if (!element) {
        return;
    }

    options.container = options.container || element.parentElement;

    if (inView(element, options.container)) {
        return;
    }

    options.container.scrollTop = element.offsetTop - options.marginTop;
}

export function resetScroll(element) {
    if (!element) {
        return;
    }

    element.scrollTop = 0;
}
