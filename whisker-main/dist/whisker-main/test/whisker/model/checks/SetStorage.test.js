"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SetStorage_1 = require("../../../../src/whisker/model/checks/SetStorage");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const ModelUtil_1 = require("../../../../src/whisker/model/util/ModelUtil");
describe('SetStorageValue', () => {
    const table = [
        ["number", ["var1", "number", 1], new Map([["var1", 1]])],
        ["string", ["var2", "string", "this is some string"], new Map([["var2", "this is some string"]])],
        ["exprType", ["var3", "exprType", "Math.abs(-3)+' some string'"], new Map([["var3", "3 some string"]])],
    ];
    it.each(table)('set storage of %s to value of type %s', (testName, args, expected) => {
        const graphID = "setStorageTest";
        const check = new SetStorage_1.SetStorage("label", { negated: false, args: args });
        const storage = new Map();
        (0, ModelUtil_1.initialiseStorage)(graphID, storage);
        check.registerComponents((0, TestDriverMock_1.getDummyTestDriver)(), (0, CheckUtilityMock_1.getDummyCheckUtility)(), graphID);
        expect(check.check().passed).toBe(true);
        expect(storage).toStrictEqual(expected);
    });
});
