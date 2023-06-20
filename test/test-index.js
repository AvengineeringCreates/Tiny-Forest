const chai = require('chai');
const assert = chai.assert;
const { TreeNode, Tree } = require('../src/index');

let tree = new Tree({
    tree: {
        root: new TreeNode(
            function(input) {
                console.log("Take the red pill or the blue pill?");
                console.log("> " + input[0]);
                if (input[0] == "red" || input[0] == "Red") return { next: this.parentTree.beyondMatrix, output: input };
                else if (input[0] == "blue" || input[0] == "Blue") return { next: this.parentTree.matrix, output: input };
                else throw "Please select red or blue.";
            },
            function(input) {
                console.log("No such pill exists.");
                console.log(input.error);
                return { output: "No such pill exists." };
            }
        ),
        beyondMatrix: new TreeNode(function (input) {
            console.log("You leave the illusion.");
            if (input[1]) {
                console.log("> " + input[1]);
                if (input[1] == "nevermind") throw "You can't go back now!";
            }
            else return { output: "You see the truth." };
            
        }),
        matrix: new TreeNode(function () {
            console.log("You returned to the matrix.");
            return { output: "You live a lie." };
        })
    },
    fallback: function (input) {
        console.log("Error: " + input.error);
        return { output: "There was a problem." };
    }
});

describe('Tree Test', function () {
    it('Check to see if the tree iterates correctly (option 1)', function () {
        assert.equal(tree.start([ "red" ]).output, "You see the truth.", 'If you input "red" and leave the Matrix, you should see the truth.');
    });
    it('Check to see if the tree iterates correctly (option 2)', function () {
        assert.equal(tree.start([ "blue" ]).output, "You live a lie.", 'If you choose "blue" and leave the Matrix, you live a lie.');
    });
    it('Check to see if tree fallbacks work', function () {
        assert.equal(tree.start([ "red", "nevermind" ]).output, "There was a problem.", 'If an error is thrown inside the tree, call the fallback.');
    });
    it('Check to see if node-specific fallbacks work', function () {
        assert.equal(tree.start([ "green" ]).output, "No such pill exists.", 'If there is an error the node has a special fallback, call the fallback.');
    });
});