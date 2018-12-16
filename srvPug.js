var express = require("express")
var path = require("path")

var app = express()

app.use(express.static("static"))
app.set('view engine', 'pug')

const port = 3000
app.listen(port, function() {
    console.log("Listening on port "+port)
})

// ----------------------------------------------------------------------------- //

var basicmenu = [
    {
        title: "Modules",
        href: "/modules",
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

var moduleNames = [
    "Name",
    "Model",
    "Address",
    "Owner"
]

var modules = [
    {
        id: 0,
        name: "Marcel biurko",
        model: "LEDRGB",
        address: 0x01,
        owner: "norbert"
    },

    {
        id: 1,
        name: "Schody",
        model: "LED1",
        address: 0x02,
        owner: "tomek"
    },
]

for (let i=0; i<10; i++) {
    modules.push({
        id: i+2,
        name: "Marcel biurko",
        model: "LEDRGB",
        address: i+20,
        owner: "norbert"
    })
}

var properties = {
    LEDRGB: [
        {
            name: "red",
            type: "range",
            min: 0,
            max: 255,
            step: 1
        },

        {
            name: "green",
            type: "range",
            min: 0,
            max: 255,
            step: 1
        },

        {
            name: "blue",
            type: "range",
            min: 0,
            max: 255,
            step: 1
        }
    ],

    LED1: [
        {
            name: "Brightness",
            type: "range",
            min: 0,
            max: 255,
            step: 1
        }
    ]
}

modules.forEach(function(e) {
    basicmenu[0].sub.push({
        title: e.name + " @ " + e.address,
        href: "/module?id=" + e.id
    })
})

app.get("/modules", function(req, res) {
    res.render("modules", {
        menu: basicmenu,

        mods: modules,
        names: moduleNames
    })
})

app.get("/module", function(req, res) {
    res.render("module", {
        menu: basicmenu,

        module: modules[req.query.id],
        properties: properties[modules[req.query.id].model]
    })
})