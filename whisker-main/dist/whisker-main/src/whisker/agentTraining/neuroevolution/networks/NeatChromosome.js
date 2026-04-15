"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeatChromosome = void 0;
const ConnectionGene_1 = require("../networkComponents/ConnectionGene");
const NetworkChromosome_1 = require("./NetworkChromosome");
const StatementFitnessFunction_1 = require("../../../testcase/fitness/StatementFitnessFunction");
const NeatPopulation_1 = require("../neuroevolutionPopulations/NeatPopulation");
const HiddenNode_1 = require("../networkComponents/HiddenNode");
const ActivationFunction_1 = require("../networkComponents/ActivationFunction");
const BiasNode_1 = require("../networkComponents/BiasNode");
class NeatChromosome extends NetworkChromosome_1.NetworkChromosome {
    constructor() {
        super(...arguments);
        /**
         * Fitness value of the chromosome shared within its species.
         */
        this._sharedFitness = 0;
        /**
         * Marks the best member of a species.
         */
        this._isSpeciesChampion = false;
        /**
         * Marks the best member of the whole population.
         */
        this._isPopulationChampion = false;
        /**
         * The number of offspring this network is allowed to produce.
         */
        this._expectedOffspring = 0;
    }
    /**
     * Deep clone of a network including its structure and attributes. Does not increment the ID-Counter.
     * @returns NeatChromosome the cloned chromosome.
     */
    clone() {
        const clone = this.cloneStructure(false);
        clone.uID = this.uID;
        clone.fitness = this.fitness;
        clone.sharedFitness = this.sharedFitness;
        clone.targetObjective = this.targetObjective;
        clone.coverageObjectives = this.coverageObjectives;
        clone.isSpeciesChampion = this.isSpeciesChampion;
        clone.isPopulationChampion = this.isPopulationChampion;
        clone.isParent = this.isParent;
        clone.expectedOffspring = this.expectedOffspring;
        if (this.referenceActivationTrace !== undefined) {
            clone.referenceActivationTrace = this.referenceActivationTrace.clone();
        }
        if (this.testActivationTrace !== undefined) {
            clone.testActivationTrace = this.testActivationTrace.clone();
        }
        clone.referenceUncertainty = new Map(this.referenceUncertainty);
        clone.testUncertainty = new Map(this.testUncertainty);
        return clone;
    }
    /**
     * Deep clone of a NeatChromosome using a defined list of genes.
     * @param newGenes the ConnectionGenes the network should be initialised with.
     * @param incrementID determines whether the ID-Counter should be incremented during cloning.
     * @returns NeatChromosome the cloned network chromosome.
     */
    cloneWith(newGenes, incrementID = true) {
        const connectionsClone = [];
        const layerClone = this.cloneLayer();
        // duplicate connections
        const allNodes = [...layerClone.values()].flat();
        for (const connection of newGenes) {
            const fromNode = allNodes.find(node => node.equals(connection.source));
            const toNode = allNodes.find(node => node.equals(connection.target));
            const connectionClone = connection.cloneWithNodes(fromNode, toNode);
            connectionsClone.push(connectionClone);
        }
        return new NeatChromosome(layerClone, connectionsClone, this.getMutationOperator(), this.getCrossoverOperator(), this.inputConnectionMethod, this._hiddenActivationFunction, this.outputActivationFunction, incrementID);
    }
    /**
     * Deep clone of a NeatChromosome's structure. Attributes that are not related to the network's structure
     * are initialised with default values.
     * @param incrementID determines whether the ID counter should be incremented during the cloning process.
     * @returns NeatChromosome the cloned Network with default attribute values.
     */
    cloneStructure(incrementID) {
        return this.cloneWith(this.connections, incrementID);
    }
    /**
     * Clones the network during the test execution process.
     */
    cloneAsTestCase() {
        const clone = this.cloneStructure(false);
        clone.uID = this.uID;
        if (this.referenceActivationTrace !== undefined) {
            clone.referenceActivationTrace = this.referenceActivationTrace.clone();
        }
        clone.referenceUncertainty = new Map(this.referenceUncertainty);
        return clone;
    }
    /**
     * Connects nodes to the specified input nodes using a defined connectionMethod to connect the nodes.
     * @param nodesToConnect the nodes that should be connected to the input layer.
     * @param inputRate the probability of adding additional sprites to the network in case a sparse method is used
     * @param connectionMethod determines how the input layer should be connected to the given nodes.
     */
    connectNodesToInputLayer(nodesToConnect, connectionMethod, inputRate = 0.3) {
        switch (connectionMethod) {
            case "sparse":
                this.connectNodeSpriteSparse(nodesToConnect, inputRate);
                break;
            default:
            case "fully":
                this.connectNodeFully(nodesToConnect);
        }
    }
    /**
     * Creates connections from each input to every specified node.
     * @param nodesToConnect the nodes that will be connected to the specified inputs.
     */
    connectNodeFully(nodesToConnect) {
        for (const inputNode of this.layers.get(0)) {
            for (const nodeToConnect of nodesToConnect) {
                const newConnection = new ConnectionGene_1.ConnectionGene(inputNode, nodeToConnect, this._random.nextDoubleMinMax(-1, 1), true, 0);
                this.addConnection(newConnection);
            }
        }
    }
    /**
     * Creates connections from a single sprite's input nodes to all specified nodes.
     * With a defined probability, more sprite node groups are connected to the specified nodes.
     * @param nodesToConnect the nodes that will be connected to the inputs.
     * @param inputRate the probability of adding additional sprites to the network.
     * @returns ConnectionGene[] the generated network's connections.
     */
    connectNodeSpriteSparse(nodesToConnect, inputRate) {
        const connections = [];
        const biasNode = this.layers.get(0).find(node => node instanceof BiasNode_1.BiasNode);
        for (const nodeToConnect of nodesToConnect) {
            const newConnection = new ConnectionGene_1.ConnectionGene(biasNode, nodeToConnect, this._random.nextDoubleMinMax(-1, 1), true, 0);
            this.addConnection(newConnection);
        }
        // Loop at least once and until we reach the maximum connection size or randomness tells us to Stop!
        const spriteKeys = [...this.inputNodes.keys()];
        do {
            // Choose a random Sprite to add its input nodes to the network;
            const spriteToConnect = this._random.pick(spriteKeys);
            // For each input node of the Sprite create a connection to each Output-Node.
            for (const inputNode of this.inputNodes.get(spriteToConnect).values()) {
                for (const nodeToConnect of nodesToConnect) {
                    const newConnection = new ConnectionGene_1.ConnectionGene(inputNode, nodeToConnect, this._random.nextDoubleMinMax(-1, 1), true, 0);
                    this.addConnection(newConnection);
                }
            }
            spriteKeys.splice(spriteKeys.indexOf(spriteToConnect), 1);
        } while (this._random.nextDouble() < inputRate && spriteKeys.length > 0);
        return connections;
    }
    /**
     * Determines how a novel connection is added to the network. In NEAT-Chromosomes we have to keep track of the
     * innovation history.
     * @param connection the connection to add.
     */
    addConnection(connection) {
        const innovation = NeatPopulation_1.NeatPopulation.findInnovation(connection, "addConnection");
        // Check if this innovation has occurred before.
        if (innovation && innovation.type === 'addConnection') {
            connection.innovation = innovation.innovationNumber;
        }
        else {
            const newInnovation = {
                type: 'addConnection',
                idSourceNode: connection.source.uID,
                idTargetNode: connection.target.uID,
                innovationNumber: NeatPopulation_1.NeatPopulation.getAvailableInnovationNumber(),
                recurrent: connection.isRecurrent
            };
            NeatPopulation_1.NeatPopulation.innovations.push(newInnovation);
            connection.innovation = newInnovation.innovationNumber;
        }
        this.connections.push(connection);
        this.generateNetwork();
    }
    /**
     * Adds a new node by splitting an existing connection and keeping track of the innovation history.
     * @param splitConnection the connection to be split by the new node.
     */
    addNodeSplitConnection(splitConnection) {
        // Disable the old connection
        splitConnection.isEnabled = false;
        // Save the old weight and the nodes of the connection
        const oldWeight = splitConnection.weight;
        const sourceNode = splitConnection.source;
        const targetNode = splitConnection.target;
        // Create the new HiddenNode and the two new connections.
        // Check if this innovation has already occurred previously.
        const innovation = NeatPopulation_1.NeatPopulation.findInnovation(splitConnection, 'addNodeSplitConnection');
        let newNode;
        let connection1;
        let connection2;
        const depth = this.getDepthOfNewNode(sourceNode, targetNode);
        if (innovation && innovation.type === 'addNodeSplitConnection') {
            newNode = new HiddenNode_1.HiddenNode(innovation.idNewNode, depth, this._hiddenActivationFunction);
            connection1 = new ConnectionGene_1.ConnectionGene(sourceNode, newNode, 1.0, true, innovation.firstInnovationNumber);
            connection2 = new ConnectionGene_1.ConnectionGene(newNode, targetNode, oldWeight, true, innovation.secondInnovationNumber);
        }
        else {
            const nextNodeId = ++NeatPopulation_1.NeatPopulation.highestNodeId;
            newNode = new HiddenNode_1.HiddenNode(nextNodeId, depth, this._hiddenActivationFunction);
            const newInnovation = {
                type: 'addNodeSplitConnection',
                idSourceNode: sourceNode.uID,
                idTargetNode: targetNode.uID,
                firstInnovationNumber: NeatPopulation_1.NeatPopulation.getAvailableInnovationNumber(),
                secondInnovationNumber: NeatPopulation_1.NeatPopulation.getAvailableInnovationNumber(),
                idNewNode: nextNodeId,
                splitInnovation: splitConnection.innovation
            };
            NeatPopulation_1.NeatPopulation.innovations.push(newInnovation);
            connection1 = new ConnectionGene_1.ConnectionGene(sourceNode, newNode, 1.0, true, newInnovation.firstInnovationNumber);
            connection2 = new ConnectionGene_1.ConnectionGene(newNode, targetNode, oldWeight, true, newInnovation.secondInnovationNumber);
        }
        // We do not use the addConnection method here since we have already assigned innovation numbers to the
        // created connections.
        this.addNode(newNode);
        this.connections.push(connection1);
        this.connections.push(connection2);
        this.generateNetwork();
    }
    /**
     * Transforms this NeatChromosome into a JSON representation.
     * @return Record containing most important attribute keys mapped to their values.
     */
    toJSON() {
        const network = {};
        network['id'] = this.uID;
        network['hF'] = ActivationFunction_1.ActivationFunction[this._hiddenActivationFunction];
        network['oF'] = ActivationFunction_1.ActivationFunction[this._outputActivationFunction];
        network['cM'] = this.inputConnectionMethod;
        if (this.targetObjective instanceof StatementFitnessFunction_1.StatementFitnessFunction) {
            network['tf'] = this.targetObjective.getNodeId();
        }
        const nodes = {};
        for (let i = 0; i < this.getAllNodes().length; i++) {
            nodes[`Node ${i}`] = this.getAllNodes()[i].toJSON();
        }
        network[`Nodes`] = nodes;
        const connections = {};
        for (let i = 0; i < this.connections.length; i++) {
            connections[`Con ${i}`] = this.connections[i].toJSON();
        }
        network[`Cons`] = connections;
        // Save the activation trace if one was recorded.
        if (this.testActivationTrace !== undefined) {
            network['AT'] = this.testActivationTrace.toJSON();
        }
        else {
            network['AT'] = undefined;
        }
        return network;
    }
    getCrossoverOperator() {
        return this._crossoverOp;
    }
    getMutationOperator() {
        return this._mutationOp;
    }
    get sharedFitness() {
        return this._sharedFitness;
    }
    set sharedFitness(value) {
        this._sharedFitness = value;
    }
    get isSpeciesChampion() {
        return this._isSpeciesChampion;
    }
    set isSpeciesChampion(value) {
        this._isSpeciesChampion = value;
    }
    get isPopulationChampion() {
        return this._isPopulationChampion;
    }
    set isPopulationChampion(value) {
        this._isPopulationChampion = value;
    }
    get isParent() {
        return this._isParent;
    }
    set isParent(value) {
        this._isParent = value;
    }
    get expectedOffspring() {
        return this._expectedOffspring;
    }
    set expectedOffspring(value) {
        this._expectedOffspring = value;
    }
    get numberOffspringPopulationChamp() {
        return this._numberOffspringPopulationChamp;
    }
    set numberOffspringPopulationChamp(value) {
        this._numberOffspringPopulationChamp = value;
    }
}
exports.NeatChromosome = NeatChromosome;
