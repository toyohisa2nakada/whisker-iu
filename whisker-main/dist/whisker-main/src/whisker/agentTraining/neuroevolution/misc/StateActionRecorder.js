"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateActionRecorder = void 0;
const events_1 = require("events");
const scratch_stage_1 = __importDefault(require("../../../../../../whisker-web/src/components/scratch-stage"));
const Container_1 = require("../../../utils/Container");
const NeuroevolutionScratchEventExtractor_1 = require("../../../testcase/NeuroevolutionScratchEventExtractor");
const KeyPressEvent_1 = require("../../../testcase/events/KeyPressEvent");
const runtime_1 = __importDefault(require("scratch-vm/src/engine/runtime"));
const vm_wrapper_1 = __importDefault(require("../../../../vm/vm-wrapper"));
const WaitEvent_1 = require("../../../testcase/events/WaitEvent");
const WhiskerSearchConfiguration_1 = require("../../../utils/WhiskerSearchConfiguration");
const MouseMoveEvent_1 = require("../../../testcase/events/MouseMoveEvent");
const index_1 = require("../../../../index");
const MouseMoveToEvent_1 = require("../../../testcase/events/MouseMoveToEvent");
const ClickSpriteEvent_1 = require("../../../testcase/events/ClickSpriteEvent");
const MouseDownForStepsEvent_1 = require("../../../testcase/events/MouseDownForStepsEvent");
const whisker_util_1 = __importDefault(require("../../../../test/whisker-util"));
const FeatureExtraction_1 = require("../../featureExtraction/FeatureExtraction");
class StateActionRecorder extends events_1.EventEmitter {
    constructor(scratch) {
        super();
        this.WAIT_THRESHOLD = Infinity;
        this.MOUSE_MOVE_THRESHOLD = 5;
        this.MOUSE_MOVE_ACTION_KEY = 'MouseMoveDimensionEvent-X';
        this.MOUSE_DOWN_ACTION_KEY = 'MouseDownForStepsEvent';
        this._scratch = scratch;
        this._vm = scratch.vm;
        this._vm.setInterrogativeDebuggerSupported(false);
        this._vm.registerCoverageTracer();
        const util = new whisker_util_1.default(scratch.vm, scratch.project);
        Container_1.Container.vm = this._vm;
        Container_1.Container.vmWrapper = new vm_wrapper_1.default(this._vm, this._scratch);
        Container_1.Container.testDriver = util.getTestDriver({});
        this._actionRecords = [];
        // Set classificationType to multi-class to also record WaitEvents if desired.
        this._eventExtractor = new NeuroevolutionScratchEventExtractor_1.NeuroevolutionScratchEventExtractor(scratch.vm, 'multiClass');
        this._fullRecordings = [];
        this._pressedKeys = new Map();
        this._stateAtAction = new Map();
        this._onRunStart = this.onGreenFlag.bind(this);
        this._onRunStop = this.onStopAll.bind(this);
        this._onInput = this.handleInput.bind(this);
        this._checkForMouseMoveCallBack = this._checkForMouseMove.bind(this);
        this._checkForWaitCallBack = this._checkForWait.bind(this);
    }
    /**
     * Starts the recording procedure by setting listeners for the start and end of Scratch runs.
     * @param config contains settings that are important during test generation such as the click duration.
     */
    startRecording(config) {
        this._vm.on(runtime_1.default.PROJECT_START, this._onRunStart);
        this._vm.on(runtime_1.default.PROJECT_STOP_ALL, this._onRunStop);
        this._vm.runtime.on(runtime_1.default.PROJECT_STOP_ALL, this._onRunStop);
        Container_1.Container.config = new WhiskerSearchConfiguration_1.WhiskerSearchConfiguration(JSON.parse(config));
        this._isRecording = true;
    }
    /**
     * Starts recording scratch input actions and sets an interval for wait event checks when a Scratch run has started.
     */
    onGreenFlag() {
        this._scratch.on(scratch_stage_1.default.INPUT_LISTENER_KEY, this._onInput);
        this._checkForWaitInterval = window.setInterval(this._checkForWaitCallBack, 500);
        this._lastActionStep = this._getCurrentStepCount();
        // Start with a clean state.
        this._lastActionStep = 0;
        this._lastMouseMoveStep = 0;
        this._mousePressedStep = 0;
        this._pressedKeys.clear();
        this._stateAtAction.clear();
        clearInterval(this._checkForMouseMoveInterval);
    }
    /**
     * Stops the recording of scratch input actions and clears the wait event check interval when the Scratch run stops.
     */
    onStopAll() {
        // Fetch coverage and add run to recording after a short delay to make sure that the vm finished gracefully.
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            this.addStateActionRecordsToRecording();
        }), 1000);
        this._scratch.off(scratch_stage_1.default.INPUT_LISTENER_KEY, this._onInput);
        clearInterval(this._checkForWaitInterval);
    }
    /**
     * Stops the recording by clearing listeners.
     */
    stopRecording() {
        this._scratch.off(scratch_stage_1.default.INPUT_LISTENER_KEY, this._onInput);
        this._vm.off(runtime_1.default.PROJECT_START, this._onRunStart);
        this._vm.off(runtime_1.default.PROJECT_STOP_ALL, this._onRunStop);
        this._vm.runtime.off(runtime_1.default.PROJECT_STOP_ALL, this._onRunStop);
        this._isRecording = false;
    }
    /**
     * Handles received action data by converting it to a string representation of an executable {@link ScratchEvent}
     * and checking whether the executed action has an active listener. If there is no active listener for the received
     * input event, then the event can be discarded as it does not lead to a state change.
     * @param actionData represents the received input event.
     */
    handleInput(actionData) {
        const event = this._inputToEvent(actionData);
        if (event) {
            const availableActions = this._eventExtractor.extractStaticEvents(this._vm).map(event => event.stringIdentifier());
            const isActionAvailable = availableActions.some(actionId => actionId.localeCompare(event.stringIdentifier(), 'en', { sensitivity: 'base' }) === 0);
            if (isActionAvailable) {
                this._recordAction(event);
            }
        }
    }
    /**
     * Maps a received action data object to the corresponding {@link ScratchEvent}.
     * @param actionData the action data object containing details of the input event.
     * @returns the ScratchEvent corresponding to the supplied action data, or null if the action is not supported.
     */
    _inputToEvent(actionData) {
        let event;
        switch (actionData.device) {
            case 'keyboard':
                event = this._handleKeyBoardInput(actionData);
                break;
            case 'mouse':
                event = this._handleMouseInput(actionData);
                break;
            default:
                event = null;
        }
        return event;
    }
    /**
     * Handles keyboard input such as key presses.
     * We only store key presses once they have been released again.
     * @param actionData the action data object containing details of the input event.
     * @returns the key press to be recorded if it has been executed entirely, i.e., the key has been released again.
     * Otherwise, returns null.
     */
    _handleKeyBoardInput(actionData) {
        const key = this._vm.runtime.ioDevices.keyboard._keyStringToScratchKey(actionData.key);
        if (actionData.isDown && actionData.key !== null) { // Start of key press or key is still pressed.
            // Register the key press if the key has not been pressed before.
            if (!this._pressedKeys.has(key)) {
                this._checkForWait(false);
                this._pressedKeys.set(key, this._getCurrentStepCount());
                this._stateAtAction.set(new KeyPressEvent_1.KeyPressEvent(key).stringIdentifier(), FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm));
            }
        }
        else if (!actionData.isDown && actionData.key !== null) { // Key has been released.
            if (this._pressedKeys.has(key)) {
                const steps = this._getCurrentStepCount() - this._pressedKeys.get(key);
                this._pressedKeys.delete(key);
                return new KeyPressEvent_1.KeyPressEvent(key, steps);
            }
        }
        return null;
    }
    /**
     * Handles mouse input by recording mouse clicks and triggers the callback for recording mouse move events.
     * @param actionData the action data object containing mouse parameter.
     * @returns a mouse click event if the mouse has been clicked, or null if the mouse has just been moved.
     */
    _handleMouseInput(actionData) {
        const scratchMouse = this._vm.runtime.ioDevices['mouse'];
        this._mouseCoordinates = [scratchMouse.getScratchX(), scratchMouse.getScratchY()];
        this._lastMouseMoveStep = this._getCurrentStepCount();
        const availableActions = this._eventExtractor.extractStaticEvents(this._vm).map(action => action.stringIdentifier());
        // Trigger callback for mouse move if there was no click event.
        if (!this._stateAtAction.has(this.MOUSE_MOVE_ACTION_KEY) && !('isDown' in actionData) &&
            availableActions.includes(this.MOUSE_MOVE_ACTION_KEY)) {
            this._checkForMouseMoveInterval = window.setInterval(this._checkForMouseMoveCallBack, 500);
            this._checkForWait(false);
            this._stateAtAction.set(this.MOUSE_MOVE_ACTION_KEY, FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm));
        }
        // Creates a ClickEvent if a mouse button has been pressed.
        if ('isDown' in actionData) {
            // Events for actively pressing the mouse button
            if (actionData.isDown) {
                const clickTarget = index_1.Util.getTargetSprite(this._vm);
                let event;
                if (availableActions.includes(new ClickSpriteEvent_1.ClickSpriteEvent(clickTarget).stringIdentifier())) {
                    clearInterval(this._checkForMouseMoveInterval);
                    this._stateAtAction.delete(this.MOUSE_MOVE_ACTION_KEY);
                    event = new ClickSpriteEvent_1.ClickSpriteEvent(clickTarget);
                }
                else if (availableActions.includes(new MouseDownForStepsEvent_1.MouseDownForStepsEvent().stringIdentifier())) {
                    this._checkForWait(false);
                    this._stateAtAction.set(this.MOUSE_DOWN_ACTION_KEY, FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm));
                    this._mousePressedStep = this._getCurrentStepCount();
                }
                return event;
            }
            else {
                return new MouseDownForStepsEvent_1.MouseDownForStepsEvent(this._getCurrentStepCount() - this._mousePressedStep);
            }
        }
        return null;
    }
    /**
     * Adds a {@link MouseMoveEvent} if the mouse has not been moved for some time. We wait with registering mouse
     * movements to avoid an explosion of mouse movements when the mouse is moved from one place to another.
     * @param mouseDownNoticed if a {@link MouseDownForStepsEvent} has been recognised we also record mouse movement.
     */
    _checkForMouseMove(mouseDownNoticed = false) {
        const stepsSinceLastMouseMove = this._getCurrentStepCount() - this._lastMouseMoveStep;
        const availableActions = this._eventExtractor.extractStaticEvents(this._vm).map(event => event.stringIdentifier());
        if (this._stateAtAction.has(this.MOUSE_MOVE_ACTION_KEY) &&
            (stepsSinceLastMouseMove > this.MOUSE_MOVE_THRESHOLD || mouseDownNoticed)) {
            const clickTarget = index_1.Util.getTargetSprite(this._vm);
            let event;
            if (availableActions.includes(new MouseMoveToEvent_1.MouseMoveToEvent(clickTarget.x, clickTarget.y, clickTarget.sprite.name).stringIdentifier())) {
                event = new MouseMoveToEvent_1.MouseMoveToEvent(clickTarget.x, clickTarget.y, clickTarget.sprite.name);
            }
            else {
                event = new MouseMoveEvent_1.MouseMoveEvent(this._mouseCoordinates[0], this._mouseCoordinates[1]);
            }
            if (availableActions.includes(event.stringIdentifier()) ||
                (event instanceof MouseMoveEvent_1.MouseMoveEvent && availableActions.includes(this.MOUSE_MOVE_ACTION_KEY))) {
                this._recordAction(event);
            }
            clearInterval(this._checkForMouseMoveInterval);
            this._stateAtAction.delete(this.MOUSE_MOVE_ACTION_KEY);
        }
    }
    /**
     * Adds a {@link WaitEvent} if no action has been executed for a set number of steps.
     * @param periodicCheck determines whether the function was called from the periodic interval,
     * or after another action was executed.
     */
    _checkForWait(periodicCheck = true) {
        const stepsSinceLastAction = this._getCurrentStepCount() - this._lastActionStep;
        const availableActions = this._eventExtractor.extractStaticEvents(this._vm).map(action => action.stringIdentifier());
        // Only add Waits if the vm permits us to do so, and if we have a saved state for it.
        // Do not add a Wait if another action is currently being executed.
        if (availableActions.includes("WaitEvent") && this._stateAtAction.has('WaitEvent') && this._stateAtAction.size == 1) {
            // Add a Wait if the function was called from a periodic check, in which case we only add a WaitEvent
            // if we have exceeded the maximum Wait boundary.
            // Otherwise, we add a Wait if we have exceeded the threshold.
            if ((periodicCheck && stepsSinceLastAction >= Container_1.Container.config.getWaitStepUpperBound() && stepsSinceLastAction > this.WAIT_THRESHOLD) ||
                (!periodicCheck && this._lastActionStep > 0 && stepsSinceLastAction > this.WAIT_THRESHOLD)) {
                this._recordAction(new WaitEvent_1.WaitEvent(stepsSinceLastAction));
            }
        }
    }
    /**
     * Records an observed action including the corresponding state by adding it to the actionRecords array.
     * @param event the observed action/event.
     */
    _recordAction(event) {
        const action = event.stringIdentifier();
        let stateFeatures;
        if (this._stateAtAction.has(action)) {
            stateFeatures = this._stateAtAction.get(action);
            this._stateAtAction.delete(action);
        }
        else {
            stateFeatures = FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm);
        }
        // Reduce the required storage capacity by rounding state values.
        for (const featureGroup of stateFeatures.values()) {
            for (const [feature, value] of featureGroup.entries()) {
                featureGroup.set(feature, Math.round(value * 100) / 100);
            }
        }
        let parameter = {};
        switch (event.toJSON()['type']) {
            case "MouseMoveEvent":
                parameter = { "X": event.getParameters()[0] / 240, "Y": event.getParameters()[1] / 180 }; // Coordinates.
                break;
            case "MouseDownForStepsEvent":
                this._checkForMouseMove(true);
                break;
        }
        const record = {
            state: stateFeatures,
            action: action,
        };
        for (const key in parameter) {
            parameter[key] = Math.round(parameter[key] * 100) / 100;
        }
        if (Object.keys(parameter).length > 0) {
            record.actionParameter = parameter;
        }
        this._actionRecords.push(record);
        this._lastActionStep = this._getCurrentStepCount();
        // Fetch state BEFORE we add a wait since the state at this point is the interesting one,
        // NOT when the action gets added.
        this._stateAtAction.set("WaitEvent", FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm));
    }
    /**
     * Fetches the current step count of the Scratch-VM.
     * @returns number of executed steps.
     */
    _getCurrentStepCount() {
        return this._vm.runtime.stepsExecuted;
    }
    /**
     * Adds an {@link ActionRecord} to the global {@link Recording}.
     */
    addStateActionRecordsToRecording() {
        const coverageTraces = this._vm.getTraces();
        const blockCoverage = coverageTraces.blockCoverage;
        const branchCoverage = coverageTraces.branchCoverage;
        const coverageSet = new Set([...blockCoverage, ...branchCoverage]);
        const fullRecord = {
            recordings: [...this._actionRecords],
            coverage: [...coverageSet.values()]
        };
        this._fullRecordings.push(fullRecord);
        this._actionRecords = [];
    }
    get isRecording() {
        return this._isRecording;
    }
    /**
     * Transforms the recording into a JSON object that can be transformed into a string and downloaded as '.json' file.
     * @returns downloadable JSON format.
     */
    getRecord() {
        // Remove empty records.
        const json = {};
        for (let i = 0; i < this._fullRecordings.length; i++) {
            const stateActionRecordJSON = {};
            for (const stateActionRecord of this._fullRecordings[i].recordings) {
                const spriteFeatures = {};
                for (const [sprite, features] of stateActionRecord.state.entries()) {
                    const featureJSON = {};
                    for (const [feature, value] of features.entries()) {
                        featureJSON[feature] = value;
                    }
                    spriteFeatures[sprite] = featureJSON;
                }
                const keyNumber = Object.keys(stateActionRecordJSON).length;
                stateActionRecordJSON[keyNumber] = {
                    'features': spriteFeatures,
                    'action': stateActionRecord.action,
                    'parameter': stateActionRecord.actionParameter
                };
            }
            // Skip empty recordings
            if (Object.keys(stateActionRecordJSON).length <= 0) {
                continue;
            }
            stateActionRecordJSON['coverage'] = this._fullRecordings[i].coverage;
            json[Object.keys(json).length] = stateActionRecordJSON;
        }
        return json;
    }
}
exports.StateActionRecorder = StateActionRecorder;
