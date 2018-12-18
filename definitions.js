(function() {
    var inputDefs = {
        redRange: {
            displayName: "Red",
            name: "red",
            type: "range",
            color: "#e90000"
        },

        greenRange: {
            displayName: "Green",
            name: "green",
            type: "range",
            color: "#00a200",
        },

        blueRange: {
            displayName: "Blue",
            name: "blue",
            type: "range",
            color: "#0000cf"
        }
    }

    var modelsInputs = {
        LEDRGB: {
            inputs: [inputDefs.redRange, inputDefs.greenRange, inputDefs.blueRange]
        }
    }

    module.exports.getInputDefs = function() {
        return inputDefs
    }

    module.exports.getModelsInputs = function() {
        return modelsInputs
    }
}())

