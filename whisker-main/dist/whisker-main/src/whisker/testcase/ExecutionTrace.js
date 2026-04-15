"use strict";
/*
 * Copyright (C) 2020 Whisker contributors
 *
 * This file is part of the Whisker test generator for Scratch.
 *
 * Whisker is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Whisker is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Whisker. If not, see http://www.gnu.org/licenses/.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionTrace = exports.EventAndParameters = void 0;
class EventAndParameters {
    constructor(_event, _parameters) {
        this._event = _event;
        this._parameters = _parameters;
    }
    get event() {
        return this._event;
    }
    get parameters() {
        return this._parameters;
    }
    getCodonCount() {
        // invariant: this._event.numSearchParameter() === this._parameters.length
        return 1 + this._event.numSearchParameter();
    }
    toString() {
        return `Event ${this._event} with parameter(s) ${this.parameters}`;
    }
}
exports.EventAndParameters = EventAndParameters;
/**
 * TODO
 */
class ExecutionTrace {
    constructor(traces, events, trace = null) {
        this._blockTraces = traces;
        this._events = events;
        this._positionTrace = trace;
    }
    clone() {
        return new ExecutionTrace(this.blockTraces, [...this.events], Object.assign({}, this._positionTrace ? Object.assign(Object.assign({}, this._positionTrace), { positions: [...this._positionTrace.positions] }) : null));
    }
    get blockTraces() {
        return this._blockTraces;
    }
    get events() {
        return this._events;
    }
    set events(value) {
        this._events = value;
    }
    get positionTrace() {
        return this._positionTrace;
    }
}
exports.ExecutionTrace = ExecutionTrace;
