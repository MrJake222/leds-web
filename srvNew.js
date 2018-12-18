var express = require("express")

var app = express()

app.use(express.static("static"))
app.set('view engine', 'pug')

const port = 3000
app.listen(port, function() {
    console.log("Listening on port "+port)
})

var definitions = require("./definitions")
// ----------------------------------------------------------------------------- //
var baseMenu = [
    {
        title: "Groups",
        sub: []
    },

    {
        title: "Admin",
        sub: [
            {
                title: "Add module"
            },

            {
                title: "Autodetect modules"
            }
        ]
    }
]
// ----------------------------------------------------------------------------- //
var modules = []

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "leds",
    password: "12345",
    database: "leds"
});

con.connect(function(err) {
    console.log("SQL Connected")

    if (err) throw err
});
// ----------------------------------------------------------------------------- //
function generateMenu(callback) {
    con.query("SELECT groupID, groupName FROM groups;", function(err, res) {
        if (err) throw err

        console.log(res)
        baseMenu[0].sub = []

        res.forEach(function(e) {
            baseMenu[0].sub.push({
                title: e.groupName,
                href: "/group?id=" + e.groupID
            })
        })

        callback()
    })
}
// ----------------------------------------------------------------------------- //
app.get("/", function(req, res) {
    generateMenu(function() {
        res.render("index", {
            menu: baseMenu
        })
    })
})

app.get("/group", function(req, res) {
    console.log("Rendering id = " + req.query.id)

    con.query("SELECT modName, modAddress, modModel, modValues FROM modules WHERE groupID="+req.query.id+";", function(err, queryRes) {
        if (err) throw err

        generateMenu(function() {
            res.render("modules", {
                menu: baseMenu,
        
                mods: queryRes,
                properties: definitions.getModelsInputs(),
            })
        })
    })
})