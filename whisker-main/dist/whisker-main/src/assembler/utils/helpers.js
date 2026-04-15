"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalizeInputs = exports.checkForProblems = exports.throwErrorIfValueUndefined = exports.renameIDs = exports.disambiguateBlockIDs = exports.validate = exports.wrapProject = void 0;
const errors_1 = require("./errors");
const validate_1 = __importDefault(require("scratch-parser/lib/validate"));
const selectors_1 = require("./selectors");
const Node_1 = require("../Node");
const Objects_1 = require("./Objects");
const Block_1 = require("../blocks/Block");
const MultiMap_1 = require("./MultiMap");
const Inputs_1 = require("../blocks/Inputs");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const connections_1 = require("./connections");
const blocks_1 = require("./blocks");
function wrapProject(project, generateFreshID = uid_1.default) {
    project = validate(project);
    project = disambiguateBlockIDs(project, generateFreshID);
    project = deleteCommentsFromProject(project);
    const wrappedProject = (0, Objects_1.deepCopy)(project, throwErrorIfValueUndefined);
    wrappedProject.targets = project.targets.map((target) => wrapTarget(target, wrappedProject));
    checkForProblems(wrappedProject);
    return wrappedProject;
}
exports.wrapProject = wrapProject;
/**
 * Takes a parsed `project.json` as input, and checks it against the
 * [SB3 schema definition](https://github.com/LLK/scratch-parser/tree/master/lib).
 * If successful, returns a validated `Project`. Otherwise, throws a `ValidationError`.
 *
 * @param project the project to validate
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function validate(project) {
    return (0, validate_1.default)(false, project, (error, validated) => {
        if (error) {
            if (error.sb3Errors) {
                const pretty = JSON.stringify(error.sb3Errors, null, 4);
                const message = `Could not parse as a valid SB3 project. Errors: ${pretty}`;
                throw new errors_1.ValidationError(message);
            }
            else {
                // It's an SB2 project that contains errors...
                throw new errors_1.ValidationError("Only version 3 projects are supported");
            }
        }
        if (validated.projectVersion !== 3) {
            throw new errors_1.ValidationError("Only version 3 projects are supported");
        }
        return validated;
    });
}
exports.validate = validate;
function disambiguateBlockIDs(project, generateFreshID) {
    project = (0, Objects_1.deepCopy)(project);
    const duplicatesAcrossTargets = findDuplicateBlockIDs(project);
    for (const target of project.targets) {
        const targetName = (0, selectors_1.getUniqueName)(target);
        if (duplicatesAcrossTargets.has(targetName)) {
            const toRename = [...duplicatesAcrossTargets.get(targetName)];
            const oldToNew = Object.fromEntries(toRename.map((oldID) => [oldID, generateFreshID(oldID)]));
            target.blocks = renameIDs(target.blocks, oldToNew);
            target.comments = renameIDs(target.comments, oldToNew);
        }
    }
    return project;
}
exports.disambiguateBlockIDs = disambiguateBlockIDs;
function renameIDs(blocksOrComments, oldToNew) {
    const oldIDs = Object.keys(oldToNew);
    if (oldIDs.length === 0) {
        return (0, Objects_1.deepCopy)(blocksOrComments); // nothing to rename...
    }
    /*
     * Note: this implementation is rather crude. It converts the `blocks` object into a JSON string, and replaces
     * everything that looks like an ID, using a Regex. Because we are not considering context information, this
     * strategy fails when an ID just so happens to appear in an unexpected position, e.g., as input of a say-block.
     * Furthermore, we also use it to rename variable/list/broadcast IDs. These could have, by mere chance, the same
     * IDs as a block, leading to unintentional renames. While this will probably never happen, you can obviously
     * construct examples where it fails. But then again, Scratch's own uid function is already used as if it
     * generates globally unique IDs, even though there's a slim chance it sometimes doesn't...
     */
    const findOldIDs = new RegExp(oldIDs.map((oldID) => escape(oldID)).join("|"), "g");
    const renamed = JSON.stringify(blocksOrComments).replace(findOldIDs, (oldID) => oldToNew[oldID]);
    return JSON.parse(renamed);
}
exports.renameIDs = renameIDs;
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
function escape(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
function findDuplicateBlockIDs(project) {
    const knownIDs = new Set();
    const duplicatesPerTarget = new MultiMap_1.MultiMap();
    for (const target of project.targets) {
        for (const blockID of Object.keys(target.blocks)) {
            if (knownIDs.has(blockID)) {
                duplicatesPerTarget.set((0, selectors_1.getUniqueName)(target), blockID);
            }
            else {
                knownIDs.add(blockID);
            }
        }
    }
    return duplicatesPerTarget;
}
function deleteCommentsFromProject(project) {
    project = (0, Objects_1.deepCopy)(project);
    for (const target of project.targets) {
        target.comments = {};
        for (const block of Object.values(target.blocks)) {
            if ((0, Inputs_1.isTopLevelDataBlock)(block)) { // These blocks do not hold a reference to their comments.
                continue;
            }
            delete block.comment;
        }
    }
    return project;
}
function throwErrorIfValueUndefined(key, value) {
    if (typeof value === 'undefined') {
        throw new errors_1.ValidationError(`Key "${key}" must not have an undefined value`);
    }
    return value;
}
exports.throwErrorIfValueUndefined = throwErrorIfValueUndefined;
function checkForProblems(project) {
    checkForDanglingBlocks(project);
    checkForBrokenConnections(project);
    checkForBlacklistedBlocksOnTheStage(project);
}
exports.checkForProblems = checkForProblems;
function checkForDanglingBlocks(project) {
    for (const { isStage, name, blocks } of project.targets) {
        const validIDs = new Set(Object.keys(blocks));
        const referencedIds = new Set(Object.values(blocks).flatMap((node) => node.getReferencedBlockIDs()));
        for (const id of referencedIds) {
            if (!validIDs.has(id)) {
                // An unknown block is referenced.
                const targetName = isStage ? `stage` : `sprite "${name}"`;
                throw new errors_1.ValidationError(`The ${targetName} has a dangling block "${id}"`);
            }
        }
    }
}
function checkForBrokenConnections(project) {
    for (const { isStage, name, blocks } of project.targets) {
        const targetName = isStage ? `the stage` : `the sprite "${name}"`;
        for (const [blockID, block] of Object.entries(blocks)) {
            if (block instanceof Node_1.VarListNode) {
                continue;
            }
            const parent = block.getParent();
            if (parent === null) {
                if (!block.isTopLevel()) {
                    throw new errors_1.ValidationError(`The block "${blockID}" on ${targetName} has a broken connection to its parent`);
                }
            }
            else if (parent.getNext() !== block && parent.hasInputNode(block) === null) {
                throw new errors_1.ValidationError(`The block "${parent.blockID}" on ${targetName} does not reference "${blockID}" as next or input`);
            }
            const next = block.getNext();
            if (next !== null && next.getParent() !== block) {
                throw new errors_1.ValidationError(`The block "${next.blockID}" on ${targetName} does not reference "${blockID}" as parent`);
            }
        }
    }
}
function checkForBlacklistedBlocksOnTheStage(project) {
    const stage = project.targets.find((s) => s.isStage);
    for (const block of Object.values(stage.blocks).map(({ block }) => block)) {
        if (!(0, connections_1.canBeOnTheStage)(block)) {
            const opcode = (0, Block_1.isBlock)(block) ? block.opcode : "toplevel variable/list";
            throw new errors_1.ValidationError(`The stage must not contain a block of type "${opcode}"`);
        }
    }
}
function wrapTarget(target, wrappedProject) {
    const wrappedTarget = (0, Objects_1.deepCopy)(target);
    const wrapBlock = (block, blockID) => (0, Node_1.node)(blockID, block, wrappedTarget, wrappedProject);
    wrappedTarget.blocks = (0, Objects_1.mapObject)(target.blocks, wrapBlock);
    return wrappedTarget;
}
function canonicalizeInputs(block) {
    block = (0, Objects_1.deepCopy)(block);
    // For substacks and boolean inputs, the input key is sometimes missing entirely if the input is empty.
    // We canonicalize the representation by explicitly adding a key and representing a missing input via a dummy.
    // The dummy is also used in Scratch, but only if an input was added and then deleted again.
    for (const key of (0, blocks_1.getInputKeys)(block.opcode)) {
        if (!(key in block.inputs)) {
            block.inputs[key] = (0, Inputs_1.deletedInput)(); // dummy input
        }
    }
    return block;
}
exports.canonicalizeInputs = canonicalizeInputs;
