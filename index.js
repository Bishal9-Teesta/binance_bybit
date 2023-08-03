
// console.log("Binance  Bybit Option Arbitrage Automation started at ", new Date().toLocaleDateString(), new Date().toLocaleTimeString())

process.env.TZ = "Asia/Kolkata"

import { EventEmitter } from "node:events"
import { config } from "dotenv"
import bybit_book from "./socket/bybit_book.js"
import binance_book from "./socket/binance_book.js"
import binance_new_symbol from "./socket/binance_new_symbol.js"
import perpetual_book from "./socket/perpetual_book.js"

global.EventEmitter = new EventEmitter({ captureRejections: false })
global.TWEAKER = 0
global.SPREAD_MARGIN = 0
global.PERPETUAL_SYMBOLS = []
global.FUTURE_PRICE = {}
global.ONGOING = new Map()
global.BYBIT = {
    book: {},
    trade_fee: 0.00025,
    settlement_fee: 0.00015,
    option_sell_margin: 0.18
}
global.BINANCE = {
    book: {},
    trade_fee: 0.0002,
    settlement_fee: 0.00015,
    new_symbol_count: 0,
    option_sell_margin: 0.15
}

const main = async () => {

    // Initialize Environment Variables
    config()
    global.PERPETUAL_SYMBOLS = process.env.PERPETUAL_SYMBOLS.toString().trim().split(" ")

    await bybit_book()
    await binance_book()
    perpetual_book()
    // binance_new_symbol()
    // console.log(JSON.stringify(await binance_exchange_info(), null, 4))
}
main()
