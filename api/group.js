db = require("../database/db")

// --------------------------------------------------------------------------------
function modifyGroup(req, res) {
    switch (req.body.action.toLowerCase()) {
        case "add":
        case "duplicate":
            db.groups.insert({ groupName: req.body.groupName }, function(err, docs) {
                res.redirect("/group?groupID="+docs._id) 
            })

            break

        case "modify":
            db.groups.update({ _id: req.body.groupID }, { $set: { groupName: req.body.groupName } }, {}, function() {
                res.redirect("/group?groupID="+req.body.groupID) 
            })

            break

        case "delete":
            db.modules.remove({ groupID: req.body.groupID, }, function() {
                db.groups.remove({ _id: req.body.groupID }, function() {
                    res.send("")
                })
            })
            
            break
    }
}

// --------------------------------------------------------------------------------
module.exports = {
    modifyGroup
}