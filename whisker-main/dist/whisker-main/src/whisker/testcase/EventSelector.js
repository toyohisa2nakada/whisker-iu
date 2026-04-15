"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusteringEventSelector = exports.InterleavingEventSelector = void 0;
class InterleavingEventSelector {
    selectEvent(codons, numCodon, availableEvents) {
        return availableEvents[codons[numCodon] % availableEvents.length];
    }
    getIndexForEvent(event, availableEvents) {
        return availableEvents.findIndex(e => e.stringIdentifier() == event.stringIdentifier());
    }
}
exports.InterleavingEventSelector = InterleavingEventSelector;
/**
 * An event selector that tries to increase the representation locality for grammatical evolution.
 * This is achieved by partitioning the range of codon values into evenly-sized clusters, which
 * are then used to map a codon value to a given set of events. As a result, small changes to a
 * codon value (in the phenotype space) are also more likely to contribute to just a small change
 * in the genotype space (i.e., the selected event will likely stay the same).
 */
class ClusteringEventSelector {
    constructor({ min, max }) {
        this._valueRange = max - min + 1;
    }
    selectEvent(codons, numCodon, availableEvents) {
        const codon = codons[numCodon];
        const clusterSize = Math.ceil(this._valueRange / availableEvents.length);
        let current = clusterSize;
        let cluster = 0;
        while (codon >= current) {
            cluster++;
            current += clusterSize;
        }
        return availableEvents[cluster];
    }
    getIndexForEvent(event, availableEvents) {
        const clusterSize = Math.ceil(this._valueRange / availableEvents.length);
        const rawIndex = availableEvents.findIndex(e => e.stringIdentifier() === event.stringIdentifier());
        return rawIndex * clusterSize;
    }
}
exports.ClusteringEventSelector = ClusteringEventSelector;
