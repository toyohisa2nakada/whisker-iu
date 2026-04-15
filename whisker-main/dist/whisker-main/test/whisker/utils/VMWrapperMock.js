"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VMWrapperMock = void 0;
class VMWrapperMock {
    init() {
        this.startTime = Date.now();
        this.stepsExecuted = 1; // Don't need that atm
        this.runStartTime = Date.now();
    }
    /**
     * @return {number} .
     */
    getTotalTimeElapsed() {
        return (Date.now() - this.startTime);
    }
    /**
     * @return {number} .
     */
    getRunTimeElapsed() {
        return (Date.now() - this.runStartTime);
    }
    /**
     * @return {number} .
     */
    getTotalStepsExecuted() {
        return this.stepsExecuted;
    }
}
exports.VMWrapperMock = VMWrapperMock;
