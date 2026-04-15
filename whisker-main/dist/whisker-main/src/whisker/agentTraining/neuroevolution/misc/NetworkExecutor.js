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
exports.NetworkExecutor = void 0;
const ExecutionTrace_1 = require("../../../testcase/ExecutionTrace");
const Randomness_1 = require("../../../utils/Randomness");
const StatisticsCollector_1 = require("../../../utils/StatisticsCollector");
const WaitEvent_1 = require("../../../testcase/events/WaitEvent");
const runtime_1 = __importDefault(require("scratch-vm/src/engine/runtime"));
const NeuroevolutionScratchEventExtractor_1 = require("../../../testcase/NeuroevolutionScratchEventExtractor");
const Container_1 = require("../../../utils/Container");
const ScoreFitness_1 = require("../networkFitness/ScoreFitness");
const NetworkFitnessFunctionType_1 = require("../networkFitness/NetworkFitnessFunctionType");
const CosineStateNovelty_1 = require("../networkFitness/Novelty/CosineStateNovelty");
const MouseMoveDimensionEvent_1 = require("../../../testcase/events/MouseMoveDimensionEvent");
const TypeNumberEvent_1 = require("../../../testcase/events/TypeNumberEvent");
const ActivationFunction_1 = require("../networkComponents/ActivationFunction");
const FeatureExtraction_1 = require("../../featureExtraction/FeatureExtraction");
class NetworkExecutor {
    /**
     * Constructs a new NetworkExecutor object.
     * @param _vmWrapper the wrapper of the Scratch-VM.
     * @param _timeout timeout after which each playthrough is halted.
     * @param _eventSelection defines how a network will select events during its playthrough.
     * @param _classificationType defines the classification type.
     * @param _stopEarly determines whether we want to stop the execution when we have covered the network's objective.
     */
    constructor(_vmWrapper, _timeout, _eventSelection, _classificationType, _stopEarly) {
        this._vmWrapper = _vmWrapper;
        this._timeout = _timeout;
        this._eventSelection = _eventSelection;
        this._stopEarly = _stopEarly;
        /**
         * Collects the available events at the current state of the Scratch-VM
         */
        this.availableEvents = [];
        /**
         * The initial state of the Scratch-VM
         */
        this._initialState = {};
        /**
         * Random generator
         */
        this._random = Randomness_1.Randomness.getInstance();
        this._vm = this._vmWrapper.vm;
        this._eventExtractor = new NeuroevolutionScratchEventExtractor_1.NeuroevolutionScratchEventExtractor(this._vm, _classificationType);
        this._initialState = this._vmWrapper._recordInitialState();
        this._skipFrame = Container_1.Container.config.getSkipFrame();
        this._actionThreshold = Container_1.Container.config.getActionThreshold();
    }
    execute(network) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = [];
            const spritesTrace = { pass: false, positions: [] };
            // Set up the Scratch-VM and start the game
            const _onRunStop = this._projectStopped.bind(this);
            this._projectRunning = true;
            yield this._vmWrapper.start();
            let stepCount = 0;
            this._vm.runtime.on(runtime_1.default.PROJECT_STOP_ALL, _onRunStop);
            const startTime = Date.now();
            while (this._projectRunning && Date.now() - startTime < this._timeout) {
                this.availableEvents = this._eventExtractor.extractEvents(this._vm);
                // Execute WaitEvent if there are no events available.
                if (this.availableEvents.length === 0) {
                    yield new WaitEvent_1.WaitEvent(this._skipFrame).apply();
                    continue;
                }
                // Update input/output nodes if novel inputs/actions have been discovered.
                const spriteFeatures = FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm);
                const collectedTrace = this._collectSpritePositions(spriteFeatures);
                spritesTrace.positions.push(collectedTrace);
                network.updateInputNodes(spriteFeatures);
                network.updateOutputNodes(this.availableEvents);
                // Select the next event and execute it if we did not decide to wait
                network.activateNetwork(spriteFeatures);
                const nextEvents = this._selectNextEvents(network);
                yield this._executeNextEvents(nextEvents, events, network);
                // Record the activation trace and increase the stepCount.
                this._recordActivationTrace(network, stepCount, spriteFeatures);
                stepCount++;
                if (this._doStopEarly(network.targetObjective)) {
                    break;
                }
            }
            // Set score and playtime.
            network.score = ScoreFitness_1.ScoreFitness.gatherPoints(this._vm);
            network.playTime = Date.now() - startTime;
            // Save the executed Trace, the covered blocks and the sprites trace
            const coverageTrace = this._vm.getTraces();
            network.trace = new ExecutionTrace_1.ExecutionTrace(coverageTrace.branchDistances, events, spritesTrace);
            network.coverage = coverageTrace.blockCoverage;
            network.branchCoverage = coverageTrace.branchCoverage;
            // Saves the final state of the network if we want to compute a state-based novelty score.
            if (Container_1.Container.config.getNetworkFitnessFunctionType() === NetworkFitnessFunctionType_1.NetworkFitnessFunctionType.NOVELTY_COSINE ||
                Container_1.Container.config.getManyObjectiveNoveltyFunction() instanceof CosineStateNovelty_1.CosineStateNovelty) {
                network.finalState = FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm);
            }
            // Stop VM and remove listeners.
            this._vm.runtime.off(runtime_1.default.PROJECT_STOP_ALL, _onRunStop);
            this._vmWrapper.end();
            StatisticsCollector_1.StatisticsCollector.getInstance().evaluations++;
            return network.trace;
        });
    }
    /**
     * Event listener which checks if the project is still running, i.e., no GameOver state was reached.
     */
    _projectStopped() {
        return this._projectRunning = false;
    }
    /**
     * Determines whether to stop early if the specified objective has been covered.
     *
     * @param {StatementFitnessFunction} objective to be covered.
     * @return {boolean} True if the process should stop early, false otherwise.
     */
    _doStopEarly(objective) {
        if (!this._stopEarly) {
            return false;
        }
        const traces = this._vm.getTraces();
        const coverages = new Set([...traces.blockCoverage, ...traces.branchCoverage]);
        return coverages.has(objective.getNodeId());
    }
    /**
     * Executes an execution trace saved within the network.
     * @param network the network holding the execution trace.
     */
    executeSavedTrace(network) {
        return __awaiter(this, void 0, void 0, function* () {
            const spritesTrace = { pass: false, positions: [] };
            // Set up the Scratch-VM and start the game
            const _onRunStop = this._projectStopped.bind(this);
            this._projectRunning = true;
            yield this._vmWrapper.start();
            const eventTrace = network.trace.events;
            this._vm.on(runtime_1.default.PROJECT_STOP_ALL, _onRunStop);
            const startTime = Date.now();
            for (let i = 0; i < eventTrace.length; i++) {
                // Stop if the project is no longer running.
                if (!this._projectRunning) {
                    break;
                }
                // Load input features into the node to record the activation trace later.
                const spriteFeatures = FeatureExtraction_1.FeatureExtraction.getFeatureMap(this._vm);
                const collectedTrace = this._collectSpritePositions(spriteFeatures);
                spritesTrace.positions.push(collectedTrace);
                network.setUpInputs(spriteFeatures);
                // Execute the event
                const event = eventTrace[i].event;
                yield event.apply();
                // Record Activation trace.
                this._recordActivationTrace(network, i, spriteFeatures);
                if (this._doStopEarly(network.targetObjective)) {
                    break;
                }
            }
            // Set score and playtime.
            network.score = ScoreFitness_1.ScoreFitness.gatherPoints(this._vm);
            network.playTime = Date.now() - startTime;
            // Save the executed Trace and the covered blocks
            const coverageTrace = this._vm.getTraces();
            network.trace = new ExecutionTrace_1.ExecutionTrace(coverageTrace.branchDistances, eventTrace, spritesTrace);
            network.coverage = coverageTrace.blockCoverage;
            network.branchCoverage = coverageTrace.branchCoverage;
            // Stop VM and remove listeners.
            this._vm.off(runtime_1.default.PROJECT_STOP_ALL, _onRunStop);
            this._vmWrapper.end();
            StatisticsCollector_1.StatisticsCollector.getInstance().evaluations++;
            return network.trace;
        });
    }
    /**
     * Collects all (X, Y) positions of sprites (excluding "Stage") from the given input features.
     * @param inputFeatures - Map of sprite names to their feature sets.
     * @returns A flat array of numbers representing all sprite coordinates [x1, y1, x2, y2, ...].
     */
    _collectSpritePositions(inputFeatures) {
        const spritesPositions = [];
        inputFeatures.forEach((features, sprite) => {
            if (sprite != "Stage" && features.size > 0 && features.has("X") && features.has("Y")) {
                spritesPositions.push(features.get('X'), features.get('Y'));
            }
        });
        return spritesPositions;
    }
    /**
     * Selects the next event by selecting a random event if the eventSelection variable is set correspondingly
     * or by querying the network otherwise.
     * @param network the network that will be used to determine the next events.
     * @returns the set of events to be executed in the next step.
     */
    _selectNextEvents(network) {
        if (this._eventSelection === 'random') {
            return this.availableEvents.filter(() => this._random.nextDouble());
        }
        else if (network.outputActivationFunction === ActivationFunction_1.ActivationFunction.SIGMOID) {
            const triggerNodes = network.getTriggerActionNodes().filter(node => node.activationValue > this._actionThreshold);
            const continuousNodes = network.getContinuousActionNodes();
            return [...this._filterMatchingEvents(triggerNodes), ...this._filterMatchingEvents(continuousNodes)];
        }
        else if (network.outputActivationFunction === ActivationFunction_1.ActivationFunction.SOFTMAX) {
            const availableEventIdentifier = this.availableEvents.map(e => e.stringIdentifier());
            const availableNodes = network.getTriggerActionNodes().filter(node => availableEventIdentifier.includes(node.event.stringIdentifier()));
            const maxTriggerAction = availableNodes.reduce((a, b) => a.activationValue > b.activationValue ? a : b).event;
            const continuousNodes = network.getContinuousActionNodes();
            return [maxTriggerAction, ...this._filterMatchingEvents(continuousNodes)];
        }
        else {
            throw new Error(`Output activation function ${network.outputActivationFunction} not supported`);
        }
    }
    /**
     * Filters the available events to only include those that match the given action nodes.
     * @param node the action nodes to filter the events by.
     */
    _filterMatchingEvents(node) {
        return this.availableEvents.filter(e => node
            .some(n => n.event.stringIdentifier() === e.stringIdentifier()));
    }
    /**
     * Execute the selected events.
     * @param nextEvents the event that should be executed next.
     * @param events the trace of executed events.
     * @param network the network that will be used to determine parameters.
     */
    _executeNextEvents(nextEvents, events, network) {
        return __awaiter(this, void 0, void 0, function* () {
            // If the only event to be executed is a WaitEvent, update the state without sending events to the VM.
            if (nextEvents.length === 1 && nextEvents[0] instanceof WaitEvent_1.WaitEvent) {
                yield this.updateState(events);
                return;
            }
            // Otherwise, if there are other events to be executed, send them to the VM and filter WaitEvents.
            // We need to filter WaitEvents as otherwise continuous action nodes might not be properly executed in
            // a multi-class classification network with continuous action nodes.
            const filteredEvents = nextEvents.filter(e => !(e instanceof WaitEvent_1.WaitEvent));
            for (const nextEvent of filteredEvents) {
                const parameters = [this._getParameter(nextEvent, network)];
                events.push(new ExecutionTrace_1.EventAndParameters(nextEvent, parameters));
                nextEvent.setParameter(parameters, "activation");
                yield nextEvent.apply();
                StatisticsCollector_1.StatisticsCollector.getInstance().incrementEventsCount();
            }
            yield this.updateState(events);
        });
    }
    /**
     * Trigger a state update in the VM by executing a WaitEvent.
     * @param events the trace of executed events.
     */
    updateState(events) {
        return __awaiter(this, void 0, void 0, function* () {
            const waitEvent = new WaitEvent_1.WaitEvent(this._skipFrame);
            events.push(new ExecutionTrace_1.EventAndParameters(waitEvent, [this._skipFrame]));
            yield waitEvent.apply();
        });
    }
    /**
     * Gets the parameters for the next event.
     * @param event the event whose parameters should be retrieved.
     * @param network the network that will be used to determine parameters.
     * @returns the parameters for the next event.
     */
    _getParameter(event, network) {
        if (event instanceof MouseMoveDimensionEvent_1.MouseMoveDimensionEvent) {
            const mouseMoveByNode = this._findNodeByEvent(event, network);
            return mouseMoveByNode.activationValue;
        }
        else if (event instanceof TypeNumberEvent_1.TypeNumberEvent) {
            const typeNumberNode = this._findNodeByEvent(event, network);
            return typeNumberNode.activationValue;
        }
        return this._skipFrame;
    }
    /**
     * Finds the node corresponding to the given event in the network.
     * @param event the event whose node should be found.
     * @param network the network in which to search for the node.
     * @returns the node corresponding to the event.
     */
    _findNodeByEvent(event, network) {
        return network.getActionNodes().find(node => node.event.stringIdentifier() === event.stringIdentifier());
    }
    /**
     * Records the ActivationTrace. We skip step 0 as this simply reflects how the project was loaded. However,
     * we are interested in step 1 as this one reflects initialization values.
     * @param network the network whose activation trace should be updated.
     * @param step determines whether we want to record the trace at the current step.
     * @param inputs the inputs based on which an activationTrace will be recorded.
     */
    _recordActivationTrace(network, step, inputs) {
        // With higher skipFrame values, we see fewer overall frames/steps.
        // Hence, we scale the sample frequency based on the skipFrame parameter.
        let sampleFrequency = 1;
        if (this._skipFrame === 1) {
            sampleFrequency = 5;
        }
        else if (this._skipFrame === 2 || this._skipFrame === 3) {
            sampleFrequency = 2;
        }
        if (network.recordNetworkStatistics && step > 0 && (step % sampleFrequency === 0 || step === 1)) {
            network.setUpInputs(inputs);
            network.updateActivationTrace(step);
        }
    }
    /**
     * Resets the Scratch-VM to the initial state
     */
    resetState() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._vmWrapper.resetProject(this._initialState);
        });
    }
}
exports.NetworkExecutor = NetworkExecutor;
