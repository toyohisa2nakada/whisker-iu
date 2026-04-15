"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Probability = exports.ProbabilityJSON = void 0;
const AbstractCheck_1 = require("./AbstractCheck");
const Randomness_1 = require("../../utils/Randomness");
const zod_1 = require("zod");
const CheckResult_1 = require("./CheckResult");
const CheckTypes_1 = require("./CheckTypes");
const ModelUtil_1 = require("../util/ModelUtil");
const name = "Probability";
const ProbabilityArgs = zod_1.z.tuple([
    CheckTypes_1.ProbabilityArg
]);
exports.ProbabilityJSON = AbstractCheck_1.ICheckJSON.extend({
    name: zod_1.z.literal(name),
    args: ProbabilityArgs,
});
class Probability extends AbstractCheck_1.PureCheck {
    constructor(edgeLabel, json) {
        super(edgeLabel, Object.assign(Object.assign({}, json), { name }));
    }
    get probability() {
        return this._args[0];
    }
    static convertArgs(args) {
        return (0, CheckTypes_1.parseNonUnionError)(ProbabilityArgs.safeParse(args));
    }
    _validate(checkJSON) {
        return exports.ProbabilityJSON.parse(checkJSON);
    }
    /**
     * Get a method that checks whether a random number is greater than the probability given. For randomness...
     * @param t Instance of the test driver (unused).
     */
    _checkArgsWithTestDriver(t) {
        const [probability] = this._args;
        const negated = this.negated;
        const prob = (0, ModelUtil_1.testNumber)(probability);
        return () => (0, CheckResult_1.result)(Randomness_1.Randomness.getInstance().nextDouble() < prob, {}, negated);
    }
    _contradicts(_that) {
        return false;
    }
}
exports.Probability = Probability;
