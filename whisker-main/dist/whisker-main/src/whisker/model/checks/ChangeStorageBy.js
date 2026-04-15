"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeStorageBy = exports.ChangeStorageByJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "ChangeStorageBy";
const ChangeStorageByArgs = zod_1.z.tuple([zod_1.z.string(), zod_1.z.number()]);
exports.ChangeStorageByJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: ChangeStorageByArgs,
});
class ChangeStorageBy extends AbstractCheck_1.ImpureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
        this._key = this._args[0];
        this._value = this._args[1];
    }
    get key() {
        return this._key;
    }
    get value() {
        return this._value;
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(ChangeStorageByArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.ChangeStorageByJSON.parse(checkJSON);
    }
    /**
     * Get a method for increasing/decreasing a value in the storage of the graph.
     * @param t Instance of the test driver for evaluating expression.
     */
    _checkArgsWithTestDriver(t) {
        return () => {
            const current = (0, ModelUtil_1.getStorageValue)(this.graphID, this.key);
            if (typeof current !== "number") {
                return fail({ message: `Expected a number but got ${current} with type ${typeof current}` });
            }
            const nextValue = current + this.value;
            (0, ModelUtil_1.setStorageValue)(this.graphID, this.key, nextValue);
            return (0, CheckResult_1.result)(true, {}, this.negated);
        };
    }
}
exports.ChangeStorageBy = ChangeStorageBy;
