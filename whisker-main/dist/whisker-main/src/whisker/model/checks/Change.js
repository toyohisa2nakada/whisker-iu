"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newChange = exports.Change = void 0;
const Comparison_1 = require("./Comparison");
const CheckResult_1 = require("./CheckResult");
const NonExhaustiveCaseDistinction_1 = require("../../core/exceptions/NonExhaustiveCaseDistinction");
class Change {
    constructor(_comparison, _bounds = null) {
        this._comparison = _comparison;
        this._bounds = _bounds;
        if (_bounds === null) {
            return;
        }
        const { min, max } = _bounds;
        if (!(min < max)) {
            throw new RangeError(`Expected min < max, but got min=${min} and max=${max}`);
        }
    }
    static from(numberOrChangeOp, bounds = null) {
        // Special handling to support string operands as the subtraction trick would not work.
        if (bounds === null) {
            switch (numberOrChangeOp) {
                case "==":
                    return new Eq0(bounds);
                case "!=":
                    return new Neq0(bounds);
            }
        }
        const operatorMap = {
            "+": ">",
            "-": "<",
            "+=": ">=",
            "-=": "<=",
            "==": "==",
            "!=": "!=",
        };
        /*
         * Expresses a change in terms of a comparison:
         *
         * Operator     Comparison
         *
         *    +n        after - before == +n
         *    -n        after - before == -n
         *    0         after - before == 0
         *
         *    +         after - before >  0
         *    +=        after - before >= 0
         *    -         after - before <  0
         *    -=        after - before <= 0
         *    =         after - before == 0
         *    !=        after - before != 0
         */
        const comparison = (0, Comparison_1.newComparison)(typeof numberOrChangeOp === "number"
            ? { operator: "==", value: numberOrChangeOp }
            : { operator: operatorMap[numberOrChangeOp], value: 0 });
        if (bounds === null) {
            return new Change(comparison);
        }
        const boundsKind = bounds.kind;
        switch (boundsKind) {
            case "clamped":
                return new ClampedChange(comparison, bounds);
            case "cyclic":
                return new CyclicChange(comparison, bounds);
            default:
                throw new NonExhaustiveCaseDistinction_1.NonExhaustiveCaseDistinction(boundsKind);
        }
    }
    apply(after, before) {
        return this._apply(this._clampToBounds(after), this._clampToBounds(before))
            .replace(this._extendReasonWithInterval({ before, after }));
    }
    contradicts(that) {
        return this._comparison.contradicts(that._comparison);
    }
    negate() {
        return new Change(this._comparison.negate(), this._bounds);
    }
    _apply(after, before) {
        return this._comparison.apply(after - before);
    }
    _clampToBounds(v) {
        if (this._bounds === null) {
            return v;
        }
        // Although the stage has a width of 480 with bounds [-240, 240], it appears the x values of sprites can
        // sometimes drop below -240 or exceed 240. This might happen for other attributes as well. Our computations
        // might not expect values outside the interval, so we clamp these values back to it.
        const { min, max } = this._bounds;
        return Math.max(min, Math.min(max, v));
    }
    _extendReasonWithInterval(reason) {
        return this._bounds === null ? reason : Object.assign(Object.assign({}, this._bounds), reason);
    }
}
exports.Change = Change;
class CyclicChange extends Change {
    constructor(comparison, bounds) {
        if (["<=", ">="].includes(comparison.operator)) { // Always passes
            super(Comparison_1.CONST_PASS, bounds);
        }
        else if (["<", ">"].includes(comparison.operator)) { // Equivalent to !=
            super((0, Comparison_1.newComparison)({ operator: "!=", value: 0 }), bounds);
        }
        else {
            super(comparison, bounds);
        }
        this._length = bounds.max - bounds.min;
    }
    _apply(after, before) {
        const result = super._apply(after, before);
        if (!["==", "!="].includes(this._comparison.operator)) {
            return result;
        }
        // The special handling below is required only for changes by an exact number.
        if (this._comparison.operator === "==" && result.passed) {
            // Because the comparison passed, we know the `after` value did not wrap around -> pass.
            return result;
        }
        if (this._comparison.operator === "!=" && !result.passed) {
            // Because the comparison failed, we know the `after` value did not wrap around -> fail.
            return result;
        }
        // The `after` value might have wrapped around. We have to simulate the comparison as if that had not occurred.
        const uncycle = after + (this._comparison.operand2 > 0 ? this._length : -this._length);
        const difWithinRing = (uncycle - before) % this._length;
        // cyclic with changes min === max mean a change of this._length is the same as no change
        return this._comparison.apply(difWithinRing) || this._comparison.apply(difWithinRing + this._length);
    }
}
class ClampedChange extends Change {
    constructor(comparison, bounds) {
        super(comparison, bounds);
        const { operator, operand2: expectedChange } = comparison;
        const { min, max } = bounds;
        if (operator === "==" && expectedChange !== 0) {
            // Expects a "strict" change by a specific amount. If a value is at a boundary point afterward, it could be
            // because the expected change was too large/small to fit into the interval. In this case, pass. But it
            // could also be that the expected change was smaller/larger than the actual change, which would be a
            // failure. The comparison below rules out this possibility.
            const [op, ifBounds] = expectedChange > 0
                ? ["<=", [max]]
                : [">=", [min]];
            this._ifBounds = ifBounds;
            this._atBounds = (0, Comparison_1.newComparison)({ operator: op, value: expectedChange });
            return;
        }
        const [op, ifBounds] = {
            // Expects a "strict" change, but if the value was already at a boundary point before, the best it could
            // possibly do is stay the same. Thus, allow equality as well.
            ">": [">=", [max]],
            "<": ["<=", [min]],
            "!=": ["==", [min, max]],
            // "Non-strict" change already allows equality, hence no explicit special handling required.
            ">=": [">=", [max]],
            "<=": ["<=", [min]],
            "==": ["==", []],
        }[operator];
        this._ifBounds = ifBounds;
        this._atBounds = (0, Comparison_1.newComparison)({ operator: op, value: 0 });
    }
    _apply(after, before) {
        return this._ifBounds.includes(after)
            ? this._atBounds.apply(after - before)
            : super._apply(after, before);
    }
}
class Eq0 extends Change {
    constructor(bounds) {
        super((0, Comparison_1.newComparison)({ operator: "==", value: 0 }), bounds);
    }
    apply(after, before) {
        return (0, CheckResult_1.result)(after == before, { before, after }, false);
    }
    negate() {
        return new Neq0(this._bounds);
    }
}
class Neq0 extends Change {
    constructor(bounds) {
        super((0, Comparison_1.newComparison)({ operator: "!=", value: 0 }), bounds);
    }
    apply(after, before) {
        return (0, CheckResult_1.result)(after != before, { before, after }, false);
    }
    negate() {
        return new Eq0(this._bounds);
    }
}
function newChange({ change: numberOrChangeOp, negated = false }, bounds = null) {
    const change = Change.from(numberOrChangeOp, bounds);
    return negated ? change.negate() : change;
}
exports.newChange = newChange;
