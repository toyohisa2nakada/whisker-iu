"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShape = void 0;
const HatBlock_1 = require("./HatBlock");
const CapBlock_1 = require("./CapBlock");
const StackBlock_1 = require("./StackBlock");
const CBlock_1 = require("./CBlock");
const Reporter_1 = require("./Reporter");
const ShadowBlock_1 = require("../other/ShadowBlock");
function getShape(block) {
    const shapes = [];
    if ((0, HatBlock_1.isHatBlock)(block)) {
        shapes.push("hat");
    }
    if ((0, CapBlock_1.isCapBlock)(block)) {
        shapes.push("cap");
    }
    if ((0, CBlock_1.isCBlock)(block)) {
        shapes.push("C");
    }
    if ((0, StackBlock_1.isStackBlock)(block)) {
        shapes.push("stack");
    }
    if ((0, Reporter_1.isBooleanReporterBlock)(block)) {
        shapes.push("boolean");
    }
    if ((0, Reporter_1.isStringNumberReporterBlock)(block)) {
        shapes.push("reporter");
    }
    if ((0, ShadowBlock_1.isShadowBlock)(block)) {
        shapes.push("shadow");
    }
    return shapes;
}
exports.getShape = getShape;
