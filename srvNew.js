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
                href: "/addModule"
            },

            {
                title: "Add group",
                href: "/addGroup"
            },
        ]
    }
]

// ----------------------------------------------------------------------------- //
var modules = []

var Datastore = require("nedb")

dbGroups = new Datastore({
    filename: "db/groups.db",
    autoload: true
})

dbModules = new Datastore({
    filename: "db/modules.db",
    autoload: true
})

// ----------------------------------------------------------------------------- //
function generateMenu(callback) {
    dbGroups.find({}, function(err, docs) {

        // baseMenu[0].sub.splice(1, baseMenu[0].sub.length-1)
        baseMenu[0].sub = []

        docs.forEach(function(e) {
            baseMenu[0].sub.push({
                title: e.groupName,
                href: "/group?id=" + e._id,

                // For listing in "Add module" page
                id: e._id
            })
        })
        
        // console.log(baseMenu)

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

    // Gets group's name
    dbGroups.find({ _id: req.query.id }, function(errGroup, docsGroup) {
        // console.log(docsGroup)

        // Gets list of modules in this group
        dbModules.find({ groupID: req.query.id }, function(err, docs) {
            // console.log(docs)

            // Generates menu
            generateMenu(function() {
                res.render("modules", {
                    menu: baseMenu,
                    
                    groupID: docsGroup[0]._id,
                    groupName: docsGroup[0].groupName,

                    mods: docs,
                    properties: definitions.getModelsInputs(),
                })
            })
        })
    })

    /* con.query("SELECT modID, modName, modAddress, modModel, modValues FROM modules WHERE modules.groupID="+req.query.id+";", function(err, queryRes) {
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
    }) */
})

app.get("/addModule", function(req, res) {
    var modKeys = Object.keys(definitions.getModelsInputs())

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
            
            title: "Add module",

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

app.post("/addModule", function(req, res) {
    // console.log(req.body)

    console.log(definitions.getModelsInputs()[req.body.modModel])

    definitions.getModelsInputs()[req.body.modModel].inputs.forEach(function(e) {
        req.body[e.name] = 0
    })

    console.log(req.body)

    dbModules.insert(req.body, function(err, docs) {
        res.redirect("back")
    })

    /* con.query("INSERT INTO modules (modName, modAddress, modModel, groupID, modValues) VALUES(\""
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
    ) */    
})

app.post("/delModule", function(req, res) {
    dbModules.remove({
        _id: req.body.id
    })

    /* con.query("DELETE FROM modules WHERE modID="+req.body.id+";", function(err, queryRes) {
        if (err) throw err
    }) */

    res.redirect("back")
})

app.get("/addGroup", function (req, res) {
    generateMenu(function() {
        res.render("add", {
            menu: baseMenu, 
            
            title: "Add group",

            fields: [
                {
                    displayName: "Name",
                    name: "groupName",
                    type: "text"
                }
            ]
        })
    })
})

app.post("/addGroup", function (req, res) {
    dbGroups.insert(req.body, function(err, docs) {
        res.redirect("back")
    })
})

app.post("/delGroup", function (req, res) {
    dbGroups.remove({
        _id: req.body.id,
    })

    dbModules.remove({
        groupID: req.body.id,
    })

    res.send("")
})