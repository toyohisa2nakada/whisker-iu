"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CheckUtilityMock_1 = require("../mocks/CheckUtilityMock");
const Key_1 = require("../../../../src/whisker/model/checks/Key");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
test("Key test", () => {
    const cuMock = new CheckUtilityMock_1.CheckUtilityMock({ "a": true, "b": false, "c": true, });
    const cu = cuMock.getCheckUtility();
    const keyCheck = new Key_1.Key('label', { args: ['a'] });
    const tdMock = new TestDriverMock_1.TestDriverMock();
    keyCheck.registerComponents(tdMock.getTestDriver(), cu, "graphID");
    cuMock.pressedKeys["a"] = true;
    expect(keyCheck.check()).toStrictEqual((0, CheckResult_1.pass)());
    cuMock.pressedKeys["a"] = false;
    tdMock.nextStep();
    expect(keyCheck.check()).toStrictEqual((0, CheckResult_1.fail)({}));
});
