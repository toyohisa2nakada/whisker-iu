"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDummyCheckUtility = exports.CheckUtilityMock = void 0;
class CheckUtilityMock {
    constructor(pressedKeys = {}, constIsKeyDown = undefined) {
        this.pressedKeys = pressedKeys;
        this.constIsKeyDown = constIsKeyDown;
        this.addErrorOutput = jest.fn();
        this.registerOnMoveEvent = jest.fn();
        this.registerOnVarEvent = jest.fn();
        this.registerOnVisualChange = jest.fn();
        this.addTimeLimitFailOutput = jest.fn();
        this.registerOutput = jest.fn();
    }
    getCheckUtility() {
        return {
            isKeyDown: (key) => this.constIsKeyDown != undefined ? this.constIsKeyDown : (this.pressedKeys)[key] == true,
            addErrorOutput: this.addErrorOutput,
            registerOnMoveEvent: this.registerOnMoveEvent,
            registerVarEvent: this.registerOnVarEvent,
            registerOnVisualChange: this.registerOnVisualChange,
            addTimeLimitFailOutput: this.addTimeLimitFailOutput,
            registerOutput: this.registerOutput
        };
    }
}
exports.CheckUtilityMock = CheckUtilityMock;
function getDummyCheckUtility() {
    return new CheckUtilityMock().getCheckUtility();
}
exports.getDummyCheckUtility = getDummyCheckUtility;
