"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TouchingVerticalEdge = exports.TouchingVerticalEdgeJSON = exports.TouchingHorizEdge = exports.TouchingHorizEdgeJSON = exports.TouchingEdge = exports.TouchingEdgeJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const TouchingEdgeArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
]);
class AbstractTouchingEdge extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, json);
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(TouchingEdgeArgs.safeParse(args));
    }
    /**
     * Get a method to check whether a sprite is touching an edge.
     * @param t Instance of the test driver for checking if a sprite or its clones is touching an edge.
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteName = sprite.name;
        this._registerOnMoveEvent(spriteName);
        return this._getCheck(sprite);
    }
    _contradicts(_that) {
        return false;
    }
}
const touchingEdgeName = "TouchingEdge";
exports.TouchingEdgeJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(touchingEdgeName),
    args: TouchingEdgeArgs,
});
class TouchingEdge extends AbstractTouchingEdge {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: touchingEdgeName }));
    }
    _validate(checkJSON) {
        return exports.TouchingEdgeJSON.parse(checkJSON);
    }
    _getCheck(sprite) {
        return () => (0, CheckResult_1.result)(sprite.isTouchingEdge(), {}, this.negated);
    }
}
exports.TouchingEdge = TouchingEdge;
const touchingHorizEdgeName = "TouchingHorizEdge";
exports.TouchingHorizEdgeJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(touchingHorizEdgeName),
    args: TouchingEdgeArgs,
});
class TouchingHorizEdge extends AbstractTouchingEdge {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: touchingHorizEdgeName }));
    }
    _validate(checkJSON) {
        return exports.TouchingHorizEdgeJSON.parse(checkJSON);
    }
    _getCheck(sprite) {
        return () => (0, CheckResult_1.result)(sprite.isTouchingHorizEdge(), {}, this.negated);
    }
}
exports.TouchingHorizEdge = TouchingHorizEdge;
const touchingVerticalEdgeName = "TouchingVerticalEdge";
exports.TouchingVerticalEdgeJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(touchingVerticalEdgeName),
    args: TouchingEdgeArgs,
});
class TouchingVerticalEdge extends AbstractTouchingEdge {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name: touchingVerticalEdgeName }));
    }
    _validate(checkJSON) {
        return exports.TouchingVerticalEdgeJSON.parse(checkJSON);
    }
    _getCheck(sprite) {
        return () => (0, CheckResult_1.result)(sprite.isTouchingVerticalEdge(), {}, this.negated);
    }
}
exports.TouchingVerticalEdge = TouchingVerticalEdge;
