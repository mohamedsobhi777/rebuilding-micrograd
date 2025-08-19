# Micrograd

A minimal automatic differentiation (autograd) engine implementation with a small neural network library built on top.

## Core Components

### Engine (`engine.py`)

The `Value` class implements scalar-valued automatic differentiation:

- **Forward Pass**: Supports basic arithmetic operations (`+`, `-`, `*`, `/`, `**`) and activation functions (`tanh`, `ReLU`, `exp`)
- **Backward Pass**: Automatic gradient computation through backpropagation using the chain rule
- **Graph Structure**: Each `Value` maintains references to its children and operation type for building computation graphs

### Neural Network (`nn.py`)

A lightweight neural network library with modular components:

- **Module**: Base class with parameter management and gradient zeroing
- **Neuron**: Single neuron with weights, bias, and tanh activation
- **Layer**: Collection of neurons forming a network layer
- **MLP**: Multi-layer perceptron supporting arbitrary architectures

## Key Features

- **Scalar Operations**: All computations operate on individual scalars rather than tensors
- **Automatic Differentiation**: Gradients computed automatically via reverse-mode AD
- **Modular Design**: Clean separation between autograd engine and neural network components
- **Educational Focus**: Simple, readable implementation ideal for understanding backpropagation

## Architecture

The system builds computation graphs dynamically during forward passes, then traverses them backward to compute gradients. Neural networks are composed of interconnected `Value` objects that automatically track gradients for parameter optimization.