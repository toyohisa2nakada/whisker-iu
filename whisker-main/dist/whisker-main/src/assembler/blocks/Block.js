"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackableBlockOpcodes = exports.isStackableBlock = exports.isScratchBlock = exports.isBlockID = exports.isBlock = exports.isObscuredDropDownMenu = exports.isTopLevelBlock = void 0;
const Inputs_1 = require("./Inputs");
const Opcode_1 = require("./Opcode");
const StackBlock_1 = require("./shapes/StackBlock");
const CBlock_1 = require("./shapes/CBlock");
const CapBlock_1 = require("./shapes/CapBlock");
const HatBlock_1 = require("./shapes/HatBlock");
const ShadowBlock_1 = require("./other/ShadowBlock");
function isTopLevelBlock(block) {
    return block.topLevel && block.parent === null && block['x'] !== undefined && block['y'] !== undefined;
}
exports.isTopLevelBlock = isTopLevelBlock;
/**
 * Tells whether the given block represents an oval-shaped dropdown menu that is currently obscured by another input,
 * e.g., a variable block, or another reporter block.
 *
 * @param block the block to check
 */
function isObscuredDropDownMenu(block) {
    /*
     * This is a funny one. When obscuring an oval-shaped dropdown menu with another input, Scratch sets its parent to
     * null. Then, the dropdown menu no longer knows which block it belonged to, thus effectively disabling it. However,
     * only toplevel blocks can have null as parent. So, Scratch also has to set toplevel = true, and add useless x and
     * y properties. To avoid drawing the dropdown menu as separate block, it also sets the shadow property to true.
     * (Regardless of whether the menu is obscured or not.) This indicates the block is just a fake block.
     *
     * "A shadow block is a reporter in an input for which one can enter or pick a value, and which cannot be dragged
     * around but can be replaced by a normal reporter. Scratch internally considers these to be blocks, although they
     * are not usually thought of as such. (These notions come from Blockly, which Scratch Blocks is based on.)"
     *
     * https://en.scratch-wiki.info/wiki/Scratch_File_Format#Blocks
     */
    return Opcode_1.dropDownMenuOpcodes.includes(block.opcode) &&
        block.shadow && isTopLevelBlock(block);
}
exports.isObscuredDropDownMenu = isObscuredDropDownMenu;
// eslint-disable-next-line @typescript-eslint/ban-types
function isBlock(o) {
    return ("opcode" in o && typeof o["opcode"] === "string" &&
        "topLevel" in o && typeof o["topLevel"] === "boolean" &&
        "shadow" in o && typeof o["shadow"] === "boolean" &&
        "fields" in o && typeof o["fields"] === "object" &&
        "inputs" in o && typeof o["inputs"] === "object");
}
exports.isBlock = isBlock;
function isBlockID(x) {
    return typeof x === "string";
}
exports.isBlockID = isBlockID;
// eslint-disable-next-line @typescript-eslint/ban-types
function isScratchBlock(o) {
    return isBlock(o) || (0, Inputs_1.isTopLevelDataBlock)(o);
}
exports.isScratchBlock = isScratchBlock;
function isStackableBlock(b) {
    return !(0, ShadowBlock_1.isShadowBlock)(b) && ((0, StackBlock_1.isStackBlock)(b) ||
        (0, CBlock_1.isCBlock)(b) ||
        (0, CapBlock_1.isCapBlock)(b) ||
        (0, HatBlock_1.isHatBlock)(b));
}
exports.isStackableBlock = isStackableBlock;
exports.stackableBlockOpcodes = Object.freeze([
    ...Opcode_1.stackBlockOpcodes,
    ...Opcode_1.cBlockOpcodes,
    ...Opcode_1.capBlockOpcodes,
    ...Opcode_1.hatBlockOpcodes,
].filter((opcode) => !Opcode_1.shadowBlockOpcodes.includes(opcode)));
