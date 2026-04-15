"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const ScratchInterface_1 = require("../../../../src/whisker/scratch/ScratchInterface");
const ScratchPosition_1 = require("../../../../src/whisker/scratch/ScratchPosition");
const Container_1 = require("../../../../src/whisker/utils/Container");
const SpriteMock_1 = require("../mocks/SpriteMock");
const newUserInput_1 = require("../../../../src/whisker/model/inputs/newUserInput");
const MouseMove_1 = require("../../../../src/whisker/model/inputs/MouseMove");
const ClickStage_1 = require("../../../../src/whisker/model/inputs/ClickStage");
const ClickSprite_1 = require("../../../../src/whisker/model/inputs/ClickSprite");
const MouseDown_1 = require("../../../../src/whisker/model/inputs/MouseDown");
const InputText_1 = require("../../../../src/whisker/model/inputs/InputText");
const InputKey_1 = require("../../../../src/whisker/model/inputs/InputKey");
Promise.resolve().then(() => __importStar(require('../../../../src/whisker/scratch/ScratchInterface')));
const graphID = "graphID";
describe('InputEffect', () => {
    describe("not enough arguments", () => {
        const constructorArguments = [
            { name: "InputKey", args: [] },
            { name: "InputClickSprite", args: [] },
            { name: "InputText", args: [] },
            { name: "InputMouseDown", args: [] },
            { name: "InputMouseMove", args: [] },
            { name: "InputMouseMove", args: [0] },
        ];
        it.each(constructorArguments)('constructor throws for (%s, %s)', (json) => {
            expect(() => {
                (0, newUserInput_1.newUserInput)(json);
            }).toThrow();
        });
    });
    test("Throws when some argument is undefined", () => {
        expect(() => {
            new MouseMove_1.MouseMove(12, undefined);
        }).toThrow();
    });
    test("constructor does not need args for InputEffectName.InputClickStage", () => {
        expect(() => {
            new ClickStage_1.ClickStage();
        }).not.toThrow();
    });
    test("toJSON()", () => {
        const effect = new InputKey_1.InputKey("left");
        const actual = effect.toJSON();
        const expected = {
            name: "InputKey",
            args: ["left arrow"],
        };
        expect(actual).toStrictEqual(expected);
    });
    describe("input effects", () => {
        jest.mock('../../../../src/whisker/utils/Container');
        const tdMock = new TestDriverMock_1.TestDriverMock();
        const t = tdMock.getTestDriver();
        Container_1.Container.testDriver = t;
        test("Mouse input effect", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.mock('../../../../src/whisker/scratch/ScratchInterface');
            ScratchInterface_1.ScratchInterface.setMousePosition = jest.fn();
            const effect = new MouseMove_1.MouseMove(12, 34);
            yield effect.inputImmediate(t, graphID);
            expect(ScratchInterface_1.ScratchInterface.setMousePosition).toHaveBeenCalledWith(new ScratchPosition_1.ScratchPosition(12, 34));
        }));
        test("Key input effect", () => __awaiter(void 0, void 0, void 0, function* () {
            tdMock.inputImmediate = jest.fn();
            const effect = new InputKey_1.InputKey("b");
            yield effect.inputImmediate(t, graphID);
            expect(tdMock.inputImmediate).toHaveBeenCalledWith([{
                    device: "keyboard",
                    key: "b",
                    isDown: true,
                    steps: 1
                }]);
        }));
        test("Text input effect", () => __awaiter(void 0, void 0, void 0, function* () {
            tdMock.typeText = jest.fn();
            const effect = new InputText_1.InputText("this is some text");
            yield effect.inputImmediate(t, graphID);
            expect(tdMock.typeText).toHaveBeenCalledWith("this is some text");
        }));
        test("Mouse down input effect", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.mock('../../../../src/whisker/utils/Container');
            tdMock.mouseDown = jest.fn();
            const effect = new MouseDown_1.MouseDown(false);
            yield effect.inputImmediate(t, graphID);
            expect(tdMock.mouseDown).toHaveBeenCalledWith(false);
        }));
        test("Click stage input effect", () => __awaiter(void 0, void 0, void 0, function* () {
            tdMock.clickStage = jest.fn();
            const effect = new ClickStage_1.ClickStage();
            yield effect.inputImmediate(t, graphID);
            expect(tdMock.clickStage).toHaveBeenCalledWith();
        }));
        test("Click stage input effect", () => __awaiter(void 0, void 0, void 0, function* () {
            Container_1.Container.config = { getClickDuration: () => 42 };
            tdMock.currentSprites = SpriteMock_1.SpriteMock.stringsToSpriteArray(["apple", "bowl"]);
            tdMock.clickSprite = jest.fn();
            const effect = new ClickSprite_1.ClickSprite(["bowl"]);
            yield effect.inputImmediate(t, graphID);
            expect(tdMock.clickSprite).toHaveBeenCalledWith("bowl", 42);
        }));
    });
});
