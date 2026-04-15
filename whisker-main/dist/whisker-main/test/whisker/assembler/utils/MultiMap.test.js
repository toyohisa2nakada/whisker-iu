"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MultiMap_1 = require("../../../../src/assembler/utils/MultiMap");
const globals_1 = require("@jest/globals");
describe("Constructing a new map", () => {
    test("without arguments creates an empty map", () => {
        const map = new MultiMap_1.MultiMap();
        (0, globals_1.expect)(map.size).toEqual(0);
        const entries = [...map.entries()];
        (0, globals_1.expect)(entries).toStrictEqual([]);
    });
    test("with an empty iterable creates an empty map", () => {
        const map = new MultiMap_1.MultiMap([]);
        (0, globals_1.expect)(map.size).toEqual(0);
        const entries = [...map.entries()];
        (0, globals_1.expect)(entries).toStrictEqual([]);
    });
    test("with a non-empty iterable inserts all items", () => {
        const entries = [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 5],
        ];
        const map = new MultiMap_1.MultiMap(entries);
        (0, globals_1.expect)(map.size).toEqual(entries.length);
        (0, globals_1.expect)([...map.entries()]).toStrictEqual(entries);
    });
    test("with an iterable containing duplicates eliminates them", () => {
        const entry = [1, 2];
        const duplicates = [entry, entry, entry];
        const map = new MultiMap_1.MultiMap(duplicates);
        (0, globals_1.expect)(map.size).toEqual(1);
        (0, globals_1.expect)([...map.entries()]).toEqual([entry]);
    });
    test("with a map itself acts as copy-constructor", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [3, 4], [1, 3], [1, 4], [4, 7]]);
        const copy = new MultiMap_1.MultiMap(map);
        (0, globals_1.expect)(map).toStrictEqual(copy);
        (0, globals_1.expect)(map).not.toBe(copy);
    });
});
describe("Getting", () => {
    test("a non-existent key returns empty set", () => {
        const empty = new MultiMap_1.MultiMap().get("nix");
        (0, globals_1.expect)(empty).toStrictEqual(new Set());
    });
    test("an existing key returns the associated set", () => {
        const map = new MultiMap_1.MultiMap([[1, "one"], [1, "one"], [1, "eins"]]);
        const values = map.get(1);
        (0, globals_1.expect)(values).toStrictEqual(new Set(["one", "eins"]));
    });
    test("the values of a key returns a defensive copy of the set", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [3, 4]]);
        const before = new MultiMap_1.MultiMap(map);
        const backingSet = map.get(1);
        backingSet.add(42);
        (0, globals_1.expect)(map).toStrictEqual(before);
    });
});
describe("Checking a key for existence", () => {
    test("always returns false for the empty map", () => {
        const empty = new MultiMap_1.MultiMap();
        (0, globals_1.expect)(empty.has("an arbitrary key")).toBeFalsy();
    });
    test("return false when the key is not present", () => {
        const map = new MultiMap_1.MultiMap([["key", "value"]]);
        (0, globals_1.expect)(map.has("value")).toBeFalsy();
    });
    test("return true when the key is present", () => {
        const map = new MultiMap_1.MultiMap([["key", "value"]]);
        (0, globals_1.expect)(map.has("key")).toBeTruthy();
    });
});
describe("Checking a key-value pair for existence", () => {
    test("always returns false for the empty map", () => {
        const empty = new MultiMap_1.MultiMap();
        (0, globals_1.expect)(empty.has("an arbitrary key", "with a value")).toBeFalsy();
    });
    test("return false when the key is not present", () => {
        const map = new MultiMap_1.MultiMap([["key", "value"]]);
        (0, globals_1.expect)(map.has("value", "key")).toBeFalsy();
    });
    test("return false when the value for the key is not present", () => {
        const map = new MultiMap_1.MultiMap([["key", "value"]]);
        (0, globals_1.expect)(map.has("key", "key")).toBeFalsy();
    });
    test("return true when the key-value pair is present", () => {
        const map = new MultiMap_1.MultiMap([["key", "value"]]);
        (0, globals_1.expect)(map.has("key", "value")).toBeTruthy();
    });
});
describe("Adding a key-value pair", () => {
    test("creates a new multi-mapping if it doesn't exist yet", () => {
        const map = new MultiMap_1.MultiMap();
        map.set("answer", 42);
        (0, globals_1.expect)(map.get("answer")).toEqual(new Set([42]));
    });
    test("updates the multi-mapping if one already exists", () => {
        const map = new MultiMap_1.MultiMap([["answer", 42]]);
        map.set("answer", 23);
        (0, globals_1.expect)(map.get("answer")).toEqual(new Set([42, 23]));
    });
    test("doesn't introduce duplicates", () => {
        const entry = [1, 2];
        const map = new MultiMap_1.MultiMap([entry]);
        map.set(...entry);
        (0, globals_1.expect)(map.size).toStrictEqual(1);
    });
});
describe("Adding multiple values for a single key", () => {
    test("doesn't change the map if the values are empty", () => {
        const entries = [[1, 2], [2, 4], [4, 8]];
        const map = new MultiMap_1.MultiMap(entries);
        map.setAll(1, []);
        (0, globals_1.expect)([...map.entries()]).toStrictEqual(entries);
    });
    test("creates a new mapping when the key doesn't exist yet", () => {
        const entries = [[1, 2], [1, 3], [1, 4]];
        const map = new MultiMap_1.MultiMap();
        map.setAll(1, [2, 3, 4]);
        (0, globals_1.expect)([...map.entries()]).toStrictEqual(entries);
    });
    test("updates the mapping if the key exists", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [1, 3]]);
        map.setAll(1, [4, 4, 5]);
        (0, globals_1.expect)([...map.entries()]).toStrictEqual([[1, 2], [1, 3], [1, 4], [1, 5]]);
    });
});
describe("The size property", () => {
    test("is 0 for the empty map", () => {
        (0, globals_1.expect)(new MultiMap_1.MultiMap().size).toStrictEqual(0);
    });
    test("tells the number of key-value mappings", () => {
        const mappings = [
            [1, 2],
            [3, 4],
            [1, 3],
            [1, 4],
            [4, 7],
        ];
        const size = mappings.length;
        const map = new MultiMap_1.MultiMap(mappings);
        (0, globals_1.expect)(map.size).toEqual(size);
    });
});
describe("The iterator", () => {
    test("is empty for the empty map", () => {
        const map = new MultiMap_1.MultiMap();
        (0, globals_1.expect)([...map]).toStrictEqual([]);
    });
    test("returns all key-value pairs in the map", () => {
        const mappings = [
            [1, 2],
            [3, 4],
            [1, 3],
            [1, 4],
            [4, 7],
        ];
        const map = new MultiMap_1.MultiMap(mappings);
        (0, globals_1.expect)(new Set(map)).toStrictEqual(new Set(mappings));
    });
});
describe("Clearing", () => {
    test("the empty map is idempotent", () => {
        const map = new MultiMap_1.MultiMap();
        map.clear();
        (0, globals_1.expect)(map).toStrictEqual(new MultiMap_1.MultiMap());
    });
    test("a non-empty map removes all entries", () => {
        const mappings = [
            [1, 2],
            [3, 4],
            [1, 3],
            [1, 4],
            [4, 7],
        ];
        const map = new MultiMap_1.MultiMap(mappings);
        map.clear();
        (0, globals_1.expect)(map).toStrictEqual(new MultiMap_1.MultiMap());
    });
});
describe("Deleting", () => {
    test("a key that doesn't exist doesn't change anything", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [3, 4], [1, 3], [1, 4], [4, 7]]);
        const copy = new MultiMap_1.MultiMap(map);
        map.delete("this key does not exist");
        (0, globals_1.expect)(map).toStrictEqual(copy);
    });
    test("a key that exists removes all values associated", () => {
        const map = new MultiMap_1.MultiMap();
        const even = [0, 2, 4, 6, 8];
        const odd = [1, 3, 5, 7, 9];
        map.setAll("even", even);
        map.setAll("prime", [2, 3, 5, 7, 11, 13, 17, 19]);
        map.setAll("odd", odd);
        const expected = new MultiMap_1.MultiMap();
        expected.setAll("even", even);
        expected.setAll("odd", odd);
        map.delete("prime");
        (0, globals_1.expect)(map).toStrictEqual(expected);
    });
    test("a key-value pair that doesn't exist doesn't change anything", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [3, 4]]);
        const copy = new MultiMap_1.MultiMap(map);
        map.delete(3, 5);
        (0, globals_1.expect)(map).toStrictEqual(copy);
    });
    test("a key-value pair that exists removes it", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [3, 4]]);
        const expected = new MultiMap_1.MultiMap([[1, 2]]);
        map.delete(3, 4);
        (0, globals_1.expect)(map).toStrictEqual(expected);
    });
    test("the last value associated with a key also deletes the key", () => {
        const map = new MultiMap_1.MultiMap([[1, 2]]);
        map.delete(1, 2);
        (0, globals_1.expect)(map.has(1)).toBeFalsy();
        (0, globals_1.expect)([...map.keys()]).not.toContain(1);
    });
});
describe("The entries", () => {
    test("of the empty map are empty", () => {
        (0, globals_1.expect)([...new MultiMap_1.MultiMap().entries()]).toStrictEqual([]);
    });
    test("of the non-empty map return all key-value pairs", () => {
        const entries = [[1, 2], [3, 4]];
        const map = new MultiMap_1.MultiMap(entries);
        (0, globals_1.expect)([...map.entries()]).toEqual(entries);
    });
});
describe("The forEach function", () => {
    test("executes the given action for each key-value pair in the map", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [3, 4], [1, 3], [1, 4], [4, 7]]);
        const empty = new MultiMap_1.MultiMap();
        map.forEach((key, value) => empty.set(key, value));
        (0, globals_1.expect)(empty).toStrictEqual(map);
    });
    test("does not execute the callback when the map is empty", () => {
        const empty = new MultiMap_1.MultiMap();
        let executed = false;
        empty.forEach(() => {
            executed = true;
        });
        (0, globals_1.expect)(executed).toBeFalsy();
    });
});
describe("The keys", () => {
    test("of the empty map are empty", () => {
        const empty = new MultiMap_1.MultiMap();
        (0, globals_1.expect)([...empty.keys()]).toStrictEqual([]);
    });
    test("of the non-empty map are properly returned", () => {
        const keys = new Set([1, 2, 3, 4]);
        const map = new MultiMap_1.MultiMap();
        keys.forEach((key) => map.set(key, "value"));
        (0, globals_1.expect)(new Set(map.keys())).toStrictEqual(keys);
    });
    test("do not contain duplicates", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [1, 3]]);
        (0, globals_1.expect)([...map.keys()]).toStrictEqual([1]);
    });
});
describe("The values", () => {
    test("of the empty map are empty", () => {
        const map = new MultiMap_1.MultiMap();
        (0, globals_1.expect)([...map.values()]).toStrictEqual([]);
    });
    test("of the non-empty map are taken from all key-value pairs", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [3, 4]]);
        (0, globals_1.expect)([...map.values()]).toStrictEqual([2, 4]);
    });
    test("can contain duplicates across different keys", () => {
        const map = new MultiMap_1.MultiMap([[1, 2], [2, 2]]);
        (0, globals_1.expect)([...map.values()]).toStrictEqual([2, 2]);
    });
});
test("Adding and deleting the same key-value pair reverts to the original state", () => {
    const map = new MultiMap_1.MultiMap();
    const original = new MultiMap_1.MultiMap(map);
    map.set(1, 2).delete(1, 2);
    (0, globals_1.expect)(map).toStrictEqual(original);
});
