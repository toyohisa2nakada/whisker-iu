"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkLoader = void 0;
const NeatChromosome_1 = require("../networks/NeatChromosome");
const InputNode_1 = require("../networkComponents/InputNode");
const BiasNode_1 = require("../networkComponents/BiasNode");
const HiddenNode_1 = require("../networkComponents/HiddenNode");
const ActivationFunction_1 = require("../networkComponents/ActivationFunction");
const ConnectionGene_1 = require("../networkComponents/ConnectionGene");
const NeatMutation_1 = require("../operators/NeatMutation");
const NeatCrossover_1 = require("../operators/NeatCrossover");
const ActivationTrace_1 = require("../misc/ActivationTrace");
const NodeType_1 = require("../networkComponents/NodeType");
const ActionNode_1 = require("../networkComponents/ActionNode");
const MouseMoveDimensionEvent_1 = require("../../../testcase/events/MouseMoveDimensionEvent");
class NetworkLoader {
    /**
     * Constructs a new network loader that loads networks from a saved JSON file.
     * @param networkSuite the JSON record of saved networks.
     * @param scratchEvents the extracted Scratch events of a project.
     * @param objectives the extracted coverage objectives of a Scratch project.
     */
    constructor(networkSuite, scratchEvents, objectives = []) {
        this._networkSuite = networkSuite;
        this._scratchEvents = scratchEvents;
        this._targetObjectives = objectives;
    }
    /**
     * Loads networks from a saved JSON record.
     * @returns NeatChromosome[] the list of loaded and instantiated networks.
     */
    loadNetworks() {
        const networks = [];
        for (const savedNetwork of Object.values(this._networkSuite)) {
            const layers = new Map();
            layers.set(0, []);
            layers.set(1, []);
            for (const savedNode of Object.values(savedNetwork['Nodes'])) {
                switch (savedNode['t']) {
                    case "I": {
                        const iNode = new InputNode_1.InputNode(savedNode['id'], savedNode['sprite'], savedNode['feature']);
                        layers.get(0).push(iNode);
                        break;
                    }
                    case "B": {
                        const biasNode = new BiasNode_1.BiasNode(savedNode['id']);
                        layers.get(0).push(biasNode);
                        break;
                    }
                    case "H": {
                        const hiddenActivationFunction = savedNode['aF'];
                        const depth = savedNode['d'];
                        const hiddenNode = new HiddenNode_1.HiddenNode(savedNode['id'], depth, ActivationFunction_1.ActivationFunction[hiddenActivationFunction]);
                        if (!layers.has(depth)) {
                            layers.set(depth, []);
                        }
                        layers.get(depth).push(hiddenNode);
                        break;
                    }
                    case "A": {
                        const event = this._scratchEvents.find(event => event.stringIdentifier() === savedNode['event']);
                        const outputActivationFunction = savedNode['aF'];
                        const actionNode = new ActionNode_1.ActionNode(savedNode['id'], ActivationFunction_1.ActivationFunction[outputActivationFunction], event, event instanceof MouseMoveDimensionEvent_1.MouseMoveDimensionEvent);
                        layers.get(1).push(actionNode);
                        break;
                    }
                }
            }
            const allConnections = [];
            for (const savedConnection of Object.values(savedNetwork['Cons'])) {
                const sourceNode = [...layers.values()].flat().find(node => node.uID === savedConnection['s']);
                const targetNode = [...layers.values()].flat().find(node => node.uID === savedConnection['t']);
                if (sourceNode && targetNode) {
                    allConnections.push(new ConnectionGene_1.ConnectionGene(sourceNode, targetNode, savedConnection['w'], savedConnection['e'], savedConnection['i']));
                }
            }
            const mutation = new NeatMutation_1.NeatMutation({});
            const crossover = new NeatCrossover_1.NeatCrossover({});
            const hiddenActivationFunction = savedNetwork['hF'];
            const outputActivationFunction = savedNetwork['oF'];
            const connectionMethod = savedNetwork['cM'];
            const network = new NeatChromosome_1.NeatChromosome(layers, allConnections, mutation, crossover, connectionMethod, ActivationFunction_1.ActivationFunction[hiddenActivationFunction], ActivationFunction_1.ActivationFunction[outputActivationFunction]);
            // If the generated networks are based on the StatementFitness function,
            // we load the coverage objectives targeted during test generation.
            if (savedNetwork['tf']) {
                const targetId = savedNetwork['tf'];
                for (const statement of this._targetObjectives) {
                    if (statement.getNodeId() === targetId) {
                        network.targetObjective = statement;
                    }
                }
            }
            // Load the saved AT if there is one.
            if (savedNetwork['AT'] !== undefined) {
                NetworkLoader.loadActivationTrace(network, savedNetwork['AT']);
            }
            networks.push(network);
        }
        return networks;
    }
    /**
     * Loads the activation trace into the savedActivationTrace value.
     * @param network the network into which the trace will we loaded
     * @param savedTrace the trace that should be loaded into the network.
     */
    static loadActivationTrace(network, savedTrace) {
        network.referenceActivationTrace = new ActivationTrace_1.ActivationTrace(network.getAllNodes().filter(node => node.type === NodeType_1.NodeType.HIDDEN));
        for (const [step, nodeTraces] of Object.entries(savedTrace)) {
            const nodeStepTraces = new Map();
            for (const [nodeId, activationValues] of Object.entries(nodeTraces)) {
                nodeStepTraces.set(nodeId, activationValues);
            }
            network.referenceActivationTrace.trace.set(Number(step), nodeStepTraces);
        }
    }
}
exports.NetworkLoader = NetworkLoader;
