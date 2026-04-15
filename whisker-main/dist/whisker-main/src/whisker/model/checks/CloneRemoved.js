"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneRemoved = exports.CloneRemovedJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckTypes_1 = require("./CheckTypes");
const CheckResult_1 = require("./CheckResult");
const name = "CloneRemoved";
const CloneRemovedArgs = zod_1.z.tuple([
    CheckTypes_1.SpriteName,
]);
exports.CloneRemovedJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: CloneRemovedArgs,
});
class CloneRemoved extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(CloneRemovedArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.CloneRemovedJSON.parse(checkJSON);
    }
    _checkArgsWithTestDriver(t) {
        const sprite = this._checkSpriteExistence(this._args[0]);
        return () => (0, CheckResult_1.result)(t.getSprites(s => s.id === sprite.id).length === 0, { message: "this clone was not deleted" }, this.negated);
    }
    _contradicts(that) {
        return false;
    }
}
exports.CloneRemoved = CloneRemoved;
