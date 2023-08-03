
import expiry_in_days from "../helper/expiry_in_days.js"
import binance_contract from "../helper/binance_contract.js"
import bybit_contract from "../helper/bybit_contract.js"
import binance_opportunity_checker from "./binance_opportunity_checker.js"
import bybit_opportunity_checker from "./bybit_opportunity_checker.js"

const flow_manager = (underlying, date, strike, type) => {

    let opportunity = []
    const binance_symbol = binance_contract(underlying, date, strike, type)
    const bybit_symbol = bybit_contract(underlying, date, strike, type)

    const binance_data = global.BINANCE.book[binance_symbol] || { b: [], a: [] }
    const bybit_data = global.BYBIT.book[bybit_symbol] || { b: [], a: [] }

    const binance_top_ask = binance_data.a[0]?.[0] || 0
    const binance_top_bid = binance_data.b[0]?.[0] + global.TWEAKER || 0

    const bybit_top_ask = bybit_data.a[0]?.[0] || 0
    const bybit_top_bid = bybit_data.b[0]?.[0] + global.TWEAKER || 0

    const future_price = Number(global.FUTURE_PRICE[`${underlying}USDT`]?.a?.[0]?.[0])

    // console.log("\n\n\n\n\n\n\nBinance Contract: ", binance_symbol)
    // console.log("Bybit Contract: ", bybit_symbol)

    // ! Opportunity from Bybit
    if (
        (binance_top_ask !== 0 || bybit_top_bid !== 0) &&
        (binance_top_ask < bybit_top_bid)
    ) {
        
        const expiry = expiry_in_days(date)
        opportunity = bybit_opportunity_checker(binance_data.a, bybit_data.b, future_price, expiry)
        opportunity.length > 0 && console.log("Bybit Opportunity: ", opportunity)
    }

    // ! Opportunity from Binance
    // if (
    //     (binance_top_bid !== 0 || bybit_top_ask !== 0) && 
    //     (binance_top_bid > bybit_top_ask)
    // ) {
        
    //     const expiry = expiry_in_days(date)
    //     opportunity = binance_opportunity_checker(binance_data.b, bybit_data.a, future_price, expiry)
    //     opportunity.length > 0 && console.log("Binance Opportunity: ", opportunity)
    // }

    // Calculate Opportunity
    if (opportunity.length > 0) {

        console.log("first")
    }
}

export default flow_manager
