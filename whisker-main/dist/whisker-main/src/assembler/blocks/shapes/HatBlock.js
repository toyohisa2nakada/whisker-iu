"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHatBlock = void 0;
const Opcode_1 = require("../Opcode");
const Block_1 = require("../Block");
/**
 * Tells whether the given block is a hat block.
 * https://en.scratch-wiki.info/wiki/Hat_Block
 *
 * @param o the block to check
 */
function isHatBlock(o) {
    return (0, Block_1.isBlock)(o) && Opcode_1.hatBlockOpcodes.includes(o.opcode);
}
exports.isHatBlock = isHatBlock;
