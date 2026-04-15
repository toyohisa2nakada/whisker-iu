"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventBiasedMutation_1 = require("../../../src/whisker/testcase/EventBiasedMutation");
const ScratchEvent_1 = require("../../../src/whisker/testcase/events/ScratchEvent");
const ExecutionTrace_1 = require("../../../src/whisker/testcase/ExecutionTrace");
class ScratchEventMock extends ScratchEvent_1.ScratchEvent {
    apply() {
        throw new Error("Method not implemented.");
    }
    getSearchParameterNames() {
        throw new Error("Method not implemented.");
    }
    setParameter() {
        throw new Error("Method not implemented.");
    }
    getParameters() {
        throw new Error("Method not implemented.");
    }
    toJavaScript() {
        throw new Error("Method not implemented.");
    }
    toScratchBlocks() {
        throw new Error("Method not implemented.");
    }
    toString() {
        throw new Error("Method not implemented.");
    }
    stringIdentifier() {
        throw new Error("Method not implemented.");
    }
    toJSON() {
        throw new Error("Method not implemented.");
    }
}
class A extends ScratchEventMock {
    numSearchParameter() {
        return 2;
    }
}
class B extends ScratchEventMock {
    numSearchParameter() {
        return 0;
    }
}
class C extends ScratchEventMock {
    numSearchParameter() {
        return 2;
    }
}
class D extends ScratchEventMock {
    numSearchParameter() {
        return 1;
    }
}
describe("EventBiasedMutation Test", () => {
    test("Compute shared probabilities", () => {
        const a = [new A(), [1, 2]];
        const b = [new B(), [10, 410]];
        const c = [new C(), [0, 1]];
        const d = [new D(), [42, 210]];
        const events = [
            a, a, a,
            b, b,
            a,
            c, c, c, c,
            a, a,
            d, d, d,
        ].map(([ev, params]) => new ExecutionTrace_1.EventAndParameters(ev, params));
        const actual = EventBiasedMutation_1.EventBiasedMutation.computeSharedProbabilities(20, events);
        const pA = (1 / 4) / 6;
        // noinspection PointlessArithmeticExpressionJS
        const pB = (1 / 4) / 2;
        const pC = (1 / 4) / 4;
        const pD = (1 / 4) / 3;
        const expected = [
            pA, pA, pA,
            pB, pB,
            pA,
            pC, pC, pC, pC,
            pA, pA,
            pD, pD, pD,
            0, 0, 0, 0, 0
        ];
        const probabilitySum = actual.reduce((a, b) => a + b, 0);
        expect(actual).toStrictEqual(expected);
        expect(probabilitySum).toBe(1);
    });
});
