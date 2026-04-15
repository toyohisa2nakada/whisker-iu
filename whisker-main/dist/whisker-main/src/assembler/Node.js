"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.node = exports.VarListNode = exports.BlockNode = void 0;
const Block_1 = require("./blocks/Block");
const Objects_1 = require("./utils/Objects");
const helpers_1 = require("./utils/helpers");
const Inputs_1 = require("./blocks/Inputs");
const errors_1 = require("./utils/errors");
const Pair_1 = require("../whisker/utils/Pair");
const blocks_1 = require("./utils/blocks");
const HatBlock_1 = require("./blocks/shapes/HatBlock");
const StackBlock_1 = require("./blocks/shapes/StackBlock");
const CBlock_1 = require("./blocks/shapes/CBlock");
const CapBlock_1 = require("./blocks/shapes/CapBlock");
const Motion_1 = require("./blocks/categories/Motion");
const Reporter_1 = require("./blocks/shapes/Reporter");
const Fields_1 = require("./blocks/Fields");
const Arrays_1 = __importDefault(require("../whisker/utils/Arrays"));
const Looks_1 = require("./blocks/categories/Looks");
const Sound_1 = require("./blocks/categories/Sound");
const Events_1 = require("./blocks/categories/Events");
const selectors_1 = require("./utils/selectors");
const Sensing_1 = require("./blocks/categories/Sensing");
const Operators_1 = require("./blocks/categories/Operators");
const Pen_1 = require("./blocks/categories/Pen");
const NonExhaustiveCaseDistinction_1 = require("../whisker/core/exceptions/NonExhaustiveCaseDistinction");
const logger_1 = __importDefault(require("../util/logger"));
const Statistics_1 = __importDefault(require("../whisker/utils/Statistics"));
const meta_1 = require("./utils/meta");
/**
 * How far new scripts are placed away from existing ones.
 */
const xOffset = 400;
class BlockWrapper {
    constructor(blockID, block, target, project) {
        this._blockID = blockID;
        this._block = (0, Objects_1.deepCopy)(block);
        this._target = target;
        this._project = project;
    }
    get blockID() {
        return this._blockID;
    }
    get block() {
        return this._block;
    }
    get target() {
        return this._target;
    }
    sliceToEnd() {
        return this.sliceTo(null); // slice until "next" is null (i.e., the very end)
    }
    isObscured() {
        // A shadow-block can be  obscured by a reporter block that was dropped on top of it. Then, the shadow-block
        // has the "topLevel" attribute set to true. See also the JSDoc for the ObscuredShadowInput type.
        return this.isShadow() && this.isTopLevel();
    }
    toJSON() {
        return this.block;
    }
}
/**
 * A wrapper class for `Block` that provides an AST-like API, and further convenience functions.
 */
class BlockNode extends BlockWrapper {
    constructor(blockID, block, target, project) {
        super(blockID, (0, helpers_1.canonicalizeInputs)(block), target, project);
    }
    _getStage() {
        return this._project.targets.find(({ isStage }) => isStage);
    }
    _getSprite(name) {
        const sprite = this._project.targets.find((target) => target.name === name);
        if (sprite) {
            return sprite;
        }
        throw new errors_1.NoSuchSpriteError(name);
    }
    _getOtherSpriteNames() {
        const names = this._project.targets
            .filter(({ isStage }) => !isStage)
            .map(({ name }) => name);
        if (this._target.isStage) { // Avoid filtering out a **sprite** with the name "Stage".
            return names;
        }
        return names.filter((name) => name !== this._target.name);
    }
    getX() {
        if (!this.isTopLevel()) {
            return null;
        }
        if (this.isShadow()) {
            return null;
        }
        return this.block.x;
    }
    getScriptRoot() {
        if (this.isTopLevel()) {
            if (this.isShadow()) {
                return null;
            }
            return this;
        }
        return this.getParent().getScriptRoot();
    }
    getStackRoot() {
        if (this.isRootOfScriptOrSubstack()) {
            return this;
        }
        return this.hasParent()
            ? this.getParent().getStackRoot()
            : null;
    }
    isRootOfSubstack() {
        return this.isTosInSubstackOf(this.getParent()) || this.isTosInSubstack2Of(this.getParent());
    }
    isRootOfScriptOrSubstack() {
        /*
         * A block is the root of a script or SUBSTACK(2) if
         * (1) it is the first block in a script (it is toplevel), but it is not an obscured oval-shaped drop-down menu
         *     (those are toplevel, too).
         * (2) it is the first block of a SUBSTACK(2).
         */
        return (this.isTopLevel() && !this.isShadow() || // (1)
            this.isRootOfSubstack() // (2)
        );
    }
    isTosInSubstackOf(parent) {
        return parent === null ? false : parent.hasSubstack(this);
    }
    isTosInSubstack2Of(parent) {
        return parent === null ? false : parent.hasSubstack2(this);
    }
    hasParent() {
        return this.block.parent !== null;
    }
    getParent() {
        if (!this.hasParent()) {
            return null;
        }
        return this._getBlockNode(this.block.parent);
    }
    getParentID() {
        return this.block.parent;
    }
    setParent(parent) {
        if (parent === null) {
            this.block.parent = null;
            return;
        }
        if (parent.target.name !== this.target.name) {
            throw new errors_1.InvalidBlockError(`Blocks must belong to the same target ("${this.target.name}")`);
        }
        this.block.parent = parent.blockID;
    }
    hasNext() {
        return this.block.next !== null;
    }
    getNext() {
        if (!this.hasNext()) {
            return null;
        }
        return this._getBlockNode(this.block.next);
    }
    getNextID() {
        return this.block.next;
    }
    setNext(next) {
        if (next === null) {
            this.block.next = null;
            return;
        }
        if (next.target.name !== this.target.name) {
            throw new errors_1.InvalidBlockError(`Blocks must belong to the same target ("${this.target.name}")`);
        }
        this.block.next = next.blockID;
    }
    getNextIDs(skipSelf) {
        const ids = [...this].map(({ blockID }) => blockID);
        return skipSelf ? ids.slice(1) : ids;
    }
    _getBlockNode(blockID) {
        if (!(blockID in this.target.blocks)) {
            throw new errors_1.NoSuchBlockError(blockID);
        }
        const block = this.target.blocks[blockID];
        if (block instanceof VarListNode) {
            // Should not happen under normal circumstances...
            throw new Error(`The given ID "${blockID}" must point to a ${BlockNode.name}`);
        }
        return block;
    }
    getLast() {
        return [...this].pop();
    }
    getLastID() {
        return this.getLast().blockID;
    }
    getReferencedBlockIDs() {
        const result = new Array();
        if (this.block.parent) {
            result.push(this.block.parent);
        }
        if (this.block.next) {
            result.push(this.block.next);
        }
        result.push(...this._getInputBlockIDs(true, false));
        return result;
    }
    _getInputBlockIDs(collectSubstacks, skipShadow) {
        const blockIDs = Array();
        for (const [key, input] of Object.entries(this.block.inputs)) {
            if (!collectSubstacks && (key === "SUBSTACK" || key === "SUBSTACK2")) {
                continue;
            }
            for (const blockID of (0, blocks_1.getBlockIDs)(input)) {
                if (skipShadow && this._getBlockNode(blockID).isShadow()) {
                    continue;
                }
                blockIDs.push(blockID);
            }
        }
        return blockIDs;
    }
    sliceTo(lastBlock) {
        return this.getBlockMeta({ substacks: true, nextBlocks: true, lastBlock });
    }
    getBlockMeta(traversal) {
        const rootID = this.blockID;
        let blockMeta = (0, meta_1.emptyBlockMeta)(rootID, traversal.nextBlocks ? traversal.lastBlock : rootID);
        // Begin the traversal at the root block.
        this._collectMetadata([blockMeta.rootID], blockMeta, traversal.substacks);
        // Very important for the next steps so as not to unintentionally modify the underlying Block of the Node!
        blockMeta = (0, Objects_1.deepCopy)(blockMeta);
        const actualLastID = (0, meta_1.findLastID)(blockMeta.rootID, blockMeta.blocks);
        if (blockMeta.lastID === null) {
            blockMeta.lastID = actualLastID;
        }
        else if (blockMeta.lastID !== actualLastID) {
            throw new errors_1.InvalidBlockError(`The given block with ID "${blockMeta.lastID}" was not encountered`);
        }
        const root = blockMeta.blocks[rootID];
        root.parent = null; // avoid dangling IDs
        const last = blockMeta.blocks[blockMeta.lastID];
        last.next = null; // avoid dangling IDs
        return blockMeta;
    }
    hasInputNode(input) {
        if (input.target.name !== this.target.name) {
            return null;
        }
        const inputs = Object.entries(this.block.inputs);
        const keys = inputs.filter(([, [, blockID]]) => blockID === input.blockID).map(([key]) => key);
        return keys.length === 0 ? null : keys[0];
    }
    isInputOf(parent) {
        return parent.hasInputNode(this);
    }
    isTopLevel() {
        return (0, Block_1.isTopLevelBlock)(this.block);
    }
    isHatBlock() {
        return (0, HatBlock_1.isHatBlock)(this.block);
    }
    isCapBlock() {
        return (0, CapBlock_1.isCapBlock)(this.block);
    }
    isCBlock() {
        return (0, CBlock_1.isCBlock)(this.block);
    }
    isStackBlock() {
        return (0, StackBlock_1.isStackBlock)(this.block);
    }
    isStackable() {
        return (0, Block_1.isStackableBlock)(this.block);
    }
    isMotionBlock() {
        return (0, Motion_1.isMotionBlock)(this.block);
    }
    isReporterBlock() {
        return (0, Reporter_1.isReporterBlock)(this.block);
    }
    isShadow() {
        return this.block.shadow;
    }
    isObscuredInput(key) {
        if (key in this.block.inputs) {
            return (0, Inputs_1.isUnobscuredShadowInput)(this.block.inputs[key]);
        }
        throw new errors_1.NoSuchKeyError(`Block "${this.block.opcode}" does not have input "${key}"`);
    }
    canBeLive() {
        if (this.isHatBlock()) {
            return true;
        }
        return this.hasParent() && this.getParent().canBeLive();
    }
    hasSubstack(substack) {
        var _a, _b, _c, _d, _e;
        if (!substack) {
            return (_c = ((_b = (_a = this.block.inputs) === null || _a === void 0 ? void 0 : _a.SUBSTACK) === null || _b === void 0 ? void 0 : _b[1]) !== null) !== null && _c !== void 0 ? _c : false;
        }
        return substack.target.name === this.target.name &&
            ((_e = (_d = this.block.inputs) === null || _d === void 0 ? void 0 : _d.SUBSTACK) === null || _e === void 0 ? void 0 : _e[1]) === substack.blockID;
    }
    hasSubstack2(substack2) {
        var _a, _b, _c, _d, _e;
        if (!substack2) {
            return (_c = ((_b = (_a = this.block.inputs) === null || _a === void 0 ? void 0 : _a.SUBSTACK2) === null || _b === void 0 ? void 0 : _b[1]) !== null) !== null && _c !== void 0 ? _c : false;
        }
        return substack2.target.name === this.target.name &&
            ((_e = (_d = this.block.inputs) === null || _d === void 0 ? void 0 : _d.SUBSTACK2) === null || _e === void 0 ? void 0 : _e[1]) === substack2.blockID;
    }
    getInputNode(key) {
        if (!(key in this.block.inputs)) {
            return null;
        }
        const [, blockID] = this.block.inputs[key];
        if (typeof blockID !== "string") {
            return null;
        }
        return this._getBlockNode(blockID);
    }
    getInputNodes(skipSubstack) {
        return Object.keys(this._block.inputs)
            .filter((key) => !skipSubstack || (key !== "SUBSTACK" && key !== "SUBSTACK2"))
            .map((key) => this.getInputNode(key))
            .filter((node) => node !== null);
    }
    getInputMeta(key) {
        if (!(0, blocks_1.getInputKeys)(this.block).includes(key)) {
            throw new errors_1.NoSuchKeyError(`Block "${this.block.opcode}" does not take input "${key}"`);
        }
        if (!(key in this.block.inputs)) {
            // Only happens for C-Blocks or boolean blocks, when there's no SUBSTACK(2) or hexagonal input present.
            return (0, meta_1.emptyInputMeta)((0, Inputs_1.deletedInput)(), false, false);
        }
        const input = this.block.inputs[key];
        const shadow = (0, Inputs_1.inputRefersToShadowBlock)(this.block.opcode, key);
        const obscured = (0, Inputs_1.isObscuredShadowInput)(input);
        let inputMeta = (0, meta_1.emptyInputMeta)(input, shadow, obscured);
        this._collectMetadata((0, blocks_1.getBlockIDs)(input), inputMeta, true);
        // Very important for the next steps so as not to unintentionally modify the underlying Block of the Node!
        inputMeta = (0, Objects_1.deepCopy)(inputMeta);
        // Avoid dangling references in inputs to this block.
        for (const blockID of (0, blocks_1.getBlockIDs)(input)) {
            // By construction, the inputBlock is a Block, and its parent is always this.blockID. No other blocks can
            // have this.blockID as parent. (If anything, they have blockID as parent.)
            const inputBlock = inputMeta.blocks[blockID];
            inputBlock.parent = null; // obscured drop-down menus actually already have parent === null
        }
        return inputMeta;
    }
    _collectMetadata(workQueue, meta, collectSubstacks) {
        const lastID = meta.type === "Block" ? meta.lastID : null;
        while (workQueue.length !== 0) {
            // Handle the block itself by copying its JSON definition to the metadata object:
            const currentBlockID = workQueue.shift();
            const current = this._getBlockNode(currentBlockID);
            const block = (0, Objects_1.deepCopy)(current.block);
            meta.blocks[currentBlockID] = block;
            /*
             * Handle the metadata of the block:
             * (1) "Primitive" inputs can be (a) literal numbers and strings, or (b) variables, lists, and broadcasts.
             *     The former (a) are already fully captured by the block's JSON object. The latter (b) require special
             *     care as they are orthogonal to blocks.
             * (2) "Regular" inputs are represented as a Block object, and can be referred to via their block ID.
             *     We can handle them like any other block -> just queue them up for processing.
             */
            current._collectPrimitiveInputs(meta); // (1)
            workQueue.push(...current._getInputBlockIDs(collectSubstacks, false)); // (2)
            if (!collectSubstacks) {
                // Avoid dangling block IDs in Meta: delete reference to the SUBSTACK(2).
                for (const key of ["SUBSTACK", "SUBSTACK2"]) {
                    if (key in block.inputs) {
                        block.inputs[key] = (0, Inputs_1.deletedInput)();
                    }
                }
            }
            // `next` blocks, if present, are always included, unless this is the last block.
            if (currentBlockID !== lastID && current.hasNext()) {
                workQueue.push(current.getNextID());
            }
        }
    }
    _collectPrimitiveInputs(meta) {
        for (const input of Object.values(this.block.inputs)) {
            const [, inputBlock, maybeObscuredBlock] = input;
            this._collectPrimitiveInput(inputBlock, meta);
            this._collectPrimitiveInput(maybeObscuredBlock, meta);
        }
    }
    _collectPrimitiveInput(input, meta) {
        if (!(0, Inputs_1.isPrimitiveInput)(input)) {
            return;
        }
        const [type, name, id] = input;
        switch (type) {
            case Inputs_1.primitiveInputTypes.variable: {
                const isSpriteOnly = id in this.target.variables;
                if (isSpriteOnly) {
                    meta.variables[id] = this.target.variables[id];
                }
                else {
                    // It's a stage variable, but we don't have its value, so 0 will have to do.
                    meta.stageVariables[id] = [name, 0];
                }
                break;
            }
            case Inputs_1.primitiveInputTypes.list: {
                const isSpriteOnly = id in this.target.lists;
                if (isSpriteOnly) {
                    meta.lists[id] = this.target.lists[id];
                }
                else {
                    // It's a stage list, but we don't have its value, so [] will have to do.
                    meta.stageLists[id] = [name, []];
                }
                break;
            }
            case Inputs_1.primitiveInputTypes.broadcast:
                // Broadcasts are stored in the stage, but luckily id and name is all we need.
                meta.broadcasts[id] = name;
                break;
        }
    }
    getInputKeys(opts) {
        return this._getInputs(opts).map(([key]) => key);
    }
    getInputBlockIDsRecursively(collectSubstacks, skipShadow) {
        const blockIDs = new Array();
        const workQueue = this._getInputBlockIDs(collectSubstacks, skipShadow);
        while (workQueue.length > 0) {
            const currentID = workQueue.shift();
            blockIDs.push(currentID);
            const inputs = this._getBlockNode(currentID)._getInputBlockIDs(collectSubstacks, skipShadow);
            workQueue.push(...inputs);
        }
        return blockIDs;
    }
    _getInputs(opts) {
        let keys = Object.keys(this.block.inputs);
        if (opts.skipSubstacks) {
            keys = keys.filter((key) => !(key === "SUBSTACK" || key === "SUBSTACK2"));
        }
        return keys.map((key) => (0, Pair_1.pair)(key, this.getInputMeta(key))).filter(([, inputDep]) => {
            const { input, input: [, inputBlock], shadow, obscured } = inputDep;
            if (opts.skipDeletedInputs && (0, Inputs_1.isDeletedInput)(input)) {
                return false;
            }
            if (opts.skipClearedInputs && (0, Inputs_1.isClearedInput)(input)) {
                return false;
            }
            if (opts.skipUnobscuredShadowBlocks && shadow && !obscured) {
                return false;
            }
            if (opts.skipBroadcasts && (0, Inputs_1.isUnobscuredShadowInput)(input) && (0, Inputs_1.isBroadCastInput)(inputBlock)) {
                return false;
            }
            if (opts.skipUnobscuredPrimitiveInputs && (0, Inputs_1.isUnobscuredShadowInput)(input) && (0, Inputs_1.isPrimitiveInput)(inputBlock)) {
                return false;
            }
            return true;
        });
    }
    supportsInput(key) {
        return (0, blocks_1.supportsInput)(this.block.opcode, key);
    }
    hasField(key) {
        return Object.keys(this.block.fields).includes(key);
    }
    getFieldKeys() {
        return Object.keys(this.block.fields);
    }
    getField(key) {
        if (!this.hasField(key)) {
            throw new errors_1.NoSuchKeyError(`Block "${this.block.opcode}" does not have field "${key}"`);
        }
        return (0, Objects_1.deepCopy)(this.block.fields[key]);
    }
    getPossibleFieldValues(key, skipCurrent) {
        if (!this.hasField(key)) {
            return [];
        }
        const opcode = this.block.opcode;
        const fieldValues = [];
        switch (key) {
            case "STYLE":
                fieldValues.push(...Motion_1.rotationStyles);
                break;
            case "EFFECT":
                if (opcode === "looks_changeeffectby" || opcode === "looks_seteffectto") {
                    fieldValues.push(...Looks_1.looksEffects);
                }
                if (opcode === "sound_changeeffectby" || opcode === "sound_seteffectto") {
                    fieldValues.push(...Sound_1.soundEffects);
                }
                break;
            case "FRONT_BACK":
                fieldValues.push("front", "back");
                break;
            case "FORWARD_BACKWARD":
                fieldValues.push("forward", "backward");
                break;
            case "NUMBER_NAME":
                fieldValues.push("number", "name");
                break;
            case "KEY_OPTION":
                fieldValues.push(...Events_1.keys);
                break;
            case "BACKDROP": {
                const backdrops = this._getStage().costumes.map(({ name }) => name);
                fieldValues.push(...backdrops);
                if (opcode === "looks_backdrops") {
                    fieldValues.push("next backdrop", "previous backdrop", "random backdrop");
                }
                break;
            }
            case "WHENGREATERTHANMENU":
                fieldValues.push("LOUDNESS", "TIMER");
                break;
            case "BROADCAST_OPTION":
                fieldValues.push(...Object.entries(this._getStage().broadcasts));
                break;
            case "STOP_OPTION":
                fieldValues.push("other scripts in sprite");
                // These choices are only available if the "control_stop" block isn't connected to a `next` block.
                // (A "control_stop" block may change its shape depending on the selected option.)
                if (!this.hasNext()) {
                    fieldValues.push("all", "this script");
                }
                break;
            case "DRAG_MODE":
                fieldValues.push("draggable", "not draggable");
                break;
            case "PROPERTY": { // field of block with opcode "sensing_of"
                // The options in the rectangular drop-down menu change depending on which target is selected in the
                // oval-shaped drop-down menu
                const [shadowType, inputBlock, obscuredBlock] = this.block.inputs.OBJECT;
                const shadowBlock = (shadowType === Inputs_1.shadowTypes.obscuredShadow ? obscuredBlock : inputBlock);
                const [targetName] = this.target.blocks[shadowBlock].getField("OBJECT");
                const sensingStage = targetName === selectors_1.STAGE_NAME;
                const properties = sensingStage ? Sensing_1.stageProperties : Sensing_1.spriteProperties;
                const variables = (sensingStage ? this._getStage() : this._getSprite(targetName)).variables;
                const variableNames = Object.values(variables).map((v) => (0, blocks_1.variableName)(v));
                fieldValues.push(...properties, ...variableNames);
                break;
            }
            case "CURRENTMENU":
                fieldValues.push(...Sensing_1.sensingCurrentOptions);
                break;
            case "OPERATOR":
                fieldValues.push(...Operators_1.operators);
                break;
            case "VARIABLE": {
                const stageVariables = Object.entries(this._getStage().variables);
                fieldValues.push(...stageVariables);
                if (!this._target.isStage) {
                    const ownVariables = Object.entries(this._target.variables);
                    fieldValues.push(...ownVariables);
                }
                break;
            }
            case "LIST": {
                const stageLists = Object.entries(this._getStage().lists);
                fieldValues.push(...stageLists);
                if (!this._target.isStage) {
                    const ownLists = Object.entries(this._target.lists);
                    fieldValues.push(...ownLists);
                }
                break;
            }
            case "TO":
                fieldValues.push(...this._getOtherSpriteNames(), "_random_", "_mouse_");
                break;
            case "TOWARDS":
                fieldValues.push(...this._getOtherSpriteNames(), "_mouse_");
                break;
            case "COSTUME":
                fieldValues.push(...this.target.costumes.map(({ name }) => name));
                break;
            case "SOUND_MENU": {
                const sounds = this.target.sounds.map(({ name }) => name);
                // Special handling required: While it is not possible to delete the last costume of a sprite, one
                // can very well delete the last sound asset. In this case, we mimic the behavior of the Scratch IDE
                // and only offer the empty string (which seems to stand for "no sound") for choice.
                if (sounds.length === 0) {
                    sounds.push("");
                }
                fieldValues.push(...sounds);
                break;
            }
            case "CLONE_OPTION":
                fieldValues.push(...this._getOtherSpriteNames());
                if (!this._target.isStage) {
                    fieldValues.push("_myself_");
                }
                break;
            case "TOUCHINGOBJECTMENU":
                fieldValues.push(...this._getOtherSpriteNames(), "_mouse_", "_edge_");
                break;
            case "DISTANCETOMENU":
                fieldValues.push(...this._getOtherSpriteNames(), "_mouse_");
                break;
            case "OBJECT":
                fieldValues.push(...this._getOtherSpriteNames(), selectors_1.STAGE_NAME);
                break;
            case "VALUE":
                logger_1.default.warn("Argument definitions in the signature of custom blocks currently not handled");
                break;
            case "colorParam":
                fieldValues.push(...Pen_1.colorParamOptions);
                break;
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(key, `Unhandled field key "${key}"`);
        }
        const fields = fieldValues.map((value) => {
            if (key === "BROADCAST_OPTION") {
                return (0, Fields_1.broadcastToField)(value);
            }
            if (key === "VARIABLE") {
                return (0, Fields_1.variableToField)(value);
            }
            if (key === "LIST") {
                return (0, Fields_1.listToField)(value);
            }
            return [value, null];
        });
        if (skipCurrent) {
            const current = this.block.fields[key];
            return Arrays_1.default.removeElem(fields, current);
        }
        return fields;
    }
    switchToValidFieldValueIfNecessary(key) {
        if (!this.getFieldKeys().includes(key)) {
            throw new errors_1.NoSuchKeyError(key);
        }
        const values = this.getPossibleFieldValues(key, false);
        if (values.length === 0) {
            logger_1.default.warn(`Warning: Cannot switch to valid field value for key "${key}"!`);
            return;
        }
        const [current] = this.block.fields[key];
        if (values.some(([value]) => value === current)) {
            return; // already valid entry selected
        }
        // Try to find a valid value with the lowest string edit distance to the current selection, and switch to it.
        const distances = values.map(([value]) => Statistics_1.default.levenshteinDistance(current.toLocaleLowerCase(), value.toLocaleLowerCase()));
        const idx = distances.indexOf(Math.min(...distances));
        this.setField(key, values[idx]);
    }
    setField(key, field) {
        if (!this.hasField(key)) {
            throw new errors_1.NoSuchKeyError(`Block "${this.block.opcode}" does not support field "${key}"`);
        }
        this.block.fields[key] = field;
        // If switching to a different target in the "sensing_of_object_menu" block, we might have to change the sensed
        // property in its parent (the "sensing_of" block), too.
        if (key === "OBJECT") {
            this.getParent().switchToValidFieldValueIfNecessary("PROPERTY");
        }
    }
    getPossibleBroadcastInputs(skipCurrentInput) {
        if (!Object.keys(this.block.inputs).includes("BROADCAST_INPUT")) {
            return [];
        }
        const broadcasts = Object.entries(this._getStage().broadcasts);
        const inputs = broadcasts.map(([id, name]) => [Inputs_1.primitiveInputTypes.broadcast, name, id]);
        if (skipCurrentInput) {
            const [shadowType, unobscured, obscured] = this.block.inputs["BROADCAST_INPUT"];
            const toSkip = (shadowType === Inputs_1.shadowTypes.unobscuredShadow ? unobscured : obscured);
            return Arrays_1.default.removeElem(inputs, toSkip);
        }
        return inputs;
    }
    setInput(key, newInput, replace) {
        if (!(0, blocks_1.supportsInput)(this.block, key)) {
            throw new errors_1.NoSuchKeyError(`Block "${this.block.opcode}" does not take input "${key}"`);
        }
        // If `replace` is truthy, the new input is just set, without trying to obscure the existing input.
        // Boolean inputs and SUBSTACK(2) are always just set.
        if (replace || (0, Inputs_1.isDeletedInput)(newInput) || (0, Inputs_1.isNoShadowInput)(newInput)) {
            this.block.inputs[key] = newInput;
            return;
        }
        const [currentShadow, currentInputBlock, currentObscuredBlock] = this.block.inputs[key];
        // Note: the obscured part of the new input is never inserted.
        const [newShadow, newInputBlock] = newInput;
        // If the new input is unobscured, it simply replaces the current input.
        if (newShadow === Inputs_1.shadowTypes.unobscuredShadow) {
            this.block.inputs[key] = [
                Inputs_1.shadowTypes.unobscuredShadow,
                newInputBlock,
            ];
            return;
        }
        // If the current input is unobscured, it is now obscured by the new input.
        if (currentShadow === Inputs_1.shadowTypes.unobscuredShadow) {
            this.block.inputs[key] = [
                Inputs_1.shadowTypes.obscuredShadow,
                newInputBlock,
                currentInputBlock,
            ];
            return;
        }
        // If the current input is obscured, the obscuring block is replaced with the new input. The current obscured
        // input stays the same.
        if (currentShadow === Inputs_1.shadowTypes.obscuredShadow) {
            this.block.inputs[key] = [
                Inputs_1.shadowTypes.obscuredShadow,
                newInputBlock,
                currentObscuredBlock,
            ];
            return;
        }
        throw new Error(`Unhandled combination of shadow types "${currentShadow}" and "${newShadow}"`);
    }
    setBlockAsInput(key, blockID) {
        const inputs = this.block.inputs;
        if (!(key in inputs) || (0, Inputs_1.isDeletedInput)(inputs[key])) {
            // Input key does not exist (yet), or input has been deleted. This is only possible for boolean inputs or
            // substacks.
            inputs[key] = [
                Inputs_1.shadowTypes.noShadow,
                blockID,
            ];
            return null;
        }
        const [inputType, oldInput, obscuredInput] = inputs[key];
        switch (inputType) {
            case Inputs_1.shadowTypes.unobscuredShadow:
                // The new input obscures the current input.
                inputs[key] = [
                    Inputs_1.shadowTypes.obscuredShadow,
                    blockID,
                    oldInput,
                ];
                if ((0, Block_1.isBlockID)(oldInput)) {
                    const inputNode = this.target.blocks[oldInput];
                    if (inputNode.isShadow()) {
                        // Obscured oval-shaped drop-down menus must become standalone scripts!
                        inputNode.makeStandaloneScript();
                    }
                }
                return null;
            case Inputs_1.shadowTypes.noShadow:
                // Replace existing input
                inputs[key] = [
                    Inputs_1.shadowTypes.noShadow,
                    blockID,
                ];
                return this._getBlockNode(oldInput);
            case Inputs_1.shadowTypes.obscuredShadow:
                // Replace the old obscuring input with the new input. The obscured input stays the same.
                inputs[key] = [
                    Inputs_1.shadowTypes.obscuredShadow,
                    blockID,
                    obscuredInput,
                ];
                return (0, Block_1.isBlockID)(oldInput) ? this._getBlockNode(oldInput) : null;
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(inputType, `Unhandled shadow type "${inputType}"`);
        }
    }
    setVarListBlockAsInput(key, varListInput) {
        varListInput = varListInput.slice(0, 3); // remove x and y coordinates if any
        const inputs = this.block.inputs;
        if (!(key in inputs) || (0, Inputs_1.isDeletedInput)(inputs[key])) {
            throw new Error(`Input "${key}" does not exist, or cannot take a variable/list block`);
        }
        const [inputType, oldInput, obscuredInput] = inputs[key];
        switch (inputType) {
            case Inputs_1.shadowTypes.unobscuredShadow:
                // The new input obscures the current input.
                inputs[key] = [
                    Inputs_1.shadowTypes.obscuredShadow,
                    varListInput,
                    oldInput,
                ];
                if ((0, Block_1.isBlockID)(oldInput)) {
                    const inputNode = this.target.blocks[oldInput];
                    if (inputNode.isShadow()) {
                        // Obscured oval-shaped drop-down menus must become standalone scripts!
                        inputNode.makeStandaloneScript();
                    }
                }
                return null;
            case Inputs_1.shadowTypes.noShadow:
                throw new Error(`Input "${key}" cannot take variable/list block`);
            case Inputs_1.shadowTypes.obscuredShadow:
                // Replace the old obscuring input with the new input. The obscured input stays the same.
                inputs[key] = [
                    Inputs_1.shadowTypes.obscuredShadow,
                    varListInput,
                    obscuredInput,
                ];
                return (0, Block_1.isBlockID)(oldInput) ? this._getBlockNode(oldInput) : null;
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(inputType, `Unhandled shadow type "${inputType}"`);
        }
    }
    setNonTopLevel() {
        this.block.topLevel = false;
        delete this.block['x'];
        delete this.block['y'];
    }
    setTopLevel(x, y) {
        this.block['x'] = x;
        this.block['y'] = y;
        this.block.topLevel = true;
    }
    _maxX() {
        const blocks = Object.values(this.target.blocks);
        const xValues = blocks
            .filter((b) => b.isTopLevel() && !b.isShadow() && b.blockID !== this.blockID)
            .map((b) => b.getX());
        return Math.max(-xOffset, ...xValues);
    }
    makeStandaloneScript() {
        this.setTopLevel(this._maxX() + xOffset, 0);
        this.block.parent = null;
    }
    setChildByKey(key, child) {
        switch (key) {
            case "next":
                this.setNext(child);
                return;
            case "SUBSTACK":
                this.setSubstack(child);
                return;
            case "SUBSTACK2":
                this.setSubstack2(child);
                return;
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(key, `Unhandled key "${key}"`);
        }
    }
    setSubstack(substack) {
        this._setSubstackByKey("SUBSTACK", substack);
    }
    setSubstack2(substack2) {
        this._setSubstackByKey("SUBSTACK2", substack2);
    }
    _setSubstackByKey(key, substack) {
        if (substack === null) {
            this._deleteSubstackByKey(key);
            return;
        }
        if (substack.target.name !== this.target.name) {
            throw new errors_1.InvalidBlockError(`Blocks must belong to the same target (${this.target.name})`);
        }
        this.block.inputs[key] = [Inputs_1.shadowTypes.noShadow, substack.blockID];
    }
    _deleteSubstackByKey(key) {
        delete this.block.inputs[key];
    }
    canDeleteInput(key) {
        if (!(0, blocks_1.getInputKeys)(this.block).includes(key)) {
            return false;
        }
        const input = this.block.inputs[key];
        if ((0, Inputs_1.isUnobscuredShadowInput)(input)) {
            const [, inputBlock] = input;
            if ((0, Block_1.isBlockID)(inputBlock)) {
                // Attempting to delete an oval-shaped drop-down menu... This cannot work!
                return false;
            }
            // Cannot delete...
            // (1) oval-shaped drop-down menus for broadcasts (otherwise, project fails to load)
            // (2) color inputs (otherwise, project fails to load)
            // (3) angle inputs (project does load, but angle defaults to 0 – debatable?)
            const blacklist = [
                Inputs_1.primitiveInputTypes.broadcast,
                Inputs_1.primitiveInputTypes.color,
                Inputs_1.primitiveInputTypes.angle,
            ];
            const [primitiveInputType] = inputBlock;
            if (blacklist.includes(primitiveInputType)) {
                return false;
            }
        }
        return true;
    }
    deleteInput(key) {
        if (!this.canDeleteInput(key)) {
            const blockID = this.blockID;
            const opcode = this.block.opcode;
            throw new errors_1.InvalidBlockError(`Cannot delete input "${key}" of block "${blockID}" with opcode "${opcode}"`);
        }
        const inputs = this.block.inputs;
        if (!(key in inputs)) {
            // The current block is a C-block or boolean block but no substack or hexagonal input has been set yet.
            // In these cases, the key is actually absent.
            return {};
        }
        const [type, input, obscuredInput] = inputs[key];
        switch (type) {
            case Inputs_1.shadowTypes.unobscuredShadow:
                if (input === null) {
                    // The current block is a C-block or boolean block whose substack or hexagonal input has already
                    // been deleted. type === 1 and input === null is a dummy that represents the absence of an input.
                    return {};
                }
                // The input must be a PrimitiveShadowInput, and accepts literal text (or numbers), so just clear it.
                input[1] = "";
                return {};
            case Inputs_1.shadowTypes.noShadow:
                // It's a reference to the first block in a substack, or a conditional block. Instead of just
                // deleting the key, we do the same as the Scratch IDE, and use a "dummy" input to signal the
                // absence of any input.
                inputs[key] = (0, Inputs_1.deletedInput)();
                return {
                    deleted: this._getBlockNode(input),
                };
            case Inputs_1.shadowTypes.obscuredShadow: {
                // Remove the obscuring block to reveal the obscured block.
                inputs[key] = [
                    Inputs_1.shadowTypes.unobscuredShadow,
                    obscuredInput,
                ];
                return Object.assign(Object.assign({}, ((0, Block_1.isBlockID)(input) && { deleted: this._getBlockNode(input) })), ((0, Block_1.isBlockID)(obscuredInput) && { revealed: this._getBlockNode(obscuredInput) }));
            }
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(type, `Unhandled input type "${type}"`);
        }
    }
    deleteInputBlock(toDelete) {
        if (!this.hasInputNode(toDelete)) {
            throw new errors_1.NoSuchBlockError(toDelete.blockID);
        }
        if (toDelete.isShadow()) {
            throw new errors_1.InvalidBlockError(`Must not delete drop-down menu block "${toDelete.blockID}"`);
        }
        for (const [inputKey, input] of Object.entries(this.block.inputs)) {
            if (input[1] === toDelete.blockID) {
                this.deleteInput(inputKey);
            }
        }
    }
    deleteCascade() {
        return this._delete({ skipSubstacks: false, skipNext: false });
    }
    deleteCascadeSubstacks() {
        return this._delete({ skipSubstacks: false, skipNext: true });
    }
    delete() {
        return this._delete({ skipSubstacks: true, skipNext: true });
    }
    _delete(delOpts) {
        const inputs = Object.entries(this.block.inputs);
        if (delOpts.skipSubstacks) {
            Arrays_1.default.removeIf(inputs, ([key]) => key === "SUBSTACK" || key === "SUBSTACK2");
        }
        const deletedBlocks = new Array();
        // Delete inputs.
        for (const [, input] of inputs) {
            for (const blockID of (0, blocks_1.getBlockIDs)(input)) {
                const deletedInputs = this._getBlockNode(blockID).deleteCascade();
                deletedBlocks.push(...deletedInputs);
            }
        }
        const next = this.getNext();
        // Delete this block itself.
        delete this.target.blocks[this.blockID];
        deletedBlocks.push(this);
        if (!next || delOpts.skipNext) {
            return deletedBlocks;
        }
        // Delete all next blocks.
        const deletedNexts = next.deleteCascade();
        deletedBlocks.push(...deletedNexts);
        return deletedBlocks;
    }
    toString() {
        return `${this.block.opcode} ("${this.blockID}")`;
    }
    [Symbol.iterator]() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current = this;
        return {
            next: () => {
                if (current) {
                    const result = { done: false, value: current };
                    current = current.getNext();
                    return result;
                }
                return {
                    done: true,
                    value: null,
                };
            }
        };
    }
}
exports.BlockNode = BlockNode;
class VarListNode extends BlockWrapper {
    constructor(blockID, block, target, project) {
        super(blockID, block, target, project);
    }
    getX() {
        return this.block[3];
    }
    getScriptRoot() {
        return this;
    }
    getStackRoot() {
        return null;
    }
    isRootOfScriptOrSubstack() {
        return true; // always toplevel, and thus always root
    }
    isRootOfSubstack() {
        return false;
    }
    isTosInSubstackOf() {
        return false;
    }
    isTosInSubstack2Of() {
        return false;
    }
    getParent() {
        return null;
    }
    getParentID() {
        return null;
    }
    getNext() {
        return null;
    }
    getNextID() {
        return null;
    }
    getNextIDs(skipSelf) {
        return skipSelf ? [] : [this.blockID];
    }
    getLastID() {
        return this.blockID;
    }
    getReferencedBlockIDs() {
        return [];
    }
    hasParent() {
        return false;
    }
    hasNext() {
        return false;
    }
    hasInputNode() {
        return null;
    }
    isInputOf() {
        return null;
    }
    isTopLevel() {
        return true;
    }
    isCBlock() {
        return false;
    }
    isCapBlock() {
        return false;
    }
    isHatBlock() {
        return false;
    }
    isStackBlock() {
        return false;
    }
    isStackable() {
        return false;
    }
    isMotionBlock() {
        return false;
    }
    isReporterBlock() {
        return true;
    }
    isShadow() {
        return false;
    }
    canBeLive() {
        return false;
    }
    hasSubstack() {
        return false;
    }
    hasSubstack2() {
        return false;
    }
    getBlockMeta(traversal) {
        if (traversal.nextBlocks && traversal.lastBlock !== this.blockID) {
            throw new errors_1.InvalidBlockError(`Did not expect to be given the block ID "${traversal.lastBlock}"`);
        }
        const blockMeta = (0, meta_1.emptyBlockMeta)(this.blockID, this.blockID);
        blockMeta.blocks[this.blockID] = this.block;
        const [type, name, id] = this.block;
        if (type === Inputs_1.primitiveInputTypes.variable) {
            const isSpriteOnly = id in this.target.variables;
            if (isSpriteOnly) {
                blockMeta.variables[id] = this.target.variables[id];
            }
            else {
                blockMeta.stageVariables[id] = [name, 0]; // 0 as dummy/default value
            }
        }
        else if (type === Inputs_1.primitiveInputTypes.list) {
            const isSpriteOnly = id in this.target.lists[id];
            if (isSpriteOnly) {
                blockMeta.lists[id] = this.target.lists[id];
            }
            else {
                blockMeta.stageLists[id] = [name, []]; // [] as dummy/default value
            }
        }
        else {
            throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(type, `Unhandled input type "${type}"`);
        }
        return (0, Objects_1.deepCopy)(blockMeta);
    }
    sliceTo(blockID) {
        return this.getBlockMeta({ substacks: false, nextBlocks: true, lastBlock: blockID });
    }
    getInputNode() {
        return null;
    }
    getInputNodes() {
        return [];
    }
    getInputMeta(key) {
        throw new errors_1.NoSuchKeyError(`Variable/list block does not take input "${key}"`);
    }
    getInputKeys() {
        return [];
    }
    getInputBlockIDsRecursively() {
        return [];
    }
    supportsInput() {
        return false;
    }
    hasField() {
        return false;
    }
    getField(key) {
        throw new errors_1.NoSuchKeyError(`Variable/list block does not have field "${key}"`);
    }
    getFieldKeys() {
        return [];
    }
    getPossibleFieldValues() {
        return [];
    }
    switchToValidFieldValueIfNecessary(_key) {
        // does not have a field
    }
    getPossibleBroadcastInputs() {
        return [];
    }
    makeStandaloneScript() {
        // already standalone
    }
    canDeleteInput(_key) {
        return false;
    }
    delete() {
        delete this.target.blocks[this.blockID];
        return [this];
    }
    deleteCascade() {
        return this.delete();
    }
    deleteCascadeSubstacks() {
        return this.delete();
    }
    toString() {
        const [inputType] = this.block;
        const name = inputType === Inputs_1.primitiveInputTypes.variable ? "variable" : "list";
        return `${this.blockID} (toplevel ${name} block)`;
    }
    [Symbol.iterator]() {
        let done = false;
        return {
            next: () => {
                if (done) {
                    return { done, value: null };
                }
                const result = { done, value: this };
                done = true;
                return result;
            }
        };
    }
}
exports.VarListNode = VarListNode;
function node(blockID, block, target, project) {
    return (0, Block_1.isBlock)(block) ?
        new BlockNode(blockID, block, target, project) :
        new VarListNode(blockID, block, target, project);
}
exports.node = node;
