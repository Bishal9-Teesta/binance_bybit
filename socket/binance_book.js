import config from "../config.js"
import { WebSocket } from "ws"
import binance_exchange_info from "../api/binance_exchange_info.js"
import flow_manager from "../algorithm/flow_manager.js"
import contract_underlying from "../helper/contract_underlying.js"
import binance_expiry_to_date from "../helper/binance_expiry_to_date.js"
import contract_strike from "../helper/contract_strike.js"
import contract_type from "../helper/contract_type.js"

let connections = []
let symbols_per_connection = []

const binance_book = async () => {

    const symbols_list = []
    const exchange_info = await binance_exchange_info()
    exchange_info?.optionSymbols?.length > 0 && exchange_info.optionSymbols.forEach(contract => {
        symbols_list.push(contract.symbol)
    })

    for (let i = 0; i < Math.floor(symbols_list.length / 100); i++) {
        connections[i] = undefined
        symbols_per_connection[i] = []
    }

    let connection_count = 0
    while (connection_count < symbols_per_connection.length) {

        const lower_index = 100 * connection_count
        const upper_index = 100 * (connection_count + 1)
        for (let i = lower_index; i < upper_index; i++) {

            symbols_list[i] && symbols_per_connection[connection_count].push(`${symbols_list[i]}@depth50@100ms`)
        }
        connection_count = connection_count + 1
    }

    connections.forEach((single_connection, connection_index) => {

        if (single_connection) return

        single_connection = new WebSocket(config().BINANCE_SOCKET_BASE_URL + "/stream?streams")

        single_connection.on('message', (data, isBinary) => {
            data = JSON.parse(Buffer.from(data).toString())
            // console.log(`Binance Book ${connection_index} Socket Message Is Binary: `, isBinary)
            // console.log(`Binance Book ${connection_index} Socket Message Data: `, data)

            if (data?.data?.s) {
                const option_contract = data.data.s

                global.BINANCE.book[option_contract] = {
                    a: data.data.a,
                    b: data.data.b,
                }

                const underlying = contract_underlying(option_contract)
                const date = binance_expiry_to_date(option_contract)
                const strike = contract_strike(option_contract)
                const type = contract_type(option_contract)
                flow_manager(underlying, date, strike, type)
            }
        })
        single_connection.once('open', () => {
            console.log(`Binance Book ${connection_index} Socket Open.`)

            // Sample payload for subscription
            // {
            //     "method": "SUBSCRIBE",
            //         "params":
            //     [
            //         "BTC-210630-9000-P@ticker",
            //         "BTC-210630-9000-P@depth"
            //     ],
            //         "id": 1
            // }
            single_connection.send(JSON.stringify({
                "method": "SUBSCRIBE",
                "params": symbols_per_connection[connection_index],
                "id": 1
            }))

            if (connection_index === (symbols_per_connection.length - 1)) {
                
                global.EventEmitter.on('binance_new_option_contract', option_contract => {
                    single_connection.send(JSON.stringify({
                        "method": "SUBSCRIBE",
                        "params": [`${option_contract}@depth50@100ms`],
                        "id": 1
                    }))

                    console.log("Successfully subscribed to ", option_contract)
                })
            }
        })
        single_connection.once('error', (error) => {
            console.log(`Binance Book ${connection_index} Socket Error: `, error)

            single_connection.close()
        })
        single_connection.once('close', (code, reason) => {
            console.log(`Binance Book ${connection_index} Socket Close Code: `, code)
            console.log(`Binance Book ${connection_index} Socket Close Reason: `, Buffer.from(reason).toString())

            single_connection.removeAllListeners()
            single_connection = undefined

            binance_book()
        })
    })
}

export default binance_book
