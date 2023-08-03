const binance_expiry_to_date = contract => {

    const expiry = contract.split("-")[1]

    const y = 20 + expiry.substring(0, 2)
    const m = parseFloat(expiry.substring(2, 4)) - 1
    const d = expiry.substring(4, 6)

    const expiry_date = new Date(y, m, d, "13", "30", "00")

    return expiry_date
}

export default binance_expiry_to_date
