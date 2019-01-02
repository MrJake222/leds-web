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
            modules.models[req.body.modModel].inputs.forEach(function(e) {
                data[e.name] = 0
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
function updateValues(req, res) {
    var update = {}
    update[req.body.name] = parseInt(req.body.value)

    if (req.body.database == "true") {
        db.modules.update({ _id: req.body.modID }, { $set: update }, {})
    }

    db.modules.find({ _id: req.body.modID }, function(err, docs) {
        var reg = modules.models[docs[0].modModel].registers[req.body.name]
        var gamma = Math.round( (req.body.value*req.body.value) / 255 )

        modbus.writeSingleRegister(docs[0].modAddress, reg, gamma)
    })

    res.send("")
}

// --------------------------------------------------------------------------------
module.exports = {
    modifyModule,
    updateValues
}