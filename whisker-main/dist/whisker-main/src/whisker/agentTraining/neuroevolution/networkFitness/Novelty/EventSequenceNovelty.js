"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSequenceNovelty = void 0;
const Statistics_1 = __importDefault(require("../../../../utils/Statistics"));
const NoveltyFitness_1 = require("./NoveltyFitness");
class EventSequenceNovelty extends NoveltyFitness_1.NoveltyFitness {
    constructor() {
        super(...arguments);
        this.eventMap = new Map();
    }
    /**
     * The behaviour to be compared corresponds to the event sequence executed by the chromosomes.
     * @param network The network hosting its executed events during the execution in the problem domain.
     * @returns the in the problem domain executed events of the supplied chromosome.
     */
    extractBehaviour(network) {
        const events = network.trace.events.map(e => e.event);
        const mapped = [];
        for (const event of events) {
            if (!this.eventMap.has(event.stringIdentifier())) {
                this.eventMap.set(event.stringIdentifier(), this.eventMap.size);
            }
            mapped.push(this.eventMap.get(event.stringIdentifier()));
        }
        return mapped;
    }
    /**
     * Compares two event sequences using the levenshtein distance.
     * @param eventSequence1 first event sequence to be compared.
     * @param eventSequence2 second event sequence to be compared.
     * @returns distance between the two event sequences based on the levenshtein distance.
     */
    compareBehaviours(eventSequence1, eventSequence2) {
        // If both sequences are empty, they are identical.
        if (eventSequence1.length === 0 && eventSequence2.length === 0) {
            return 0;
        }
        const distance = Statistics_1.default.levenshteinDistance(eventSequence1, eventSequence2);
        return distance / Math.max(eventSequence1.length, eventSequence2.length);
    }
}
exports.EventSequenceNovelty = EventSequenceNovelty;
