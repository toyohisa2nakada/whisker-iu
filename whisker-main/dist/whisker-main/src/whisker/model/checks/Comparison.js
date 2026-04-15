"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newComparison = exports.CONST_FAIL = exports.CONST_PASS = exports.approxLt = exports.approxGt = exports.approxEq = exports.EPSILON = void 0;
const CheckResult_1 = require("./CheckResult");
const ModelUtil_1 = require("../util/ModelUtil");
/**
 * Threshold for two numbers to be considered approximately equal. The value is chosen to be large enough to ignore
 * rounding errors introduced by floating point arithmetics, and small enough to not mask actual programming errors in
 * the Scratch program under test.
 */
exports.EPSILON = 1e-10;
class AbstractComparison {
    constructor(_operand2, _interval) {
        this._operand2 = _operand2;
        this._interval = _interval;
        this._actualOperand2 = this._interval === null || typeof _operand2 !== "number"
            ? _operand2
            : Math.min(_interval.max, Math.max(_interval.min, _operand2));
    }
    get operand2() {
        return this._operand2;
    }
    get interval() {
        return this._interval;
    }
    contradicts(that) {
        if (this.operator === "==") {
            return !that.apply(this.operand2).passed;
        }
        if (that.operator === "==") {
            return !this.apply(that.operand2).passed;
        }
        if (this.operator === "!=" || that.operator === "!=") {
            return false;
        }
        // < and <, > and >, < and <=, <= and <=, >= and >, > and >=
        if (this.operator.startsWith(that.operator) || that.operator.startsWith(this.operator)) {
            return false;
        }
        // < and >, < and >=, <= and >, <= and >=
        return !this.apply(that.operand2).passed || !that.apply(this.operand2).passed;
    }
    toString() {
        return `x ${this.operator} ${this.operand2}`;
    }
    _extendReasonWithInterval(reason) {
        return this._interval === null ? reason : Object.assign(Object.assign({}, this._interval), reason);
    }
}
function approxEqNum(x, y, epsilon = exports.EPSILON) {
    const actual = (0, ModelUtil_1.returnNumberIfPossible)(x, null);
    if (typeof y != "number" || typeof actual != "number") {
        return false; // at least one value is not a number, so the difference does not exist
    }
    return Math.abs(actual - y) <= epsilon;
}
function approxEq(operand1, operand2, epsilon = exports.EPSILON) {
    if (operand1 == operand2) {
        return true;
    }
    return approxEqNum(operand1, operand2, epsilon);
}
exports.approxEq = approxEq;
function approxNeq(operand1, operand2, epsilon = exports.EPSILON) {
    return !approxEq(operand1, operand2, epsilon);
}
function approxLeq(x, y, epsilon = exports.EPSILON) {
    if (x <= y) {
        return true;
    }
    return approxEqNum(x, y, epsilon);
}
function approxGt(x, y, epsilon = exports.EPSILON) {
    return !approxLeq(x, y, epsilon);
}
exports.approxGt = approxGt;
function approxGeq(x, y, epsilon = exports.EPSILON) {
    if (x >= y) {
        return true;
    }
    return approxEqNum(x, y, epsilon);
}
function approxLt(x, y, epsilon = exports.EPSILON) {
    return !approxGeq(x, y, epsilon);
}
exports.approxLt = approxLt;
class Eq extends AbstractComparison {
    constructor(operand2, interval = null) {
        super(operand2, interval);
    }
    get operator() {
        return "==";
    }
    apply(operand1) {
        const message = { actual: operand1, expected: this.operand2 };
        const res = approxEq(operand1, this._actualOperand2);
        return (0, CheckResult_1.result)(res, this._extendReasonWithInterval(message), false);
    }
    negate() {
        return new Neq(this.operand2, this.interval);
    }
}
class Neq extends AbstractComparison {
    constructor(operand2, interval = null) {
        super(operand2, interval);
        this._boundaries = Object.values(Object.assign({}, interval));
    }
    get operator() {
        return "!=";
    }
    apply(operand1) {
        const message = { actual: operand1 };
        const res = approxNeq(operand1, this._actualOperand2) || this._boundaries.includes(operand1);
        return (0, CheckResult_1.result)(res, this._extendReasonWithInterval(message), false);
    }
    negate() {
        return new Eq(this.operand2, this.interval);
    }
}
class Leq extends AbstractComparison {
    constructor(operand2, interval = null) {
        super(operand2, interval);
    }
    get operator() {
        return "<=";
    }
    apply(operand1) {
        const message = { actual: operand1, expected: this.operand2 };
        const res = approxLeq(operand1, this._actualOperand2);
        return (0, CheckResult_1.result)(res, this._extendReasonWithInterval(message), false);
    }
    negate() {
        return new Gt(this.operand2, this.interval);
    }
}
class Lt extends AbstractComparison {
    constructor(operand2, interval = null) {
        super(operand2, interval);
        this._boundaries = interval === null ? [] : [interval.min];
    }
    get operator() {
        return "<";
    }
    apply(operand1) {
        const message = { actual: operand1, expected: this.operand2 };
        const res = approxLt(operand1, this._actualOperand2) || this._boundaries.includes(operand1);
        return (0, CheckResult_1.result)(res, this._extendReasonWithInterval(message), false);
    }
    negate() {
        return new Geq(this.operand2);
    }
}
class Gt extends AbstractComparison {
    constructor(operand2, interval = null) {
        super(operand2, interval);
        this._boundaries = interval === null ? [] : [interval.max];
    }
    get operator() {
        return ">";
    }
    apply(operand1) {
        const message = { actual: operand1, expected: this.operand2 };
        const res = approxGt(operand1, this._actualOperand2) || this._boundaries.includes(operand1);
        return (0, CheckResult_1.result)(res, this._extendReasonWithInterval(message), false);
    }
    negate() {
        return new Leq(this.operand2, this.interval);
    }
}
class Geq extends AbstractComparison {
    constructor(operand2, interval = null) {
        super(operand2, interval);
    }
    get operator() {
        return ">=";
    }
    apply(operand1) {
        const message = { actual: operand1, expected: this.operand2 };
        const res = approxGeq(operand1, this._actualOperand2);
        return (0, CheckResult_1.result)(res, this._extendReasonWithInterval(message), false);
    }
    negate() {
        return new Lt(this.operand2, this.interval);
    }
}
exports.CONST_PASS = new class ConstPass extends Neq {
    constructor() {
        super(NaN, null); // Hack: Assuming x is a number, x != NaN is always true as per IEEE 754
    }
    negate() {
        return exports.CONST_FAIL;
    }
};
exports.CONST_FAIL = new class ConstFail extends Eq {
    constructor() {
        super(NaN, null); // Hack: Assuming x is a number, x == NaN is always false as per IEEE 754
    }
    apply(operand1) {
        return super.apply(operand1).replace({ message: "CONST_FAIL" });
    }
    negate() {
        return exports.CONST_PASS;
    }
};
const Comparison = Object.freeze({
    "==": Eq,
    "!=": Neq,
    "<": Lt,
    ">": Gt,
    "<=": Leq,
    ">=": Geq,
});
function newComparison({ operator, value, negated = false }, interval = null) {
    const comparison = new Comparison[operator](value, interval);
    return negated ? comparison.negate() : comparison;
}
exports.newComparison = newComparison;
