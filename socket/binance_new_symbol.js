import config from "../config.js"
import { WebSocket } from "ws"

const binance_new_symbol = () => {

    const url = config().BINANCE_SOCKET_BASE_URL + "/ws/option_pair"

    const socket = new WebSocket(url)

    socket.once('open', () => {
        console.log("Binance New Option Contract Socket Open.")
    })
    socket.once('error', (error) => {
        console.log("Binance New Option Contract Socket Error: ", error)

        socket.close()
    })
    socket.once('close', (code, reason) => {
        console.log("Binance New Option Contract Socket Close Code: ", code)
        console.log("Binance New Option Contract Socket Close Reason: ", Buffer.from(reason).toString())

        socket.removeAllListeners()

        binance_new_symbol()
    })
    socket.on('message', (data, isBinary) => {
        console.log("Binance New Option Contract Socket Message Data: ", JSON.stringify(JSON.parse(Buffer.from(data).toString()), null, 4))
        console.log("Binance New Option Contract Socket Message Is Binary: ", isBinary)

        if (data?.s) {
            const new_contract = data.s
            global.BINANCE.new_symbol_count = global.BINANCE.new_symbol_count + 1
            console.log(global.BINANCE.new_symbol_count, ".\tBinance New Option Contract Symbol: ", new_contract)

            global.EventEmitter.emit('binance_new_option_contract', new_contract)
        }
    })
}

export default binance_new_symbol
