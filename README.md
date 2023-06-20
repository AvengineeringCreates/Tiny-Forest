# Tiny-Forest
A small npm module for making conditional trees.

tiny-forest provides two classes, TreeNode and Tree. A TreeNode represents a conditional fork in data, and a Tree represents a collection of TreeNodes whose relationships with each other create a data set.

## Install
`$ npm install tiny-forest`

## Example Usage

This example allows the user to pick from one of two paths based on a prompt input.
```
const { TreeNode, Tree } = require('tiny-forest');
const prompt = require('prompt-sync')({sigint: true});

let theUltimateChoice = new Tree({
    tree: {
        root: new TreeNode(
            function(input) {
                console.log("Take the red pill or the blue pill?");
                let input = prompt();
                if (input == "red" || input == "Red") return { next: this.parentTree.beyondMatrix, output: input };
                else if (input == "blue" || input == "Blue") return { next: this.parentTree.matrix, output: input };
                else throw "Call the fallback.";
            }
        ),
        beyondMatrix: new TreeNode(function () {
            console.log("You leave the illusion.");
            return { output: "You see the truth." };
            
        }),
        matrix: new TreeNode(function () {
            console.log("You returned to the matrix.");
            return { output: "You live a lie." };
        })
    },
    fallback: function (input) {
        return { output: input.error };
    }
});

theUltimateChoice.start();
```

## Tests
`$ npm run test`

## Documentation

Documentation is provided via a JSDocs generated webpage:
https://avengineeringcreates.github.io/Tiny-Forest/

## License
[MIT License](https://andreasonny.mit-license.org/2019) © AvengineeringCreates
