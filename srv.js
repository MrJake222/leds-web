var express = require("express")
var bodyParser = require('body-parser');

var app = express()

app.use(express.static("static"))
app.set('view engine', 'pug')
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
                href: "/modifyModule"
            },

            {
                title: "Add group",
                href: "/modifyGroup"
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
                href: "/group?groupID=" + e._id,

                // For listing in "Add module" page
                id: e._id
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

    if (req.query.groupID) {
        // Get group's name
        dbGroups.find({ _id: req.query.groupID }, function(errGroup, docsGroup) {
            // console.log(docsGroup)

            // Get list of modules in this group
            dbModules.find({ groupID: req.query.groupID }, function(err, docs) {
                // console.log(docs)
                docs.sort(function(a, b) {
                    return a.modAddress - b.modAddress
                })

                // Generate menu
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
    }
})

app.get("/modifyModule", function(req, res) {
    var modKeys = Object.keys(definitions.getModelsInputs())

    var models = []

    modKeys.forEach(function(e) {
        models.push({
            title: e,
            id: e
        })
    })

    var data = {
        modName: "",
        modAddress: 0,
        modModel: "",
        groupID: ""
    }

    var gen = function(title, submit) {
        generateMenu(function() {
            res.render("add", {
                menu: baseMenu, 
                
                title: title,
                submit: submit,
    
                hidden: [
                    {
                        name: "action",
                        value: submit
                    },

                    {
                        name: "modID",
                        value: req.query.modID
                    }
                ],

                fields: [
                    {
                        displayName: "Name",
                        name: "modName",
                        type: "text",
                        value: data.modName
                    },
    
                    {
                        displayName: "Address",
                        name: "modAddress",
                        type: "number",
                        value: data.modAddress
                    },
    
                    {
                        displayName: "Model",
                        name: "modModel",
                        type: "select",
                        value: data.modModel,
                        options: models,
                    },
    
                    {
                        displayName: "Group",
                        name: "groupID",
                        type: "select",
                        value: data.groupID,
                        options: baseMenu[0].sub
                    },
                ]
            })
        })
    }

    if (req.query.action) {
        if (req.query.action == "groupAdd") {
            data.groupID = req.query.groupID

            gen("Add module to group", "Add")
        }

        else {
            dbModules.find({ _id: req.query.modID }, function(err, docs) {
                data.modName = docs[0].modName,
                data.modAddress = docs[0].modAddress,
                data.modModel = docs[0].modModel,
                data.groupID = docs[0].groupID   

                gen(req.query.action+" module", req.query.action)
            })
        }
    }

    else
        gen("Add module", "Add")   
})

app.get("/modifyGroup", function (req, res) {
    var data = {
        groupName: ""
    }

    var gen = function(title) {
        generateMenu(function() {
            res.render("add", {
                menu: baseMenu, 

                hidden: [
                    {
                        name: "action",
                        value: title
                    },

                    {
                        name: "groupID",
                        value: req.query.groupID
                    }
                ],
                
                title: title + " group",
                submit: title,

                fields: [
                    {
                        displayName: "Name",
                        name: "groupName",
                        type: "text",
                        value: data.groupName
                    }
                ]
            })
        })
    }

    if (req.query.action) {
        dbGroups.find({ _id: req.query.groupID }, function(err, docs) {
            data.groupName = docs[0].groupName

            gen(req.query.action)
        })
    }

    else
        gen("Add")
})

app.post("/modifyModule", function(req, res) {
    // console.log(req.body)

    var data = {
        modName: req.body.modName,
        modAddress: parseInt(req.body.modAddress),
        modModel: req.body.modModel,
        groupID: req.body.groupID
    }

    switch (req.body.action.toLowerCase()) {
        case "add":
        case "duplicate":
            // Generate input fields
            definitions.getModelsInputs()[req.body.modModel].inputs.forEach(function(e) {
                data[e.name] = 0
            })

            dbModules.insert(data, function(err, docs) {
                res.redirect("/group?groupID="+req.body.groupID)
            })

            break

        case "modify":
            dbModules.update({ _id: req.body.modID }, { $set: data }, {}, function() {
                res.redirect("/group?groupID="+req.body.groupID) 
            })

            break

        case "delete":
            dbModules.remove({ _id: req.body.modID, }, function() {
                res.send("")
            })
            
            break
    }
})

app.post("/modifyGroup", function (req, res) {
    // console.log(req.body)

    switch (req.body.action.toLowerCase()) {
        case "add":
        case "duplicate":
            dbGroups.insert({ groupName: req.body.groupName }, function(err, docs) {
                res.redirect("/group?groupID="+docs._id) 
            })

            break

        case "modify":
            dbGroups.update({ _id: req.body.groupID }, { $set: { groupName: req.body.groupName } }, {}, function() {
                res.redirect("/group?groupID="+req.body.groupID) 
            })

            break

        case "delete":
            dbModules.remove({ groupID: req.body.groupID, }, function() {
                dbGroups.remove({ _id: req.body.groupID }, function() {
                    res.send("")
                })
            })
            
            break
    }
})

// ----------------------------------------------------------------------------- //
var modelRegisters = {
    LEDRGB: {
        red: 0x00,
        green: 0x01,
        blue:  0x02
    }
}

// ---------------------------------------------------------------- 
var SerialPort = require("serialport")
const modbusCrc = require("./modbus-crc")

var serial = new SerialPort(process.argv[2], {
    autoOpen: true,
    baudRate: 230400,
    dataBits: 8,
    parity: "none"
})

const ModbusParser = require("./parser-modbus")
const parser = serial.pipe(new ModbusParser())

// ---------------------------------------------------------------- 
var framebuffer = []
var blockSerial = false
var currentTimeout

parser.on("data", function(data) {
    clearTimeout(currentTimeout)

    data = ModbusParser.parseModbusFrame(data)
    // console.log("Rx value " + data.registerValue)
    
    blockSerial = false
    handleNextFrame()
})

function handleNextFrame() {
    console.log(framebuffer.length, blockSerial)

    if (blockSerial || framebuffer.length == 0)
        return

    blockSerial = true

    var frame = framebuffer.shift()

    serial.write(frame, function() {
        currentTimeout = setTimeout(function() {
            console.log("Timeout ", frame)
            blockSerial = false
            handleNextFrame()
        }, 100)
    })
}

function appendToFramebuffer(frame) {
    framebuffer.push(frame)

    handleNextFrame()
}

// ----------------------------------------------------------------------------- //
/* function calcCRC(data) {
	var CRC = 0xFFFF;

	data.forEach(function(e) {
		CRC ^= (e & 0xFF);

		for (let i=0; i<8; i++) {
			var lsb = CRC & 0x01;

			CRC >>= 1;

			if (lsb)
				CRC ^= 0xA001;
		}
	})

	return CRC;
} */

function to8Bit(int16) {
    var lsb = int16 & 0xFF
    var msb = (int16>>8) & 0xFF

    return [msb, lsb]
}

function writeModule(address, data) {
    var frame = [address].concat(data)
    /* var crc = calcCRC(frame) */

    frame = frame.concat(modbusCrc.fastCRC(frame))

    /* var hex = ""
    frame.forEach(function(e) {
        var h = e.toString(16)
        if (h.length < 2)
            h = "0" + h

        hex += h
    })

    console.log(hex) */

    appendToFramebuffer(frame)
}

function writeSingleRegister(address, register16, value16) {
    const func_code = 0x06

    writeModule(address, [func_code].concat(to8Bit(register16)).concat(to8Bit(value16)))
}

// ----------------------------------------------------------------------------- //

// ----------------------------------------------------------------------------- //
app.post("/updateLeds", function(req, res) {
    var update = {}
    update[req.body.name] = parseInt(req.body.value)

    if (req.body.database == "true") {
        dbModules.update({ _id: req.body.modID }, { $set: update }, {})
    }

    // console.log(req.body.database)

    //else {
    dbModules.find({ _id: req.body.modID }, function(err, docs) {
        writeSingleRegister(docs[0].modAddress, modelRegisters[docs[0].modModel][req.body.name], Math.round((req.body.value*req.body.value)/255))
    })
    //}

    res.send("")
})