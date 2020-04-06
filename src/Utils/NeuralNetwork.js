import Matrix from './Matrix'

const activationsFunctions = {
	relu: function (x) {
		if (x > 0) return x
		else return 0
	},
	tanh: function (x) {
		return Math.tanh(x)
	},
	sigmoid: function (x) {
		return (1 / (1 + Math.exp(-x)))
	},
	leakyRelu: function (x) {
		if (x > 0) return x
		else return (x * 0.01)
	},
	softmax: function (x, id, array) {
		let sum = 0
        array.forEach(e => sum += Math.exp(e))
		return Math.exp(x) / sum
	}
}

export default class NeuralNetwork {
    constructor (layersSizes, activationFunct) {
        // case copy constructor
        if (layersSizes instanceof NeuralNetwork) {
            this.weights = layersSizes.wweights.copy()
            this.bias = layersSizes.bias.copy()
            this.activations = layersSizes.activations
        } else {

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
