"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneCreated = exports.CloneCreatedJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "CloneCreated";
const CloneCreatedArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
]);
exports.CloneCreatedJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: CloneCreatedArgs,
});
class CloneCreated extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(CloneCreatedArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.CloneCreatedJSON.parse(checkJSON);
    }
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        const spriteName = sprite.name;
        return () => (0, ModelUtil_1.wasCloneCreatedAroundStep)(spriteName, t.getTotalStepsExecuted());
    }
    _contradicts(that) {
        return false;
    }
}
exports.CloneCreated = CloneCreated;
