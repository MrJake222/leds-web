menu = require("./menu")

function index(req, res) {
    menu.generateMenu(req.session.login, function(baseMenu) {
        res.render("index", {
            menu: baseMenu
        })
    })
}

// --------------------------------------------------------------------------------
module.exports = {
    index
}