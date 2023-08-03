
import fs from "node:fs"
import * as url from 'url';
import path from "node:path"

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const file_path = path.join(__dirname, "../log/Binance_Opportunity.csv")

const binance_opportunity_checker = (binance_bid_pair_array, bybit_ask_pair_array, future_price, expiry_in_days, binance_symbol, bybit_symbol) => {

    const final = []
    const spreads = []
    let accumulated_opportunity = 0
    let accumulated_quantity = 0
    let accumulated_expense = 0
    let accumulated_buy_premium = 0
    let accumulated_sell_premium = 0
    let accumulated_required_margin = 0

    if (!binance_bid_pair_array || !bybit_ask_pair_array) return

    let binance_remaining_quantity = 0
    let bybit_remaining_quantity = 0

    let binance_pointer = 0
    let bybit_pointer = 0

    let should_continue = true

    console.log("\n\n\nBinance Opportunity :-")
    while (should_continue) {

        if (
            (binance_pointer >= binance_bid_pair_array.length || !binance_bid_pair_array[binance_pointer]) ||
            (bybit_pointer >= bybit_ask_pair_array.length || !bybit_ask_pair_array[bybit_pointer])
        ) break

        let binance_quantity = binance_remaining_quantity === 0 ? Number(binance_bid_pair_array[binance_pointer][1]) : binance_remaining_quantity
        let bybit_quantity = bybit_remaining_quantity === 0 ? Number(bybit_ask_pair_array[bybit_pointer][1]) : bybit_remaining_quantity

        let minimum_quantity = Math.min(binance_quantity, bybit_quantity)

        const binance_bid_price = Number(binance_bid_pair_array[binance_pointer][0]) + global.TWEAKER
        const bybit_ask_price = Number(bybit_ask_pair_array[bybit_pointer][0])
        const spread = binance_bid_price - bybit_ask_price

        // Look for price difference
        if (spread > global.SPREAD_MARGIN) {

            spreads.push(spread)
            const binance_fee = ( future_price * minimum_quantity ) * global.BINANCE.trade_fee
            const bybit_fee = ( future_price * minimum_quantity ) * global.BYBIT.trade_fee
            const binance_settlement_fee = ( future_price * minimum_quantity ) * global.BINANCE.settlement_fee
            const bybit_settlement_fee = ( future_price * minimum_quantity ) * global.BYBIT.settlement_fee
            const opportunity = spread * minimum_quantity
            const expense = bybit_fee + binance_fee + binance_settlement_fee + bybit_settlement_fee
            const option_buy_premium = bybit_ask_price * minimum_quantity
            const option_sell_premium = ( future_price * minimum_quantity ) * global.BINANCE.option_sell_margin
            const required_margin = option_buy_premium + option_sell_premium
            const roi = (opportunity / required_margin) * 100
            const cagr = ((Math.pow(((required_margin + opportunity) / required_margin), (1 / (expiry_in_days / 365)))) - 1) * 100

            if (opportunity > 0) {

                accumulated_quantity += minimum_quantity
                accumulated_buy_premium += option_buy_premium
                accumulated_opportunity += opportunity - expense
                accumulated_sell_premium += option_sell_premium
                accumulated_required_margin += required_margin
                accumulated_expense += expense
    
                const data_to_log = `
    
                Future Price:                                   ${future_price}
                Binance Bid Price:                              ${binance_bid_price}
                Bybit Ask Price:                                ${bybit_ask_price}
                Expiry:                                         ${expiry_in_days}
                Quantity:                                       ${minimum_quantity}
                Binance Fee:                                    ${binance_fee}
                Bybit Fee:                                      ${bybit_fee}
                Binance Settlement Fee:                         ${binance_settlement_fee}
                Bybit Settlement Fee:                           ${bybit_settlement_fee}
                Spread:                                         ${spread}
                Opportunity:                                    ${opportunity}
                Expense:                                        ${expense}
                Option Buy Premium:                             ${option_buy_premium}
                Option Sell Premium:                            ${option_sell_premium}
                Required Margin:                                ${required_margin}
                ROI:                                            ${roi}
                CAGR:                                           ${cagr}
                `
                final.push({
                    type: "Binance Opportunity",
                    future_price,
                    bybit_ask_price,
                    binance_bid_price,
                    quantity: minimum_quantity,
                    binance_fee,
                    bybit_fee,
                    binance_settlement_fee,
                    bybit_settlement_fee,
                    spread,
                    opportunity,
                    expense,
                    option_buy_premium,
                    option_sell_premium,
                    required_margin,
                    roi,
                    cagr
                })
                console.log(data_to_log)
            }
        }

        binance_remaining_quantity = binance_quantity - minimum_quantity
        bybit_remaining_quantity = bybit_quantity - minimum_quantity

        if (binance_remaining_quantity === 0) binance_pointer++
        if (bybit_remaining_quantity === 0) bybit_pointer++
    }

    if (final.length > 0) {
        
        const roi = (accumulated_opportunity / accumulated_required_margin) * 100
        const cagr = ((Math.pow(((accumulated_required_margin + accumulated_opportunity) / accumulated_required_margin), (1 / (expiry_in_days / 365)))) - 1) * 100

        let data_to_log = `

            -----------------------------------------------------------------------------------------------
            Binance Symbol:                                 ${binance_symbol}
            Bybit Symbol:                                   ${bybit_symbol}
            Binance Bid:                                    ${JSON.stringify(binance_bid_pair_array)}
            Bybit Ask:                                      ${JSON.stringify(bybit_ask_pair_array)}
            Spreads:                                        ${spreads}
            Accumulated Quantity:                           ${accumulated_quantity}
            Accumulated Buy Premium:                        ${accumulated_buy_premium}
            Accumulated Opportunity:                        ${accumulated_opportunity}
            Accumulated Sell Premium:                       ${accumulated_sell_premium}
            Accumulated Required Margin:                    ${accumulated_required_margin}
            Trade ROI:                                      ${roi}
            CAGR:                                           ${cagr}
        `
        console.log(data_to_log)

        // Logger
        let ask = '['
        bybit_ask_pair_array.forEach(pair => {
            ask = ask + `[${pair[0]}-${pair[1]}]`
        })
        ask = ask + ']'
        let bid = '['
        binance_bid_pair_array.forEach(pair => {
            bid = bid + `[${pair[0]}-${pair[1]}]`
        })
        bid = bid + ']'
        // Binance Contract, Bybit Contract, Expiry, Future Price, Spreads, Accumulated_Quantity, Accumulated_Opportunity, Accumulated_Buy_Premium, Accumulated_Sell_Premium, Accumulated_Required_Margin, Trade_ROI, Trade_CAGR, Bybit_Ask_Orderbook, Binance_Bid_Orderbook
        data_to_log = `${binance_symbol}, ${bybit_symbol}, ${expiry_in_days}, ${future_price}, ${spreads.join("-")}, ${accumulated_quantity}, ${accumulated_opportunity}, ${accumulated_buy_premium}, ${accumulated_sell_premium}, ${accumulated_required_margin}, ${roi}, ${cagr}, ${ask}, ${bid}\n`

        global.ONGOING.set(`${binance_symbol}_${bybit_symbol}`, true)

        fs.appendFileSync(file_path, data_to_log, { encoding: 'utf-8' })

        setTimeout(() => global.ONGOING.delete(`${binance_symbol}_${bybit_symbol}`), 5 * 1000)
    }

    return final
}

export default binance_opportunity_checker
