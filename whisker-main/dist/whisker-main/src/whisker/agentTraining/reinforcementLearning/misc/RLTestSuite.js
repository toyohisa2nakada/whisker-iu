"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLTestSuite = void 0;
class RLTestSuite {
    constructor(_testCases) {
        this._testCases = _testCases;
    }
    get testCases() {
        return this._testCases;
    }
}
exports.RLTestSuite = RLTestSuite;
