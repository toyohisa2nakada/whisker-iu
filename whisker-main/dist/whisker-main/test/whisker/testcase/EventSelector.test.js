"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventSelector_1 = require("../../../src/whisker/testcase/EventSelector");
const ScratchEvent_1 = require("../../../src/whisker/testcase/events/ScratchEvent");
const Arrays_1 = __importDefault(require("../../../src/whisker/utils/Arrays"));
const WaitEvent_1 = require("../../../src/whisker/testcase/events/WaitEvent");
const MouseMoveEvent_1 = require("../../../src/whisker/testcase/events/MouseMoveEvent");
const KeyPressEvent_1 = require("../../../src/whisker/testcase/events/KeyPressEvent");
class DummyEvent extends ScratchEvent_1.ScratchEvent {
    constructor(name) {
        super();
        this._name = name;
    }
    numSearchParameter() {
        return 0;
    }
    getSearchParameterNames() {
        return [];
    }
    stringIdentifier() {
        return `DummyEvent`;
    }
    apply() {
        return Promise.resolve(undefined);
    }
    getNumParameters() {
        return 0;
    }
    getParameters() {
        return [];
    }
    setParameter() {
        return [];
    }
    toJavaScript() {
        return "";
    }
    toScratchBlocks() {
        return { blocks: [], first: null, last: null };
    }
    toJSON() {
        return undefined;
    }
    toString() {
        return this._name;
    }
}
describe("ClusteringEventSelector Test", () => {
    const selector = new EventSelector_1.ClusteringEventSelector({ min: 0, max: 14 });
    test("Test select one available event", () => {
        const codons = Arrays_1.default.range(0, 15);
        const event0 = new DummyEvent('event0');
        const events = [event0];
        const expected = Array(15).fill(event0);
        const actual = [];
        for (const i of Arrays_1.default.range(0, 15)) {
            actual.push(selector.selectEvent(codons, i, events));
        }
        expect(actual).toStrictEqual(expected);
    });
    test("Test select multiple available events", () => {
        // The number of codons is a multiple of the number of clusters (events).
        const codons = Arrays_1.default.range(0, 15);
        const events = Arrays_1.default.range(0, 3).map((x) => new DummyEvent(`event${x}`));
        const [event0, event1, event2] = events;
        const expected = [
            event0, event0, event0, event0, event0,
            event1, event1, event1, event1, event1,
            event2, event2, event2, event2, event2
        ];
        const actual = [];
        for (const i of Arrays_1.default.range(0, 15)) {
            actual.push(selector.selectEvent(codons, i, events));
        }
        expect(actual).toStrictEqual(expected);
    });
    test("Test select multiple available events (with inhomogeneous cluster size)", () => {
        // The number of codons is a NOT multiple of the number of clusters (events). The last cluster is smaller
        // than all other clusters.
        const codons = Arrays_1.default.range(0, 15);
        const events = Arrays_1.default.range(0, 4).map((x) => new DummyEvent(`event${x}`));
        const [event0, event1, event2, event3] = events;
        const expected = [
            event0, event0, event0, event0,
            event1, event1, event1, event1,
            event2, event2, event2, event2,
            event3, event3, event3 // fourth cluster (smaller!)
        ];
        const actual = [];
        for (const i of Arrays_1.default.range(0, 15)) {
            actual.push(selector.selectEvent(codons, i, events));
        }
        expect(actual).toStrictEqual(expected);
    });
    test("Test select all available events", () => {
        const codons = Arrays_1.default.range(0, 15);
        const expected = Arrays_1.default.range(0, 15).map((x) => new DummyEvent(`event${x}`));
        const events = expected;
        const actual = [];
        for (const i of Arrays_1.default.range(0, 15)) {
            actual.push(selector.selectEvent(codons, i, events));
        }
        expect(actual).toStrictEqual(expected);
    });
    test("Find index for given event type with even number of available Events", () => {
        const codons = Arrays_1.default.range(0, 101);
        const availableEvents = [new WaitEvent_1.WaitEvent(), new MouseMoveEvent_1.MouseMoveEvent()];
        const desiredEvent = availableEvents[0];
        const index = selector.getIndexForEvent(desiredEvent, availableEvents);
        expect(selector.selectEvent(codons, index, availableEvents)).toStrictEqual(desiredEvent);
    });
    test("Find index for given event type with odd number of available Events", () => {
        const codons = Arrays_1.default.range(0, 15);
        const availableEvents = [new WaitEvent_1.WaitEvent(), new MouseMoveEvent_1.MouseMoveEvent(), new KeyPressEvent_1.KeyPressEvent("space")];
        const desiredEvent = availableEvents[2];
        const index = selector.getIndexForEvent(desiredEvent, availableEvents);
        expect(selector.selectEvent(codons, index, availableEvents)).toStrictEqual(desiredEvent);
    });
});
describe("InterleavingEventSelector Test", () => {
    const selector = new EventSelector_1.InterleavingEventSelector();
    test("Test select event", () => {
        const codons = Arrays_1.default.range(0, 15);
        const events = Arrays_1.default.range(0, 3).map((x) => new DummyEvent(`event${x}`));
        const [event0, event1, event2] = events;
        const expected = [
            event0, event1, event2,
            event0, event1, event2,
            event0, event1, event2,
            event0, event1, event2,
            event0, event1, event2,
        ];
        const actual = [];
        for (const i of Arrays_1.default.range(0, 15)) {
            actual.push(selector.selectEvent(codons, i, events));
        }
        expect(actual).toStrictEqual(expected);
    });
    test("Find index for given event type", () => {
        const codons = Arrays_1.default.range(0, 15);
        const availableEvents = [new WaitEvent_1.WaitEvent(), new MouseMoveEvent_1.MouseMoveEvent(), new KeyPressEvent_1.KeyPressEvent("space")];
        const desiredEvent = availableEvents[1];
        const index = selector.getIndexForEvent(desiredEvent, availableEvents);
        expect(selector.selectEvent(codons, index, availableEvents)).toStrictEqual(desiredEvent);
    });
});
