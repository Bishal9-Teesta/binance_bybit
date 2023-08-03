const binance_expiry_in_days = contract => {

    const expiry = contract.split("-")[1]

    const y = 20 + expiry.substring(0, 2)
    const m = parseFloat(expiry.substring(2, 4)) - 1
    const d = expiry.substring(4, 6)

    const expiryDate = new Date(y, m, d, "13", "30", "00")
    const differenceInDays = (expiryDate.getTime() - new Date().getTime()) / ( 1000 * 60 * 60 * 24 )

    return Number(differenceInDays.toFixed(2))
}

export default binance_expiry_in_days
