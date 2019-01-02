menu = require("./menu")

function index(req, res) {
    menu.generateMenu(function() {
        res.render("index", {
            menu: menu.baseMenu
        })
    })
}

// --------------------------------------------------------------------------------
module.exports = {
    index
}