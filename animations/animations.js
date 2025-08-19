// Animation utilities using Anime.js for micrograd visualizations

class GraphVisualizer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.nodes = new Map();
        this.edges = [];
        this.nodePositions = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.setupSVG();
    }

    setupSVG() {
        // Add arrow marker definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#7f8c8d');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.svg.appendChild(defs);
    }

    clear() {
        // Clear all content except defs
        const defs = this.svg.querySelector('defs');
        this.svg.innerHTML = '';
        if (defs) {
            this.svg.appendChild(defs);
        }
        
        this.nodes.clear();
        this.edges = [];
        this.nodePositions.clear();
    }

    visualizeValue(rootValue, options = {}) {
        const {
            width = 800,
            height = 400,
            animate = true
        } = options;

        this.clear();
        
        // Get graph structure
        const { nodes, edges } = rootValue.getNodes();
        
        // Calculate positions
        this.calculateLayout(nodes, edges, width, height);
        
        // Create visual elements
        this.createNodes(nodes);
        this.createEdges(edges);
        
        if (animate) {
            this.animateGraphBuild();
        }

        return { nodes, edges };
    }

    calculateLayout(nodes, edges, width, height) {
        // Topological sort to determine levels
        const levels = this.topologicalSort(nodes, edges);
        const levelWidth = width / (levels.length + 1);
        
        levels.forEach((levelNodes, levelIndex) => {
            const levelHeight = height / (levelNodes.length + 1);
            
            levelNodes.forEach((node, nodeIndex) => {
                const x = levelWidth * (levelIndex + 1);
                const y = levelHeight * (nodeIndex + 1);
                
                this.nodePositions.set(node.id, { x, y });
            });
        });
    }

    topologicalSort(nodes, edges) {
        const adjList = new Map();
        const inDegree = new Map();
        
        // Initialize
        nodes.forEach(node => {
            adjList.set(node.id, []);
            inDegree.set(node.id, 0);
        });
        
        // Build adjacency list and in-degree count
        edges.forEach(([from, to]) => {
            adjList.get(from.id).push(to);
            inDegree.set(to.id, inDegree.get(to.id) + 1);
        });
        
        // Find nodes with no dependencies (inputs)
        const queue = nodes.filter(node => inDegree.get(node.id) === 0);
        const levels = [];
        
        while (queue.length > 0) {
            const currentLevel = [...queue];
            levels.push(currentLevel);
            queue.length = 0;
            
            currentLevel.forEach(node => {
                adjList.get(node.id).forEach(neighbor => {
                    inDegree.set(neighbor.id, inDegree.get(neighbor.id) - 1);
                    if (inDegree.get(neighbor.id) === 0) {
                        queue.push(neighbor);
                    }
                });
            });
        }
        
        return levels;
    }

    createNodes(nodes) {
        nodes.forEach(node => {
            const position = this.nodePositions.get(node.id);
            const nodeGroup = this.createNodeElement(node, position);
            this.nodes.set(node.id, nodeGroup);
        });
    }

    createNodeElement(node, position) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('value-node');
        group.setAttribute('data-node-id', node.id);
        
        // Determine node type for styling
        const isInput = node._prev.size === 0;
        const nodeType = isInput ? 'input' : (node._op ? 'intermediate' : 'output');
        group.classList.add(nodeType);
        
        // Create rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', position.x - 40);
        rect.setAttribute('y', position.y - 20);
        rect.setAttribute('width', '80');
        rect.setAttribute('height', '40');
        
        // Create text for label and data
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', position.x);
        labelText.setAttribute('y', position.y - 5);
        labelText.textContent = node.label || `${node.data.toFixed(2)}`;
        
        const dataText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dataText.setAttribute('x', position.x);
        dataText.setAttribute('y', position.y + 8);
        dataText.textContent = `data: ${node.data.toFixed(3)}`;
        dataText.setAttribute('font-size', '10');
        
        // Create gradient text (initially hidden)
        const gradText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        gradText.setAttribute('x', position.x);
        gradText.setAttribute('y', position.y + 18);
        gradText.textContent = `grad: ${node.grad.toFixed(3)}`;
        gradText.setAttribute('font-size', '8');
        gradText.setAttribute('opacity', '0');
        gradText.classList.add('grad-text');
        
        group.appendChild(rect);
        group.appendChild(labelText);
        group.appendChild(dataText);
        group.appendChild(gradText);
        
        // Add operation node if needed
        if (node._op) {
            this.createOperationNode(node, position, group);
        }
        
        this.svg.appendChild(group);
        return group;
    }

    createOperationNode(node, position, parentGroup) {
        const opGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        opGroup.classList.add('op-node');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', position.x + 60);
        circle.setAttribute('cy', position.y);
        circle.setAttribute('r', '15');
        
        const opText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        opText.setAttribute('x', position.x + 60);
        opText.setAttribute('y', position.y);
        opText.textContent = node._op;
        
        opGroup.appendChild(circle);
        opGroup.appendChild(opText);
        this.svg.appendChild(opGroup);
        
        return opGroup;
    }

    createEdges(edges) {
        edges.forEach(([from, to]) => {
            const edge = this.createEdgeElement(from, to);
            this.edges.push(edge);
        });
    }

    createEdgeElement(from, to) {
        const fromPos = this.nodePositions.get(from.id);
        const toPos = this.nodePositions.get(to.id);
        
        // Calculate connection points
        const x1 = fromPos.x + 40;
        const y1 = fromPos.y;
        const x2 = to._op ? toPos.x + 45 : toPos.x - 40;
        const y2 = toPos.y;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('graph-edge');
        path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
        
        this.svg.appendChild(path);
        return path;
    }

    animateGraphBuild() {
        const nodeElements = Array.from(this.svg.querySelectorAll('.value-node'));
        const edgeElements = Array.from(this.svg.querySelectorAll('.graph-edge'));
        
        // Initially hide all elements
        [...nodeElements, ...edgeElements].forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'scale(0)';
        });
        
        // Animate nodes first
        anime({
            targets: nodeElements,
            opacity: 1,
            scale: 1,
            duration: 800,
            delay: anime.stagger(200),
            easing: 'easeOutElastic(1, .6)',
            complete: () => {
                // Then animate edges
                anime({
                    targets: edgeElements,
                    opacity: 1,
                    duration: 600,
                    delay: anime.stagger(100),
                    easing: 'easeOutCubic'
                });
            }
        });
    }

    animateForwardPass(rootValue, callback) {
        const { nodes } = rootValue.getNodes();
        const sortedNodes = this.topologicalSort(nodes, []).flat();
        
        this.animationQueue = sortedNodes.map((node, index) => ({
            type: 'forward',
            node,
            delay: index * 500
        }));
        
        this.executeAnimationQueue(callback);
    }

    animateBackwardPass(rootValue, callback) {
        const { nodes } = rootValue.getNodes();
        const sortedNodes = this.topologicalSort(nodes, []).flat().reverse();
        
        // Show gradient text for all nodes
        this.svg.querySelectorAll('.grad-text').forEach(el => {
            anime({
                targets: el,
                opacity: 0.7,
                duration: 300
            });
        });
        
        this.animationQueue = sortedNodes.map((node, index) => ({
            type: 'backward',
            node,
            delay: index * 800
        }));
        
        this.executeAnimationQueue(callback);
    }

    executeAnimationQueue(callback) {
        if (this.animationQueue.length === 0) {
            if (callback) callback();
            return;
        }
        
        this.isAnimating = true;
        const animation = this.animationQueue.shift();
        
        setTimeout(() => {
            this.executeAnimation(animation, () => {
                this.executeAnimationQueue(callback);
            });
        }, animation.delay);
    }

    executeAnimation(animation, callback) {
        const nodeElement = this.svg.querySelector(`[data-node-id="${animation.node.id}"]`);
        
        if (animation.type === 'forward') {
            this.highlightNode(nodeElement, '#3498db', callback);
        } else if (animation.type === 'backward') {
            this.highlightNode(nodeElement, '#e74c3c');
            this.updateGradientDisplay(animation.node);
            if (callback) setTimeout(callback, 400);
        }
    }

    highlightNode(nodeElement, color, callback) {
        const rect = nodeElement.querySelector('rect');
        
        anime({
            targets: rect,
            stroke: color,
            strokeWidth: 4,
            scale: 1.1,
            duration: 300,
            direction: 'alternate',
            easing: 'easeInOutQuad',
            complete: callback
        });
    }

    updateGradientDisplay(node) {
        const nodeElement = this.svg.querySelector(`[data-node-id="${node.id}"]`);
        const gradText = nodeElement.querySelector('.grad-text');
        gradText.textContent = `grad: ${node.grad.toFixed(3)}`;
        
        anime({
            targets: gradText,
            scale: [1.2, 1],
            duration: 300,
            easing: 'easeOutCubic'
        });
    }

    resetVisualization() {
        // Reset all visual states
        this.svg.querySelectorAll('.value-node rect').forEach(rect => {
            rect.setAttribute('stroke-width', '2');
            rect.style.transform = '';
        });
        
        this.svg.querySelectorAll('.grad-text').forEach(el => {
            el.style.opacity = '0';
        });
        
        this.svg.querySelectorAll('.graph-edge').forEach(edge => {
            edge.classList.remove('active', 'gradient-flow');
        });
        
        this.isAnimating = false;
        this.animationQueue = [];
    }
}

// Neural Network Visualizer
class NeuralNetworkVisualizer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.layers = [];
        this.connections = [];
    }

    clear() {
        this.svg.innerHTML = '';
        this.layers = [];
        this.connections = [];
    }

    visualizeNetwork(network, options = {}) {
        const {
            width = 900,
            height = 600,
            animate = true
        } = options;

        this.clear();
        
        const structure = network.getNetworkStructure();
        this.calculateNetworkLayout(structure, width, height);
        this.createNetworkElements(structure);
        
        if (animate) {
            this.animateNetworkBuild();
        }
    }

    calculateNetworkLayout(structure, width, height) {
        const layerWidth = width / (structure.length + 1);
        
        structure.forEach((layer, layerIndex) => {
            const layerHeight = height / (layer.neurons.length + 1);
            const x = layerWidth * (layerIndex + 1);
            
            layer.neurons.forEach((neuron, neuronIndex) => {
                const y = layerHeight * (neuronIndex + 1);
                neuron.position = { x, y };
            });
        });
        
        this.layers = structure;
    }

    createNetworkElements(structure) {
        // Create connections first (so they appear behind neurons)
        this.createConnections();
        
        // Create neurons
        structure.forEach(layer => {
            layer.neurons.forEach(neuron => {
                this.createNeuron(neuron, layer.type);
            });
        });
    }

    createConnections() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            const currentLayer = this.layers[i];
            const nextLayer = this.layers[i + 1];
            
            currentLayer.neurons.forEach(fromNeuron => {
                nextLayer.neurons.forEach((toNeuron, toIndex) => {
                    const connection = this.createConnection(fromNeuron, toNeuron, toIndex);
                    this.connections.push(connection);
                });
            });
        }
    }

    createConnection(from, to, weightIndex) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('weight-line');
        line.setAttribute('x1', from.position.x + 20);
        line.setAttribute('y1', from.position.y);
        line.setAttribute('x2', to.position.x - 20);
        line.setAttribute('y2', to.position.y);
        
        // Color-code by weight strength if available
        if (to.weights && to.weights[weightIndex] !== undefined) {
            const weight = to.weights[weightIndex];
            const intensity = Math.min(Math.abs(weight), 1);
            const color = weight > 0 ? `rgba(52, 152, 219, ${intensity})` : `rgba(231, 76, 60, ${intensity})`;
            line.setAttribute('stroke', color);
        }
        
        this.svg.appendChild(line);
        return line;
    }

    createNeuron(neuron, type) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('neuron-group');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.classList.add('neuron-circle');
        circle.setAttribute('cx', neuron.position.x);
        circle.setAttribute('cy', neuron.position.y);
        circle.setAttribute('r', '20');
        
        // Color by type
        const colors = {
            input: '#2ecc71',
            hidden: '#3498db',
            output: '#e74c3c'
        };
        
        if (colors[type]) {
            circle.setAttribute('fill', colors[type]);
        }
        
        // Add bias indicator if available
        if (neuron.bias !== undefined) {
            const biasText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            biasText.setAttribute('x', neuron.position.x);
            biasText.setAttribute('y', neuron.position.y + 35);
            biasText.textContent = `b: ${neuron.bias.toFixed(2)}`;
            biasText.setAttribute('text-anchor', 'middle');
            biasText.setAttribute('font-size', '10');
            group.appendChild(biasText);
        }
        
        group.appendChild(circle);
        this.svg.appendChild(group);
        
        return group;
    }

    animateNetworkBuild() {
        const neurons = Array.from(this.svg.querySelectorAll('.neuron-circle'));
        const connections = Array.from(this.svg.querySelectorAll('.weight-line'));
        
        // Initially hide all elements
        [...neurons, ...connections].forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'scale(0)';
        });
        
        // Animate by layers
        this.layers.forEach((layer, layerIndex) => {
            setTimeout(() => {
                const layerNeurons = neurons.slice(
                    layerIndex * layer.neurons.length,
                    (layerIndex + 1) * layer.neurons.length
                );
                
                anime({
                    targets: layerNeurons,
                    opacity: 1,
                    scale: 1,
                    duration: 600,
                    delay: anime.stagger(100),
                    easing: 'easeOutElastic(1, .6)'
                });
            }, layerIndex * 800);
        });
        
        // Animate connections last
        setTimeout(() => {
            anime({
                targets: connections,
                opacity: 1,
                scale: 1,
                duration: 1000,
                delay: anime.stagger(50),
                easing: 'easeOutCubic'
            });
        }, this.layers.length * 800);
    }

    animateForwardPass(inputs, callback) {
        const neurons = Array.from(this.svg.querySelectorAll('.neuron-circle'));
        let neuronIndex = 0;
        
        // Animate input layer activation
        const inputNeurons = neurons.slice(0, this.layers[0].neurons.length);
        inputNeurons.forEach((neuron, i) => {
            setTimeout(() => {
                this.activateNeuron(neuron);
            }, i * 200);
        });
        
        // Animate forward propagation through layers
        for (let layerIndex = 1; layerIndex < this.layers.length; layerIndex++) {
            setTimeout(() => {
                const layerStart = this.layers.slice(0, layerIndex).reduce((sum, layer) => sum + layer.neurons.length, 0);
                const layerNeurons = neurons.slice(layerStart, layerStart + this.layers[layerIndex].neurons.length);
                
                layerNeurons.forEach((neuron, i) => {
                    setTimeout(() => {
                        this.activateNeuron(neuron);
                    }, i * 200);
                });
            }, layerIndex * 1000);
        }
        
        if (callback) {
            setTimeout(callback, this.layers.length * 1000 + 500);
        }
    }

    activateNeuron(neuronElement) {
        anime({
            targets: neuronElement,
            r: [20, 25, 20],
            duration: 400,
            easing: 'easeInOutQuad'
        });
    }
}

// Export classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GraphVisualizer, NeuralNetworkVisualizer };
}