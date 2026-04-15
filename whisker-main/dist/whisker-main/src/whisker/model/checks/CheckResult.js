"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.result = exports.fail = exports.pass = void 0;
class PassedCheckImpl {
    get passed() {
        return true;
    }
    enhance(_reason) {
        return this;
    }
    replace(_reason) {
        return this;
    }
}
class FailedCheckImpl {
    constructor(_reason) {
        this._reason = _reason;
    }
    get passed() {
        return false;
    }
    get reason() {
        return this._reason;
    }
    enhance(reason) {
        return fail(Object.assign(Object.assign({}, this._reason), reason));
    }
    replace(reason) {
        return fail(reason);
    }
}
function pass() {
    return new PassedCheckImpl();
}
exports.pass = pass;
function fail(reason) {
    return new FailedCheckImpl(reason);
}
exports.fail = fail;
function result(b, reason, negated) {
    return (negated !== b) ? pass() : fail(reason);
}
exports.result = result;
