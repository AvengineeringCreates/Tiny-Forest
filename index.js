/**
 * A small library of classes for managing static tree data structures.
 * @module tiny-forest
 */

/**
 * @typedef TreeNodeOptions
 * @type {Object}
 * @property {function} index The object that the node represents.
 * @property {function} conditional Returns descendants conditionally based on the return from parameter index.
 * @property {function} [fallback] Fallback function for nodes with asynchronous conditionals
 *      (ex. recieving data from a server to continue down the tree).
 *      This overrides the parent Tree fallback.
 */

/** Class representing a node in a tree data strucutre. */
class TreeNode {
    /**
     * Create a TreeNode.
     * @param {TreeNodeOptions} options A dictionary with properties as keys.
     */
    constructor(options) {
        this.index = options.index;
        this.conditional = options.conditional;
        this.fallback = options.fallback;
    }

    /**
     * Check whether or not the node is a "leaf", or has any descendents.
     * @returns {boolean} Is a leaf.
     */
    isLeaf() {
        if (this.conditional == null) return true;
        else return false;
    }
}

/**
 * @typedef TreeOptions
 * @type {Object}
 * @property {TreeNode[]} tree Array of TreeNodes representing the data structure.
 * @property {int} [rootIndex=0] The index of the root.
 * @property {function} [fallback] Fallback function for Trees containing nodes with asynchronous conditionals.
 */

/** Class representing a tree data structure. */
class Tree {
    /**
     * Create a Tree.
     * @param {TreeOptions} options A dictionary with properties as keys.
     */
    constructor(options) {
        this.tree = options.tree;
        if (options.rootKey !== null) this.rootKey = options.rootKey;
        else this.rootKey = "root";
        this.fallback = options.fallback;

        this.root = this.tree[this.rootKey];
        this.node = this.root;
        this.stack = [];

        for (let k in this.tree) { this.tree[k].parentTree = this.tree; }
    }

    async nextNode(currentNode, input) {
        let result = currentNode.index(input);
        if (currentNode.conditional) {
            // ! A custom object might help to condense this.
            let conditionalReturn = currentNode.conditional(result, this.interaction);
            // ! All of these if statements look kind of ugly.
            // I am really tired right now but a rewrite would be awesome.
            let returnedNode = null;
            let returnedOutput = null;
            if (conditionalReturn) {
                returnedNode = conditionalReturn.next;
                returnedOutput = conditionalReturn.output;
            }
            this.node = returnedNode;
            if (returnedNode) this.nextNode(returnedNode, returnedOutput);
        } else {
            return { node: node, result: result, stack: stack };
        }
    }

    /**
     * Start climbing the tree starting with root.
     * @param {*} [input] Input value provided to the index function of the root node.
     */
    async start(input) {
        nextNode(this.root, input);
    }
}

module.exports = { TreeNode, Tree };