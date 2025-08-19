# Micrograd Interactive Explainer

An interactive web-based visualization of automatic differentiation and neural networks, built on top of a minimalistic autograd engine inspired by [Andrej Karpathy's micrograd](https://github.com/karpathy/micrograd).

## 🎯 Overview

This project provides an educational tool to understand how automatic differentiation works under the hood in modern deep learning frameworks. Through interactive animations and visualizations, you can explore:

- **Basic Value Operations**: See how mathematical operations (+, -, *, tanh, ReLU) track gradients
- **Computational Graphs**: Visualize the directed acyclic graph structure of computations  
- **Backpropagation**: Watch gradients flow backward through the computation graph
- **Neural Networks**: Understand how neurons, layers, and MLPs are built from basic operations
- **Training Process**: Observe how neural networks learn through gradient descent

## 🚀 Getting Started

### Quick Start

1. **Clone or download this repository**
2. **Open `index.html` in your web browser**
3. **Navigate through the different sections using the top navigation**

No installation required! The explainer runs entirely in your browser using vanilla JavaScript and the Anime.js animation library.

### File Structure

```
building-micrograd/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── value.js           # JavaScript Value class (mirrors engine.py)
├── nn.js              # Neural network components (mirrors nn.py)
├── animations.js      # Anime.js visualization logic
├── main.js            # Main application controller
├── engine.py          # Original Python Value implementation
├── nn.py              # Original Python neural network components
├── intuition.ipynb    # Jupyter notebook with examples
└── requirements.txt   # Python dependencies
```

## 📚 How to Use

### 1. Basic Operations
- Click the operation buttons (Addition, Multiplication, Tanh) to see simple computations
- Observe how each operation creates nodes in the computation graph
- Notice the data flow and intermediate results

### 2. Computational Graph
- Click "Build Graph" to create a complex expression: `L = (a * b + c) * f`
- Use "Highlight Path" to see the forward pass data flow
- Watch how values propagate from inputs to the final output

### 3. Backpropagation
- Start with "Forward Pass" to compute the output values
- Click "Backward Pass" to see gradients flow in reverse
- Observe how the chain rule is applied at each node
- Check the gradient values displayed for each variable

### 4. Neural Networks
- **Single Neuron**: See how a neuron computes weighted sums and applies activation
- **Layer Demo**: Visualize how multiple neurons form a layer
- **MLP Demo**: Explore multi-layer perceptron architecture

### 5. Training Visualization  
- Watch a neural network learn to solve a binary classification problem
- Observe the loss curve decreasing over time
- See real-time parameter updates during training

## 🔧 Technical Implementation

### Core Components

**Value Class (`value.js`)**
- Mirrors the Python implementation from `engine.py`
- Tracks data and gradients through operations
- Implements automatic differentiation via the chain rule
- Supports operations: +, -, *, /, **, tanh, ReLU, exp

**Neural Network Classes (`nn.js`)**
- `Neuron`: Single neuron with weights, bias, and tanh activation
- `Layer`: Collection of neurons with shared inputs  
- `MLP`: Multi-layer perceptron with configurable architecture
- `Trainer`: Training utilities with loss functions and optimization

**Visualization Engine (`animations.js`)**
- `GraphVisualizer`: Renders computational graphs as interactive SVG
- `NeuralNetworkVisualizer`: Creates animated neural network diagrams
- Integrates with Anime.js for smooth transitions and highlighting

### Key Features

- **Interactive SVG Visualizations**: Click and explore computational graphs
- **Smooth Animations**: Powered by Anime.js for professional animations  
- **Educational Progression**: Concepts build from simple to complex
- **Real-time Updates**: See values and gradients change during computation
- **Responsive Design**: Works on desktop and mobile devices

## 🎓 Educational Value

This explainer helps you understand:

1. **Automatic Differentiation**: How gradients are computed automatically
2. **Computational Graphs**: The graph structure underlying all computations
3. **Chain Rule**: How gradients propagate through composite functions
4. **Neural Network Fundamentals**: Building blocks of deep learning
5. **Training Dynamics**: How networks learn from data

## 🛠 Development

### Running Locally
Simply open `index.html` in any modern web browser. No server required!

### Python Components  
To run the original Python implementation:

```bash
pip install -r requirements.txt
jupyter notebook intuition.ipynb
```

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox  
- Safari
- Edge

Requires JavaScript and SVG support.

## 📖 Learning Path

**Recommended order for exploration:**

1. Start with **Basic Operations** to understand Value objects
2. Move to **Computational Graph** to see how operations connect  
3. Explore **Backpropagation** to understand gradient flow
4. Study **Neural Networks** to see practical applications
5. Watch **Training** to see everything come together

## 🔗 References

- [Andrej Karpathy's micrograd](https://github.com/karpathy/micrograd)
- [The spelled-out intro to neural networks and backpropagation](https://www.youtube.com/watch?v=VMj-3S1tku0)
- [Anime.js Animation Library](https://animejs.com/)

## 🤝 Contributing

This is an educational project. Feel free to:
- Report bugs or issues
- Suggest improvements to visualizations
- Add new animation features
- Improve documentation

## 📜 License

Educational use. Based on the micrograd project by Andrej Karpathy.

---

**Happy Learning! 🧠✨**

*Understanding automatic differentiation one animation at a time.*
