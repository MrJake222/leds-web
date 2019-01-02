menu = require("./menu")
db   = require("../database/db")
modules = require("../modules")

function modifyGroup(req, res) {
    var data = {
        groupName: ""
    }

    var gen = function(title) {
        menu.generateMenu(function() {
            res.render("add", {
                menu: menu.baseMenu, 

                hidden: [
                    {
                        name: "action",
                        value: title
                    },

                    {
                        name: "groupID",
                        value: req.query.groupID
                    }
                ],
                
                title: title + " group",
                submit: title,

                fields: [
                    {
                        displayName: "Name",
                        name: "groupName",
                        type: "text",
                        value: data.groupName
                    }
                ]
            })
        })
    }

    if (req.query.action) {
        db.groups.find({ _id: req.query.groupID }, function(err, docs) {
            data.groupName = docs[0].groupName

            gen(req.query.action)
        })
    }

    else
        gen("Add")
}

function group(req, res) {
    if (req.query.groupID) {
        // Get group's name
        db.groups.find({ _id: req.query.groupID }, function(errGroup, docsGroup) {
            // console.log(docsGroup)

            // Get list of modules in this group
            db.modules.find({ groupID: req.query.groupID }, function(err, docs) {
                // console.log(docs)
                docs.sort(function(a, b) {
                    return a.modAddress - b.modAddress
                })

                // Generate menu
                menu.generateMenu(function() {
                    res.render("modules", {
                        menu: menu.baseMenu,
                        
                        groupID: docsGroup[0]._id,
                        groupName: docsGroup[0].groupName,

                        mods: docs,
                        properties: modules.models,
                    })
                })
            })
        })
    }
}

// --------------------------------------------------------------------------------
module.exports = {
    modifyGroup,
    group
}