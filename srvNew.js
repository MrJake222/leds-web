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
            submit: "Add",

            fields: [
                {
                    displayName: "Name",
                    name: "modName",
                    type: "text",
                    value: req.query.modName
                },

                {
                    displayName: "Address",
                    name: "modAddress",
                    type: "number",
                    value: req.query.modAddress
                },

                {
                    displayName: "Model",
                    name: "modModel",
                    type: "select",
                    value: req.query.modModel,
                    options: models,
                },

                {
                    displayName: "Group",
                    name: "groupID",
                    type: "select",
                    value: req.query.groupID,
                    options: baseMenu[0].sub
                },
            ]
        })
    })
})

app.post("/addModule", function(req, res) {
    console.log(definitions.getModelsInputs()[req.body.modModel])

    definitions.getModelsInputs()[req.body.modModel].inputs.forEach(function(e) {
        req.body[e.name] = 0
    })

    console.log(req.body)

    dbModules.insert(req.body, function(err, docs) {
        res.redirect("back")
    })   
})

app.get("/editModule", function (req, res) {
    var modKeys = Object.keys(definitions.getModelsInputs())

    var models = []

    modKeys.forEach(function(e) {
        models.push({
            title: e,
            id: e
        })
    })

    dbModules.find({ _id: req.query.modID }, function(errGroup, docsGroup) {
        generateMenu(function() {
            res.render("add", {
                menu: baseMenu, 
                
                title: "Add module",
                submit: "Add",
    
                fields: [
                    {
                        displayName: "Name",
                        name: "modName",
                        type: "text",
                        value: docsGroup[0].modName
                    },
    
                    {
                        displayName: "Address",
                        name: "modAddress",
                        type: "number",
                        value: docsGroup[0].modAddress
                    },
    
                    {
                        displayName: "Model",
                        name: "modModel",
                        type: "select",
                        value: docsGroup[0].modModel,
                        options: models,
                    },
    
                    {
                        displayName: "Group",
                        name: "groupID",
                        type: "select",
                        value: docsGroup[0].groupID,
                        options: baseMenu[0].sub
                    },
                ]
            })
        })
    })
})

app.post("/editGroup", function (req, res) {
    // console.log(req.body)

    dbGroups.update({ _id: req.body.id }, {
        groupName: req.body.groupName
    }, function() {
       res.redirect("/group?id="+req.body.id) 
    })
})

app.post("/delModule", function(req, res) {
    dbModules.remove({
        _id: req.body.id
    }, function() {
        res.redirect("back")
    })

    /* con.query("DELETE FROM modules WHERE modID="+req.body.id+";", function(err, queryRes) {
        if (err) throw err
    }) */

    //res.redirect("back")
})

app.get("/addGroup", function (req, res) {
    generateMenu(function() {
        res.render("add", {
            menu: baseMenu, 
            
            title: "Add group",
            submit: "Add",

            fields: [
                {
                    displayName: "Name",
                    name: "groupName",
                    type: "text",
                    value: req.query.groupName
                }
            ]
        })
    })
})

app.get("/editGroup", function (req, res) {
    dbGroups.find({ _id: req.query.groupID }, function(errGroup, docsGroup) {
        generateMenu(function() {
            res.render("add", {
                menu: baseMenu, 
                
                title: "Modify group",

                submit: "Save",
                id: req.query.groupID,

                fields: [
                    {
                        displayName: "Name",
                        name: "groupName",
                        type: "text",
                        value: docsGroup[0].groupName
                    }
                ]
            })
        })
    })
})

app.post("/editGroup", function (req, res) {
    // console.log(req.body)

    dbGroups.update({ _id: req.body.id }, {
        groupName: req.body.groupName
    }, function() {
       res.redirect("/group?id="+req.body.id) 
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