"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOperatorBlock = exports.operatorMathOp = exports.operators = exports.operatorRound = exports.operatorContains = exports.operatorLength = exports.operatorLetterOf = exports.operatorJoin = exports.operatorNot = exports.operatorOr = exports.operatorAnd = exports.operatorEquals = exports.operatorLt = exports.operatorGt = exports.operatorRandom = exports.operatorMod = exports.operatorDivide = exports.operatorMultiply = exports.operatorSubtract = exports.operatorAdd = void 0;
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const BlockFactory_1 = require("../BlockFactory");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
function operatorAdd(num1 = "", num2 = "") {
    const block = {
        "opcode": "operator_add",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM1": (0, Inputs_1.mathNumberInput)(num1),
            "NUM2": (0, Inputs_1.mathNumberInput)(num2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorAdd = operatorAdd;
function operatorSubtract(num1 = "", num2 = "") {
    const block = {
        "opcode": "operator_subtract",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM1": (0, Inputs_1.mathNumberInput)(num1),
            "NUM2": (0, Inputs_1.mathNumberInput)(num2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorSubtract = operatorSubtract;
function operatorMultiply(num1 = "", num2 = "") {
    const block = {
        "opcode": "operator_multiply",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM1": (0, Inputs_1.mathNumberInput)(num1),
            "NUM2": (0, Inputs_1.mathNumberInput)(num2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorMultiply = operatorMultiply;
function operatorDivide(num1 = "", num2 = "") {
    const block = {
        "opcode": "operator_divide",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM1": (0, Inputs_1.mathNumberInput)(num1),
            "NUM2": (0, Inputs_1.mathNumberInput)(num2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorDivide = operatorDivide;
function operatorMod(num1 = "", num2 = "") {
    const block = {
        "opcode": "operator_mod",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM1": (0, Inputs_1.mathNumberInput)(num1),
            "NUM2": (0, Inputs_1.mathNumberInput)(num2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorMod = operatorMod;
function operatorRandom(from = 1, to = 10) {
    const block = {
        "opcode": "operator_random",
        "next": null,
        "parent": null,
        "inputs": {
            "FROM": (0, Inputs_1.mathNumberInput)(from),
            "TO": (0, Inputs_1.mathNumberInput)(to)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorRandom = operatorRandom;
function operatorGt(operand1 = "", operand2 = 50) {
    const block = {
        "opcode": "operator_gt",
        "next": null,
        "parent": null,
        "inputs": {
            "OPERAND1": (0, Inputs_1.mathNumberInput)(operand1),
            "OPERAND2": (0, Inputs_1.mathNumberInput)(operand2),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorGt = operatorGt;
function operatorLt(operand1 = "", operand2 = 50) {
    const block = {
        "opcode": "operator_lt",
        "next": null,
        "parent": null,
        "inputs": {
            "OPERAND1": (0, Inputs_1.mathNumberInput)(operand1),
            "OPERAND2": (0, Inputs_1.mathNumberInput)(operand2),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorLt = operatorLt;
function operatorEquals(operand1 = "", operand2 = 50) {
    const block = {
        "opcode": "operator_equals",
        "next": null,
        "parent": null,
        "inputs": {
            "OPERAND1": (0, Inputs_1.mathNumberInput)(operand1),
            "OPERAND2": (0, Inputs_1.mathNumberInput)(operand2),
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorEquals = operatorEquals;
function operatorAnd() {
    const block = {
        "opcode": "operator_and",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorAnd = operatorAnd;
function operatorOr() {
    const block = {
        "opcode": "operator_or",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorOr = operatorOr;
function operatorNot() {
    const block = {
        "opcode": "operator_not",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorNot = operatorNot;
function operatorJoin(string1 = "apple", string2 = "banana") {
    const block = {
        "opcode": "operator_join",
        "next": null,
        "parent": null,
        "inputs": {
            "STRING1": (0, Inputs_1.textInput)(string1),
            "STRING2": (0, Inputs_1.textInput)(string2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorJoin = operatorJoin;
function operatorLetterOf(letter = 1, string = "apple") {
    const block = {
        "opcode": "operator_letter_of",
        "next": null,
        "parent": null,
        "inputs": {
            "LETTER": (0, Inputs_1.mathWholeNumberInput)(letter),
            "STRING": (0, Inputs_1.textInput)(string)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorLetterOf = operatorLetterOf;
function operatorLength(string = "apple") {
    const block = {
        "opcode": "operator_length",
        "next": null,
        "parent": null,
        "inputs": {
            "STRING": (0, Inputs_1.textInput)(string)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorLength = operatorLength;
function operatorContains(string1 = "apple", string2 = "banana") {
    const block = {
        "opcode": "operator_contains",
        "next": null,
        "parent": null,
        "inputs": {
            "STRING1": (0, Inputs_1.textInput)(string1),
            "STRING2": (0, Inputs_1.textInput)(string2)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorContains = operatorContains;
function operatorRound(num = "") {
    const block = {
        "opcode": "operator_round",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM": (0, Inputs_1.mathNumberInput)(num)
        },
        "fields": {},
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorRound = operatorRound;
exports.operators = Object.freeze([
    "abs",
    "floor",
    "ceiling",
    "sqrt",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "ln",
    "log",
    "e ^",
    "10 ^",
]);
function operatorMathOp(operator = "abs", num = "") {
    const block = {
        "opcode": "operator_mathop",
        "next": null,
        "parent": null,
        "inputs": {
            "NUM": (0, Inputs_1.mathNumberInput)(num)
        },
        "fields": {
            "OPERATOR": [
                operator,
                null
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.operatorMathOp = operatorMathOp;
/**
 * Tells whether the given block is an operator block.
 * https://en.scratch-wiki.info/wiki/Operators_Blocks
 *
 * @param block the block to check
 */
function isOperatorBlock(block) {
    return Opcode_1.operatorBlockOpcodes.includes(block.opcode);
}
exports.isOperatorBlock = isOperatorBlock;
