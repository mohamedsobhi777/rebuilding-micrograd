// Main controller for the Micrograd Interactive Explainer

class MicrogradExplainer {
    constructor() {
        this.currentSection = 'basic-operations';
        this.visualizers = {};
        this.currentExample = null;
        this.trainingState = {
            isTraining: false,
            epoch: 0,
            model: null,
            trainer: null,
            data: null
        };
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupVisualizers();
        this.setupEventListeners();
        this.showSection('basic-operations');
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.currentSection = sectionId;
        this.resetCurrentSection();
    }

    setupVisualizers() {
        // Basic operations visualizer
        const basicSvg = document.getElementById('basic-svg');
        this.visualizers.basic = new GraphVisualizer(basicSvg);
        
        // Computational graph visualizer
        const graphSvg = document.getElementById('graph-svg');
        this.visualizers.graph = new GraphVisualizer(graphSvg);
        
        // Backpropagation visualizer
        const backpropSvg = document.getElementById('backprop-svg');
        this.visualizers.backprop = new GraphVisualizer(backpropSvg);
        
        // Neural network visualizer
        const nnSvg = document.getElementById('nn-svg');
        this.visualizers.nn = new NeuralNetworkVisualizer(nnSvg);
        
        // Training visualizer
        const trainingSvg = document.getElementById('training-svg');
        this.visualizers.training = new NeuralNetworkVisualizer(trainingSvg);
    }

    setupEventListeners() {
        // Basic Operations
        document.getElementById('add-demo-btn')?.addEventListener('click', () => {
            this.runBasicDemo('addition');
        });
        
        document.getElementById('mul-demo-btn')?.addEventListener('click', () => {
            this.runBasicDemo('multiplication');
        });
        
        document.getElementById('tanh-demo-btn')?.addEventListener('click', () => {
            this.runBasicDemo('tanh');
        });
        
        document.getElementById('reset-basic-btn')?.addEventListener('click', () => {
            this.resetBasicOperations();
        });

        // Computational Graph
        document.getElementById('build-graph-btn')?.addEventListener('click', () => {
            this.buildComputationalGraph();
        });
        
        document.getElementById('highlight-path-btn')?.addEventListener('click', () => {
            this.highlightGraphPath();
        });
        
        document.getElementById('reset-graph-btn')?.addEventListener('click', () => {
            this.resetComputationalGraph();
        });

        // Backpropagation
        document.getElementById('forward-pass-btn')?.addEventListener('click', () => {
            this.runForwardPass();
        });
        
        document.getElementById('backward-pass-btn')?.addEventListener('click', () => {
            this.runBackwardPass();
        });
        
        document.getElementById('step-backward-btn')?.addEventListener('click', () => {
            this.stepBackward();
        });
        
        document.getElementById('reset-backprop-btn')?.addEventListener('click', () => {
            this.resetBackpropagation();
        });

        // Neural Networks
        document.getElementById('neuron-demo-btn')?.addEventListener('click', () => {
            this.showNeuronDemo();
        });
        
        document.getElementById('layer-demo-btn')?.addEventListener('click', () => {
            this.showLayerDemo();
        });
        
        document.getElementById('mlp-demo-btn')?.addEventListener('click', () => {
            this.showMLPDemo();
        });
        
        document.getElementById('reset-nn-btn')?.addEventListener('click', () => {
            this.resetNeuralNetwork();
        });

        // Training
        document.getElementById('start-training-btn')?.addEventListener('click', () => {
            this.startTraining();
        });
        
        document.getElementById('pause-training-btn')?.addEventListener('click', () => {
            this.pauseTraining();
        });
        
        document.getElementById('step-training-btn')?.addEventListener('click', () => {
            this.stepTraining();
        });
        
        document.getElementById('reset-training-btn')?.addEventListener('click', () => {
            this.resetTraining();
        });
    }

    // Basic Operations Methods
    runBasicDemo(type) {
        const example = Examples.basic[type]();
        this.currentExample = example;
        
        let rootValue, codeText;
        
        switch (type) {
            case 'addition':
                rootValue = example.c;
                codeText = `a = Value(2.0, label='a')
b = Value(-3.0, label='b')
c = a + b  # c.data = ${example.c.data}`;
                break;
            case 'multiplication':
                rootValue = example.c;
                codeText = `a = Value(2.0, label='a')
b = Value(-3.0, label='b')
c = a * b  # c.data = ${example.c.data}`;
                break;
            case 'tanh':
                rootValue = example.y;
                codeText = `x = Value(0.5, label='x')
y = x.tanh()  # y.data = ${example.y.data.toFixed(3)}`;
                break;
        }
        
        document.getElementById('basic-code').textContent = codeText;
        this.visualizers.basic.visualizeValue(rootValue, { animate: true });
    }

    resetBasicOperations() {
        this.visualizers.basic.clear();
        this.currentExample = null;
        document.getElementById('basic-code').textContent = `a = Value(2.0, label='a')
b = Value(-3.0, label='b')
c = a * b
# c.data = -6.0`;
    }

    // Computational Graph Methods
    buildComputationalGraph() {
        const example = Examples.complex();
        this.currentExample = example;
        
        this.visualizers.graph.visualizeValue(example.L, { animate: true });
        
        document.getElementById('current-step').textContent = 'Graph built! Expression: L = (a * b + c) * f';
    }

    highlightGraphPath() {
        if (!this.currentExample) {
            this.buildComputationalGraph();
            return;
        }
        
        this.visualizers.graph.animateForwardPass(this.currentExample.L, () => {
            document.getElementById('current-step').textContent = 'Forward pass complete! Values computed from inputs to output.';
        });
    }

    resetComputationalGraph() {
        this.visualizers.graph.clear();
        this.currentExample = null;
        document.getElementById('current-step').textContent = 'Click "Build Graph" to start';
    }

    // Backpropagation Methods
    runForwardPass() {
        const example = Examples.complex();
        this.currentExample = example;
        
        this.visualizers.backprop.visualizeValue(example.L);
        this.visualizers.backprop.animateForwardPass(example.L, () => {
            document.getElementById('gradient-info').innerHTML = `
                <p><strong>Forward pass complete!</strong></p>
                <p>Final output L = ${example.L.data}</p>
                <p>Ready for backpropagation...</p>
            `;
        });
    }

    runBackwardPass() {
        if (!this.currentExample) {
            this.runForwardPass();
            return;
        }
        
        // Initialize gradients
        this.currentExample.L.zeroGrad();
        this.currentExample.L.grad = 1.0;
        this.currentExample.L.backward();
        
        this.visualizers.backprop.animateBackwardPass(this.currentExample.L, () => {
            this.updateGradientInfo();
        });
    }

    stepBackward() {
        if (!this.currentExample) {
            this.runForwardPass();
            return;
        }
        
        // For now, just run the full backward pass
        // TODO: Implement step-by-step backward pass
        this.runBackwardPass();
    }

    updateGradientInfo() {
        if (!this.currentExample) return;
        
        const gradients = {
            'L': this.currentExample.L.grad,
            'd': this.currentExample.d.grad,
            'f': this.currentExample.f.grad,
            'e': this.currentExample.e.grad,
            'c': this.currentExample.c.grad,
            'a': this.currentExample.a.grad,
            'b': this.currentExample.b.grad
        };
        
        let html = '<p><strong>Gradient Flow Complete!</strong></p>';
        Object.entries(gradients).forEach(([label, grad]) => {
            html += `<p>${label}: ${grad.toFixed(4)}</p>`;
        });
        
        document.getElementById('gradient-info').innerHTML = html;
    }

    resetBackpropagation() {
        this.visualizers.backprop.resetVisualization();
        this.visualizers.backprop.clear();
        this.currentExample = null;
        document.getElementById('gradient-info').innerHTML = '<p>Gradients will appear here during backpropagation</p>';
    }

    // Neural Network Methods
    showNeuronDemo() {
        const neuron = new Neuron(2);
        const inputs = [2.0, -1.0];
        const output = neuron.forward(inputs);
        
        // Create a simple visualization for a single neuron
        this.visualizers.nn.clear();
        const svg = this.visualizers.nn.svg;
        
        // Input nodes
        inputs.forEach((input, i) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', 150);
            circle.setAttribute('cy', 150 + i * 100);
            circle.setAttribute('r', '20');
            circle.setAttribute('fill', '#2ecc71');
            circle.setAttribute('stroke', '#27ae60');
            circle.setAttribute('stroke-width', '2');
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 150);
            text.setAttribute('y', 155 + i * 100);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-weight', 'bold');
            text.textContent = `x${i + 1}`;
            
            svg.appendChild(circle);
            svg.appendChild(text);
        });
        
        // Neuron
        const neuronCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        neuronCircle.setAttribute('cx', 400);
        neuronCircle.setAttribute('cy', 200);
        neuronCircle.setAttribute('r', '30');
        neuronCircle.setAttribute('fill', '#3498db');
        neuronCircle.setAttribute('stroke', '#2980b9');
        neuronCircle.setAttribute('stroke-width', '3');
        
        const neuronText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        neuronText.setAttribute('x', 400);
        neuronText.setAttribute('y', 205);
        neuronText.setAttribute('text-anchor', 'middle');
        neuronText.setAttribute('fill', 'white');
        neuronText.setAttribute('font-weight', 'bold');
        neuronText.textContent = 'N';
        
        svg.appendChild(neuronCircle);
        svg.appendChild(neuronText);
        
        // Output
        const outputCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outputCircle.setAttribute('cx', 650);
        outputCircle.setAttribute('cy', 200);
        outputCircle.setAttribute('r', '20');
        outputCircle.setAttribute('fill', '#e74c3c');
        outputCircle.setAttribute('stroke', '#c0392b');
        outputCircle.setAttribute('stroke-width', '2');
        
        const outputText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        outputText.setAttribute('x', 650);
        outputText.setAttribute('y', 205);
        outputText.setAttribute('text-anchor', 'middle');
        outputText.setAttribute('fill', 'white');
        outputText.setAttribute('font-weight', 'bold');
        outputText.textContent = 'y';
        
        svg.appendChild(outputCircle);
        svg.appendChild(outputText);
        
        // Weights
        inputs.forEach((input, i) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 170);
            line.setAttribute('y1', 150 + i * 100);
            line.setAttribute('x2', 370);
            line.setAttribute('y2', 200);
            line.setAttribute('stroke', '#7f8c8d');
            line.setAttribute('stroke-width', '2');
            
            const weight = neuron.w[i].data;
            const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            weightText.setAttribute('x', 270);
            weightText.setAttribute('y', 175 + i * 50);
            weightText.setAttribute('text-anchor', 'middle');
            weightText.setAttribute('font-size', '12');
            weightText.textContent = `w${i + 1}: ${weight.toFixed(2)}`;
            
            svg.appendChild(line);
            svg.appendChild(weightText);
        });
        
        // Output connection
        const outputLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        outputLine.setAttribute('x1', 430);
        outputLine.setAttribute('y1', 200);
        outputLine.setAttribute('x2', 630);
        outputLine.setAttribute('y2', 200);
        outputLine.setAttribute('stroke', '#7f8c8d');
        outputLine.setAttribute('stroke-width', '2');
        
        svg.appendChild(outputLine);
        
        // Update info
        document.getElementById('architecture-display').innerHTML = `
            <p><strong>Single Neuron</strong></p>
            <p>Inputs: 2</p>
            <p>Weights: [${neuron.w.map(w => w.data.toFixed(2)).join(', ')}]</p>
            <p>Bias: ${neuron.b.data.toFixed(2)}</p>
            <p>Output: ${output.data.toFixed(3)}</p>
            <p>Formula: tanh(w₁x₁ + w₂x₂ + b)</p>
        `;
    }

    showLayerDemo() {
        const layer = new Layer(3, 4);
        this.visualizers.nn.clear();
        
        // Simple layer visualization
        const mlp = new MLP(3, [4]);
        this.visualizers.nn.visualizeNetwork(mlp, { animate: true });
        
        document.getElementById('architecture-display').innerHTML = `
            <p><strong>Single Layer</strong></p>
            <p>Input neurons: 3</p>
            <p>Output neurons: 4</p>
            <p>Total parameters: ${layer.parameters().length}</p>
            <p>Each output neuron is fully connected to all inputs</p>
        `;
    }

    showMLPDemo() {
        const mlp = new MLP(3, [4, 4, 1]);
        this.visualizers.nn.visualizeNetwork(mlp, { animate: true });
        
        const arch = mlp.getArchitecture();
        document.getElementById('architecture-display').innerHTML = `
            <p><strong>Multi-Layer Perceptron</strong></p>
            <p>Input layer: ${arch.input} neurons</p>
            <p>Hidden layers: ${arch.hidden.join(', ')} neurons</p>
            <p>Output layer: ${arch.output} neurons</p>
            <p>Total parameters: ${mlp.parameters().length}</p>
        `;
    }

    resetNeuralNetwork() {
        this.visualizers.nn.clear();
        document.getElementById('architecture-display').innerHTML = '<p>Select a demo to see network details</p>';
    }

    // Training Methods
    startTraining() {
        if (!this.trainingState.model) {
            this.initializeTraining();
        }
        
        this.trainingState.isTraining = true;
        this.updateTrainingControls();
        this.runTrainingLoop();
    }

    initializeTraining() {
        const example = Examples.binaryClassification;
        this.trainingState.model = example.createModel();
        this.trainingState.data = example.createData();
        this.trainingState.trainer = new Trainer(this.trainingState.model, Loss.mse, 0.01);
        this.trainingState.epoch = 0;
        
        // Visualize initial network
        this.visualizers.training.visualizeNetwork(this.trainingState.model, { 
            width: 600, 
            height: 400,
            animate: false 
        });
        
        this.initializeLossChart();
    }

    runTrainingLoop() {
        if (!this.trainingState.isTraining) return;
        
        const result = this.trainingState.trainer.trainStep(
            this.trainingState.data.inputs,
            this.trainingState.data.targets
        );
        
        this.trainingState.epoch++;
        this.updateTrainingMetrics(result);
        this.updateLossChart(result.loss);
        
        setTimeout(() => {
            if (this.trainingState.isTraining && this.trainingState.epoch < 1000) {
                this.runTrainingLoop();
            } else if (this.trainingState.epoch >= 1000) {
                this.pauseTraining();
            }
        }, 50); // 50ms delay between steps
    }

    pauseTraining() {
        this.trainingState.isTraining = false;
        this.updateTrainingControls();
    }

    stepTraining() {
        if (!this.trainingState.model) {
            this.initializeTraining();
        }
        
        const result = this.trainingState.trainer.trainStep(
            this.trainingState.data.inputs,
            this.trainingState.data.targets
        );
        
        this.trainingState.epoch++;
        this.updateTrainingMetrics(result);
        this.updateLossChart(result.loss);
    }

    updateTrainingMetrics(result) {
        document.getElementById('epoch-count').textContent = this.trainingState.epoch;
        document.getElementById('current-loss').textContent = result.loss.toFixed(6);
    }

    updateTrainingControls() {
        const startBtn = document.getElementById('start-training-btn');
        const pauseBtn = document.getElementById('pause-training-btn');
        
        if (this.trainingState.isTraining) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            startBtn.textContent = 'Training...';
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            startBtn.textContent = 'Start Training';
        }
    }

    initializeLossChart() {
        const chart = document.getElementById('loss-chart');
        chart.innerHTML = '<svg width="100%" height="100%" id="loss-svg"></svg>';
        this.lossData = [];
    }

    updateLossChart(loss) {
        this.lossData.push(loss);
        
        const svg = document.getElementById('loss-svg');
        if (!svg) return;
        
        const maxDataPoints = 100;
        const data = this.lossData.slice(-maxDataPoints);
        const maxLoss = Math.max(...data);
        const minLoss = Math.min(...data);
        
        const width = svg.clientWidth || 300;
        const height = svg.clientHeight || 200;
        
        // Clear previous line
        svg.innerHTML = '';
        
        if (data.length < 2) return;
        
        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = `M 0 ${height - ((data[0] - minLoss) / (maxLoss - minLoss || 1)) * height}`;
        
        for (let i = 1; i < data.length; i++) {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((data[i] - minLoss) / (maxLoss - minLoss || 1)) * height;
            pathData += ` L ${x} ${y}`;
        }
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#e74c3c');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        
        svg.appendChild(path);
    }

    resetTraining() {
        this.trainingState = {
            isTraining: false,
            epoch: 0,
            model: null,
            trainer: null,
            data: null
        };
        
        this.visualizers.training.clear();
        this.updateTrainingControls();
        
        document.getElementById('epoch-count').textContent = '0';
        document.getElementById('current-loss').textContent = '0.000';
        
        this.initializeLossChart();
    }

    resetCurrentSection() {
        // Reset the current section's state
        switch (this.currentSection) {
            case 'basic-operations':
                this.resetBasicOperations();
                break;
            case 'computational-graph':
                this.resetComputationalGraph();
                break;
            case 'backpropagation':
                this.resetBackpropagation();
                break;
            case 'neural-networks':
                this.resetNeuralNetwork();
                break;
            case 'training':
                this.resetTraining();
                break;
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.microgradExplainer = new MicrogradExplainer();
});