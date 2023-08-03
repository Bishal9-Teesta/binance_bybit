
const binance_opportunity_checker = (binance_bid_pair_array, bybit_ask_pair_array, future_price, expiry_in_days) => {

    const final = []
    let required_margin = 0
    let accumulated_opportunity = 0
    let accumulated_quantity = 0
    let accumulated_buy_premium = 0
    let accumulated_sell_premium = 0

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

            const binance_fee = ( future_price * minimum_quantity ) * global.BINANCE.trade_fee
            const bybit_fee = ( future_price * minimum_quantity ) * global.BYBIT.trade_fee
            const binance_settlement_fee = ( future_price * minimum_quantity ) * global.BINANCE.settlement_fee
            const bybit_settlement_fee = ( future_price * minimum_quantity ) * global.BYBIT.settlement_fee
            const opportunity = spread * minimum_quantity
            const option_buy_premium = bybit_ask_price * minimum_quantity

            accumulated_quantity += minimum_quantity
            accumulated_buy_premium += option_buy_premium
            accumulated_opportunity += opportunity - ( bybit_fee + binance_fee + binance_settlement_fee + bybit_settlement_fee )
            accumulated_sell_premium += ( future_price * minimum_quantity ) * global.BINANCE.option_sell_margin

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
            Option Buy Premium:                             ${option_buy_premium}
            Total Expense:                                  ${( bybit_fee + binance_fee + binance_settlement_fee + bybit_settlement_fee )}
            Option Sell Premium:                            ${( future_price * minimum_quantity ) * global.BINANCE.option_sell_margin}
            `
            console.log(data_to_log)
        }

        binance_remaining_quantity = binance_quantity - minimum_quantity
        bybit_remaining_quantity = bybit_quantity - minimum_quantity

        if (binance_remaining_quantity === 0) binance_pointer++
        if (bybit_remaining_quantity === 0) bybit_pointer++
    }

    if (accumulated_opportunity > 0) {
        required_margin = accumulated_buy_premium + accumulated_sell_premium
        const roi = ( accumulated_opportunity / required_margin ) * 100
        const cagr = ( ( Math.pow(( ( required_margin + accumulated_opportunity ) / required_margin ), ( 1 / (expiry_in_days / 365) )) ) - 1 ) * 100

        console.log(`

            -----------------------------------------------------------------------------------------------
            Binance Bid:                                    ${JSON.stringify(binance_bid_pair_array)}
            Bybit Ask:                                      ${JSON.stringify(bybit_ask_pair_array)}
            Accumulated Quantity:                           ${accumulated_quantity}
            Accumulated Buy Premium:                        ${accumulated_buy_premium}
            Accumulated Opportunity:                        ${accumulated_opportunity}
            Accumulated Sell Premium:                       ${accumulated_sell_premium}
            Required Margin:                                ${required_margin}
            Trade ROI:                                      ${roi}
            CAGR:                                           ${cagr}
        `)

        if (cagr > 30) {

            final.push({
                future_price,
                accumulated_quantity,
                accumulated_opportunity,
                expiry_in_days,
                required_margin,
                roi,
                cagr,
                type: 'Binance Opportunity',
                binance_bid_pair_array,
                bybit_ask_pair_array
            })
        }
    }

    return final
}

export default binance_opportunity_checker
