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

function addModuleInput(modID, input, value) {
    if (values[modID] === undefined) {
        values[modID] = {}
    }

    values[modID][input] = value

    document.getElementById(modID+"-"+input).value = value
}

function updateModuleColor(modID, modModel) {
    var rgb = models[modModel].calcColorBar(modID, values)

    console.log(rgb)

    // section --> header
    document.getElementById(modID).children[0].style.borderColor = rgb
}

/* function updateRanges() {
    $(".rows").each(function(index, obj) {
        $(obj).children(".row").each(function(index2, obj2) {
            // .row children
            var children = obj2.children

            // Name of value(ex. red)
            var name = children[0].children[0]

            // Value (0-255)
            var value = children[0].children[1]

            // input[type=range]
            var input = children[1]
            
            input.value = value.innerHTML
            value.innerHTML = Math.round(value.innerHTML/255*100)
        })
    })
} */

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

    // data.update[name] = range.val()

    $.post("/updateLeds", data)


    // ----------------------------------------------- //

    values[modID][name] = range.val()

    updateModuleColor(modID, modModel)

    /* var rgb = "rgb("

    rgb += values[modID].red + ","
    rgb += values[modID].green + ","
    rgb += values[modID].blue

    rgb += ")" */

    /* // Header
    var header = $(ev.target).parent().first().parent().first().parent().first().children().first()

    console.log(rgb)
    header.css("border-color", rgb) */


/* 
    // Header
    var header = $(ev.target).parent().first().parent().first().parent().first().children().first()

    rgb = header.borderColor
    console.log(rgb)
    if (rgb === undefined)
        rgb = "rgb(0,0,0)"
    rgb = rgb.substring(4, rgb.length-1)
    rgb = rgb.split(",")

    rgb2 = []

    rgb.forEach(function (e) {
        rgb2.push(parseInt(e))
    })

    switch (name) {
        case "red":
            rgb2[0] = parseInt(range.val())
            break

        case "green":
            rgb2[1] = parseInt(range.val())
            break

        case "blue":
            rgb2[2] = parseInt(range.val())
            break
    }

    console.log(rgb2)

    rgb = "rgb("
    text = rgb

    rgb2.forEach(function (e) {
        rgb += e
        text += 255-e

        if (e != rgb2[2]) {
            rgb += ", "
            text += ", "
        }
    })

    rgb += ")"
    text += ")"

    header.css("border-color", rgb) */
    // header.css("color", text)

    // console.log(header)
}