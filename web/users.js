// --------------------------------------------------------------------------------
menu = require("./menu")
db   = require("../database/db")

// --------------------------------------------------------------------------------
var anonymousSites = [
    "/addUser",
    "/login"
]

function loginStatusCheck(req, res, next) {
    if (!req.session.login && !anonymousSites.includes(req.url))
        res.redirect("/login")

    else
        next()
}

function login(req, res, error) {
    res.render("add", {
        // small: true,
        menu: [
            {
                title: "Add user",
                right: true,
                href: "/addUser"
            }
        ],

        title: "Please log in",
        submit: "Log in",

        error: error,

        hidden: [
            {
                name: "url",
                value: req.url
            }
        ],

        fields: [
            {
                displayName: "Login",
                name: "login",
                type: "text",
            },

            {
                displayName: "Password",
                name: "password",
                type: "password",
            },
        ]
    })
}

function logout(req, res) {
    req.session.username = undefined

    res.redirect("/login")
}

// --------------------------------------------------------------------------------
function user(req, res) {
    menu.generateMenu(req.session.login, function(baseMenu, user) {
        res.render("user", {
            menu: baseMenu,

            userID: user._id,
            username: user.username,

            properties: [
                {
                    name: "Login",
                    value: user.login
                },
                
                {
                    name: "Username",
                    value: user.username
                },

                {
                    name: "Password",
                    value: "********"
                },
            ]
        })
    })
}

// --------------------------------------------------------------------------------
// Generates add user menu
function addUser(req, res) {
    var gen = function(title) {
        res.render("add", {
            menu: [
                {
                    title: "Log in",
                    right: true,
                    href: "/login",
                }
            ],
            
            title: title + " user",
            submit: title,

            hidden: [
                {
                    name: "action",
                    value: title
                },

                {
                    name: "userID",
                    value: req.query.userID
                }
            ],

            fields: [
                {
                    displayName: "Username",
                    name: "username",
                    type: "text",
                },

                {
                    displayName: "Login",
                    name: "login",
                    type: "text",
                },

                {
                    displayName: "Password",
                    name: "password",
                    type: "password"
                },

                {
                    displayName: "Confirm",
                    name: "password",
                    type: "password"
                },
            ]
        })
    }

    if (req.query.field)
        gen("Modify")
    else
        gen("Add")
}

// --------------------------------------------------------------------------------
module.exports = {
    loginStatusCheck,
    login,
    logout,
    user,

    addUser
}
