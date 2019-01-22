// App's port
const PORT = 3000

// --------------------------------------------------------------------------------
var express = require("express")

// Initalize the server framework
var app = express()

// Serve static content
app.use(express.static("static"))

// Use express-session
var session = require('express-session')
var NedbStore = require('connect-nedb-session')(session);

app.use(session({
    secret: "ledz",
    resave: false,
    saveUninitialized: false,

    store: new NedbStore({
        filename: "db/session.db"
    })
}))

// Use PUG
app.set('view engine', 'pug')

// Support POST data
app.use(require("body-parser").urlencoded({ extended: true }))

// Listen on PORT
app.listen(PORT, function() {
    console.log("Listening on port " + PORT)
})

// --------------------------------------------------------------------------------
webUsers = require("./web/users")
apiUsers = require("./api/users")

// Display login page
app.use(webUsers.loginStatusCheck)

app.get("/user", webUsers.user)

app.get("/login", function(req, res) {
    webUsers.login(req, res)
})

app.get("/logout", webUsers.logout)
app.get("/addUser", webUsers.addUser)

app.post("/login", apiUsers.login)
app.post("/addUser", apiUsers.addUser)
app.post("/modifyUser", apiUsers.modifyUser)
app.post("/checkLogin", apiUsers.checkLogin)

// --------------------------------------------------------------------------------
var index = require("./web/index")

app.get("/", index.index)

// --------------------------------------------------------------------------------
var webGroup = require("./web/group")
var apiGroup = require("./api/group")

app.get("/group", webGroup.group)
app.get("/modifyGroup", webGroup.modifyGroup)
app.post("/modifyGroup", apiGroup.modifyGroup)

// --------------------------------------------------------------------------------
var webModule = require("./web/module")
var apiModule = require("./api/module")

app.get("/modifyModule",  webModule.modifyModule)
app.post("/modifyModule", apiModule.modifyModule)
app.post("/checkAddress", apiModule.checkAddress)
app.post("/updateLeds", apiModule.updateLeds)
app.post("/dim", apiModule.dim)