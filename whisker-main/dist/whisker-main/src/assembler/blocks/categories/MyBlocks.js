"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomBlock = void 0;
const Opcode_1 = require("../Opcode");
/**
 * Tells whether the given block is a custom block.
 * https://en.scratch-wiki.info/wiki/My_Blocks
 *
 * @param block the block to check
 */
function isCustomBlock(block) {
    return Opcode_1.customBlockOpcodes.includes(block.opcode);
}
exports.isCustomBlock = isCustomBlock;
