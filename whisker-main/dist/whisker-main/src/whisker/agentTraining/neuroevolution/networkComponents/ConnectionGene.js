"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionGene = void 0;
class ConnectionGene {
    /**
     * Constructs a new connection gene.
     * @param source the source node of the connection.
     * @param target the target node of the connection.
     * @param weight the weight of the connection.
     * @param enabled defines whether the connection is enabled.
     * @param innovation the innovation number of the connection.
     */
    constructor(source, target, weight, enabled, innovation) {
        /**
         * The gradient defined by the backward pass and used to update the connection weight during gradient descent.
         */
        this._gradient = 0;
        this._source = source;
        this._target = target;
        this._weight = weight;
        this._isEnabled = enabled;
        this._innovation = innovation;
        this._isRecurrent = source.depth >= target.depth;
    }
    /**
     * Clones this connection including its attributes but using the passed nodes as source and target nodes.
     * @param source the source node of the new connection.
     * @param target the target node of the new connection.
     */
    cloneWithNodes(source, target) {
        return new ConnectionGene(source, target, this.weight, this.isEnabled, this.innovation);
    }
    /**
     * Check for equality by comparing the source and target nodes.
     * @param other the other connection to compare this connection with.
     */
    equalsByNodes(other) {
        if (!(other instanceof ConnectionGene))
            return false;
        return this.source.equals(other.source) &&
            this.target.equals(other.target) &&
            this.isRecurrent === other.isRecurrent;
    }
    /**
     * Returns the next available innovation number and increases the counter.
     * @returns number next innovation number.
     */
    static getNextInnovationNumber() {
        return ++ConnectionGene.innovationCounter;
    }
    toString() {
        return `ConnectionGene{FromId: ${this.source.uID}\
, ToId: ${this.target.uID}\
, Weight: ${this.weight}\
, Enabled: ${this.isEnabled}\
, Recurrent: ${this.isRecurrent}\
, InnovationNumber: ${this.innovation}}`;
    }
    /**
     * Transforms this ConnectionGene into a JSON representation.
     * @return Record containing most important attributes keys mapped to their values.
     */
    toJSON() {
        const connection = {};
        connection['s'] = this.source.uID;
        connection['t'] = this.target.uID;
        connection['w'] = Number(this.weight.toFixed(5));
        connection['e'] = this.isEnabled;
        connection['i'] = this.innovation;
        connection['r'] = this.isRecurrent;
        return connection;
    }
    get source() {
        return this._source;
    }
    get target() {
        return this._target;
    }
    get weight() {
        return this._weight;
    }
    set weight(value) {
        this._weight = value;
    }
    get gradient() {
        return this._gradient;
    }
    set gradient(value) {
        this._gradient = value;
    }
    get isEnabled() {
        return this._isEnabled;
    }
    set isEnabled(value) {
        this._isEnabled = value;
    }
    get innovation() {
        return this._innovation;
    }
    set innovation(innovation) {
        this._innovation = innovation;
    }
    get isRecurrent() {
        return this._isRecurrent;
    }
}
exports.ConnectionGene = ConnectionGene;
/**
 * Counter used for obtaining the next available innovation number.
 */
ConnectionGene.innovationCounter = 0;
