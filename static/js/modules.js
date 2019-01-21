var canvasData = {}
var colorwheel

function rad(deg) {
    return deg * Math.PI / 180
}

function deg(rad) {
    return rad / Math.PI * 180
}

// --------------------------------------------------------------------------------
function createRing(ctx, x, y, sAngle, eAngle, offset, outerRadius, thickness, stripes, fillcb) {
    // console.log("redrawing " + ctx.canvas.classList[0])

    ctx.beginPath()

    // var stripes = 360
    var step = (eAngle - sAngle) / stripes

    // console.log(step)

    for (let angle=sAngle; angle<eAngle; angle+=step) {
        var startAngle = angle+offset-1
        var endAngle   = angle+offset+step+1

        // console.log(startAngle, endAngle)

        startAngle = rad(startAngle)
        endAngle = rad(endAngle)

        ctx.beginPath()
        ctx.moveTo(x, y)

        ctx.arc(x, y, outerRadius, startAngle, endAngle, false)
        ctx.closePath()
        
        ctx.fillStyle = fillcb(angle)
        ctx.fill()
    }

    ctx.closePath()
    ctx.fill()

    var sRad = rad(sAngle+offset)
    var eRad = rad(eAngle+offset)

    // White circle inside
    ctx.beginPath()
    ctx.arc(x, y, outerRadius-thickness, sRad, eRad)
    ctx.fillStyle = '#eaebef'
    ctx.fill()

    // Outer border
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.arc(x, y, outerRadius, sRad, eRad)
    ctx.stroke()

    // Inner border
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.arc(x, y, outerRadius-thickness, sRad, eRad)
    ctx.stroke()
}

var getValue = {
    hue: function(angle) {
        return 360-angle
    },

    saturation: function(angle) {
        return angle/270*100
    },

    lightness: function(angle) {
        return angle/270*100
    }
}

var drawImage = {
    hue: function(data, values) {
        if (!colorwheel) {
            createRing(data.ctx, data.horizontalCenter, data.verticalCenter, 0, 360, 0, data.radius, 23, 360, function(angle) {
                return `hsl(${(getValue.hue(angle))}, 100%, 50%)`
            })

            colorwheel = data.ctx.getImageData(0, 0, data.canvas.width, data.canvas.height)
        }

        else {
            data.ctx.putImageData(colorwheel, 0, 0)
        }

        drawLine(data.ctx, data.horizontalCenter, data.verticalCenter, data.radius, 23, rad(values.hue))
    },

    saturation: function(data, values, exclude) {
        // if (!exclude) {
            createRing(data.ctx, data.horizontalCenter, data.verticalCenter, 0, 270, 135, data.radius, 23, 27, function(angle) {
                // console.log(angle, getValue.saturation(angle))
                return `hsl(${values.hue}, ${getValue.saturation(angle)}%, ${values.lightness}%)`
            })
        // }

        drawLine(data.ctx, data.horizontalCenter, data.verticalCenter, data.radius, 23, -rad(values.saturation/135*360+135))
    },

    lightness: function(data, values) {
        createRing(data.ctx, data.horizontalCenter, data.verticalCenter, 0, 270, 135, data.radius, 23, 45, function(angle) {
            return `hsl(${values.hue}, ${values.saturation}%, ${getValue.lightness(angle)}%)`
        })

        drawLine(data.ctx, data.horizontalCenter, data.verticalCenter, data.radius, 23, -rad(values.lightness/135*360+135))
    }
}

function redraw(mod, exclude) {
    Object.keys(mod.canvases).forEach(function(prop) {
        // if (prop != exclude) {
            var data = mod.canvases[prop]

            data.ctx.clearRect(0, 0, data.ctx.canvas.width, data.ctx.canvas.height)

            drawImage[prop](data, mod.values, prop == exclude)
        // }
    })
}

function updateHeader(mod) {
    var header = document.getElementById(mod.id).previousSibling
    var values = mod.values

    header.style.borderColor = `hsl(${values.hue}, ${values.saturation}%, ${values.lightness}%)`
}

function updateLeds(mod, inputName, eventType) {
    updateHeader(mod)

    // ----------------------------------------------- //
    var data = {
        modID: mod.id,
        databaseUpdate: eventType == "mouseup" || eventType == "touchend",
        inputName: inputName,
        inputValue: mod.values[inputName]
    }

    $.post("/updateLeds", data)
}

// --------------------------------------------------------------------------------
function initCanvas() {
    var genData = function(canvas, height, parentWidth, prop) {     
        console.log(parentWidth, height)
        
        // if (parentWidth < 420) {
            var scale = parentWidth / 500

            // console.log(parentWidth, height, scale, Math.round(height * scale))
            height = Math.round(height * scale)

            // canvas.style.height = height + "px"
        // }

        var data = {
            canvas: canvas,
            ctx: canvas.getContext("2d"),

            width: height,
            height: height,
        }

        data.horizontalCenter = data.width/2
        data.verticalCenter = data.height/2
        data.radius = data.horizontalCenter - 10

        /* if (parentWidth == 420 && prop == "hue")
            data.radius -= 10 */

        canvas.style.width = data.width + "px"
        canvas.style.height = data.height + "px"

        canvas.width = data.width * window.devicePixelRatio
        canvas.height = data.height * window.devicePixelRatio

        data.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        // canvasContainer.classList.remove("canvasContainerHeigth")

        return data
    }

    $(".canvasContainer").each(function(i, canvasContainer) {
        var heights = []

        $(canvasContainer).find("canvas").each(function(idx, canvas) {
            heights[idx] = getComputedStyle(canvas).height.slice(0, -2)
        })

        $(canvasContainer).find("canvas").each(function(idx, canvas) {
            var cls = canvas.classList[0]

            if (!canvasData[canvasContainer.id]) {
                canvasData[canvasContainer.id] = {
                    id: canvasContainer.id,

                    values: {
                        hue: 0,
                        saturation: 100,
                        lightness: 50
                    },

                    canvases: {},
                }
            }

            var maxWidth = getComputedStyle(canvasContainer).width.slice(0, -2)
            canvasData[canvasContainer.id].canvases[cls] = genData(canvas, heights[idx], maxWidth, cls)
            canvasData[canvasContainer.id].values[cls] = parseInt(canvas.getAttribute("data-value"))
        })

        redraw(canvasData[canvasContainer.id])
        updateHeader(canvasData[canvasContainer.id])
    })
}

// --------------------------------------------------------------------------------
// Drawes line between circles
function drawLine(ctx, x, y, radius, thickness, angle) {
    var start = circlePoint(x, y, radius-thickness, angle)
    var end = circlePoint(x, y, radius, angle)

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.lineWidth = 2
    // ctx.strokeStyle = 'hsl('+(angle*180/Math.PI + 180)+', 100%, 50%)'
    ctx.stroke()
}

function circlePoint(cx, cy, rad, angle) {
    return {
        x: cx + (rad * Math.cos(-angle)),
        y: cy + (rad * Math.sin(-angle))
    }
}

function getMousePos(ev, canvas) {
    var rect = canvas.getBoundingClientRect()

    // console.log(ev)

    if (ev.type.startsWith("touch")) {
        if (ev.type == "touchend")
            ev = ev.changedTouches[0]

        else
            ev = ev.touches[0]
    }

    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    }
}

// --------------------------------------------------------------------------------
var currentCanvas
var currentValue
var currentMousePos

function clamp(min, i, max) {
    if (i > max)
        return max

    if (i < min)
        return min

    return i
}

function mouseMove(ev, first=false) {
    var cls = currentCanvas.classList[0]
    var mouse = getMousePos(ev, currentCanvas)

    // console.log(ev, currentCanvas)

    var canvasContainer = currentCanvas

    do {
        canvasContainer = canvasContainer.parentElement
    } while (!canvasContainer.classList.contains("canvasContainer"))

    var mod = canvasData[canvasContainer.id]
    var data = mod.canvases[cls]

    if (first) {
        currentValue = mod.values[cls]
        currentMousePos = mouse.y

        if (cls != "hue")
            currentValue *= 2

        return
    }

    var val = currentMousePos - mouse.y

    /* if (cls != "hue")
        val *= -1 */

    // console.log(currentMousePos, mouse.y, currentValue, val)

    val += currentValue

    if (cls == "hue") {
        val %= 360

        if (val < 0)
            val += 360
    }

    else {
        val = Math.round(val/2)

        val = clamp(0, val, 100)
    }

    mod.values[cls] = val

    redraw(mod, cls)
    
    if (ev.type != "mousedown" && ev.type != "touchstart")
        updateLeds(mod, cls, ev.type)

    ev.preventDefault()
}

function mouseDown(ev) {
    currentCanvas = ev.target

    window.onmousemove = mouseMove
    window.onmouseup = mouseUp

    // ev.target.ontouchmove = mouseMove

    mouseMove(ev, true)
}

function mouseUp(ev) {
    window.onmousemove = null
    window.onmouseup = null

    // ev.target.ontouchmove = null

    mouseMove(ev)
}

function touchStart(ev) {
    currentCanvas = ev.target

    ev.target.ontouchmove = mouseMove

    mouseMove(ev, true)
}

function touchEnd(ev) {
    ev.target.ontouchmove = null

    // console.log(ev)

    mouseMove(ev)
}