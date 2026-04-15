"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProgramModel_1 = require("../../../../src/whisker/model/components/ProgramModel");
const ModelNode_1 = require("../../../../src/whisker/model/components/ModelNode");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const ModelUtil_1 = require("../../../../src/whisker/model/util/ModelUtil");
const globals_1 = require("@jest/globals");
describe('AbstractModelTests', () => {
    test('Storage is initialized', () => {
        const graphId = "someGraphId1230123";
        const s = new ModelNode_1.ModelNode("start");
        (0, ModelUtil_1.initialiseStorage)(graphId, new Map([["someFunction", 3]]));
        const model = new ProgramModel_1.ProgramModel(graphId, "start", { start: s }, {}, [], { someFunction: ["exprType", '(a, b) => a + b'] });
        model.registerComponents((0, CheckUtilityMock_1.getDummyCheckUtility)(), (0, TestDriverMock_1.getDummyTestDriver)());
        const fn = (0, ModelUtil_1.getStorageValue)(graphId, "someFunction");
        (0, globals_1.expect)(fn).toBeInstanceOf(Function);
        (0, globals_1.expect)(fn(1, 2)).toEqual(3);
        (0, globals_1.expect)(fn(3, 4)).toEqual(7);
    });
});
