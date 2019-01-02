framebuffer = require("./framebuffer")
fastCRC = require("./fastCRC")

function to8Bit(int16) {
    var lsb = int16 & 0xFF
    var msb = (int16>>8) & 0xFF

    return [msb, lsb]
}

// --------------------------------------------------------------------------------
function writeModule(address, data) {
    var frame = [address].concat(data)

    frame = frame.concat(fastCRC.fastCRC(frame))
    framebuffer.append(frame)
}

// --------------------------------------------------------------------------------
function writeSingleRegister(address, register16, value16) {
    const func_code = 0x06

    writeModule(address, [func_code].concat(to8Bit(register16)).concat(to8Bit(value16)))
}

// --------------------------------------------------------------------------------
module.exports = {
    writeSingleRegister
}