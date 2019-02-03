var leaveActive = 0

function hoverPreser(ev) {
    console.log(leaveActive)

    // if (ev.type == "mouseleave") {
        /* if (leaveActive > 1)
            return

        leaveActive++

        setTimeout(function() {
            leaveActive = 0
            console.log("FALSE")
        }, 1000) */
    // }

    var el = $(ev.target).children(".selects")

    el.stop()
    el.slideToggle(ev.type == "mouseenter" ? 400 : 200)

    console.log(ev.type)

   /*  if (leaveActive < 2) {
        el.stop()
        el.slideToggle(ev.type == "mouseenter" ? 400 : 200)
    }

    if (ev.type == "mouseleave") {
        leaveActive++

        setTimeout(function() {
            leaveActive = 0
            console.log("FALSE")
        }, 1000)
    } */
}

var selected

function getHsl(el) {
    return {
        hue: el.getAttribute("data-hue"),
        saturation: el.getAttribute("data-saturation"),
        lightness: el.getAttribute("data-lightness")
    }
}

function makeHslString(hsl) {
    return "hsl("+hsl.hue+", "+hsl.saturation+"%, "+hsl.lightness+"%)"
}

function presetSelect(ev) {
    if (ev.type == "click") {
        if (selected) {
            presetSelect({target: selected})

            if (selected == ev.target) {
                selected = null
                return
            }
        }
    }

    var hsl = getHsl(ev.target)


    if (ev.type == "click") {
        hsl.saturation -= 30
        hsl.lightness -= 30
    }
    ev.target.style.borderColor = makeHslString(hsl)

    selected = ev.target
}

function presetAccept(ev) {
    if (!selected) {
        alert("No preset selected")
        return
    }
    
    var inputs = $(ev.target).parent().parent().find("input")
    var sel = 0

    inputs.each(function(idx, select) {
        if (select.checked) {
            var canvases = $("#" + select.name)
            /* var hue = canvases.find(".hue")[0]
            var saturation = canvases.find(".saturation")[0] */
            var lightness = canvases.find(".lightness")[0]

            var hsl = getHsl(selected)
            var mod = canvasData[select.name]

            var sweepHue = function() {
                var hueStart = mod.values.hue
                var hueDiff = hsl.hue - hueStart

                sweep(1000, true, function(val) {
                    mod.values.hue = hueStart + (hueDiff * val)

                    redraw(mod, "hue")
                }, function() {
                    mod.values.saturation = hsl.saturation
                    mod.values.lastlightness = hsl.lightness

                    updateLeds(mod, "hue", true)
                    updateLeds(mod, "saturation", true)

                    // console.log(mod)

                    dblClick({target: lightness})
                })
            }

            if (mod.values.lightness > 0) {
                dblClick({target: lightness}, function() {
                    sweepHue()
                })
            }

            else {
                sweepHue()
            }

            sel ++
        }
    })

    if (sel == 0) {
        alert("No module selected")
    }
}

function modulesTurnOff(ev) {
    var inputs = $(ev.target).parent().parent().find("input")
    
    var sel = 0

    inputs.each(function(idx, select) {
        if (select.checked) {
            var mod = canvasData[select.name]

            // console.log(mod.values.lightness)

            if (mod.values.lightness == 0)
                return

            var canvases = $("#" + select.name)
            var lightness = canvases.find(".lightness")[0]

            dblClick({target: lightness})

            sel++
        }
    })

    if (sel == 0) {
        alert("No module selected")
    }
}