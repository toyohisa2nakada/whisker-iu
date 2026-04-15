"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedSizeQueue = void 0;
const Arrays_1 = __importDefault(require("./Arrays"));
/**
 * A queue implementation that has a fixed size.
 * If the queue is full upon adding new entries, the oldest items are removed.
 */
class FixedSizeQueue {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.items = [];
    }
    enqueue(item) {
        if (this.items.length >= this.maxSize) {
            this.dequeue();
        }
        this.items.push(item);
    }
    enqueueMany(items) {
        for (const item of items) {
            this.enqueue(item);
        }
    }
    dequeue() {
        return this.size() > 0 ? this.items.shift() : null;
    }
    peek() {
        return this.size() > 0 ? this.items[0] : null;
    }
    isEmpty() {
        return this.items.length === 0;
    }
    size() {
        return this.items.length;
    }
    clear() {
        this.items = [];
    }
    toArray() {
        return [...this.items];
    }
    sample(numberOfSamples) {
        const elements = this.toArray();
        Arrays_1.default.shuffle(elements);
        return elements.slice(0, numberOfSamples);
    }
}
exports.FixedSizeQueue = FixedSizeQueue;
