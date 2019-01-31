db      = require("../database/db")
modules = require("../modules")

function modifyPreset(req, res) {
    // console.log)

    db.modules.find({ _id: req.body.modID }, function(err, docs) {

        switch (req.body.action.toLowerCase()) {
            case "add":
                var data = {
                    login: req.session.login,
                    name: req.body.name
                }

                modules.models[docs[0].modModel].inputs.forEach(function(input) {
                    data[input] = docs[0][input]
                })

                // console.log(data)
                db.preset.insert(data, function() {
                    res.send("")
                })
                
                break

            case "delete":
                db.preset.remove({ _id: req.body.presetID }, function() {
                    res.send("")
                })

                res.send
        }
    })
}

// --------------------------------------------------------------------------------
module.exports = {
    modifyPreset
}