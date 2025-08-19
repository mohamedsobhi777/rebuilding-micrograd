// Neural Network components mirroring the Python implementation

class Module {
    zeroGrad() {
        const params = this.parameters();
        params.forEach(p => {
            p.grad = 0;
        });
    }

    parameters() {
        return [];
    }
}

class Neuron extends Module {
    constructor(nin) {
        super();
        this.nin = nin;
        this.w = [];
        this.b = null;
        this.init();
    }

    init() {
        // Initialize weights with random values between -1 and 1
        for (let i = 0; i < this.nin; i++) {
            const weight = new Value(
                (Math.random() * 2 - 1), 
                [], 
                '', 
                `w${i}`
            );
            this.w.push(weight);
        }
        
        // Initialize bias
        this.b = new Value(
            (Math.random() * 2 - 1), 
            [], 
            '', 
            'b'
        );
    }

    forward(x) {
        if (x.length !== this.nin) {
            throw new Error(`Expected ${this.nin} inputs, got ${x.length}`);
        }

        // Convert inputs to Values if they aren't already
        const inputs = x.map(val => val instanceof Value ? val : new Value(val));

        // Compute weighted sum: w1*x1 + w2*x2 + ... + b
        let act = this.b;
        for (let i = 0; i < this.nin; i++) {
            act = act.add(this.w[i].mul(inputs[i]));
        }

        // Apply tanh activation
        const out = act.tanh();
        return out;
    }

    call(x) {
        return this.forward(x);
    }

    parameters() {
        return [...this.w, this.b];
    }

    // Helper method for visualization
    getWeights() {
        return this.w.map(w => w.data);
    }

    getBias() {
        return this.b.data;
    }
}

class Layer extends Module {
    constructor(nin, nout) {
        super();
        this.nin = nin;
        this.nout = nout;
        this.neurons = [];
        
        for (let i = 0; i < nout; i++) {
            this.neurons.push(new Neuron(nin));
        }
    }

    forward(x) {
        const outs = this.neurons.map(n => n.forward(x));
        return outs.length === 1 ? outs[0] : outs;
    }

    call(x) {
        return this.forward(x);
    }

    parameters() {
        const params = [];
        this.neurons.forEach(neuron => {
            params.push(...neuron.parameters());
        });
        return params;
    }

    // Helper methods for visualization
    getNeurons() {
        return this.neurons;
    }

    getWeightMatrix() {
        return this.neurons.map(neuron => neuron.getWeights());
    }

    getBiases() {
        return this.neurons.map(neuron => neuron.getBias());
    }
}

class MLP extends Module {
    constructor(nin, nouts) {
        super();
        this.nin = nin;
        this.nouts = nouts;
        this.layers = [];
        
        const sz = [nin, ...nouts];
        for (let i = 0; i < nouts.length; i++) {
            this.layers.push(new Layer(sz[i], sz[i + 1]));
        }
    }

    forward(x) {
        let output = x;
        for (const layer of this.layers) {
            output = layer.forward(output);
        }
        return output;
    }

    call(x) {
        return this.forward(x);
    }

    parameters() {
        const params = [];
        this.layers.forEach(layer => {
            params.push(...layer.parameters());
        });
        return params;
    }

    // Helper methods for visualization
    getLayers() {
        return this.layers;
    }

    getArchitecture() {
        return {
            input: this.nin,
            hidden: this.nouts.slice(0, -1),
            output: this.nouts[this.nouts.length - 1]
        };
    }

    // Get network structure for visualization
    getNetworkStructure() {
        const structure = [];
        
        // Input layer
        structure.push({
            type: 'input',
            size: this.nin,
            neurons: Array(this.nin).fill().map((_, i) => ({ id: `input_${i}`, type: 'input' }))
        });

        // Hidden and output layers
        this.layers.forEach((layer, layerIndex) => {
            const isOutput = layerIndex === this.layers.length - 1;
            structure.push({
                type: isOutput ? 'output' : 'hidden',
                size: layer.nout,
                neurons: layer.neurons.map((neuron, i) => ({
                    id: `layer_${layerIndex}_neuron_${i}`,
                    type: isOutput ? 'output' : 'hidden',
                    weights: neuron.getWeights(),
                    bias: neuron.getBias()
                }))
            });
        });

        return structure;
    }

    // Training utilities
    zeroGrad() {
        this.parameters().forEach(p => {
            p.grad = 0;
        });
    }

    updateParameters(learningRate = 0.01) {
        this.parameters().forEach(p => {
            p.data += -learningRate * p.grad;
        });
    }
}

// Loss functions
class Loss {
    static mse(predictions, targets) {
        if (predictions.length !== targets.length) {
            throw new Error('Predictions and targets must have the same length');
        }

        let totalLoss = new Value(0);
        for (let i = 0; i < predictions.length; i++) {
            const pred = predictions[i] instanceof Value ? predictions[i] : new Value(predictions[i]);
            const target = targets[i] instanceof Value ? targets[i] : new Value(targets[i]);
            const diff = pred.sub(target);
            totalLoss = totalLoss.add(diff.pow(2));
        }

        return totalLoss;
    }

    static mae(predictions, targets) {
        if (predictions.length !== targets.length) {
            throw new Error('Predictions and targets must have the same length');
        }

        let totalLoss = new Value(0);
        for (let i = 0; i < predictions.length; i++) {
            const pred = predictions[i] instanceof Value ? predictions[i] : new Value(predictions[i]);
            const target = targets[i] instanceof Value ? targets[i] : new Value(targets[i]);
            const diff = pred.sub(target);
            // Approximate absolute value using smooth approximation for differentiability
            const abs_diff = diff.pow(2).pow(0.5);
            totalLoss = totalLoss.add(abs_diff);
        }

        return totalLoss;
    }
}

// Training utilities
class Trainer {
    constructor(model, lossFn = Loss.mse, learningRate = 0.01) {
        this.model = model;
        this.lossFn = lossFn;
        this.learningRate = learningRate;
        this.lossHistory = [];
    }

    trainStep(inputs, targets) {
        // Zero gradients
        this.model.zeroGrad();

        // Forward pass
        const predictions = inputs.map(input => this.model.forward(input));

        // Compute loss
        const loss = this.lossFn(predictions, targets);

        // Backward pass
        loss.backward();

        // Update parameters
        this.model.updateParameters(this.learningRate);

        // Store loss for visualization
        this.lossHistory.push(loss.data);

        return {
            loss: loss.data,
            predictions: predictions.map(p => p instanceof Value ? p.data : p)
        };
    }

    train(inputs, targets, epochs = 100) {
        const history = [];
        
        for (let epoch = 0; epoch < epochs; epoch++) {
            const result = this.trainStep(inputs, targets);
            history.push({
                epoch,
                loss: result.loss,
                predictions: result.predictions
            });

            // Log progress every 10 epochs
            if (epoch % 10 === 0) {
                console.log(`Epoch ${epoch}: Loss = ${result.loss.toFixed(6)}`);
            }
        }

        return history;
    }

    getLossHistory() {
        return this.lossHistory;
    }

    reset() {
        this.lossHistory = [];
    }
}

// Example datasets and models
const Examples = {
    simpleRegression: {
        createModel: () => new MLP(1, [1]),
        createData: () => ({
            inputs: [[0], [1], [2], [3], [4]],
            targets: [0, 2, 4, 6, 8] // y = 2x
        })
    },

    xorProblem: {
        createModel: () => new MLP(2, [4, 1]),
        createData: () => ({
            inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
            targets: [0, 1, 1, 0] // XOR truth table
        })
    },

    binaryClassification: {
        createModel: () => new MLP(2, [3, 1]),
        createData: () => ({
            inputs: [
                [2.0, 3.0],
                [3.0, -1.0],
                [0.5, 1.0],
                [1.0, 1.0]
            ],
            targets: [1, -1, -1, 1]
        })
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Module, Neuron, Layer, MLP, Loss, Trainer, Examples };
}