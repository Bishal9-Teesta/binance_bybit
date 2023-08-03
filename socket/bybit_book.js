import config from "../config.js"
import { WebSocket } from "ws"
import bybit_instrument_info from "../api/bybit_instrument_info.js"
import bybit_book_maintainer from "../helper/bybit_book_maintainer.js"
import flow_manager from "../algorithm/flow_manager.js"
import contract_underlying from "../helper/contract_underlying.js"
import bybit_expiry_to_date from "../helper/bybit_expiry_to_date.js"
import contract_strike from "../helper/contract_strike.js"
import contract_type from "../helper/contract_type.js"

let ping_interval = undefined

const bybit_book = async () => {

    const instrument_info = await bybit_instrument_info(undefined, undefined)
    const option_contract_list = []
    instrument_info.result.list.forEach(instrument => {
        option_contract_list.push("orderbook.25." + instrument.symbol)
    })
    // console.log("Symbols List: ", option_contract_list)

    const socket = new WebSocket(config().BYBIT_SOCKET_OPTION_BASE_URL)

    socket.on('message', (data, isBinary) => {
        data = JSON.parse(Buffer.from(data).toString())
        // console.log("Bybit Book Socket Message Is Binary: ", isBinary)
        // console.log("Bybit Book Socket Message Data: ", data)

        if (data?.data?.s && data?.type === "snapshot") {
            const option_contract = data.data.s
            global.BYBIT.book[option_contract] = {
                a: data.data.a,
                b: data.data.b.reverse(),
            }

            const underlying = contract_underlying(option_contract)
            const date = bybit_expiry_to_date(option_contract)
            const strike = contract_strike(option_contract)
            const type = contract_type(option_contract)
            flow_manager(underlying, date, strike, type)
        } else if (data?.data?.s && data?.type === "delta") {
            const option_contract = data.data.s
            const { a, b } = bybit_book_maintainer(global.BYBIT.book[option_contract], { b: data.data.b, a: data.data.a })
            global.BYBIT.book[option_contract].a = a
            global.BYBIT.book[option_contract].b = b

            const underlying = contract_underlying(option_contract)
            const date = bybit_expiry_to_date(option_contract)
            const strike = contract_strike(option_contract)
            const type = contract_type(option_contract)
            flow_manager(underlying, date, strike, type)
        }

        // console.clear()
        // console.log(JSON.stringify(global.BYBIT.book["BTC-25AUG23-33500-C"], null, 4))
    })

    socket.once('open', () => {
        console.log("Bybit Book Socket Open.")
        socket.send(JSON.stringify({
            "req_id": "binance_bybit_option",
            "op": "subscribe",
            "args": option_contract_list
        }))

        ping_interval = setInterval(() => socket.send(JSON.stringify({ "req_id": "binance_bybit_option", "op": "ping" })), 15 * 1000)
    })
    socket.on('ping', (data) => {
        console.log("Bybit Book Socket Ping Data: ", Buffer.from(data).toString())
    })
    socket.on('pong', (data) => {
        console.log("Bybit Book Socket Pong Data: ", Buffer.from(data).toString())
    })
    socket.once('error', (error) => {
        console.log("Bybit Book Socket Error: ", error)

        socket.close()
    })
    socket.once('close', (code, reason) => {
        console.log("Bybit Book Socket Close Code: ", code)
        console.log("Bybit Book Socket Close Reason: ", Buffer.from(reason).toString())

        socket.removeAllListeners()
        if (ping_interval) {
            clearInterval(ping_interval)
            ping_interval = undefined
        }
        bybit_book()
    })
}

export default bybit_book
