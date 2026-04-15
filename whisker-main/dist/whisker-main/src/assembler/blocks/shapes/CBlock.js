"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCBlock = void 0;
const Opcode_1 = require("../Opcode");
const Block_1 = require("../Block");
/**
 * Tells whether the given block is a C-block.
 * https://en.scratch-wiki.info/wiki/C_Block
 *
 * @param o the block to check
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isCBlock(o) {
    return (0, Block_1.isBlock)(o) && Opcode_1.cBlockOpcodes.includes(o.opcode);
}
exports.isCBlock = isCBlock;
