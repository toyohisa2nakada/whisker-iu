"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiskerTestListWithSummary = void 0;
class WhiskerTestListWithSummary {
    constructor(testList, summary) {
        // logger.debug('constructing a WhiskerTestListWithSummary, testList: ', testList);
        // logger.debug('summary: ', summary);
        this._testList = testList;
        this._summary = summary;
    }
    get testList() {
        return this._testList;
    }
    get summary() {
        return this._summary;
    }
    set summary(value) {
        this._summary = value;
    }
}
exports.WhiskerTestListWithSummary = WhiskerTestListWithSummary;
