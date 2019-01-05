menu = require("./menu")
db   = require("../database/db")
modules = require("../modules")

function modifyModule(req, res) {
    var modKeys = Object.keys(modules.models)

    var models = []

    modKeys.forEach(function(e) {
        models.push({
            title: e,
            id: e
        })
    })

    var data = {
        modName: "",
        modAddress: 0,
        modModel: "",
        groupID: ""
    }

    var gen = function(title, submit) {
        menu.generateMenu(function() {
            res.render("add", {
                menu: menu.baseMenu, 
                
                title: title,
                submit: submit,
    
                hidden: [
                    {
                        name: "action",
                        value: submit
                    },

                    {
                        name: "modID",
                        value: req.query.modID
                    }
                ],

                fields: [
                    {
                        displayName: "Name",
                        name: "modName",
                        type: "text",
                        value: data.modName
                    },
    
                    {
                        displayName: "Address",
                        name: "modAddress",
                        type: "number",
                        value: data.modAddress
                    },
    
                    {
                        displayName: "Model",
                        name: "modModel",
                        type: "select",
                        value: data.modModel,
                        options: models,
                    },
    
                    {
                        displayName: "Group",
                        name: "groupID",
                        type: "select",
                        value: data.groupID,
                        options: menu.baseMenu[0].sub
                    },
                ]
            })
        })
    }

    /* Finds first free address */
    db.modules.find({}, function(err, docs) {
        docs.sort(function(a,b) {
            return a.modAddress - b.modAddress
        })

        var addrs = []
        var addr

        docs.forEach(function(doc) {
            addrs.push(doc.modAddress)
        })

        for (addr=1; addr<=247; addr++) {
            if (!addrs.includes(addr))
                break;
        }

        data.modAddress = addr

        if (req.query.action) {
            if (req.query.action == "groupAdd") {
                data.groupID = req.query.groupID

                gen("Add module to group", "Add")
            }

            else {
                db.modules.find({ _id: req.query.modID }, function(err, docs) {
                    data.modName = docs[0].modName,
                    // data.modAddress = docs[0].modAddress,
                    data.modModel = docs[0].modModel,
                    data.groupID = docs[0].groupID   

                    gen(req.query.action+" module", req.query.action)
                })
            } // group add else
        } // if req.query.action

        else
            gen("Add module", "Add")   

    }) // Free addr end

    
}

// --------------------------------------------------------------------------------
module.exports = {
    modifyModule
}