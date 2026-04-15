"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReporterBlock = exports.isBooleanReporterBlock = exports.isStringNumberReporterBlock = void 0;
const Block_1 = require("../Block");
const Opcode_1 = require("../Opcode");
const Inputs_1 = require("../Inputs");
/**
 * Tells whether the given block is a reporter block.
 * https://en.scratch-wiki.info/wiki/Reporter_Block
 *
 * @param block the block to check
 */
function isStringNumberReporterBlock(block) {
    if ((0, Inputs_1.isTopLevelDataBlock)(block)) {
        // Note: a top-level list block reports the contents of the list as string.
        return true;
    }
    return Opcode_1.numberStringReporterBlockOpcodes.includes(block.opcode);
}
exports.isStringNumberReporterBlock = isStringNumberReporterBlock;
/**
 * Tells whether the given block is a boolean block.
 * https://en.scratch-wiki.info/wiki/Boolean_Block
 *
 * @param block the block to check
 */
function isBooleanReporterBlock(block) {
    return (0, Block_1.isBlock)(block) && Opcode_1.booleanReporterBlockOpcodes.includes(block.opcode);
}
exports.isBooleanReporterBlock = isBooleanReporterBlock;
function isReporterBlock(block) {
    if ((0, Inputs_1.isTopLevelDataBlock)(block)) {
        return true;
    }
    return Opcode_1.reporterBlockOpcodes.includes(block.opcode);
}
exports.isReporterBlock = isReporterBlock;
