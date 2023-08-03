import config from "../config.js"
import { WebSocket } from "ws"

let ping_interval = undefined

const perpetual_book = () => {

    const perpetual_symbol_list = []
    const url = config().BYBIT_SOCKET_PERPETUAL_BASE_URL
    global.PERPETUAL_SYMBOLS.forEach(symbol => {
        perpetual_symbol_list.push(`orderbook.1.${symbol}USDT`)
        global.FUTURE_PRICE[`${symbol}USDT`] = [ 0, 0 ]
    })

    const socket = new WebSocket(url)

    socket.once('open', () => {
        console.log("Perpetual Socket Open.")

        socket.send(JSON.stringify({
            "req_id": "binance_bybit_perpetual",
            "op": "subscribe",
            "args": perpetual_symbol_list
        }))

        ping_interval = setInterval(() => socket.send(JSON.stringify({ "req_id": "binance_bybit_perpetual", "op": "ping" })), 15 * 1000)
    })
    socket.once('error', (error) => {
        console.log("Perpetual Socket Error: ", error)

        socket.close()
    })
    socket.once('close', (code, reason) => {
        console.log("Perpetual Socket Close Code: ", code)
        console.log("Perpetual Socket Close Reason: ", Buffer.from(reason).toString())

        socket.removeAllListeners()
        if (ping_interval) {
            clearInterval(ping_interval)
            ping_interval = undefined
        }
        perpetual_book()
    })
    socket.on('message', (data, isBinary) => {
        data = JSON.parse(Buffer.from(data).toString())
        // console.log('Perpetual Socket Message Data: ', data)
        // console.log("Perpetual Socket Message Is Binary: ", isBinary)

        if (data?.type === 'snapshot' && data?.data?.s) {

            const perpetual_symbol = data.data.s
            global.FUTURE_PRICE[perpetual_symbol] = {
                a: data.data.a[0],
                b: data.data.b[0],
            }
        } else if (data?.type === 'delta' && data?.data?.s) {

            const perpetual_symbol = data.data.s
            if (data.data.a.length > 0) {
                global.FUTURE_PRICE[perpetual_symbol].a = data.data.a
            }
            if (data.data.b.length > 0) {
                global.FUTURE_PRICE[perpetual_symbol].b = data.data.b
            }
        }
    })
}

export default perpetual_book
