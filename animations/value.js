class Value {
    constructor(data, children = [], op = '', label = '') {
        this.data = data;
        this.grad = 0;
        this._backward = () => {};
        this._prev = new Set(children);
        this._op = op;
        this.label = label;
        this.id = Math.random().toString(36).substr(2, 9); // Unique ID for visualization
    }

    toString() {
        return `Value(data=${this.data})`;
    }

    add(other) {
        other = other instanceof Value ? other : new Value(other);
        const out = new Value(this.data + other.data, [this, other], '+');

        out._backward = () => {
            this.grad += 1.0 * out.grad;
            other.grad += 1.0 * out.grad;
        };

        return out;
    }

    mul(other) {
        other = other instanceof Value ? other : new Value(other);
        const out = new Value(this.data * other.data, [this, other], '*');

        out._backward = () => {
            this.grad += other.data * out.grad;
            other.grad += this.data * out.grad;
        };

        return out;
    }

    pow(other) {
        if (typeof other !== 'number') {
            throw new Error('only supporting number powers for now');
        }
        const out = new Value(Math.pow(this.data, other), [this], `**${other}`);

        out._backward = () => {
            this.grad += other * Math.pow(this.data, other - 1) * out.grad;
        };

        return out;
    }

    relu() {
        const out = new Value(this.data < 0 ? 0 : this.data, [this], 'ReLU');

        out._backward = () => {
            this.grad += (out.data > 0 ? 1 : 0) * out.grad;
        };

        return out;
    }

    tanh() {
        const x = this.data;
        const t = (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
        const out = new Value(t, [this], 'tanh');

        out._backward = () => {
            this.grad += (1 - t * t) * out.grad;
        };

        return out;
    }

    exp() {
        const x = this.data;
        const out = new Value(Math.exp(x), [this], 'exp');

        out._backward = () => {
            this.grad += out.data * out.grad;
        };

        return out;
    }

    div(other) {
        return this.mul(other instanceof Value ? other.pow(-1) : new Value(other).pow(-1));
    }

    neg() {
        return this.mul(-1);
    }

    sub(other) {
        return this.add(other instanceof Value ? other.neg() : new Value(other).neg());
    }

    backward() {
        // Build topological order of all children in the graph
        const topo = [];
        const visited = new Set();

        const buildTopo = (v) => {
            if (!visited.has(v)) {
                visited.add(v);
                for (const child of v._prev) {
                    buildTopo(child);
                }
                topo.push(v);
            }
        };

        buildTopo(this);

        // Go one variable at a time and apply the chain rule to get its gradient
        this.grad = 1;
        for (let i = topo.length - 1; i >= 0; i--) {
            topo[i]._backward();
        }
    }

    // Helper method to get all nodes in the computational graph
    getNodes() {
        const nodes = new Set();
        const edges = new Set();

        const build = (v) => {
            if (!nodes.has(v)) {
                nodes.add(v);
                for (const child of v._prev) {
                    edges.add([child, v]);
                    build(child);
                }
            }
        };

        build(this);
        return { nodes: Array.from(nodes), edges: Array.from(edges) };
    }

    // Reset gradients for this node and all its children
    zeroGrad() {
        const { nodes } = this.getNodes();
        nodes.forEach(node => {
            node.grad = 0;
        });
    }
}

// Helper function to create values from numbers
function createValue(data, label = '') {
    return new Value(data, [], '', label);
}

// Example expressions for demos
const Examples = {
    basic: {
        addition: () => {
            const a = createValue(2.0, 'a');
            const b = createValue(-3.0, 'b');
            const c = a.add(b);
            c.label = 'c';
            return { a, b, c };
        },
        
        multiplication: () => {
            const a = createValue(2.0, 'a');
            const b = createValue(-3.0, 'b');
            const c = a.mul(b);
            c.label = 'c';
            return { a, b, c };
        },

        tanh: () => {
            const x = createValue(0.5, 'x');
            const y = x.tanh();
            y.label = 'y';
            return { x, y };
        }
    },

    complex: () => {
        const a = createValue(2.0, 'a');
        const b = createValue(-3.0, 'b');
        const c = createValue(10.0, 'c');
        const f = createValue(-2.0, 'f');
        
        const e = a.mul(b);
        e.label = 'e';
        
        const d = e.add(c);
        d.label = 'd';
        
        const L = d.mul(f);
        L.label = 'L';
        
        return { a, b, c, e, d, f, L };
    },

    neuron: () => {
        // Simple neuron example: x1*w1 + x2*w2 + b -> tanh
        const x1 = createValue(2.0, 'x1');
        const x2 = createValue(0.0, 'x2');
        const w1 = createValue(-3.0, 'w1');
        const w2 = createValue(1.0, 'w2');
        const b = createValue(6.8813735870195432, 'b');
        
        const x1w1 = x1.mul(w1);
        x1w1.label = 'x1*w1';
        
        const x2w2 = x2.mul(w2);
        x2w2.label = 'x2*w2';
        
        const x1w1x2w2 = x1w1.add(x2w2);
        x1w1x2w2.label = 'x1*w1 + x2*w2';
        
        const n = x1w1x2w2.add(b);
        n.label = 'n';
        
        const o = n.tanh();
        o.label = 'o';
        
        return { x1, x2, w1, w2, b, x1w1, x2w2, x1w1x2w2, n, o };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Value, createValue, Examples };
}