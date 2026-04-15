"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjacencyKeys = exports.hasUniqueName = exports.getUniqueName = exports.STAGE_NAME = void 0;
/**
 * Unique target name for the stage. (The stage has the name "Stage", but sprites can also have the name "Stage".)
 * No sprite is allowed to have the name "_stage_".
 */
exports.STAGE_NAME = "_stage_";
function getUniqueName({ isStage, name }) {
    return isStage ? exports.STAGE_NAME : name;
}
exports.getUniqueName = getUniqueName;
function hasUniqueName({ isStage, name }, uniqueName) {
    return isStage ? uniqueName === exports.STAGE_NAME : uniqueName === name;
}
exports.hasUniqueName = hasUniqueName;
exports.adjacencyKeys = Object.freeze([
    "parent",
    "next",
    "SUBSTACK",
    "SUBSTACK2",
]);
