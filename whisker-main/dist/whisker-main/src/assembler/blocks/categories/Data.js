"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudVariable = exports.isDataBlock = exports.dataHideList = exports.dataShowList = exports.dataListContainsItem = exports.dataLengthOfList = exports.dataItemNumOfList = exports.dataItemOfList = exports.dataReplaceItemOfList = exports.dataInsertAtList = exports.dataDeleteAllOfList = exports.dataDeleteOfList = exports.dataAddToList = exports.dataHideVariable = exports.dataShowVariable = exports.dataChangeVariableBy = exports.dataSetVariableTo = void 0;
const Inputs_1 = require("../Inputs");
const Opcode_1 = require("../Opcode");
const BlockFactory_1 = require("../BlockFactory");
const uid_1 = __importDefault(require("scratch-vm/src/util/uid"));
const defaultVariableName = "my variable";
const defaultListName = "my list";
const defaultItem = "thing";
const defaultIndex = 1;
function dataSetVariableTo(variableName = defaultVariableName, value = "0") {
    const block = {
        "opcode": "data_setvariableto",
        "next": null,
        "parent": null,
        "inputs": {
            "VALUE": (0, Inputs_1.textInput)(value),
        },
        "fields": {
            "VARIABLE": [
                variableName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataSetVariableTo = dataSetVariableTo;
function dataChangeVariableBy(variableName = defaultVariableName, value = 1) {
    const block = {
        "opcode": "data_changevariableby",
        "next": null,
        "parent": null,
        "inputs": {
            "VALUE": (0, Inputs_1.mathNumberInput)(value)
        },
        "fields": {
            "VARIABLE": [
                variableName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataChangeVariableBy = dataChangeVariableBy;
function dataShowVariable(variableName = defaultVariableName) {
    const block = {
        "opcode": "data_showvariable",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "VARIABLE": [
                variableName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataShowVariable = dataShowVariable;
function dataHideVariable(variableName = defaultVariableName) {
    const block = {
        "opcode": "data_hidevariable",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "VARIABLE": [
                variableName,
                (0, uid_1.default)()
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataHideVariable = dataHideVariable;
function dataAddToList(item = defaultItem, listName = defaultListName) {
    const block = {
        "opcode": "data_addtolist",
        "next": null,
        "parent": null,
        "inputs": {
            "ITEM": (0, Inputs_1.textInput)(item)
        },
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)()
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataAddToList = dataAddToList;
function dataDeleteOfList(index = defaultIndex, listName = defaultListName) {
    const block = {
        "opcode": "data_deleteoflist",
        "next": null,
        "parent": null,
        "inputs": {
            "INDEX": (0, Inputs_1.mathIntegerInput)(index)
        },
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataDeleteOfList = dataDeleteOfList;
function dataDeleteAllOfList(listName = defaultListName) {
    const block = {
        "opcode": "data_deletealloflist",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataDeleteAllOfList = dataDeleteAllOfList;
function dataInsertAtList(item = defaultItem, index = defaultIndex, listName = defaultListName) {
    const block = {
        "opcode": "data_insertatlist",
        "next": null,
        "parent": null,
        "inputs": {
            "ITEM": (0, Inputs_1.textInput)(item),
            "INDEX": (0, Inputs_1.mathIntegerInput)(index)
        },
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataInsertAtList = dataInsertAtList;
function dataReplaceItemOfList(index = defaultIndex, item = defaultItem, listName = defaultListName) {
    const block = {
        "opcode": "data_replaceitemoflist",
        "next": null,
        "parent": null,
        "inputs": {
            "INDEX": (0, Inputs_1.mathIntegerInput)(index),
            "ITEM": (0, Inputs_1.textInput)(item),
        },
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataReplaceItemOfList = dataReplaceItemOfList;
function dataItemOfList(index = defaultIndex, listName = defaultListName) {
    const block = {
        "opcode": "data_itemoflist",
        "next": null,
        "parent": null,
        "inputs": {
            "INDEX": (0, Inputs_1.mathIntegerInput)(index)
        },
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataItemOfList = dataItemOfList;
function dataItemNumOfList(item = defaultItem, listName = defaultListName) {
    const block = {
        "opcode": "data_itemnumoflist",
        "next": null,
        "parent": null,
        "inputs": {
            "ITEM": (0, Inputs_1.textInput)(item)
        },
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataItemNumOfList = dataItemNumOfList;
function dataLengthOfList(listName = defaultListName) {
    const block = {
        "opcode": "data_lengthoflist",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataLengthOfList = dataLengthOfList;
function dataListContainsItem(item = defaultItem, listName = defaultListName) {
    const block = {
        "opcode": "data_listcontainsitem",
        "next": null,
        "parent": null,
        "inputs": {
            "ITEM": (0, Inputs_1.textInput)(item),
        },
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataListContainsItem = dataListContainsItem;
function dataShowList(listName = defaultListName) {
    const block = {
        "opcode": "data_showlist",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataShowList = dataShowList;
function dataHideList(listName = defaultListName) {
    const block = {
        "opcode": "data_hidelist",
        "next": null,
        "parent": null,
        "inputs": {},
        "fields": {
            "LIST": [
                listName,
                (0, uid_1.default)(),
            ]
        },
        "shadow": false,
        "topLevel": true,
    };
    return (0, BlockFactory_1.blockMeta)({
        [(0, uid_1.default)()]: block,
    });
}
exports.dataHideList = dataHideList;
/**
 * Tells whether the given block is a variable block.
 * https://en.scratch-wiki.info/wiki/Variables_Blocks
 *
 * @param block the block to check
 */
function isDataBlock(block) {
    return Opcode_1.dataBlockOpcodes.includes(block.opcode);
}
exports.isDataBlock = isDataBlock;
function isCloudVariable(variable) {
    var _a;
    return (_a = variable[2]) !== null && _a !== void 0 ? _a : false;
}
exports.isCloudVariable = isCloudVariable;
