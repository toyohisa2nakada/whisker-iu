"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assembler = void 0;
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const Node_1 = require("./Node");
const selectors_1 = require("./utils/selectors");
const errors_1 = require("./utils/errors");
const Objects_1 = require("./utils/Objects");
const blocks_1 = require("./utils/blocks");
const helpers_1 = require("./utils/helpers");
const Inputs_1 = require("./blocks/Inputs");
const Fields_1 = require("./blocks/Fields");
const hashCode_1 = require("../repair/utils/hashCode");
const meta_1 = require("./utils/meta");
/**
 * An API to programmatically modify the `project.json` of Scratch projects.
 *
 * On a technical level, every Scratch project is made of Scratch blocks (represented by the {@link ScratchBlock} type).
 * Every block can have inputs (represented by the {@link Input} interface).
 *
 * Another point of view is the conceptual level. Here, blocks serve two main purposes:
 * 1. Statements: Stackable blocks build the control flow of the program.
 * 2. Expressions: Reporter blocks and primitive inputs (excl. `"BROADCAST_INPUT"`, `"SUBSTACK"` and `"SUBSTACK2"`)
 *    represent values.
 *
 * The API provides methods for both points of view. We do not recommend mixing them to avoid unexpected results. For
 * example, every statement can be safely deleted, but attempting to delete a block could fail.
 *
 * Current limitations:
 * - Custom blocks are not supported.
 * - It is assumed all required assets (costumes and sounds) are already present.
 */
class Assembler {
    /**
     * Constructs a new `Assembler` for the given `project`. All changes will be applied to an internal working copy of
     * the project. The optional callback `generateFreshID` is used to generate fresh IDs for blocks, variables, lists,
     * and broadcasts. It defaults to the `uid` function used by Scratch.
     *
     * @param project the project to modify
     * @param generateFreshID callback that generates a fresh ID when invoked (optional)
     */
    constructor(project, generateFreshID = uid_1.default) {
        this._project = (0, helpers_1.wrapProject)(project);
        this._generateFreshID = generateFreshID.bind(null);
    }
    /**
     * Returns a deep copy of the `project.json` as plain JSON object. This object can be serialized with
     * `JSON.stringify`, and loaded directly into the Scratch VM, or stored to the hard drive as `.sb3` file.
     *
     * Before returning, the `project.json` is parsed against the sb3 schema definition, and validated. If the function
     * throws, it is a likely a bug in the `Assembler` class.
     */
    toJSON() {
        (0, helpers_1.checkForProblems)(this._project);
        const project = (0, Objects_1.deepCopy)(this._project, helpers_1.throwErrorIfValueUndefined);
        (0, helpers_1.validate)(project);
        project.meta.hashCode = (0, hashCode_1.hashCode)(JSON.stringify(project.targets));
        return project;
    }
    static fromJSON(project, generateFreshID = uid_1.default) {
        return new Assembler(project, generateFreshID);
    }
    copy() {
        return new Assembler(this.toJSON(), this._generateFreshID);
    }
    get filePath() {
        var _a;
        return (_a = this._project.meta.filePath) !== null && _a !== void 0 ? _a : null;
    }
    //------------------------------------------------------------------------------------------------------------------
    //region Private helpers
    _getScript(scriptID) {
        let script = null;
        try {
            script = this._getNode(scriptID);
        }
        catch (e) {
            if (e instanceof errors_1.NoSuchBlockError) {
                throw new errors_1.NoSuchScriptError(e);
            }
            throw e;
        }
        if (!script.isTopLevel()) {
            throw new errors_1.NoSuchScriptError(scriptID);
        }
        return script;
    }
    _getTarget(name) {
        const targets = this._project.targets;
        if (name === selectors_1.STAGE_NAME) {
            return targets.find(({ isStage }) => isStage);
        }
        const target = targets.find((target) => target.name === name);
        if (target) {
            return target;
        }
        throw new errors_1.NoSuchSpriteError(name);
    }
    _getStage() {
        return this._getTarget(selectors_1.STAGE_NAME);
    }
    *_getNodes(skipShadow = true) {
        for (const target of this._project.targets) {
            for (const block of Object.values(target.blocks)) {
                if (skipShadow && block.isShadow()) {
                    continue;
                }
                yield block;
            }
        }
    }
    _getNode(blockID) {
        for (const target of this._project.targets) {
            if (blockID in target.blocks) {
                return target.blocks[blockID];
            }
        }
        throw new errors_1.NoSuchBlockError(blockID);
    }
    _moveTopLevelProperties(source, target) {
        const { x, y } = source.block;
        target.setTopLevel(x, y);
        source.setNonTopLevel();
    }
    //endregion
    //------------------------------------------------------------------------------------------------------------------
    //region Querying
    /**
     * Returns all but shadow blocks in the project.
     */
    getBlocks() {
        const blocks = new Array();
        for (const node of this._getNodes()) {
            blocks.push(node.blockID);
        }
        return blocks;
    }
    getBlocksOfStack(stackID, skipSubstack) {
        const stack = this._getNode(stackID);
        const queue = [stack];
        const blocks = new Array();
        for (const block of queue) {
            if (block.isShadow()) {
                continue;
            }
            blocks.push(block.blockID);
            queue.push(...block.getInputNodes(skipSubstack));
            if (block.hasNext()) {
                queue.push(block.getNext());
            }
        }
        return blocks;
    }
    getBlocksOfScript(scriptID) {
        const queue = [this._getScript(scriptID)];
        const blocks = new Array();
        for (const block of queue) {
            if (block.isShadow()) {
                continue;
            }
            blocks.push(block.blockID);
            queue.push(...block.getInputNodes(false));
            if (block.hasNext()) {
                queue.push(block.getNext());
            }
        }
        return blocks;
    }
    getBlocksOfTarget(targetName) {
        const target = this._getTarget(targetName);
        return Object.values(target.blocks)
            .filter((block) => !block.isShadow())
            .map(({ blockID }) => blockID);
    }
    /**
     * Returns the total number of blocks in the project, excluding shadow blocks and dummy blocks.
     */
    getBlockCount() {
        return this.getBlocks().length;
    }
    getInputBlockIDs(parent, includeSubstacks, skipShadow = false) {
        const node = this._getNode(parent);
        return node.getInputBlockIDsRecursively(includeSubstacks, skipShadow);
    }
    _getStmts() {
        const stmts = new Array();
        for (const node of this._getNodes()) {
            if (node.isStackable()) {
                stmts.push(node);
            }
        }
        return stmts;
    }
    /**
     * Returns all statements in the project. These encompass the blocks from the categories "stack", "hat", "cap", and
     * "C", but excludes shadow blocks and reporter blocks (expressions).
     */
    getStmts() {
        return this._getStmts().map(({ blockID }) => blockID);
    }
    /**
     * Returns all sequentially composed statements (i.e., directly connected to each other in a parent-next
     * relationship) starting at the statement with the given ID.
     *
     * @param rootID The ID of the statement to start at
     */
    getStmtsOf(rootID) {
        return [...this._getNode(rootID)].map(({ blockID }) => blockID);
    }
    getStmtsOfTarget(targetName) {
        this._getTarget(targetName); // to make sure the target exists
        return this._getStmts()
            .filter(({ target }) => (0, selectors_1.hasUniqueName)(target, targetName))
            .map(({ blockID }) => blockID);
    }
    /**
     * Like `getStmts()`, but also excludes statements that are toplevel. In contrast to `getEventHandlers()`, the
     * result also includes non-hat blocks.
     */
    getNonTopLevelStmts() {
        return this._getStmts()
            .filter((stmt) => !stmt.isTopLevel())
            .map(({ blockID }) => blockID);
    }
    _getCBlocks() {
        const cBlocks = new Array();
        for (const node of this._getNodes()) {
            if (node.isCBlock()) {
                cBlocks.push(node);
            }
        }
        return cBlocks;
    }
    getCBlocks() {
        return this._getCBlocks().map(({ blockID }) => blockID);
    }
    _getInputs(node = null) {
        const options = {
            skipSubstacks: false,
            skipBroadcasts: false,
            skipDeletedInputs: true,
            skipUnobscuredShadowBlocks: false,
            skipClearedInputs: true,
            skipUnobscuredPrimitiveInputs: false,
        };
        return (node === null ? [...this._getNodes()] : [node])
            .flatMap((node) => node.getInputKeys(options)
            .map((key) => ([node, key])));
    }
    /**
     * Returns all inputs in the project. This excludes "empty" inputs, such as deleted `SUBSTACK`s and boolean inputs,
     * and primitive inputs that are the empty string.
     */
    getInputs() {
        return this._getInputs().map(([{ blockID }, key]) => ({ blockID, key }));
    }
    getInputsOfBlock(blockID) {
        return this._getInputs(this._getNode(blockID)).map(([{ blockID }, key]) => ({ blockID, key }));
    }
    _getExprs(skipUnconnected, referViaInputKey, skipMissing, blockID = null) {
        const options = {
            skipSubstacks: true,
            skipBroadcasts: true,
            skipDeletedInputs: skipMissing,
            skipUnobscuredShadowBlocks: true,
            skipClearedInputs: skipMissing,
            skipUnobscuredPrimitiveInputs: false,
        };
        const exprs = Array();
        const nodes = blockID === null ? this._getNodes() : [this._getNode(blockID)];
        for (const node of nodes) {
            const unconnectedExpr = node.isTopLevel() && node.isReporterBlock();
            if (unconnectedExpr && !skipUnconnected) {
                exprs.push([node, null]);
            }
            for (const key of node.getInputKeys(options)) {
                if (referViaInputKey) {
                    exprs.push([node, key]);
                }
                else {
                    // If the input is a block itself, we try to refer to it via its BlockID. (For example, this could
                    // be useful for coverage measurement.) Otherwise, like in the case of primitive inputs, we fall
                    // back to the BlockID of the parent and the corresponding input key.
                    const inputNode = node.getInputNode(key);
                    exprs.push(inputNode ? [inputNode, null] : [node, key]);
                }
            }
        }
        return exprs;
    }
    /**
     * Returns all expressions in the project. This includes reporter blocks (including unconnected ones) and primitive
     * inputs, but excludes `SUBSTACK`/`SUBSTACK2` (because these are statements) and `BROADCAST_INPUT` (because it
     * behaves like a drop-down menu).
     */
    getExprs() {
        return this._getExprs(false, false, true).map(([{ blockID }, key]) => (Object.assign({ blockID }, (key && { key }))));
    }
    getConnectedExprs() {
        return this._getExprs(true, true, true).map(([{ blockID }, key]) => ({ blockID, key }));
    }
    getExprsOfBlock(blockID) {
        return this._getExprs(true, true, false, blockID).map(([{ blockID }, key]) => ({ blockID, key }));
    }
    _getScripts(skipReporter) {
        const scripts = new Array();
        for (const node of this._getNodes()) {
            if (node.isTopLevel() && !(skipReporter && node.isReporterBlock())) {
                scripts.push(node);
            }
        }
        return scripts;
    }
    /**
     * Returns all scripts in the project, identified by their root block. This includes unconnected scripts (whose
     * root block is not a hat block). If `skipReporter` is `false`, it also includes unconnected reporter blocks,
     * otherwise it excludes them.
     *
     * @param skipReporter whether to skip reporter blocks in the result
     */
    getScripts(skipReporter) {
        return this._getScripts(skipReporter).map(({ blockID }) => blockID);
    }
    getScriptsOfTarget(targetName, skipReporter) {
        this._getTarget(targetName); // to make sure the target exists
        return this._getScripts(skipReporter)
            .filter(({ target }) => (0, selectors_1.hasUniqueName)(target, targetName))
            .map(({ blockID }) => blockID);
    }
    /**
     * Returns all connected scripts in the project, identified by their hat block.
     */
    getConnectedScripts() {
        return this._getScripts(true)
            .filter((node) => node.isHatBlock())
            .map(({ blockID }) => blockID);
    }
    /**
     * Alias for `getConnectedScripts`.
     */
    getEventHandlers() {
        return this.getConnectedScripts();
    }
    /**
     * Returns all unconnected scripts in the project, identified by their root block. Unconnected scripts never start
     * with a hat block, and are dead code.
     */
    getUnconnectedScripts() {
        const scripts = new Array();
        for (const node of this._getNodes()) {
            if (node.isTopLevel() && !node.isHatBlock()) {
                scripts.push(node.blockID);
            }
        }
        return scripts;
    }
    /**
     * Returns all statements that are root in a script, SUBSTACK or SUBSTACK2.
     */
    getStacks() {
        const stacks = new Array();
        for (const node of this._getNodes()) {
            if (node.isRootOfScriptOrSubstack() && node.isStackable()) {
                stacks.push(node.blockID);
            }
        }
        return stacks;
    }
    /**
     * In the script rooted at the given statement, returns all statements that are root in the script, or in a SUBSTACK
     * or SUBSTACK2 in the script. If the given statement is the root of a script, the result array will contain that
     * statement. Otherwise, the array will only contain the statements that are root in a SUBSTACK or SUBSTACK2 of a
     * successor of the given statement.
     *
     * @param blockID The root of the script in which to search
     * @param includeDeleted If deleted (empty) substacks should be included in the result
     */
    getStacksOfScript(blockID, includeDeleted = false) {
        const stacks = new Array();
        const node = this._getNode(blockID);
        if (node instanceof Node_1.VarListNode) {
            return stacks;
        }
        const workQueue = [node];
        while (workQueue.length > 0) {
            const current = workQueue.shift();
            if (current === null) {
                continue;
            }
            const blockID = current.blockID;
            if (current.isRootOfScriptOrSubstack()) {
                stacks.push(blockID);
            }
            workQueue.push(current.getNext());
            if (!current.isCBlock()) {
                continue;
            }
            const substackKeys = (0, blocks_1.getInputKeys)(current.block.opcode)
                .filter((key) => ["SUBSTACK", "SUBSTACK2"].includes(key));
            for (const key of substackKeys) {
                const substack = current.getInputNode(key);
                if (substack === null && includeDeleted) {
                    stacks.push({ blockID, key });
                }
                else {
                    workQueue.push(substack);
                }
            }
        }
        return stacks;
    }
    /**
     * Returns all statements that are root in a SUBSTACK or SUBSTACK2.
     */
    getSubstacks() {
        const substacks = new Array();
        for (const node of this._getNodes()) {
            if (node.isStackable() && node.isRootOfSubstack()) {
                substacks.push(node.blockID);
            }
        }
        return substacks;
    }
    /**
     * Starting at the block with the given ID, follows the chain of `next` blocks until the very end, and returns
     * the IDs of all stackable blocks encountered along the way, in traversal order. The ID of the given block is
     * not included if `skipSelf` is `true`, otherwise it is included.
     *
     * @param blockID the ID of the block where to start
     * @param skipSelf whether to omit the `blockID` from the result
     */
    getNextIDs(blockID, skipSelf) {
        return this._getNode(blockID).getNextIDs(skipSelf);
    }
    /**
     * For a given block, returns the root of the script the block belongs to. Returns null for shadow blocks.
     *
     * @param blockID the ID of the block to query
     */
    getScriptRoot(blockID) {
        const root = this._getNode(blockID).getScriptRoot();
        return root ? root.blockID : null;
    }
    getStackRoot(blockID) {
        const root = this._getNode(blockID).getStackRoot();
        return root ? root.blockID : null;
    }
    /**
     * In the stack/slice starting with the given `blockID`, returns the ID of the last block in that stack/slice. Note
     * that `blockID` need not be a root block. If `blockID` is a reporter block, it returns `blockID`.
     *
     * @param blockID the stack/slice of interest
     */
    getLastInSlice(blockID) {
        return this._getNode(blockID).getLastID();
    }
    /**
     * Returns true iff the block with the given ID can be live code, false if it is dead code. In general, all blocks
     * of unconnected scripts are always dead code.
     *
     * @param blockID the block of interest
     */
    canBeLive(blockID) {
        return this._getNode(blockID).canBeLive();
    }
    /**
     * For a given block, returns the unique name of the target it belongs to.
     *
     * @param blockID the ID of the block to query
     */
    getTargetName(blockID) {
        return (0, selectors_1.getUniqueName)(this._getNode(blockID).target);
    }
    _getTargets() {
        return this._project.targets;
    }
    /**
     * Returns all targets in the project (including the stage).
     *
     * @param skipEmpty If `true`, excludes empty targets (i.e., containing no code)
     */
    getTargets(skipEmpty = false) {
        return this._getTargets()
            .filter((target) => !skipEmpty || Object.keys(target.blocks).length > 0)
            .map((target) => (0, selectors_1.getUniqueName)(target));
    }
    /**
     * Returns all sprites in the project (i.e., without the stage).
     */
    getSprites() {
        return this._getTargets()
            .filter(({ isStage }) => !isStage)
            .map(({ name }) => name);
    }
    /**
     * Returns all fields in the project. This includes oval-shaped fields (of shadow blocks), and rectangular fields.
     */
    getFields() {
        const fields = new Array();
        for (const node of this._getNodes(false)) {
            for (const key of node.getFieldKeys()) {
                fields.push(({ blockID: node.blockID, key }));
            }
        }
        return fields;
    }
    getFieldsOfBlock(blockID) {
        return this._getNode(blockID).getFieldKeys().map((key) => ({ blockID, key }));
    }
    /**
     * Returns all possible values that can be selected in the specified field. If the parameter `skipCurrentValue`
     * is `true`, the result does not contain the currently selected value.
     *
     * @param blockID the ID of the block that has the field
     * @param key the key to identify the filed
     * @param skipCurrentValue whether to skip the currently selected field value
     */
    getPossibleFieldValues({ blockID, key }, skipCurrentValue) {
        const node = this._getNode(blockID);
        return node.getPossibleFieldValues(key, skipCurrentValue);
    }
    _getDropDowns(blockID, skipIfObscured) {
        const dropDowns = Array();
        const nodes = [];
        if (blockID === null) {
            nodes.push(...this._getNodes(false));
        }
        else {
            const node = this._getNode(blockID);
            const ovalDropDowns = node.getInputNodes(true).filter((node) => node.isShadow());
            nodes.push(node, ...ovalDropDowns);
        }
        for (const node of nodes) {
            if (node instanceof Node_1.VarListNode) {
                continue;
            }
            if (skipIfObscured && node.isObscured()) {
                // If the block is obscured, it must also be a shadow block. It is OK to skip here already, and not
                // look at "BROADCAST_INPUT" because only "event_broadcast" and "event_broadcastandwait" can have it as
                // key, and both are not shadow blocks.
                continue;
            }
            const blockID = node.blockID;
            for (const key of node.getFieldKeys()) {
                dropDowns.push({ blockID, key });
            }
            // Blocks of type "event_broadcast" and "event_broadcastandwait" have a primitive input of type
            // "BROADCAST_INPUT". But it behaves like a field and is drawn like a field... So we include it here.
            if (node.block.opcode === "event_broadcast" || node.block.opcode === "event_broadcastandwait") {
                if (skipIfObscured && (0, Inputs_1.isObscuredShadowInput)(node.block['inputs']['BROADCAST_INPUT'])) {
                    continue;
                }
                dropDowns.push({ blockID, key: "BROADCAST_INPUT" });
            }
        }
        return dropDowns;
    }
    /**
     * Returns all drop-down menus in the project. This includes oval-shaped fields (of shadow-blocks), rectangular
     * fields, and the input of type `BROADCAST_INPUT` (since it behaves like a drop-down menu). The parameter
     * `skipIfObscured` controls if obscured oval-shaped fields should be excluded.
     *
     * @param skipIfObscured whether to skip dropdown menus that are obscured by reporter blocks dropped on top of them
     */
    getDropDowns(skipIfObscured) {
        return this._getDropDowns(null, skipIfObscured);
    }
    /**
     * Returns all dropdown menus of the block with the given ID. The result includes:
     * - All rectangular dropdown menus on the block itself.
     * - All broadcast menus on the block itself.
     * - All oval dropdown menus (under the hood, this is a rectangular menu on a shadow block, which has a different
     *   block ID.)
     *
     * @param blockID The ID of the block for which the dropdown menus should be retrieved
     * @param skipIfObscured Whether an oval dropdown menu should be omitted if it is obscured by a reporter
     */
    getDropDownsOfBlock(blockID, skipIfObscured) {
        return this._getDropDowns(blockID, skipIfObscured);
    }
    /**
     * Returns all possible values that can be selected in the specified drop-down menu. If the parameter
     * `skipCurrentValue` is `true`, the result does not contain the currently selected value.
     *
     * @param blockID the ID of the block that has the drop-down menu
     * @param key the key to identify the field
     * @param skipCurrentValue whether to skip the currently selected value
     */
    getPossibleDropDownValues({ blockID, key }, skipCurrentValue) {
        const node = this._getNode(blockID);
        return key !== "BROADCAST_INPUT"
            ? node.getPossibleFieldValues(key, skipCurrentValue)
            : node.getPossibleBroadcastInputs(skipCurrentValue)
                .map((broadcast) => (0, Fields_1.broadcastInputToField)(broadcast));
    }
    /**
     * Returns the variables of the given target. For sprites, this excludes stage variables.
     *
     * @param target the target to query
     */
    getVariablesOfTarget(target) {
        return Object.keys(this._getTarget(target).variables);
    }
    /**
     * Returns the variables of the stage.
     */
    getStageVariables() {
        return this.getVariablesOfTarget(selectors_1.STAGE_NAME);
    }
    /**
     * Returns the lists of the given target. For sprites, this excludes stage lists.
     *
     * @param target the target to query
     */
    getListsOfTarget(target) {
        return Object.keys(this._getTarget(target).lists);
    }
    /**
     * Returns the lists of the stage.
     */
    getStageLists() {
        return this.getListsOfTarget(selectors_1.STAGE_NAME);
    }
    _getVariable(variableID) {
        for (const target of this._project.targets) {
            for (const key of Object.keys(target.variables)) {
                if (variableID === key) {
                    return [target.variables[variableID], target.isStage];
                }
            }
        }
        throw new errors_1.NoSuchVariableError(variableID);
    }
    _getList(listID) {
        for (const target of this._project.targets) {
            for (const key of Object.keys(target.lists)) {
                if (listID === key) {
                    return [target.lists[listID], target.isStage];
                }
            }
        }
        throw new errors_1.NoSuchListError(listID);
    }
    //endregion
    //------------------------------------------------------------------------------------------------------------------
    //region Meta
    /**
     * Returns an object with metadata for the requested statement. The block IDs in the returned object are the same
     * as the ones used by the project. If `skipSubstacks` is `true,` the metadata of substack inputs is skipped. This
     * can be useful, e.g., if only the data for a C-block itself are desired.
     *
     * @param statement the ID of the statement to query
     * @param skipSubstack whether to skip metadata of substack inputs, defaults to `false`
     */
    getStmtMeta(statement, skipSubstack = false) {
        return this.getBlockMeta(statement, skipSubstack);
    }
    /**
     * Returns an object with metadata for the requested expression.
     *
     * @param exprSel the selector for the expression
     */
    getExprMeta(exprSel) {
        const node = this._getNode(exprSel.blockID);
        return exprSel.key ? node.getInputMeta(exprSel.key) : node.getBlockMeta({ substacks: false, nextBlocks: false });
    }
    /**
     * Returns an object with metadata for the requested block. The block IDs in the returned object are the same
     * as the ones used by the project. If `skipSubstacks` is `true`, the metadata of substack inputs is skipped. This
     * can be useful, e.g., if only the data for a C-block itself are desired.
     *
     * @param block the ID of the block to query
     * @param skipSubstack whether to skip metadata of substack inputs, defaults to `false`
     */
    getBlockMeta(block, skipSubstack = false) {
        return this._getNode(block).getBlockMeta({ substacks: !skipSubstack, nextBlocks: false });
    }
    /**
     * Returns an object with metadata for the requested input.
     *
     * @param blockID the ID of the block that uses the input
     * @param key the key identifying the input
     */
    getInputMeta({ blockID, key }) {
        return this._getNode(blockID).getInputMeta(key);
    }
    /**
     * Returns an object with metadata for the requested script. The script is identified by the ID of its root block.
     * If called with the ID of a non-root block, a "slice" of the script is returned, starting at the given block,
     * and ending at the last block in the script. The block IDs in the returned object are the same as the ones used
     * by the project.
     *
     * @param script the script to query
     */
    getScriptMeta(script) {
        const topLevelBlock = this._getNode(script);
        if (!topLevelBlock.isTopLevel) {
            throw new errors_1.NoSuchScriptError(`Script with root "${script}" does not exist`);
        }
        return topLevelBlock.sliceToEnd();
    }
    /**
     * Returns an object with metadata for the requested stack of blocks/statements. The slice starts at the given
     * start point and contains the end point. The block IDs in the returned object are the same as the ones used by
     * the project.
     *
     * @param start the ID of the starting block
     * @param end the ID of the end block, or `null` (slice to the end, the default)
     */
    getStackMeta(start, end = null) {
        return this._getNode(start).sliceTo(end);
    }
    /**
     * Returns the current state of the specified field.
     *
     * @param blockID the ID of the block to which the field belongs
     * @param key the key to identify the field
     */
    getFieldValue({ blockID, key }) {
        const node = this._getNode(blockID);
        return node.getField(key);
    }
    /**
     * Returns the current state of the specified drop-down menu. Supports all fields, and primitive inputs with key
     * `"BROADCAST_INPUT"`.
     *
     * @param blockID the ID of the block the drop-down menu belongs to
     * @param key the key to identify the drop-down menu
     */
    getDropDownValue({ blockID, key }) {
        const node = this._getNode(blockID);
        if (key !== "BROADCAST_INPUT") {
            return node.getField(key);
        }
        const { input: [shadowType, unobscuredInput, obscuredInput] } = node.getInputMeta(key);
        const broadcastInput = shadowType === Inputs_1.shadowTypes.unobscuredShadow ? unobscuredInput : obscuredInput;
        return (0, Fields_1.broadcastInputToField)(broadcastInput);
    }
    /**
     * Converts the specified variable to a reporter block.
     *
     * @param variableID the ID of the variable
     */
    getVariableAsBlockMeta(variableID) {
        const [variable, isStage] = this._getVariable(variableID);
        const blockID = this._generateFreshID("variable");
        const meta = (0, meta_1.emptyBlockMeta)(blockID, blockID);
        meta.blocks[blockID] = [Inputs_1.primitiveInputTypes.variable, (0, blocks_1.variableName)(variable), variableID, 0, 0];
        (isStage ? meta.stageVariables : meta.variables)[variableID] = variable;
        return (0, Objects_1.deepCopy)(meta);
    }
    /**
     * Converts the specified list to a reporter block.
     *
     * @param listID the ID of the list
     */
    getListAsBlockMeta(listID) {
        const [list, isStage] = this._getList(listID);
        const blockID = this._generateFreshID("list");
        const meta = (0, meta_1.emptyBlockMeta)(blockID, blockID);
        meta.blocks[blockID] = [Inputs_1.primitiveInputTypes.list, (0, blocks_1.listName)(list), listID, 0, 0];
        (isStage ? meta.stageLists : meta.lists)[listID] = list;
        return (0, Objects_1.deepCopy)(meta);
    }
    /**
     * Converts the specified variable to an input.
     *
     * @param variableID the ID of the variable
     */
    getVariableAsInputMeta(variableID) {
        const [variable, isStage] = this._getVariable(variableID);
        const variableInput = [Inputs_1.primitiveInputTypes.variable, (0, blocks_1.variableName)(variable), variableID];
        const input = [Inputs_1.shadowTypes.unobscuredShadow, variableInput];
        const meta = (0, meta_1.emptyInputMeta)(input, false, false);
        (isStage ? meta.stageVariables : meta.variables)[variableID] = variable;
        return (0, Objects_1.deepCopy)(meta);
    }
    /**
     * Converts the specified list to an input.
     *
     * @param listID the ID of the list
     */
    getListAsInputMeta(listID) {
        const [list, isStage] = this._getList(listID);
        const listInput = [Inputs_1.primitiveInputTypes.list, (0, blocks_1.listName)(list), listID];
        const input = [Inputs_1.shadowTypes.unobscuredShadow, listInput];
        const meta = (0, meta_1.emptyInputMeta)(input, false, false);
        (isStage ? meta.stageLists : meta.lists)[listID] = list;
        return (0, Objects_1.deepCopy)(meta);
    }
}
exports.Assembler = Assembler;
