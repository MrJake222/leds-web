var values = {}

var models = {
    LEDRGB: {
        calcColorBar: function(modID, values) {
            rgb = "rgba("

            rgb += values[modID].red + ","
            rgb += values[modID].green + ","
            rgb += values[modID].blue

            rgb += ",0.5)"
            
            return rgb
        }
    }
}

/* Add module input by name(eg. red) to values[modID][input] */
function addModuleInput(modID, input, value) {
    if (values[modID] === undefined) {
        values[modID] = {}
    }

    values[modID][input] = value

    document.getElementById(modID+"-"+input).value = value
}

/* Update color with each slide and on load */
function updateModuleColor(modID, modModel) {
    var rgb = models[modModel].calcColorBar(modID, values)

    // section --> header
    document.getElementById(modID).children[0].style.borderColor = rgb
}

function updateLeds(ev, modID, modModel, name) {
    var range = $(ev.target)
    var value = range.prev().children().eq(1)
    
    value.html(range.val())

    // ----------------------------------------------- //
    var data = {
        modID: modID,
        database: ev.type == "change",
        name: name,
        value: range.val(),
    }

    $.post("/updateValues", data)


    // ----------------------------------------------- //

    values[modID][name] = range.val()

    updateModuleColor(modID, modModel)
}