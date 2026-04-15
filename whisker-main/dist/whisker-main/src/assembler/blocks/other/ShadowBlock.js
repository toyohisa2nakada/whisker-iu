"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObscuredShadowBlock = exports.isShadowBlock = void 0;
const Block_1 = require("../Block");
const Opcode_1 = require("../Opcode");
function isShadowBlock(b) {
    return (0, Block_1.isBlock)(b)
        && Opcode_1.shadowBlockOpcodes.includes(b.opcode)
        && b.next === null
        && b.shadow === true;
}
exports.isShadowBlock = isShadowBlock;
function isObscuredShadowBlock(b) {
    return isShadowBlock(b) && (0, Block_1.isTopLevelBlock)(b);
}
exports.isObscuredShadowBlock = isObscuredShadowBlock;
