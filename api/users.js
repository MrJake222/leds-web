db = require("../database/db")

// --------------------------------------------------------------------------------
function checkLogin(req, res) {
    // console.log("checkLogin: " + req.body.login)

    db.users.find({login: req.body.login}, function(err, docs) {
        // console.log(docs)

        if (docs.length > 0) {
            res.send({error: true})
        }

        else {
            res.send({})
        }
    })
}

function addUser(req, res) {
    var data = {
        login: req.body.login,
        username: req.body.username,
        password: req.body.password[0]
    }

    switch (req.body.action.toLowerCase()) {
        case "add":
            db.users.insert(data, function(err, doc) {
                res.redirect("/login")
            })

            break

        /* case "modify":
            db.modules.update({ _id: req.body.modID }, { $set: data }, {}, function() {
                res.redirect("/group?groupID="+req.body.groupID) 
            })

            break

        case "delete":
            db.modules.remove({ _id: req.body.modID, }, function() {
                res.send("")
            })
            
            break */
    }
}

/* Modifies user */
function modifyUser(req, res) {
    var id = req.body.userID

    delete req.body.userID
    
    if (req.body.login)
        req.session.login = null

    db.users.update({ _id: id }, { $set: req.body }, {}, function() {
        res.redirect("back")
    })
}

// --------------------------------------------------------------------------------
webUsers = require("../web/users")

function login(req, res) {
    db.users.find({login: req.body.login}, function(err, docs) {
        // console.log(docs.length)

        if (docs.length == 0) {
            webUsers.login(req, res, "No such user")
        }

        else {
            // console.log(req.body)

            db.users.find({login: req.body.login, password: req.body.password}, function(err, docs) {
                // console.log(docs)

                if (docs.length == 0) {
                    webUsers.login(req, res, "Wrong password")
                }

                else {
                    req.session.login = req.body.login

                    // console.log(req.session)

                    res.redirect("/user?id="+docs[0]._id)
                }
            })
        }
    })
}

// --------------------------------------------------------------------------------
module.exports = {
    checkLogin,

    addUser,
    modifyUser,

    login
}