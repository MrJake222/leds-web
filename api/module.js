db = require("../database/db")
modules = require("../modules")
modbus  = require("../modbus/modbus")

function modifyModule(req, res) {
    var data = {
        modName: req.body.modName,
        modAddress: parseInt(req.body.modAddress),
        modModel: req.body.modModel,
        groupID: req.body.groupID
    }

    switch (req.body.action.toLowerCase()) {
        case "add":
        case "duplicate":
            // Generate input fields
            modules.models[req.body.modModel].inputs.forEach(function(input) {
                data[input] = 0
            })

            db.modules.insert(data, function(err, docs) {
                res.redirect("/group?groupID="+req.body.groupID)
            })

            break

        case "modify":
            db.modules.update({ _id: req.body.modID }, { $set: data }, {}, function() {
                res.redirect("/group?groupID="+req.body.groupID) 
            })

            break

        case "delete":
            db.modules.remove({ _id: req.body.modID, }, function() {
                res.send("")
            })
            
            break
    }
}

// --------------------------------------------------------------------------------
function checkAddress(req, res) {
    var action = req.body.action.toLowerCase()
    var modAddress = parseInt(req.body.modAddress)

    if (modAddress == 0) {
        res.send({error: "Broadcast address"})
        return
    }

    if (modAddress < 0 || modAddress > 247) {
        res.send({error: "Address out of range"})
        return
    }

    var maxOccurences = 1

    if (action == "add" || action == "duplicate") {
        maxOccurences = 0
    }

    db.modules.find({modAddress: modAddress}, function(err, docs) {
        if (docs.length > maxOccurences) {
            res.send({error: "Duplicate address"})
        }

        else {
            res.send({})
        }
    })
}

// --------------------------------------------------------------------------------
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
    var r, g, b;

    /* var h = values.hue
    var s = values.saturation
    var l = values.lightness */

    if(s == 0) {
        r = g = b = l; // achromatic
    }
    
    else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function gamma(val) {
    return Math.round( (val*val) / 255 )
}

function updateLeds(req, res) {
    var updateSet = {}

    /* if (req.body.databaseUpdate == "true")
        console.log(req.body) */

    if (req.body.inputValue != undefined)
        updateSet[req.body.inputName] = parseInt(req.body.inputValue)

    var process = function() {
        if (req.body.inputName == "lastlightness" && req.body.databaseUpdate == "true") {
            res.send("")
            return
        }

        db.modules.find({ _id: req.body.modID }, function(err, docs) {
            if (err)
                throw err

            // var registerAddress = modules.models[docs[0].modModel].registers[req.body.name]
            // var gamma = Math.round( (req.body.value*req.body.value) / 255 )

            var mod = docs[0]
            
            if (req.body.inputName == "lastlightness")
                mod["lightness"] = mod["lastlightness"]
            else
                mod[req.body.inputName] = updateSet[req.body.inputName]

            var rgb = hslToRgb(mod.hue/360, mod.saturation/100, mod.lightness/100)

            if (req.body.inputName == "lastlightness") {
                for (let i=0; i<3; i++)
                    rgb[i] |= 0x0100
            }

            /* for (let i=0; i<3; i++)
                rgb[i] = gamma(rgb[i]) */

            // console.log(rgb)

            modbus.writeMultipleRegisters(docs[0].modAddress, 0x0000, rgb)
        })

        res.send("")
    }

    if (req.body.databaseUpdate == "true") {
        db.modules.update({ _id: req.body.modID }, { $set: updateSet }, {}, function() {
            process()
        })
    }

    else {
        process()
    }
}

function dim(req, res) {
    db.modules.find({ _id: req.body.modID }, function(err, docs) {
        if (err)
            throw err

        var time = parseInt(req.body.time)

        var value = (time & 0x0FFF)

        if (req.body.undim == "true")
            value |= 0xF000

        // console.log(value)

        modbus.writeSingleRegister(docs[0].modAddress, 0x0005, value, time+100)

        res.send("")
    })
}

// --------------------------------------------------------------------------------
module.exports = {
    modifyModule,
    checkAddress,
    updateLeds,
    dim
}