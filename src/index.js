/**
 * A small library of classes for managing static tree data structures.
 * @module tiny-forest
 */

/**
 * @name TreeNodeIndex
 * @description The junction the node represents.
 * @function
 * @param {*} [input] An optional input passed to the junction..
 * @returns {{node: TreeNode, path: TreeNode[], result: [*]}} Returns an object containing the next node,
 *      the full path up to this node and an optional result value from the node.
 */

/**
 * @name TreeFallback
 * @description A fallback function just in case there is an error during traversal of the tree.
 * @function
 * @param {{error: Error, node: TreeNode, path: TreeNode[]}} [input] An input passed to the object.
 * @returns {*}
 */

/** Class representing a node in a tree data strucutre. */
class TreeNode {
    /**
     * Create a TreeNode.
     * @param TreeNodeIndex index A function that represents the node.
     * @param TreeFallback fallbackOverride Overrides the tree's default fallback if this node errors.
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
     * @param {TreeOptions} options A dictionary with properties as keys.
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
        try {
            let result = currentNode.index(input);
            // ! This part might be a little redundant but I will make it more elegant later.
            let returnedNode = null;
            let returnedOutput = null;
            if (result) {
                returnedNode = result.next;
                returnedOutput = result.output;
            }
            this.node = returnedNode;
            if (returnedNode) return this.nextNode(returnedNode, returnedOutput);
            else return { lastNode: this.node, path: this.path, output: returnedOutput };
            this.path[this.path.length] = currentNode;
        } catch (e) {
            if (currentNode.fallbackOverride) { return currentNode.fallbackOverride({ error: e, node: this.node, path: this.path }); }
            else if (this.fallback) { return this.fallback({ error: e, node: this.node, path: this.path }); }
            else throw e;
        }
    }

    /**
     * Start climbing the tree starting with root.
     * @param {*} [input] Input value provided to the index function of the root node.
     */
    start(input) {
        return this.nextNode(this.root, input);
    }
}

module.exports = { TreeNode, Tree };