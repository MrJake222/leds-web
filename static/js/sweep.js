var wait = 32

function sweep(time, reverse, cb, donecb) {
    var easefunc = function(x, reverse) {
        var cos = Math.cos(x)
        
        if (reverse)
            cos *= -1

        return (cos + 1) / 2
    }

    var steps = Math.round(time / wait)
    var step = Math.PI / steps
    var val = 0

    var nextStep = function() {
        // console.log(val)

        cb(easefunc(val, reverse))

        val += step

        if (val <= Math.PI)
            setTimeout(nextStep, wait)
        else
            donecb()
    }

    nextStep()

    /* for (let i=0; i<=Math.PI; i+=step) {
        cb(easefunc(i))
    } */
}