"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCapBlock = void 0;
const Opcode_1 = require("../Opcode");
const Block_1 = require("../Block");
/**
 * Tells whether the given block is a cap block.
 * https://en.scratch-wiki.info/wiki/Cap_Block
 *
 * @param block the block to check
 */
function isCapBlock(block) {
    if (!(0, Block_1.isBlock)(block)) {
        return false;
    }
    if (block.opcode !== "control_stop") {
        return Opcode_1.capBlockOpcodes.includes(block.opcode);
    }
    // Stop blocks can change their shape depending on the selected stop option.
    const stopBlock = block;
    const [stopOption] = stopBlock.fields.STOP_OPTION;
    return stopOption !== "other scripts in sprite";
}
exports.isCapBlock = isCapBlock;
