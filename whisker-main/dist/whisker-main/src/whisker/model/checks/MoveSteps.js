"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveSteps = exports.MoveStepsJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const CheckResult_1 = require("./CheckResult");
const name = "MoveSteps";
const MoveStepsArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
    CheckTypes_1.NumberLike,
]);
exports.MoveStepsJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: MoveStepsArgs,
});
class MoveSteps extends AbstractCheck_1.BoundedCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(MoveStepsArgs.safeParse(args));
    }
    get attrName() {
        // here it does not matter if the returned value is "x" or "y" because they need updates under the same events
        return "x";
    }
    _validate(checkJSON) {
        return exports.MoveStepsJSON.parse(checkJSON);
    }
    /**
     * Get a method whether a sprite moved a certain number of steps
     *
     * @param t Instance of the test driver for retrieving the direction attribute of a sprite and its clones.
     */
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteName = sprite.name;
        this._registerOnMoveEvent(spriteName);
        this._boundsNeedUpdate(sprite);
        let bounds = (0, ModelUtil_1.getXYBounds)(sprite);
        return () => {
            const reason = {};
            bounds = this._updatedBound(sprite, bounds);
            const correct = (0, ModelUtil_1.movedCorrectAmountOfSteps)(sprite, this._args[1], bounds, reason);
            return (0, CheckResult_1.result)(correct, reason, this.negated);
        };
    }
    _updatedBound(s, currentBounds) {
        return this._boundsNeedUpdate(s) ? (0, ModelUtil_1.getXYBounds)(s) : currentBounds;
    }
    _contradicts(that) {
        return this._args[0] === that._args[0] && this._args[1] !== that._args[1];
    }
}
exports.MoveSteps = MoveSteps;
