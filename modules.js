var inputs = {
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

// --------------------------------------------------------------------------------
var models = {
    LEDRGB: {
        inputs: [inputs.redRange, inputs.greenRange, inputs.blueRange],
        registers: {
            red: 0x00,
            green: 0x01,
            blue:  0x02
        }
    }
}

module.exports = {
    inputs,
    models
}