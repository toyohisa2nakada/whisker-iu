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
exports.NetworkChromosome = void 0;
const NodeType_1 = require("../networkComponents/NodeType");
const InputNode_1 = require("../networkComponents/InputNode");
const Randomness_1 = require("../../../utils/Randomness");
const ActionNode_1 = require("../networkComponents/ActionNode");
const ActivationTrace_1 = require("../misc/ActivationTrace");
const NeatPopulation_1 = require("../neuroevolutionPopulations/NeatPopulation");
const ntc_1 = require("ntc");
const assert_1 = __importDefault(require("assert"));
const BiasNode_1 = require("../networkComponents/BiasNode");
const MouseMoveToEvent_1 = require("../../../testcase/events/MouseMoveToEvent");
const MouseMoveDimensionEvent_1 = require("../../../testcase/events/MouseMoveDimensionEvent");
const Chromosome_1 = require("../../../search/Chromosome");
class NetworkChromosome extends Chromosome_1.Chromosome {
    /**
     * Constructs a new NetworkChromosome.
     * @param _layers the networks {@link NetworkLayer}s.
     * @param _connections the connections of the network.
     * @param _crossoverOp the crossover operator.
     * @param _mutationOp the mutation operator.
     * @param _inputConnectionMethod determines how novel nodes are being connected to the input layer.
     * @param _hiddenActivationFunction the activation function that will be used for hidden nodes.
     * @param _outputActivationFunction the activation function that will be used for output nodes.
     * @param incrementID determines whether the id counter should be incremented after constructing this chromosome.
     */
    constructor(_layers, _connections, _mutationOp, _crossoverOp, _inputConnectionMethod, _hiddenActivationFunction, _outputActivationFunction, incrementID = true) {
        super();
        this._layers = _layers;
        this._connections = _connections;
        this._mutationOp = _mutationOp;
        this._crossoverOp = _crossoverOp;
        this._inputConnectionMethod = _inputConnectionMethod;
        this._hiddenActivationFunction = _hiddenActivationFunction;
        this._outputActivationFunction = _outputActivationFunction;
        /**
         * Maps sprites and their respective features to the corresponding input node.
         */
        this._inputNodes = new Map();
        /**
         * Determines whether an ActivationTrace and uncertainty values should be recorded during a playthrough.
         */
        this._recordNetworkStatistics = false;
        /**
         * The average surprise value across all steps calculated between pairs of nodes.
         */
        this._averageLSA = 0;
        /**
         * Counts the number of surprising node activations.
         */
        this._surpriseCount = 0;
        /**
         * Maps Scratch steps to the uncertainty values observed during the execution of a sample program.
         */
        this._referenceUncertainty = new Map();
        /**
         * Maps Scratch steps to the uncertainty values observed during the test execution.
         * */
        this._testUncertainty = new Map();
        /**
         * The fitness value of the network.
         */
        this._fitness = 0;
        /**
         * The achieved score of a network.
         */
        this._score = 0;
        /**
         * The time a network has been playing a game.
         */
        this._playTime = 0;
        /**
         * Determined if on a child with equivalent network structure, gradient descent has already been applied.
         * There is no reason for applying gradient descent on the same parent twice.
         */
        this._gradientDescentChild = false;
        /**
         * The novelty score of the network used as a secondary fitness criterion if a novelty-based fitness metric is used.
         */
        this._noveltyScore = 0;
        /**
         * Random number generator.
         */
        this._random = Randomness_1.Randomness.getInstance();
        /**
         * The covered blocks represented by their id.
         */
        this._coverage = new Set();
        /**
         * The covered branches represented by their id.
         */
        this._branchCoverage = new Set();
        this._uID = NetworkChromosome._uIDCounter;
        this.generateNetwork();
        if (incrementID) {
            NetworkChromosome._uIDCounter++;
        }
    }
    /**
     * Adds additional input Nodes if we have encountered new input features during the playthrough.
     * @param features a map which maps each sprite to its input feature vector.
     */
    updateInputNodes(features) {
        let updated = false;
        features.forEach((spriteFeatures, spriteKey) => {
            const featureKeys = [...spriteFeatures.keys()];
            // Check if we have encountered a new Sprite.
            if (!this.inputNodes.has(spriteKey)) {
                updated = true;
                const spriteNodes = new Map();
                for (const featureKey of featureKeys) {
                    const featureID = `I:${spriteKey}-${featureKey}`;
                    const id = NetworkChromosome.getNonHiddenNodeId(featureID);
                    const iNode = new InputNode_1.InputNode(id, spriteKey, featureKey);
                    spriteNodes.set(featureKey, iNode);
                    this._layers.get(0).push(iNode);
                }
                this.inputNodes.set(spriteKey, spriteNodes);
            }
            else {
                // We have not encountered a new Sprite, but we still have to check
                // if we encountered new features of a Sprite.
                for (const featureKey of featureKeys) {
                    const savedSpriteMap = this.inputNodes.get(spriteKey);
                    if (!savedSpriteMap.has(featureKey)) {
                        updated = true;
                        const featureID = `I:${spriteKey}-${featureKey}`;
                        const id = NetworkChromosome.getNonHiddenNodeId(featureID);
                        const iNode = new InputNode_1.InputNode(id, spriteKey, featureKey);
                        savedSpriteMap.set(featureKey, iNode);
                        this._layers.get(0).push(iNode);
                    }
                }
            }
        });
        // If the network's structure has changed, re-generate the new network.
        if (updated) {
            this.generateNetwork();
        }
    }
    /**
     * Adds additional output nodes if we have encountered new events during the playthrough.
     * @param events a list of encountered events.
     */
    updateOutputNodes(events) {
        let updated = false;
        for (const event of events) {
            // Update MouseMoveEvents by changing the Event itself to prevent an explosion of such events.
            if (event instanceof MouseMoveToEvent_1.MouseMoveToEvent) {
                const targetSprite = event.sprite;
                for (const actionNode of this.getTriggerActionNodes()) {
                    const nodeEvent = actionNode.event;
                    if (nodeEvent instanceof MouseMoveToEvent_1.MouseMoveToEvent && nodeEvent.sprite === targetSprite
                        && (nodeEvent.x !== event.x || nodeEvent.y !== event.y)) {
                        nodeEvent.x = event.x;
                        nodeEvent.y = event.y;
                        break;
                    }
                }
            }
            // Check if we have to add a new action node.
            const actionNodes = [...this.getTriggerActionNodes(), ...this.getContinuousActionNodes()];
            if (!actionNodes.some(node => node.event.stringIdentifier() === event.stringIdentifier())) {
                updated = true;
                const featureID = `A:${event.stringIdentifier()}`;
                const id = NetworkChromosome.getNonHiddenNodeId(featureID);
                const actionNode = new ActionNode_1.ActionNode(id, this._outputActivationFunction, event, event instanceof MouseMoveDimensionEvent_1.MouseMoveDimensionEvent);
                this._layers.get(1).push(actionNode);
                this.connectNodesToInputLayer([actionNode], this._inputConnectionMethod);
            }
        }
        // If the network's structure has changed, re-generate the new network.
        if (updated) {
            this.generateNetwork();
        }
    }
    /**
     * Fetches the ID of a functional Node, i.e., a non-Hidden node.
     * @param featureID the featureID of the node whose id should be extracted.
     * @returns the found ID.
     */
    static getNonHiddenNodeId(featureID) {
        if (NeatPopulation_1.NeatPopulation.nodeToId.has(featureID)) {
            return NeatPopulation_1.NeatPopulation.nodeToId.get(featureID);
        }
        else {
            const id = NeatPopulation_1.NeatPopulation.highestNodeId + 1;
            NeatPopulation_1.NeatPopulation.nodeToId.set(featureID, id);
            return id;
        }
    }
    /**
     * Generates the network by placing the input and output nodes in the corresponding List.
     * Furthermore, assign each node its incoming connections that are defined by the connection gene array.
     */
    generateNetwork() {
        this.sortConnections();
        // Add input nodes to the InputNode-Map.
        for (const node of this._layers.get(0)) {
            if (node instanceof InputNode_1.InputNode) {
                if (!this.inputNodes.has(node.sprite)) {
                    const newSpriteMap = new Map();
                    newSpriteMap.set(node.feature, node);
                    this.inputNodes.set(node.sprite, newSpriteMap);
                }
                else if (!this.inputNodes.get(node.sprite).has(node.feature))
                    this.inputNodes.get(node.sprite).set(node.feature, node);
            }
        }
        // Go through each connection and set up the incoming connections of each node.
        for (const connection of this._connections) {
            const targetNode = connection.target;
            // Add the connection to the incoming connections of the target node if it is not present yet and enabled.
            if (!targetNode.incomingConnections.includes(connection) && connection.isEnabled) {
                targetNode.incomingConnections.push(connection);
            }
        }
    }
    /**
     * Activates the network to get an output based on to the fed inputs.
     * @param inputs consisting of the extracted features from the current Scratch state.
     */
    activateNetwork(inputs) {
        // Reset the node value of all nodes but pay attention to recurrent connections.
        for (const node of this.getAllNodes()) {
            node.nodeValue = 0;
            for (const inConnection of node.incomingConnections) {
                if (inConnection.isRecurrent) {
                    node.nodeValue += inConnection.weight * inConnection.source.activationValue;
                }
            }
        }
        // After we looked at potential recurrent connections, we can reset the activation value.
        for (const node of this.getAllNodes()) {
            if (!(node instanceof BiasNode_1.BiasNode)) {
                node.activationValue = 0;
            }
        }
        const layers = [...this._layers.keys()].sort();
        for (const layer of layers) {
            if (layer === 0) {
                this.setUpInputs(inputs);
            }
            else if (layer < 1) {
                this.layers.get(layer).forEach(node => {
                    this._calculateNodeValue(node);
                    node.activationValue = node.activate();
                });
            }
            else {
                this._layers.get(layer).forEach(node => this._calculateNodeValue(node));
                const nodeValues = [...this._layers.get(layer)].map(node => node.nodeValue);
                this.layers.get(layer).forEach(node => node.activationValue = node.activate(nodeValues));
            }
        }
        return [...this.layers.get(1)].some(node => node.activatedFlag);
    }
    /**
     * Computes the node value of a given node gene by calculating the weighted sum.
     * @param node whose node value will be calculated.
     */
    _calculateNodeValue(node) {
        for (const inConnection of node.incomingConnections) {
            const sourceNode = inConnection.source;
            if (!inConnection.isRecurrent) {
                node.nodeValue += (inConnection.weight * sourceNode.activationValue);
            }
            node.activatedFlag = true;
        }
    }
    /**
     * Load the given inputs into the input nodes of the network.
     * @param inputs consists of input features extracted from the current Scratch path.
     */
    setUpInputs(inputs) {
        // Reset the input nodes' activation flag to only use inputs during activation for which we collected values.
        for (const iNodeMap of this.inputNodes.values()) {
            for (const iNode of iNodeMap.values()) {
                iNode.activatedFlag = false;
            }
        }
        this.updateInputNodes(inputs);
        inputs.forEach((spriteValue, spriteKey) => {
            spriteValue.forEach((featureValue, featureKey) => {
                const iNode = this.inputNodes.get(spriteKey).get(featureKey);
                if (iNode) {
                    iNode.activationCount++;
                    iNode.activatedFlag = true;
                    iNode.nodeValue = featureValue;
                    iNode.activationValue = featureValue;
                }
            });
        });
    }
    /**
     * Generates dummy inputs for all input nodes.
     * @returns randomly generated input features.
     */
    generateDummyInputs() {
        const random = Randomness_1.Randomness.getInstance();
        const inputs = new Map();
        this.inputNodes.forEach((sprite, k) => {
            const spriteFeatures = new Map();
            const featureKeys = [...sprite.keys()];
            for (const featureKey of featureKeys) {
                spriteFeatures.set(featureKey, random.nextDouble());
            }
            inputs.set(k, spriteFeatures);
        });
        return inputs;
    }
    /**
     * Sorts the connections of this network according to their innovation numbers in increasing order.
     */
    sortConnections() {
        this._connections.sort((a, b) => a.innovation - b.innovation);
    }
    /**
     * Initialises the coverage objectives map, setting every coverage count to zero.
     * @param fitnessKeys all objective keys of the given Scratch program.
     */
    initialiseCoverageObjectives(fitnessKeys) {
        this.coverageObjectives = new Map();
        for (const t of fitnessKeys) {
            this.coverageObjectives.set(t, 0);
        }
    }
    /**
     * Resets the coverage objective map by setting all values to zero.
     */
    resetCoverageMap() {
        for (const key of this.coverageObjectives.keys()) {
            this.coverageObjectives.set(key, 0);
        }
    }
    /**
     * Adds a single ActivationTrace to the network's current trace.
     * @param step the previously performed step whose ActivationTrace should be recorded.
     */
    updateActivationTrace(step) {
        const tracedNodes = this.getAllNodes()
            .filter(node => node.type === NodeType_1.NodeType.HIDDEN || node.type === NodeType_1.NodeType.OUTPUT);
        if (this.testActivationTrace === undefined) {
            this.testActivationTrace = new ActivationTrace_1.ActivationTrace(tracedNodes);
        }
        this.testActivationTrace.update(step, tracedNodes);
    }
    /**
     * Returns the number of events this network has executed.
     * @returns number of executed events.
     */
    getNumEvents() {
        (0, assert_1.default)(this.getTrace() != null);
        return this.getTrace().events.length;
    }
    /**
     * Generates a string representation in the dot format of the given NetworkChromosome.
     * @returns string dot format of the given chromosome
     */
    toString() {
        const edges = [];
        const minNodes = [];
        const maxNodes = [];
        const convertIdentifier = (identifier) => {
            return identifier
                .replace(/-/g, '')
                .replace(/:/, '')
                // Rename colors in hex-format
                .replace(/#([a-fA-F\d]{6}|[a-fA-F\d]{3})$/g, substring => (0, ntc_1.name)(substring)[1])
                .replace(/ /g, '');
        };
        for (const node of this.getAllNodes()) {
            if (node.type === NodeType_1.NodeType.INPUT || node.type === NodeType_1.NodeType.BIAS) {
                minNodes.push(convertIdentifier(node.identifier()));
            }
            else if (node.type === NodeType_1.NodeType.OUTPUT) {
                maxNodes.push(convertIdentifier(node.identifier()));
            }
        }
        const minRanks = `\t{ rank = min; ${minNodes.toString()} }`.replace(/,/g, '; ');
        const maxRanks = `\t{ rank = max; ${maxNodes.toString()} }`.replace(/,/g, '; ');
        for (const connection of this._connections) {
            const source = convertIdentifier(connection.source.identifier());
            const target = convertIdentifier(connection.target.identifier());
            const lineStyle = connection.isEnabled ? 'solid' : 'dotted';
            const weight = connection.weight.toFixed(2);
            const color = Math.min(11, Math.max(1, Math.round(Number(weight) + 6)));
            edges.push(`\t"${source}" -> "${target}" [label=${weight} style=${lineStyle} color="/rdylgn11/${color}" penwidth=3];`);
        }
        const renderedEdges = edges.join('\n');
        const graphConfigs = "\trankdir = BT;\n\tranksep = 10;";
        return `digraph Network {\n${graphConfigs}\n${renderedEdges}\n${minRanks}\n${maxRanks}\n}`;
    }
    getLength() {
        return this.layers.size;
    }
    getFitness(fitnessFunction, fitnessKey) {
        return __awaiter(this, void 0, void 0, function* () {
            // The coverage objective was covered at least once.
            if (this.coverageObjectives.get(fitnessKey) > 0) {
                return this.coverageObjectives.get(fitnessKey);
            }
            // If the coverage objective has not been covered, compute the distance to the target.
            // Cast to maximising fitness function if necessary.
            return fitnessFunction.isMaximizing() ? yield fitnessFunction.getFitness(this) : 1 - (yield fitnessFunction.getFitness(this));
        });
    }
    /**
     * Returns all nodes of the Network.
     * @returns all nodes of the network.
     */
    getAllNodes() {
        return [...this._layers.values()].flat();
    }
    /**
     * Returns the number of nodes hosted by the network.
     * @returns number of nodes hosted by the network.
     */
    getNumNodes() {
        return this.getAllNodes().length;
    }
    /**
     * Determines the depth of a node given its input and output nodes.
     * @param inNode the source node of the node whose depth is to be determined.
     * @param outNode the target node of the node whose depth is to be determined.
     * @returns depth of the node whose input and output nodes are provided.
     */
    getDepthOfNewNode(inNode, outNode) {
        return (inNode.depth + outNode.depth) / 2;
    }
    /**
     * Adds a new node to the network.
     * @param newNode the node to be added.
     */
    addNode(newNode) {
        const depth = newNode.depth;
        if (!this._layers.get(depth)) {
            this._layers.set(depth, []);
        }
        this._layers.get(depth).push(newNode);
    }
    /**
     * Creates a deep clone of the network layer by deep cloning each node.
     * @returns the deep cloned NetworkLayer.
     */
    cloneLayer() {
        this.sortLayer();
        const layerClone = new Map();
        for (const [layer, nodes] of this._layers.entries()) {
            const layerNodeClones = [];
            for (const node of nodes) {
                layerNodeClones.push(node.clone());
            }
            layerClone.set(layer, layerNodeClones);
        }
        return layerClone;
    }
    /**
     * Returns all trigger action nodes of the network.
     * @returns all trigger action nodes of the network.
     */
    getTriggerActionNodes() {
        return this.getActionNodes().filter(node => !node.continuous);
    }
    /**
     * Returns all continuous action nodes of the network.
     * @returns all continuous action nodes of the network.
     */
    getContinuousActionNodes() {
        return this.getActionNodes().filter(node => node.continuous);
    }
    /**
     * Returns all action nodes of the network.
     * In theory, the final layer should only contain action nodes.
     * However, in practice, the final layer can also contain hidden nodes.
     * This can happen if a recurrent self-loop is added to one of the output neurons
     * and a hidden neuron is inserted by splitting this recurrent connection.
     *
     *
     * @returns all action nodes of the network.
     */
    getActionNodes() {
        return [...this.layers.get(1)].filter(node => node instanceof ActionNode_1.ActionNode);
    }
    getTrace() {
        return this._trace;
    }
    getCoveredBlocks() {
        return this._coverage;
    }
    getCoveredBranches() {
        return this._branchCoverage;
    }
    set trace(value) {
        this._trace = value;
    }
    get trace() {
        return this.getTrace();
    }
    set coverage(value) {
        this._coverage = value;
    }
    get coverage() {
        return this._coverage;
    }
    set branchCoverage(value) {
        this._branchCoverage = value;
    }
    get branchCoverage() {
        return this._branchCoverage;
    }
    /**
     * Sorts the layer map by increasing keys.
     */
    sortLayer() {
        this._layers = new Map([...this.layers.entries()].sort(([keyA], [keyB]) => keyA - keyB));
    }
    get uID() {
        return this._uID;
    }
    set uID(value) {
        this._uID = value;
    }
    get layers() {
        return this._layers;
    }
    get connections() {
        return this._connections;
    }
    get inputConnectionMethod() {
        return this._inputConnectionMethod;
    }
    get outputActivationFunction() {
        return this._outputActivationFunction;
    }
    get inputNodes() {
        return this._inputNodes;
    }
    get fitness() {
        return this._fitness;
    }
    set fitness(value) {
        this._fitness = value;
    }
    get score() {
        return this._score;
    }
    set score(value) {
        this._score = value;
    }
    get playTime() {
        return this._playTime;
    }
    set playTime(value) {
        this._playTime = value;
    }
    get gradientDescentChild() {
        return this._gradientDescentChild;
    }
    set gradientDescentChild(value) {
        this._gradientDescentChild = value;
    }
    get testActivationTrace() {
        return this._testActivationTrace;
    }
    set testActivationTrace(value) {
        this._testActivationTrace = value;
    }
    get referenceActivationTrace() {
        return this._referenceActivationTrace;
    }
    set referenceActivationTrace(value) {
        this._referenceActivationTrace = value;
    }
    get recordNetworkStatistics() {
        return this._recordNetworkStatistics;
    }
    set recordNetworkStatistics(value) {
        this._recordNetworkStatistics = value;
    }
    get averageLSA() {
        return this._averageLSA;
    }
    set averageLSA(value) {
        this._averageLSA = value;
    }
    get surpriseCount() {
        return this._surpriseCount;
    }
    set surpriseCount(value) {
        this._surpriseCount = value;
    }
    get referenceUncertainty() {
        return this._referenceUncertainty;
    }
    set referenceUncertainty(value) {
        this._referenceUncertainty = value;
    }
    get testUncertainty() {
        return this._testUncertainty;
    }
    set testUncertainty(value) {
        this._testUncertainty = value;
    }
    get finalState() {
        return this._finalState;
    }
    set finalState(value) {
        this._finalState = value;
    }
    get noveltyScore() {
        return this._noveltyScore;
    }
    set noveltyScore(value) {
        this._noveltyScore = value;
    }
    get coverageObjectives() {
        return this._coverageObjectives;
    }
    set coverageObjectives(value) {
        this._coverageObjectives = value;
    }
}
exports.NetworkChromosome = NetworkChromosome;
/**
 * Unique-ID counter.
 */
NetworkChromosome._uIDCounter = 0;
