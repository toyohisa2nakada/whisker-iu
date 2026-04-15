"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLEventExtractor = void 0;
const NeuroevolutionScratchEventExtractor_1 = require("../../../testcase/NeuroevolutionScratchEventExtractor");
const MouseMoveFixedDirection_1 = require("../../../testcase/events/MouseMoveFixedDirection");
class RLEventExtractor extends NeuroevolutionScratchEventExtractor_1.NeuroevolutionScratchEventExtractor {
    constructor(vm) {
        super(vm, 'multiClass');
        this._eventOrder = [];
    }
    /**
     * Extracts events from the current state of the VM. Sorts the extracted events based on the {@link _eventOrder}
     * array. If some events are missing, we pad the respective index with a {@link null} value.
     *
     * @param vm The current state of the Scratch VM from which the current set of active events will be extracted.
     * @returns the padded and sorted array of Scratch events.
     */
    extractEvents(vm) {
        const extracted = super.extractEvents(vm);
        this._updateEventOrder(extracted);
        const paddedEvents = [];
        for (const eventId of this._eventOrder) {
            const matchingEvent = extracted.find(event => event.stringIdentifier() === eventId);
            if (matchingEvent) {
                paddedEvents.push(matchingEvent);
            }
            else {
                paddedEvents.push(null);
            }
        }
        return paddedEvents;
    }
    /**
     * Updates the {@link _eventOrder} array if new events were discovered.
     *
     * @param events The events to update the order array with.
     */
    _updateEventOrder(events) {
        const currentIds = events.map(event => event.stringIdentifier());
        for (const id of currentIds) {
            if (!this._eventOrder.includes(id)) {
                this._eventOrder.push(id);
            }
        }
    }
    /**
     * Adds discretized mouse move events to the event list.
     *
     * @param eventList The list of currently active scratch events.
     */
    _addMouseMoveEvents(eventList) {
        eventList.push(new MouseMoveFixedDirection_1.MouseMoveFixedDirection("UP"));
        eventList.push(new MouseMoveFixedDirection_1.MouseMoveFixedDirection("DOWN"));
        eventList.push(new MouseMoveFixedDirection_1.MouseMoveFixedDirection("LEFT"));
        eventList.push(new MouseMoveFixedDirection_1.MouseMoveFixedDirection("RIGHT"));
    }
}
exports.RLEventExtractor = RLEventExtractor;
