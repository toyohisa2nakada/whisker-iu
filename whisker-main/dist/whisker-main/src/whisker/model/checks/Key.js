"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Key = exports.KeyJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const name = "Key";
const KeyArgs = zod_1.z.tuple([
    CheckTypes_1.KeyArgument,
]);
exports.KeyJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: KeyArgs,
});
class Key extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(KeyArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.KeyJSON.parse(checkJSON);
    }
    /**
     * Get a method for checking if a key was pressed or not pressed.
     * @param t Instance of the test driver (unused).
     */
    _checkArgsWithTestDriver(t) {
        const [key] = this._args;
        const negated = this.negated;
        return () => (0, CheckResult_1.result)(this.cu.isKeyDown(key), {}, negated);
    }
    _contradicts(_that) {
        return false; // Multiple keys can be pressed at the same time.
    }
}
exports.Key = Key;
