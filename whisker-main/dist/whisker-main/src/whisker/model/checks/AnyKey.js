"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyKey = exports.AnyKeyJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const name = "AnyKey";
const AnyKeyArgs = zod_1.z.tuple([]);
exports.AnyKeyJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: AnyKeyArgs,
});
class AnyKey extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(AnyKeyArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.AnyKeyJSON.parse(checkJSON);
    }
    /**
     * Get a method for checking if any key was pressed or not pressed.
     * @param t Instance of the test driver (unused).
     */
    _checkArgsWithTestDriver(t) {
        return () => {
            return (0, CheckResult_1.result)(this.cu.isAnyKeyDown(), {}, this.negated);
        };
    }
    _contradicts(_that) {
        return false; // Multiple keys can be pressed at the same time.
    }
}
exports.AnyKey = AnyKey;
