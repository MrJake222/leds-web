const Transform = require('stream').Transform
const FastCRC = require("./fastCRC")

class ModbusParser extends Transform {
	constructor() {
		super()

		this.size = 0
		this.buffer = null
	}

	_transform(chunk, encoding, cb) {
		if (!this.buffer)
			this.buffer = chunk
		else
			this.buffer = Buffer.concat([this.buffer, chunk])
		
	
		if (this.buffer.length > 4) {
			if (FastCRC.fastCRC(this.buffer)) {
				// console.log("crc ok")
				this.push(this.buffer)

				this.buffer = null
			}
		}

		cb()
	}

	_flush(cb) {
		this.push(this.buffer)
		this.buffer = Buffer.alloc(16)

		cb()
	}
}

// --------------------------------------------------------------------------------
function parseModbusFrame(frame) {
	//console.log(frame)
	
	/* var ret = {
		modAddress: frame[0],
		functionCode: frame[1],
	} */

	switch(ret.functionCode) {
		case 0x06:
			/* ret.modRegister = (frame[2] << 8) || frame[3]
			ret.registerValue = (frame[4] << 8) || frame[5] */
			break

		case 0x10:
			// ret.modRegister = (frame[2] << 8) || frame[3]
			// ret.registerValue = (frame[4] << 8) || frame[5]
			break

		default:
			ret.error = "Unknown function code"
			break
	}

	// return ret
}

// --------------------------------------------------------------------------------
module.exports = {
	ModbusParser,
	parseModbusFrame
}



