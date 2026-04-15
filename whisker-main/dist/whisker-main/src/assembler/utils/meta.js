"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLastID = exports.toBlockMeta = exports.emptyInputMeta = exports.emptyBlockMeta = void 0;
const Inputs_1 = require("../blocks/Inputs");
const blocks_1 = require("./blocks");
const Objects_1 = require("./Objects");
function emptyBlockMeta(rootID, lastID) {
    return Object.assign({ type: "Block", rootID,
        lastID }, emptyMeta());
}
exports.emptyBlockMeta = emptyBlockMeta;
function emptyInputMeta(input, shadow, obscured) {
    return Object.assign({ type: "Input", input, shadow, obscured }, emptyMeta());
}
exports.emptyInputMeta = emptyInputMeta;
function toBlockMeta(inputMeta) {
    const blockIDs = (0, blocks_1.getBlockIDs)(inputMeta.input);
    if (blockIDs.length === 0) {
        throw new Error("Cannot convert input metadata to block metadata because the input is not a block");
    }
    const [rootID] = blockIDs;
    const lastID = findLastID(rootID, inputMeta.blocks);
    const blockMeta = Object.assign(Object.assign({}, inputMeta), { rootID,
        lastID, type: "Block" });
    delete blockMeta.input;
    return (0, Objects_1.deepCopy)(blockMeta);
}
exports.toBlockMeta = toBlockMeta;
function emptyMeta() {
    const keys = ["blocks", "lists", "stageLists", "variables", "stageVariables", "broadcasts"];
    const entries = keys.map((key) => [key, (0, Objects_1.empty)()]);
    return Object.fromEntries(entries);
}
/**
 * Starting at the root node, follow the chain of `next` blocks until we are at the last block, and return that block.
 */
function findLastID(rootID, blocks) {
    let currentID = rootID;
    let current = blocks[currentID];
    if ((0, Inputs_1.isTopLevelDataBlock)(current)) {
        return currentID;
    }
    while (current.next !== null && blocks[current.next]) {
        currentID = current.next;
        current = blocks[current.next];
    }
    return currentID;
}
exports.findLastID = findLastID;
