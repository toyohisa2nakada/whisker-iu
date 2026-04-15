"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpriteMock_1 = require("../mocks/SpriteMock");
const TestDriverMock_1 = require("../mocks/TestDriverMock");
const NbrOfClones_1 = require("../../../../src/whisker/model/checks/NbrOfClones");
const CheckResult_1 = require("../../../../src/whisker/model/checks/CheckResult");
describe('NbrOfClones test', () => {
    const graphID = "graphID";
    const banana = new SpriteMock_1.SpriteMock("banana");
    banana.clones = [new SpriteMock_1.SpriteMock("banana"), new SpriteMock_1.SpriteMock("banana"), new SpriteMock_1.SpriteMock("banana")];
    const apple = new SpriteMock_1.SpriteMock("apple");
    apple.clones = [
        new SpriteMock_1.SpriteMock("apple"), new SpriteMock_1.SpriteMock("apple"), new SpriteMock_1.SpriteMock("apple"),
        new SpriteMock_1.SpriteMock("apple"), new SpriteMock_1.SpriteMock("apple")
    ];
    const bowl = new SpriteMock_1.SpriteMock("bowl");
    apple.clones[1].visible = false;
    banana.clones[0].visible = false;
    banana.clones[2].visible = false;
    const tdMock = new TestDriverMock_1.TestDriverMock([apple, banana, bowl, ...apple.clones, ...banana.clones]);
    const t = tdMock.getTestDriver();
    const table = [
        ["banana", true, 2], ["banana", false, 4], ["apple", true, 5], ["apple", false, 6], ["bowl", false, 1]
    ];
    it.each(table)('counts correct amount of %s with visible necessary == %s', (name, visible, count) => {
        const c = new (visible ? NbrOfClones_1.NbrOfVisibleClones : NbrOfClones_1.NbrOfClones)('label', {
            negated: false,
            args: [name, "==", count]
        });
        c.registerComponents(t, null, graphID);
        expect(c.check()).toStrictEqual((0, CheckResult_1.pass)());
    });
    test('throws exception for invalid comparison', () => {
        expect(() => new NbrOfClones_1.NbrOfClones('label', {
            negated: true,
            args: ["banana", "<=>", 10]
        })).toThrowError();
    });
});
