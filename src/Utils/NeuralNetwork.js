import Matrix from './Matrix'
import { assert } from './useful'

export const activationsFunctions = {
    relu: x => (x > 0) ? x : 0,
    tanh: x => Math.tanh(x),
    sigmoid: x => 1 / (1 + Math.exp(-x)),
    centeredSigmoid: x => 2 / (1 + Math.exp(-x)) - 1,
    leakyRelu: x => (x > 0) ? x : x * 0.01,
    softmax: function (x, i, j, array) {
        assert(array.length === 1, 'softmax can only be applied on array')
        let sum = 0
        array[0].forEach(e => { sum += Math.exp(e) })
        return Math.exp(x) / sum
    }
}

export class NeuralNetwork {

    constructor (layersSizes, activationFunct) {
        // case copy constructor, a bit weird, I guess... ^^
        if (layersSizes instanceof NeuralNetwork) {
            this.weights = layersSizes.wweights.copy()
            this.bias = layersSizes.bias.copy()
            this.activations = layersSizes.activations
            this.layersSizes = layersSizes.layersSizes
        } else {
            assert(activationFunct.length === layersSizes.length - 1)
            this.weights = []
            this.bias = []
            this.activations = activationFunct
            this.layersSizes = layersSizes

            for (let i = 0; i < layersSizes.length - 1; i++) {
                this.weights.push(Matrix.randomize(layersSizes[i], layersSizes[i + 1]))
                this.bias.push(Matrix.randomize(1, layersSizes[i + 1]))
            }
        }
        return this
    }

    forward (input) {
        let out = (input instanceof Matrix) ? input : Matrix.fromArray(input) // conversion in matrix
        for (let i = 0; i < this.weights.length; i++) {
            out = out.dot(this.weights[i]).add(this.bias[i]).map(this.activations[i]) // apply each layers
        }
        return out
    }

    randomMutation (mutationRate) {
        return this.mutate(val => Math.random() < mutationRate ? Math.random() * 2 - 1 : val)
    }

    serialize () { return JSON.stringify(this) }

    copy () { return new NeuralNetwork(this) }

    mutate (funct) {
        this.weights.forEach(w => { w.map(funct) })
        this.bias.forEach(b => { b.map(funct) })
    }

    static crossOver (a, b) {
        const nn = new NeuralNetwork(a.layersSizes, a.activations) // make copy with same construction parameters
        nn.weights = nn.weights.applyWiseFunctwith(b.weights, (a, b) => Math.random() < 0.5 ? a : b) // select random elements in a & b
        nn.bias = nn.bias.applyWiseFunctwith(b.bias, (a, b) => Math.random() < 0.5 ? a : b)
        return nn
    }
}
