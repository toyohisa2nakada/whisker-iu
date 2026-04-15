"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEqualityAssertion = exports.js = exports.escaped = exports.WhiskerAssertion = void 0;
const Arrays_1 = __importDefault(require("../../utils/Arrays"));
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
class WhiskerAssertion {
    constructor(target, cloneIndex) {
        this._target = target;
        this._cloneIndex = cloneIndex;
    }
    getTarget() {
        return this._target;
    }
    getTargetName() {
        if (this._target.isStage) {
            return "Stage";
        }
        else if (this._target.isOriginal) {
            return `Sprite ${this._target.getName()}`;
        }
        else {
            return `Clone ${this._cloneIndex} of ${this._target.getName()}`;
        }
    }
    getTargetAccessor() {
        if (this._target.isStage) {
            return "t.getStage()";
        }
        else if (this._target.isOriginal) {
            return `t.getSprite("${this._target.getName()}")`;
        }
        else {
            return `t.getSprite("${this._target.getName()}").getClone(${this._cloneIndex})`;
        }
    }
}
exports.WhiskerAssertion = WhiskerAssertion;
function escaped(value) {
    if (value.toString() === "Infinity") {
        return "Infinity";
    }
    else if (value.toString() === 'NaN') {
        return "NaN";
    }
    let jsonString = JSON.stringify(value);
    if (jsonString.charAt(0) == '"') {
        jsonString = jsonString.slice(1, -1);
    }
    return jsonString;
}
exports.escaped = escaped;
function js(strings, ...keys) {
    let str = '';
    let openedString = false;
    for (let i = 0; i < strings.length - 1; i++) {
        if (strings[i].includes('"')) {
            openedString = !openedString;
        }
        if (openedString) {
            // Make sure we properly escape interpolated variables when a string has been opened before.
            str += strings[i] + escaped(keys[i]);
        }
        else {
            str += strings[i] + keys[i];
        }
    }
    return str + Arrays_1.default.last(strings.raw);
}
exports.js = js;
/**
 * As many assertion types are equality assertions with the left value being a block
 * and the right value being a fixed value, this function generates a block construct
 * to represent such equality assertions.
 */
function generateEqualityAssertion(leftBlockId, rightValue) {
    const assertEqualsBlockId = (0, uid_1.default)();
    const assertEqualsBlockAId = (0, uid_1.default)();
    const assertEqualsBlockBId = (0, uid_1.default)();
    const assertEqualsBlock = {
        "id": assertEqualsBlockId,
        "opcode": "bbt_assertEquals",
        "inputs": {
            "A": {
                "name": "A",
                "block": leftBlockId,
                "shadow": assertEqualsBlockAId
            },
            "B": {
                "name": "B",
                "block": assertEqualsBlockBId,
                "shadow": assertEqualsBlockBId
            }
        },
        "fields": {},
        "next": null,
        "topLevel": false,
        "parent": null,
        "shadow": false,
        "breakpoint": false
    };
    const assertEqualsBlockA = {
        "id": assertEqualsBlockAId,
        "opcode": "text",
        "inputs": {},
        "fields": {
            "TEXT": {
                "name": "TEXT",
                "value": ""
            }
        },
        "next": null,
        "topLevel": true,
        "parent": null,
        "shadow": true,
        "breakpoint": false
    };
    const assertEqualsBlockB = {
        "id": assertEqualsBlockBId,
        "opcode": "text",
        "inputs": {},
        "fields": {
            "TEXT": {
                "name": "TEXT",
                "value": rightValue
            }
        },
        "next": null,
        "topLevel": false,
        "parent": assertEqualsBlockId,
        "shadow": true,
        "breakpoint": false
    };
    return [assertEqualsBlock, assertEqualsBlockA, assertEqualsBlockB];
}
exports.generateEqualityAssertion = generateEqualityAssertion;
