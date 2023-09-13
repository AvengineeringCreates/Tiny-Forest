/**
 * A small library of classes for managing static tree data structures.
 * @module tiny-forest
 */

/* 
 * ! Note to self/contributors: maybe it's better to have these complex objects
 * like the TreeNodeIndex returns be defined as custom objects for better
 * usability?
 */

/**
 * @typedef {function} TreeNodeIndex
 * @param {*} [input] An optional input passed to the function.
 * @returns {{node: TreeNode, path: TreeNode[], result, input}} Returns an object containing the next node,
 *      the full path up to this node and an optional result value from the node.
 */

/**
 * @typedef {function} TreeFallback
 * @param {Object} input An input passed to the object.
 * @param {Error} input.error The error thrown.
 * @param {TreeNode} input.node The node where the error was thrown.
 * @param {TreeNode[]} input.path The full path leading up to the error.
 * @returns {*}
 */

/** Class representing a node in a tree data strucutre. */
class TreeNode {
    /**
     * Create a TreeNode.
     * @constructor
     * @param {module:tiny-forest~TreeNodeIndex} index A function that represents the node.
     * @param {module:tiny-forest~TreeFallback} fallbackOverride Overrides the tree's default fallback if this node errors.
     */
    constructor(index, fallbackOverride) {
        this.index = index;
        if (fallbackOverride) this.fallbackOverride = fallbackOverride;
    }
}

/**
 * @typedef TreeOptions
 * @type {Object}
 * @property {Object} tree Dictionary of TreeNodes representing the data structure.
 * @property {int} [rootIndex="root"] The index of the root.
 * @property {TreeFallback} [fallback] Fallback function for Trees containing nodes with asynchronous conditionals.
 */

/** Class representing a tree data structure. */
class Tree {
    /**
     * Create a Tree.
     * @constructor
     * @param {module:tiny-forest~TreeOptions} options A dictionary with properties as keys.
     */
    constructor(options) {
        this.tree = options.tree;

        if (options.rootKey) this.rootKey = options.rootKey;
        else this.rootKey = "root";

        if (options.fallback) this.fallback = options.fallback;

        this.root = this.tree[this.rootKey];
        this.node = this.root;
        this.path = [];

        for (let k in this.tree) { this.tree[k].parentTree = this.tree; }
    }

    nextNode(currentNode, input) {
        /*
         * Nested functions like decideNextPath and catchAndUseFallback
         * are apparently scoped independently, so we have to store "this"
         * as a separate reference in order to use it in nested functions.
         */
        let that = this;

        function decideNextPath(result) {
            that.path[that.path.length] = currentNode;
            let returnedNode = null;
            let returnedOutput = null;
            if (result) {
                returnedNode = result.next;
                returnedOutput = result.output;
            }
            if (returnedNode) {
                that.node = returnedNode;
                return that.nextNode(returnedNode, returnedOutput);
            }
            else return { lastNode: that.node, path: that.path, output: returnedOutput };
        }

        function catchAndUseFallback(e) {
            if (currentNode.fallbackOverride) {
                return currentNode.fallbackOverride({ error: e, node: that.node, path: that.path, input: input });
            }
            else if (that.fallback) {
                return that.fallback({ error: e, node: that.node, path: that.path, input: input });
            }
            else throw e;
        }

        try {
            let indexResponse = currentNode.index(input);
            // If index returns a Promise, then return a Promise which decides the next 
            if (typeof indexResponse === 'object' && typeof indexResponse.then === 'function') {
                // ! The additional .catch at the end of this might be redundant, but I am too lazy to look to see how 
                return indexResponse.then((result) => { return decideNextPath(result); }).catch((e) => { catchAndUseFallback(e); });
            // Otherwise, treat it completely synchronously.
            } else {
                return decideNextPath(indexResponse);
            }
        } catch (e) {
            return catchAndUseFallback(e);
        }
    }

    /**
     * Start climbing the tree starting with root.
     * @function
     * @param {*} [input] Input value provided to the index function of the root node.
     */
    start(input) {
        return this.nextNode(this.root, input);
    }
}

module.exports = { TreeNode, Tree };