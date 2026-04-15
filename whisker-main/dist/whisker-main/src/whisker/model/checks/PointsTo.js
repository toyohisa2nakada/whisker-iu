"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsTo = exports.PointsToJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "PointsTo";
const PointsToArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    CheckTypes_1.SpriteName.or(zod_1.z.literal(ModelUtil_1.MOUSE_NAME)),
]);
exports.PointsToJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: PointsToArgs,
});
class PointsTo extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(PointsToArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.PointsToJSON.parse(checkJSON);
    }
    /**
     * Get a method whether a sprite points to the mouse/another sprite.
     *
     * @param t Instance of the test driver for retrieving the direction attribute of a sprite and its clones.
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteNameRotate = sprite.name;
        const targetName = this._args[1] === ModelUtil_1.MOUSE_NAME ? ModelUtil_1.MOUSE_NAME : this._checkSpriteExistence(this._args[1]).name;
        this._registerOnVisualChange(spriteNameRotate);
        this._registerOnMoveEvent(spriteNameRotate);
        if (targetName !== ModelUtil_1.MOUSE_NAME) {
            this._registerOnVisualChange(targetName);
            this._registerOnMoveEvent(targetName);
        }
        return () => {
            let target;
            if (targetName == ModelUtil_1.MOUSE_NAME) {
                target = t.getMousePos();
                if (Number.isNaN(target.x) || Number.isNaN(target.y)) {
                    return (0, CheckResult_1.result)(true, { msg: "mouse position is NaN" }, this.negated);
                }
            }
            else {
                target = t.getSprite(targetName);
            }
            const expectedValues = [
                (0, ModelUtil_1.getExpectedDirectionForSprite1LookingAtTarget)(sprite, target.x, target.y),
                (0, ModelUtil_1.getExpectedDirectionForSprite1LookingAtTarget)(sprite.old, target.x, target.y)
            ];
            const reason = {
                actual: (0, ModelUtil_1.numberToReasonString)(sprite.direction),
                expected: `[${expectedValues.map(ModelUtil_1.numberToReasonString).join(",")}]`,
                s_x: (0, ModelUtil_1.numberToReasonString)(sprite.x),
                s_y: (0, ModelUtil_1.numberToReasonString)(sprite.y),
                t_x: (0, ModelUtil_1.numberToReasonString)(target.x),
                t_y: (0, ModelUtil_1.numberToReasonString)(target.y),
            };
            const hasCorrectDirection = expectedValues.some(e => (0, ModelUtil_1.checkDirectionWithinDelta)(sprite, e))
                || sprite.x === target.x && sprite.direction === 90; // 90 and 180 should both be fine
            return (0, CheckResult_1.result)(hasCorrectDirection, reason, this.negated);
        };
    }
    _contradicts(that) {
        return false; // two different objects can be at the same location
    }
}
exports.PointsTo = PointsTo;
