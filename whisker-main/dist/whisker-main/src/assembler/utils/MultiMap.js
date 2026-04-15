"use strict";
// A MultiMap implementation for JavaScript inspired by Google Guava's MultiMap
// https://guava.dev/releases/23.0/api/docs/com/google/common/collect/Multimap.html
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiMap = void 0;
class MultiMap {
    constructor(entries) {
        this._map = new Map();
        if (entries) {
            for (const [key, value] of entries) {
                this.set(key, value);
            }
        }
    }
    get(key) {
        return new Set(this._map.get(key));
    }
    has(key, value) {
        const hasKey = this._map.has(key);
        if (!value) {
            return hasKey;
        }
        return hasKey && this._map.get(key).has(value);
    }
    set(key, value) {
        if (this._map.has(key)) {
            this._map.get(key).add(value);
        }
        else {
            this._map.set(key, new Set([value]));
        }
        return this;
    }
    setAll(key, values) {
        for (const value of values) {
            this.set(key, value);
        }
        return this;
    }
    get size() {
        return [...this._map.values()].reduce((size, currSet) => size + currSet.size, 0);
    }
    [Symbol.iterator]() {
        return (function* () {
            for (const key of this._map.keys()) {
                for (const value of this._map.get(key)) {
                    yield [key, value];
                }
            }
        }).bind(this)();
    }
    clear() {
        this._map.clear();
    }
    delete(key, value) {
        if (!value) {
            return this._map.delete(key);
        }
        const wasPresent = this._map.has(key) && this._map.get(key).delete(value);
        if (wasPresent && this._map.get(key).size === 0) {
            this._map.delete(key);
        }
        return wasPresent;
    }
    entries() {
        return this[Symbol.iterator]();
    }
    forEach(action) {
        for (const [key, value] of this) {
            action(key, value);
        }
    }
    keys() {
        return this._map.keys();
    }
    values() {
        return (function* () {
            for (const values of this._map.values()) {
                for (const value of values) {
                    yield value;
                }
            }
        }).bind(this)();
    }
}
exports.MultiMap = MultiMap;
