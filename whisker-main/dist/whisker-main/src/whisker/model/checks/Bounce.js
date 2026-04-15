"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bounce = exports.BounceJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "Bounce";
const BounceArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
]);
exports.BounceJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: BounceArgs,
});
class Bounce extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(BounceArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.BounceJSON.parse(checkJSON);
    }
    /**
     * Get a method whether a sprite bounces when it touches an edge.
     *
     * @param t Instance of the test driver for retrieving the direction attribute of a sprite and its clones.
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteName = sprite.name;
        this._registerOnVisualChange(spriteName);
        return () => {
            const isDirFlipped = (expected) => (0, ModelUtil_1.checkCyclicValueWithinDelta)(sprite.direction, expected, -180, 180, 5);
            // delta of 5 to minimize false positives
            const reason = { direction: sprite.direction, oldDirection: sprite.old.direction };
            let touchingEdge = false;
            let dirFlipped = false;
            if (sprite.isTouchingVerticalEdge()) {
                touchingEdge = true;
                const expected = (0, ModelUtil_1.flipDirectionVertically)(sprite.old.direction);
                reason.isTouchingVerticalEdge = true;
                reason.expectedVerticalFlip = expected;
                dirFlipped = isDirFlipped(expected);
            }
            if (sprite.isTouchingHorizEdge()) {
                touchingEdge = true;
                const expected = (0, ModelUtil_1.flipDirectionHorizontally)(sprite.old.direction);
                reason.isTouchingHorziEdge = true;
                reason.expectedHorizFlip = expected;
                dirFlipped || (dirFlipped = isDirFlipped(expected));
            }
            return (0, CheckResult_1.result)(!touchingEdge || dirFlipped, reason, this.negated);
        };
    }
    _contradicts(that) {
        return false; // there is neither a contradiction for different sprites nor a contradiction with the same
    }
}
exports.Bounce = Bounce;
