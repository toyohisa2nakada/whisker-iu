"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModelUtil_1 = require("../../../../src/whisker/model/util/ModelUtil");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const ChangeStorageBy_1 = require("../../../../src/whisker/model/checks/ChangeStorageBy");
describe('IncDecStorage', () => {
    const initialValue = 5;
    const table = [
        [1, new Map([["var1", 6]])],
        [0, new Map([["var1", 5]])],
        [-7, new Map([["var1", -2]])],
    ];
    it.each(table)('increment variable by %s', (change, expected) => {
        const graphID = "setStorageTest";
        const check = new ChangeStorageBy_1.ChangeStorageBy("label", { negated: false, args: ["var1", change] });
        const storage = new Map([["var1", initialValue]]);
        (0, ModelUtil_1.initialiseStorage)(graphID, storage);
        check.registerComponents((0, TestDriverMock_1.getDummyTestDriver)(), (0, CheckUtilityMock_1.getDummyCheckUtility)(), graphID);
        expect(check.check().passed).toBe(true);
        expect(storage).toStrictEqual(expected);
    });
});
