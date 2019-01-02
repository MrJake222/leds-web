// App's port
const PORT = 3000

// --------------------------------------------------------------------------------
var express = require("express")

// Initalize the server framework
var app = express()

// Serve static content
app.use(express.static("static"))

// Use PUG
app.set('view engine', 'pug')

// Support POST data
app.use(require("body-parser").urlencoded({ extended: true }))

// Listen on PORT
app.listen(PORT, function() {
    console.log("Listening on port " + PORT)
})

// --------------------------------------------------------------------------------
var index = require("./web/index")

app.get("/", index.index)

// --------------------------------------------------------------------------------
var webGroup = require("./web/group")
var apiGroup = require("./api/group")

app.get("/group", webGroup.group)
app.get("/modifyGroup",  webGroup.modifyGroup)
app.post("/modifyGroup", apiGroup.modifyGroup)

// --------------------------------------------------------------------------------
var webModule = require("./web/module")
var apiModule = require("./api/module")

app.get("/modifyModule",  webModule.modifyModule)
app.post("/modifyModule", apiModule.modifyModule)
app.post("/updateValues", apiModule.updateValues)
