"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapObject = exports.deepFreeze = exports.empty = exports.deepCopy = void 0;
/**
 * Creates a deep copy of the given object. Note: the copy is only lossless if the object is plain JSON data.
 *
 * @param object the object to copy
 * @param replacer an optional replacer function passed to JSON.stringify
 */
function deepCopy(object, replacer = null) {
    return JSON.parse(JSON.stringify(object, replacer));
}
exports.deepCopy = deepCopy;
function empty() {
    return Object.create(null);
}
exports.empty = empty;
/**
 * Like `Object.freeze` but also freezes nested objects in `o` recursively.
 *
 * @param o the object to deep-freeze
 * @return the object that was passed to the function
 */
// Credit goes to https://stackoverflow.com/a/34776962
function deepFreeze(o) {
    Object.freeze(o);
    if (o === undefined) {
        return o;
    }
    Object.getOwnPropertyNames(o).forEach(function (prop) {
        if (o[prop] !== null
            && (typeof o[prop] === "object" || typeof o[prop] === "function")
            && !Object.isFrozen(o[prop])) {
            deepFreeze(o[prop]);
        }
    });
    return o;
}
exports.deepFreeze = deepFreeze;
/**
 * Similar to `Array.prototype.map` but for objects in general.
 *
 * @param o the object to map
 * @param f the mapping function
 */
function mapObject(o, f) {
    const result = empty();
    for (const [key, value] of Object.entries(o)) {
        result[key] = f(value, key);
    }
    return result;
}
exports.mapObject = mapObject;
