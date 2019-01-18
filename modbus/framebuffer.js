const SerialPort = require("serialport")
const fastCRC = require("./fastCRC")

var serial = new SerialPort(process.argv[2], {
    autoOpen: true,
    baudRate: 57600,
    dataBits: 8,
    parity: "none"
})

const ModbusParser = require("./ModbusParser")
const parser = serial.pipe(new ModbusParser.ModbusParser())

// --------------------------------------------------------------------------------
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

// --------------------------------------------------------------------------------
function handleNextFrame() {
    // console.log(framebuffer.length, blockSerial)

    if (blockSerial || framebuffer.length == 0)
        return

    blockSerial = true

    var frame = framebuffer.shift()

    serial.write(frame, function() {
        if (frame[0]) {
            currentTimeout = setTimeout(function() {
                console.log("Timeout ", frame)

                blockSerial = false
                handleNextFrame()
            }, 100)
        }
    })
}

// --------------------------------------------------------------------------------
function append(frame) {
    framebuffer.push(frame)

    handleNextFrame()
}

// --------------------------------------------------------------------------------
module.exports = {
    append
}
