const SerialPort = require("serialport")
const fastCRC = require("./fastCRC")

var portPath = process.argv[2]
// var portPath = "/dev/ttyS0"

var serial = new SerialPort(portPath, {
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
    if (!currentTimeout)
        return

    clearTimeout(currentTimeout)

    // data = ModbusParser.parseModbusFrame(data)
    // console.log("Rx value " + data.registerValue)
    
    blockSerial = false
    handleNextFrame("rx")
})

// --------------------------------------------------------------------------------
function handleNextFrame(append) {
    // console.log(framebuffer.length, blockSerial, append)

    if (blockSerial || framebuffer.length == 0)
        return

    blockSerial = true

    var frameData = framebuffer.shift()

    // console.log(frameData.frame)

    serial.write(frameData.frame, function() {
        if (frameData.frame[0]) {
            currentTimeout = setTimeout(function() {
                currentTimeout = null
                console.log("Timeout ", frameData.frame)

                blockSerial = false
                handleNextFrame("timeout")
            }, frameData.timeout)
        }
    })
}

// --------------------------------------------------------------------------------
function append(frame) {
    framebuffer.push(frame)

    // if (!currentTimeout)
    handleNextFrame("append")
}

// --------------------------------------------------------------------------------
module.exports = {
    append
}
