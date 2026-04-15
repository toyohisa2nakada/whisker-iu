"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDummyTestDriver = exports.TestDriverMock = void 0;
const SpriteMock_1 = require("./SpriteMock");
class TestDriverMock {
    constructor(currentSprites = [], steps = 0, isMouseDown = true) {
        this.totalStepsExecuted = 0;
        this.mousePos = { x: 0, y: 0 };
        this.currentSprites = SpriteMock_1.SpriteMock.toSpriteArray(currentSprites);
        this.isMouseDown = isMouseDown;
        this.totalStepsExecuted = steps;
    }
    get currentSprites() {
        return this._currentSprites;
    }
    set currentSprites(value) {
        this._currentSprites = value;
        this.stage = this._currentSprites.filter(s => s.isStage)[0];
    }
    nextStep() {
        ++this.totalStepsExecuted;
    }
    getTestDriver() {
        return {
            getSprites: (filter = s => true, skipStage = true) => {
                return Object.values(this.currentSprites).filter(s => filter(s) && (s != this.stage || !skipStage));
            },
            getSprite: (key) => Object.values(this.currentSprites).find(s => s.name == key),
            getStage: () => this.stage,
            isMouseDown: () => this.isMouseDown,
            getTotalStepsExecuted: () => this.totalStepsExecuted,
            inputImmediate: (...args) => this.inputImmediate(args),
            typeText: (text) => this.typeText(text),
            mouseDown: (value) => this.mouseDown(value),
            clickStage: () => this.clickStage(),
            clickSprite: (name, steps) => this.clickSprite(name, steps),
            getMousePos: () => this.mousePos
        };
    }
}
exports.TestDriverMock = TestDriverMock;
function getDummyTestDriver() {
    return new TestDriverMock().getTestDriver();
}
exports.getDummyTestDriver = getDummyTestDriver;
