var express = require("express")
var bodyParser = require('body-parser');

var app = express()

app.use(express.static("static"))
app.set('view engine', 'pug')
// app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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
                title: "Add module",
                href: "/add"
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

        // console.log(res)
        baseMenu[0].sub = []

        res.forEach(function(e) {
            baseMenu[0].sub.push({
                title: e.groupName,
                href: "/group?id=" + e.groupID,
                id: e.groupID
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

    con.query("SELECT modID, modName, modAddress, modModel, modValues FROM modules WHERE modules.groupID="+req.query.id+";", function(err, queryRes) {
        if (err) throw err

        for (let i=0; i<queryRes.length; i++) {
            queryRes[i].modValues = JSON.parse(queryRes[i].modValues)
        }
        
        generateMenu(function() {
            res.render("modules", {
                menu: baseMenu,
                
                groupName: baseMenu[0].sub[req.query.id-1].title,

                mods: queryRes,
                properties: definitions.getModelsInputs(),
            })
        })
    })
})

app.get("/add", function(req, res) {
    var modKeys = Object.keys(definitions.getModelsInputs())

    var groups = []
    var models = []

    modKeys.forEach(function(e) {
        models.push({
            title: e,
            id: e
        })
    })

    generateMenu(function() {
        res.render("add", {
            menu: baseMenu,        

            fields: [
                {
                    displayName: "Name",
                    name: "modName",
                    type: "text"
                },

                {
                    displayName: "Address",
                    name: "modAddress",
                    type: "number"
                },

                {
                    displayName: "Model",
                    name: "modModel",
                    type: "select",
                    options: models,
                },

                {
                    displayName: "Group",
                    name: "groupID",
                    type: "select",
                    options: baseMenu[0].sub
                },
            ]
        })
    })
})

app.post("/add", function(req, res) {
    console.log(req.body)

    con.query("INSERT INTO modules (modName, modAddress, modModel, groupID, modValues) VALUES(\""
        + req.body.modName + "\"," 
        + req.body.modAddress + ",\"" 
        + req.body.modModel + "\"," 
        + req.body.groupID + "," 
        + '\'{"red": 0, "green": 0, "blue": 0}\');',
        
        function(err, queryRes) {
            if (err) throw err

            console.log("Inserted")

            res.redirect("back")
        }
    )    
})

app.post("/del", function(req, res) {
    con.query("DELETE FROM modules WHERE modID="+req.body.id+";", function(err, queryRes) {
        if (err) throw err
    })

    res.send("")
})